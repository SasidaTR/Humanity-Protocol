(function(){
	const mandatoryVoteConfig = window.humanityProtocolConfig?.laws?.mandatoryVote || {}
	const fixedVoteHourConfig = window.humanityProtocolConfig?.laws?.fixedVoteHour || {}
	const incomeTaxConfig = window.humanityProtocolConfig?.laws?.incomeTax || {}
	const basicIncomeConfig = window.humanityProtocolConfig?.laws?.basicIncome || {}
	const economyConfig = window.humanityProtocolConfig?.economy || {}
	const BASIC_INCOME_AMOUNTS = basicIncomeConfig.availableMonthlyAmounts || [0, 100, 200, 400]
	const BASIC_INCOME_DEFAULT_AMOUNT = basicIncomeConfig.defaultMonthlyAmount ?? 0
	const BASIC_INCOME_GAIN_CAP = basicIncomeConfig.relativeGainCap ?? 2.5
	const DAYS_PER_MONTH = economyConfig.daysPerMonth ?? 30
	const INCOME_TAX_RATES = incomeTaxConfig.availableRates || [0, 10, 20, 30, 40, 50]
	const INCOME_TAX_DEFAULT_RATE = incomeTaxConfig.defaultRate ?? 0
	const INCOME_TAX_BRACKETS = incomeTaxConfig.bracketFactors || {}
	const HOURS_PER_YEAR = economyConfig.hoursPerYear ?? 8766
	const FIXED_VOTE_HOUR_DEFAULT = fixedVoteHourConfig.defaultHour ?? 12
	const FIXED_VOTE_HOUR_MAX_DISTANCE = fixedVoteHourConfig.maxHourDistance ?? 12
	const FIXED_VOTE_HOUR_DISTANCE_WEIGHT = fixedVoteHourConfig.distanceWeight ?? 0.55
	const FIXED_VOTE_HOUR_STRAIN_WEIGHT = fixedVoteHourConfig.strainWeight ?? 0.45
	const FIXED_VOTE_HOUR_STRAIN = fixedVoteHourConfig.hourStrain || []
	const FIXED_VOTE_HOUR_NATURAL = fixedVoteHourConfig.naturalVoteHour || {}
	const HOURS_PER_DAY = 24
	const CONVICTION_IMPACTS = {
		basicIncome: {
			happinessComfort: 5,
			groupPriority: 3,
			humanIncompetence: 2
		},
		incomeTax: {
			groupPriority: 4,
			individualPriority: -3,
			progressCooperation: 2
		},
		mandatoryVote: {
			groupPriority: 5,
			individualPriority: -4,
			humanIncompetence: 3
		},
		fixedVoteHour: {
			riskMinimization: 4,
			groupPriority: 3,
			humanCompetence: -3
		}
	}
	const MANDATORY_VOTE_FINE_AMOUNT = mandatoryVoteConfig.fineAmount ?? 135
	const MANDATORY_VOTE_FINE_RATE_PER_WINDOW = mandatoryVoteConfig.fineRatePerWindow ?? 0.012

	const LAW_DEFINITIONS = {
		mandatoryVote: {
			id: 'mandatoryVote',
			defaultEnabled: false,
			sanctions: ['fine']
		},
		basicIncome: {
			id: 'basicIncome',
			defaultEnabled: false,
			sanctions: [],
			hasMonthlyAmount: true,
			defaultMonthlyAmount: BASIC_INCOME_DEFAULT_AMOUNT
		},
		incomeTax: {
			id: 'incomeTax',
			defaultEnabled: false,
			sanctions: [],
			hasTaxRate: true,
			defaultTaxRate: INCOME_TAX_DEFAULT_RATE
		},
		fixedVoteHour: {
			id: 'fixedVoteHour',
			defaultEnabled: false,
			sanctions: [],
			hasVoteHour: true,
			defaultVoteHour: FIXED_VOTE_HOUR_DEFAULT
		}
	}

	let currentLanguage = 'fr'
	let lawsPanel = null
	let lawElements = {}
	const lawState = {}
	let appliedConvictionImpacts = {}

	function buildInitialLawState(lawId){
		const definition = LAW_DEFINITIONS[lawId]

		return {
			enabled: Boolean(definition.defaultEnabled),
			sanctionId: definition.sanctions[0] || null,
			voteHour: sanitizeVoteHour(definition.defaultVoteHour),
			taxRate: sanitizeTaxRate(definition.defaultTaxRate),
			lastTaxRevenue: 0,
			totalTaxRevenue: 0,
			monthlyAmount: sanitizeMonthlyAmount(definition.defaultMonthlyAmount),
			coverageRatio: 1,
			lastPayout: 0,
			totalPayout: 0,
			lastFineCount: 0,
			lastFineRevenue: 0,
			totalFineCount: 0,
			totalFineRevenue: 0
		}
	}

	function sanitizeVoteHour(value){
		const parsedHour = Math.round(Number(value))
		return Number.isFinite(parsedHour)
			? Math.max(0, Math.min(HOURS_PER_DAY - 1, parsedHour))
			: FIXED_VOTE_HOUR_DEFAULT
	}

	function sanitizeTaxRate(value){
		const parsedRate = Math.round(Number(value))

		if (!Number.isFinite(parsedRate)) {
			return INCOME_TAX_DEFAULT_RATE
		}

		return INCOME_TAX_RATES.includes(parsedRate) ? parsedRate : INCOME_TAX_DEFAULT_RATE
	}

	function sanitizeMonthlyAmount(value){
		const parsedAmount = Number(value)

		if (!Number.isFinite(parsedAmount)) {
			return BASIC_INCOME_DEFAULT_AMOUNT
		}

		return BASIC_INCOME_AMOUNTS.includes(parsedAmount) ? parsedAmount : BASIC_INCOME_DEFAULT_AMOUNT
	}

	function getCohortAnnualIncomePerPerson(cohort){
		return window.humanityProtocolEconomy?.getCohortAnnualIncome?.(cohort) || 0
	}

	function formatRateAmount(monthlyAmount, language){
		const economy = window.humanityProtocolEconomy

		if (!economy) {
			return String(monthlyAmount)
		}

		const period = economy.getRatePeriod()
		const converted = economy.convertMonthlyAmount(monthlyAmount, period)
		const suffix = window.humanityProtocolI18n.getTranslation(language, `universalLaws.periods.${period}`)

		return `${economy.formatAmount(converted)} ${suffix}`
	}

	function getCohortTaxRate(cohort){
		const state = lawState.incomeTax

		if (!state?.enabled) {
			return 0
		}

		const bracketFactor = INCOME_TAX_BRACKETS[cohort.incomeLevelId] ?? 1
		return Math.max(0, Math.min(1, (state.taxRate / 100) * bracketFactor))
	}

	function formatVoteHourRange(hour, language){
		const start = String(hour).padStart(2, '0')
		const end = String((hour + 1) % HOURS_PER_DAY).padStart(2, '0')
		return language === 'en' ? `${start}:00 to ${end}:00` : `${start}h00 à ${end}h00`
	}

	function applyConvictionImpactOnce(lawId){
		const impactValues = CONVICTION_IMPACTS[lawId]

		if (!impactValues || appliedConvictionImpacts[lawId] || !window.humanityProtocolConvictions?.adjustConvictions) {
			return
		}

		window.humanityProtocolConvictions.adjustConvictions(impactValues)
		appliedConvictionImpacts[lawId] = true
	}

	function buildLawTranslationKey(lawId, suffix){
		return `universalLaws.laws.${lawId}.${suffix}`
	}

	function getLawState(lawId){
		return lawState[lawId]
	}

	function getLawDefinition(lawId){
		return LAW_DEFINITIONS[lawId] || null
	}

	function refreshSurveyWithCurrentPopulation(){
		const populationSnapshot = window.humanityProtocolPopulation?.getPopulationSummary?.()

		if (!populationSnapshot || !window.humanityProtocolSatisfactionSurvey?.applyPopulationSnapshot) {
			return
		}

		window.humanityProtocolSatisfactionSurvey.applyPopulationSnapshot(populationSnapshot, 0)
	}

	function createLawRow(lawId){
		const definition = getLawDefinition(lawId)

		if (!definition) {
			return null
		}

		const row = document.createElement('section')
		row.className = 'universal-laws-row'

		const toggleLabel = document.createElement('label')
		toggleLabel.className = 'universal-laws-toggle'

		const checkbox = document.createElement('input')
		checkbox.type = 'checkbox'
		checkbox.className = 'universal-laws-checkbox'
		checkbox.addEventListener('change', () => {
			const state = getLawState(lawId)
			state.enabled = checkbox.checked
			window.humanityProtocolTools.recordToolMetric('universal-laws', `${lawId}ToggleCount`)

			if (state.enabled) {
				applyConvictionImpactOnce(lawId)
			}

			refreshSurveyWithCurrentPopulation()
			renderUniversalLawsTool({ language: currentLanguage })
		})

		const name = document.createElement('span')
		name.className = 'universal-laws-name'

		toggleLabel.append(checkbox, name)

		const body = document.createElement('div')
		body.className = 'universal-laws-details'

		const effectGroup = document.createElement('div')
		effectGroup.className = 'universal-laws-detail-group'

		const effectValue = document.createElement('p')
		effectValue.className = 'universal-laws-detail-value'

		const sanctionGroup = document.createElement('div')
		sanctionGroup.className = 'universal-laws-detail-group is-control'

		const sanctionValue = document.createElement('p')
		sanctionValue.className = 'universal-laws-detail-value'

		const sanctionSelect = document.createElement('select')
		sanctionSelect.className = 'universal-laws-select'
		sanctionSelect.hidden = definition.sanctions.length <= 1
		sanctionSelect.addEventListener('change', () => {
			const state = getLawState(lawId)
			state.sanctionId = sanctionSelect.value
			window.humanityProtocolTools.recordToolMetric('universal-laws', `${lawId}SanctionChangeCount`)
			renderUniversalLawsTool({ language: currentLanguage })
		})

		const amountGroup = document.createElement('div')
		amountGroup.className = 'universal-laws-detail-group is-control'
		amountGroup.hidden = !definition.hasMonthlyAmount

		const monthlyAmountSelect = document.createElement('select')
		monthlyAmountSelect.className = 'universal-laws-select'
		monthlyAmountSelect.addEventListener('change', () => {
			const state = getLawState(lawId)
			state.monthlyAmount = sanitizeMonthlyAmount(monthlyAmountSelect.value)
			window.humanityProtocolTools.recordToolMetric('universal-laws', `${lawId}AmountChangeCount`)
			refreshSurveyWithCurrentPopulation()
			renderUniversalLawsTool({ language: currentLanguage })
		})

		amountGroup.append(monthlyAmountSelect)

		const taxGroup = document.createElement('div')
		taxGroup.className = 'universal-laws-detail-group is-control'
		taxGroup.hidden = !definition.hasTaxRate

		const taxRateSelect = document.createElement('select')
		taxRateSelect.className = 'universal-laws-select'
		taxRateSelect.addEventListener('change', () => {
			const state = getLawState(lawId)
			state.taxRate = sanitizeTaxRate(taxRateSelect.value)
			window.humanityProtocolTools.recordToolMetric('universal-laws', `${lawId}RateChangeCount`)
			refreshSurveyWithCurrentPopulation()
			renderUniversalLawsTool({ language: currentLanguage })
		})

		taxGroup.append(taxRateSelect)

		const scheduleGroup = document.createElement('div')
		scheduleGroup.className = 'universal-laws-detail-group is-control'
		scheduleGroup.hidden = !definition.hasVoteHour

		const voteHourSelect = document.createElement('select')
		voteHourSelect.className = 'universal-laws-select'
		voteHourSelect.addEventListener('change', () => {
			const state = getLawState(lawId)
			state.voteHour = sanitizeVoteHour(voteHourSelect.value)
			window.humanityProtocolTools.recordToolMetric('universal-laws', `${lawId}HourChangeCount`)
			refreshSurveyWithCurrentPopulation()
			renderUniversalLawsTool({ language: currentLanguage })
		})

		scheduleGroup.append(voteHourSelect)
		effectGroup.append(effectValue)
		sanctionGroup.append(sanctionValue, sanctionSelect)
		sanctionGroup.hidden = definition.sanctions.length === 0
		body.append(effectGroup, sanctionGroup, scheduleGroup, taxGroup, amountGroup)

		row.append(toggleLabel, body)

		lawElements[lawId] = {
			row,
			checkbox,
			name,
			effectValue,
			sanctionValue,
			sanctionSelect,
			voteHourSelect,
			taxRateSelect,
			monthlyAmountSelect
		}

		return row
	}

	function ensureLawsPanel(container){
		if (!container) {
			return null
		}

		if (!lawsPanel) {
			lawsPanel = document.createElement('section')
			lawsPanel.className = 'universal-laws-panel'

			Object.keys(LAW_DEFINITIONS).forEach((lawId) => {
				const row = createLawRow(lawId)

				if (row) {
					lawsPanel.append(row)
				}
			})
		}

		if (!lawsPanel.isConnected) {
			container.append(lawsPanel)
		}

		return lawsPanel
	}

	function hideLawsPanel(){
		if (lawsPanel?.isConnected) {
			lawsPanel.remove()
		}
	}

	function renderLaw(lawId, language){
		const definition = getLawDefinition(lawId)
		const state = getLawState(lawId)
		const elements = lawElements[lawId]

		if (!definition || !state || !elements) {
			return
		}

		elements.checkbox.checked = state.enabled
		elements.name.textContent = window.humanityProtocolI18n.getTranslation(language, buildLawTranslationKey(lawId, 'name'))
		elements.effectValue.textContent = window.humanityProtocolI18n.getTranslation(language, buildLawTranslationKey(lawId, 'effect'))
		elements.row.classList.toggle('is-enabled', state.enabled)

		if (definition.hasMonthlyAmount) {
			elements.monthlyAmountSelect.replaceChildren()

			BASIC_INCOME_AMOUNTS.forEach((amount) => {
				const option = document.createElement('option')
				option.value = String(amount)
				option.textContent = formatRateAmount(amount, language)
				option.selected = amount === state.monthlyAmount
				elements.monthlyAmountSelect.append(option)
			})
		}

		if (definition.hasTaxRate) {
			elements.taxRateSelect.replaceChildren()

			INCOME_TAX_RATES.forEach((rate) => {
				const option = document.createElement('option')
				option.value = String(rate)
				option.textContent = `${rate} %`
				option.selected = rate === state.taxRate
				elements.taxRateSelect.append(option)
			})
		}

		if (definition.hasVoteHour) {
			elements.voteHourSelect.replaceChildren()

			for (let hour = 0; hour < HOURS_PER_DAY; hour += 1) {
				const option = document.createElement('option')
				option.value = String(hour)
				option.textContent = formatVoteHourRange(hour, language)
				option.selected = hour === state.voteHour
				elements.voteHourSelect.append(option)
			}
		}

		if (definition.sanctions.length === 0) {
			return
		}

		if (definition.sanctions.length <= 1) {
			elements.sanctionValue.hidden = false
			elements.sanctionSelect.hidden = true
			elements.sanctionValue.textContent = window.humanityProtocolI18n.getTranslation(
				language,
				buildLawTranslationKey(lawId, `sanctions.${state.sanctionId}`)
			)
			return
		}

		elements.sanctionValue.hidden = true
		elements.sanctionSelect.hidden = false
		elements.sanctionSelect.replaceChildren()

		definition.sanctions.forEach((sanctionId) => {
			const option = document.createElement('option')
			option.value = sanctionId
			option.textContent = window.humanityProtocolI18n.getTranslation(
				language,
				buildLawTranslationKey(lawId, `sanctions.${sanctionId}`)
			)
			option.selected = sanctionId === state.sanctionId
			elements.sanctionSelect.append(option)
		})
	}

	function renderUniversalLawsTool({ language = 'fr', toolBody } = {}){
		currentLanguage = language === 'en' ? 'en' : 'fr'
		ensureLawsPanel(toolBody)
		Object.keys(LAW_DEFINITIONS).forEach((lawId) => renderLaw(lawId, currentLanguage))
	}

	function buildSnapshot(){
		return {
			version: 4,
			appliedConvictionImpacts: { ...appliedConvictionImpacts },
			laws: Object.entries(lawState).reduce((snapshot, [lawId, state]) => {
				snapshot[lawId] = {
					enabled: Boolean(state.enabled),
					sanctionId: state.sanctionId,
					voteHour: sanitizeVoteHour(state.voteHour),
					taxRate: sanitizeTaxRate(state.taxRate),
					monthlyAmount: sanitizeMonthlyAmount(state.monthlyAmount),
					coverageRatio: Math.max(0, Math.min(1, Number(state.coverageRatio) || 0)),
					totalPayout: Math.max(0, Math.round(Number(state.totalPayout) || 0)),
					lastTaxRevenue: Math.max(0, Math.round(Number(state.lastTaxRevenue) || 0)),
					totalTaxRevenue: Math.max(0, Math.round(Number(state.totalTaxRevenue) || 0)),
					lastFineCount: Math.max(0, Math.round(Number(state.lastFineCount) || 0)),
					lastFineRevenue: Math.max(0, Math.round(Number(state.lastFineRevenue) || 0)),
					totalFineCount: Math.max(0, Math.round(Number(state.totalFineCount) || 0)),
					totalFineRevenue: Math.max(0, Math.round(Number(state.totalFineRevenue) || 0))
				}
				return snapshot
			}, {})
		}
	}

	function restoreSnapshot(save){
		const savedLaws = save?.ui?.universalLaws?.laws || {}
		const savedImpacts = save?.ui?.universalLaws?.appliedConvictionImpacts || {}

		appliedConvictionImpacts = Object.keys(CONVICTION_IMPACTS).reduce((impacts, lawId) => {
			impacts[lawId] = Boolean(savedImpacts[lawId])
			return impacts
		}, {})

		Object.keys(LAW_DEFINITIONS).forEach((lawId) => {
			const definition = getLawDefinition(lawId)
			const savedLaw = savedLaws[lawId]
			const defaultSanctionId = definition.sanctions[0] || null
			const nextSanctionId = definition.sanctions.includes(savedLaw?.sanctionId)
				? savedLaw.sanctionId
				: defaultSanctionId

			lawState[lawId] = {
				enabled: Boolean(savedLaw?.enabled),
				sanctionId: nextSanctionId,
				voteHour: sanitizeVoteHour(savedLaw?.voteHour ?? definition.defaultVoteHour),
				taxRate: sanitizeTaxRate(savedLaw?.taxRate ?? definition.defaultTaxRate),
				monthlyAmount: sanitizeMonthlyAmount(savedLaw?.monthlyAmount ?? definition.defaultMonthlyAmount),
				coverageRatio: Math.max(0, Math.min(1, Number(savedLaw?.coverageRatio ?? 1))),
				lastPayout: 0,
				totalPayout: Math.max(0, Math.round(Number(savedLaw?.totalPayout) || 0)),
				lastTaxRevenue: Math.max(0, Math.round(Number(savedLaw?.lastTaxRevenue) || 0)),
				totalTaxRevenue: Math.max(0, Math.round(Number(savedLaw?.totalTaxRevenue) || 0)),
				lastFineCount: Math.max(0, Math.round(Number(savedLaw?.lastFineCount) || 0)),
				lastFineRevenue: Math.max(0, Math.round(Number(savedLaw?.lastFineRevenue) || 0)),
				totalFineCount: Math.max(0, Math.round(Number(savedLaw?.totalFineCount) || 0)),
				totalFineRevenue: Math.max(0, Math.round(Number(savedLaw?.totalFineRevenue) || 0))
			}
		})
	}

	function resetState(){
		appliedConvictionImpacts = {}
		Object.keys(LAW_DEFINITIONS).forEach((lawId) => {
			lawState[lawId] = buildInitialLawState(lawId)
		})
	}

	function getCircularHourDistance(firstHour, secondHour){
		const rawDistance = Math.abs(firstHour - secondHour) % HOURS_PER_DAY
		return Math.min(rawDistance, HOURS_PER_DAY - rawDistance)
	}

	function getNaturalVoteHour(cohort){
		const activityHour = FIXED_VOTE_HOUR_NATURAL.activity?.[cohort.activityId] ??
			FIXED_VOTE_HOUR_NATURAL.activity?.none ??
			16
		const ageOffset = FIXED_VOTE_HOUR_NATURAL.ageOffset?.[cohort.ageGroupId] || 0
		return ((activityHour + ageOffset) % HOURS_PER_DAY + HOURS_PER_DAY) % HOURS_PER_DAY
	}

	function getFixedVoteHourPressure(cohort, lawHour){
		const distanceRatio = FIXED_VOTE_HOUR_MAX_DISTANCE > 0
			? getCircularHourDistance(getNaturalVoteHour(cohort), lawHour) / FIXED_VOTE_HOUR_MAX_DISTANCE
			: 0
		const strain = Number(FIXED_VOTE_HOUR_STRAIN[lawHour]) || 0

		return Math.min(
			1,
			Math.max(0, (distanceRatio * FIXED_VOTE_HOUR_DISTANCE_WEIGHT) + (strain * FIXED_VOTE_HOUR_STRAIN_WEIGHT))
		)
	}

	function addConditions(target, source, scale = 1){
		Object.entries(source || {}).forEach(([axisId, value]) => {
			target[axisId] = (target[axisId] || 0) + ((Number(value) || 0) * scale)
		})

		return target
	}

	function describeBasicIncomeEffects(cohort){
		const state = lawState.basicIncome

		if (!state?.enabled || state.monthlyAmount <= 0) {
			return null
		}

		const annualIncome = getCohortAnnualIncomePerPerson(cohort)
		const annualPayout = state.monthlyAmount * (economyConfig.monthsPerYear ?? 12)
		const relativeGain = annualIncome > 0
			? Math.min(BASIC_INCOME_GAIN_CAP, annualPayout / annualIncome)
			: BASIC_INCOME_GAIN_CAP
		const coverageRatio = Math.max(0, Math.min(1, Number(state.coverageRatio) || 0))
		const conditions = addConditions({}, basicIncomeConfig.gainConditions, relativeGain * coverageRatio)

		addConditions(conditions, basicIncomeConfig.shortfallConditions, relativeGain * (1 - coverageRatio))

		return { conditions }
	}

	function applyBasicIncomeConsequences({ eligiblePopulation = 0, elapsedHours = 0 } = {}){
		const state = lawState.basicIncome
		state.lastPayout = 0

		const boundedPopulation = Math.max(0, Number(eligiblePopulation) || 0)
		const boundedElapsedHours = Math.max(0, Number(elapsedHours) || 0)

		if (!state.enabled || state.monthlyAmount <= 0) {
			state.coverageRatio = 1
			return { payout: 0, coverageRatio: 1 }
		}

		if (boundedPopulation <= 0 || boundedElapsedHours <= 0) {
			return { payout: 0, coverageRatio: state.coverageRatio }
		}

		const dueAmount = boundedPopulation * state.monthlyAmount * (boundedElapsedHours / (DAYS_PER_MONTH * 24))
		const availableFunds = Math.max(0, Number(window.humanityProtocolFunds?.getFundsSummary?.()?.available) || 0)
		const paidAmount = Math.min(dueAmount, availableFunds)
		const coverageRatio = dueAmount > 0 ? paidAmount / dueAmount : 1
		const roundedPayout = Math.round(paidAmount)

		if (roundedPayout > 0) {
			window.humanityProtocolFunds?.adjustFunds?.(-roundedPayout)
		}

		state.coverageRatio = coverageRatio
		state.lastPayout = roundedPayout
		state.totalPayout += roundedPayout

		return { payout: roundedPayout, coverageRatio }
	}

	function describeIncomeTaxEffects(cohort){
		const state = lawState.incomeTax

		if (!state?.enabled) {
			return null
		}

		const cohortTaxRate = getCohortTaxRate(cohort)
		const conditions = addConditions({}, incomeTaxConfig.conditions)
		addConditions(conditions, incomeTaxConfig.rateConditions, cohortTaxRate)

		return { conditions }
	}

	function applyIncomeTaxConsequences({ taxableIncomeByLevel = {}, elapsedHours = 0 } = {}){
		const state = lawState.incomeTax
		state.lastTaxRevenue = 0

		const boundedElapsedHours = Math.max(0, Number(elapsedHours) || 0)

		if (!state.enabled || boundedElapsedHours <= 0 || state.taxRate <= 0) {
			return { taxRevenue: 0 }
		}

		const yearFraction = boundedElapsedHours / HOURS_PER_YEAR
		const taxRevenue = Object.entries(taxableIncomeByLevel).reduce((total, [incomeLevelId, annualIncome]) => {
			const bracketFactor = INCOME_TAX_BRACKETS[incomeLevelId] ?? 1
			const effectiveRate = Math.max(0, Math.min(1, (state.taxRate / 100) * bracketFactor))
			return total + ((Number(annualIncome) || 0) * effectiveRate * yearFraction)
		}, 0)

		const roundedRevenue = Math.round(taxRevenue)

		if (roundedRevenue > 0) {
			window.humanityProtocolFunds?.adjustFunds?.(roundedRevenue)
		}

		state.lastTaxRevenue = roundedRevenue
		state.totalTaxRevenue += roundedRevenue

		return { taxRevenue: roundedRevenue }
	}

	function describeMandatoryVoteEffects(){
		const state = lawState.mandatoryVote

		if (!state?.enabled) {
			return null
		}

		const conditions = addConditions({}, mandatoryVoteConfig.conditions)
		addConditions(conditions, mandatoryVoteConfig.sanctionConditions?.[state.sanctionId])

		return {
			conditions,
			voice: { ...mandatoryVoteConfig.voice }
		}
	}

	function describeFixedVoteHourEffects(cohort){
		const state = lawState.fixedVoteHour

		if (!state?.enabled) {
			return null
		}

		const pressure = getFixedVoteHourPressure(cohort, state.voteHour)
		const conditions = addConditions({}, fixedVoteHourConfig.conditions)
		addConditions(conditions, fixedVoteHourConfig.pressureConditions, pressure)

		return {
			conditions,
			voice: {
				obstruction: (Number(fixedVoteHourConfig.voice?.obstruction) || 0) * pressure
			}
		}
	}

	function applyMandatoryVoteConsequences({ nonVoters = 0, elapsedHours = 0, voteWindowHours = 24 } = {}){
		const mandatoryVoteState = lawState.mandatoryVote
		const boundedNonVoters = Math.max(0, Math.round(Number(nonVoters) || 0))
		const boundedElapsedHours = Math.max(0, Number(elapsedHours) || 0)
		const boundedVoteWindowHours = Math.max(1, Number(voteWindowHours) || 24)

		mandatoryVoteState.lastFineCount = 0
		mandatoryVoteState.lastFineRevenue = 0

		if (!mandatoryVoteState.enabled || boundedNonVoters <= 0 || boundedElapsedHours <= 0) {
			return {
				fineCount: 0,
				fineRevenue: 0
			}
		}

		const windowFactor = boundedElapsedHours / boundedVoteWindowHours
		const enforcementRate = MANDATORY_VOTE_FINE_RATE_PER_WINDOW * windowFactor
		const fineCount = Math.min(
			boundedNonVoters,
			Math.max(
				0,
				Math.round(
					boundedNonVoters *
					enforcementRate *
					(0.9 + (Math.random() * 0.2))
				)
			)
		)
		const fineRevenue = fineCount * MANDATORY_VOTE_FINE_AMOUNT

		if (fineRevenue > 0) {
			window.humanityProtocolFunds?.adjustFunds?.(fineRevenue)
		}

		mandatoryVoteState.lastFineCount = fineCount
		mandatoryVoteState.lastFineRevenue = fineRevenue
		mandatoryVoteState.totalFineCount += fineCount
		mandatoryVoteState.totalFineRevenue += fineRevenue

		return {
			fineCount,
			fineRevenue
		}
	}

	resetState()

	window.humanityProtocolEconomy?.registerIncomeSource?.('law:incomeTax', (incomeLevelId, grossMonthlyIncome) => {
		const state = lawState.incomeTax

		if (!state?.enabled || state.taxRate <= 0) {
			return 0
		}

		const bracketFactor = INCOME_TAX_BRACKETS[incomeLevelId] ?? 1
		const effectiveRate = Math.max(0, Math.min(1, (state.taxRate / 100) * bracketFactor))
		return -grossMonthlyIncome * effectiveRate
	})

	window.humanityProtocolEconomy?.registerIncomeSource?.('law:basicIncome', () => {
		const state = lawState.basicIncome

		if (!state?.enabled || state.monthlyAmount <= 0) {
			return 0
		}

		return state.monthlyAmount * Math.max(0, Math.min(1, Number(state.coverageRatio) || 0))
	})

	window.humanityProtocolLivingConditions?.registerConditionSource?.('law:basicIncome', describeBasicIncomeEffects)
	window.humanityProtocolLivingConditions?.registerConditionSource?.('law:incomeTax', describeIncomeTaxEffects)
	window.humanityProtocolLivingConditions?.registerConditionSource?.('law:mandatoryVote', describeMandatoryVoteEffects)
	window.humanityProtocolLivingConditions?.registerConditionSource?.('law:fixedVoteHour', describeFixedVoteHourEffects)

	window.humanityProtocolTools.registerTool({
		debugLabel: 'Lois universelles',
		getTitle: (language) => language === 'en' ? 'Universal Laws' : 'Lois universelles',
		id: 'universal-laws',
		enabled: false,
		onDisable: hideLawsPanel,
		onEnable: ({ toolBody }) => ensureLawsPanel(toolBody),
		render: renderUniversalLawsTool
	})

window.humanityProtocolUniversalLawsTool = {
		applyMandatoryVoteConsequences,
		buildSnapshot,
		getMandatoryVoteSummary: () => ({
			enabled: lawState.mandatoryVote.enabled,
			sanctionId: lawState.mandatoryVote.sanctionId,
			lastFineCount: lawState.mandatoryVote.lastFineCount,
			lastFineRevenue: lawState.mandatoryVote.lastFineRevenue,
			totalFineCount: lawState.mandatoryVote.totalFineCount,
			totalFineRevenue: lawState.mandatoryVote.totalFineRevenue
		}),
		isMandatoryVoteEnabled: () => lawState.mandatoryVote.enabled,
		applyBasicIncomeConsequences,
		applyIncomeTaxConsequences,
		getBasicIncomeSummary: () => ({
			enabled: lawState.basicIncome.enabled,
			dailyAmount: lawState.basicIncome.dailyAmount,
			coverageRatio: lawState.basicIncome.coverageRatio,
			lastPayout: lawState.basicIncome.lastPayout,
			totalPayout: lawState.basicIncome.totalPayout
		}),
		getCohortTaxRate,
		getIncomeTaxSummary: () => ({
			enabled: lawState.incomeTax.enabled,
			taxRate: lawState.incomeTax.taxRate,
			lastTaxRevenue: lawState.incomeTax.lastTaxRevenue,
			totalTaxRevenue: lawState.incomeTax.totalTaxRevenue
		}),
		getFixedVoteHourSummary: () => ({
			enabled: lawState.fixedVoteHour.enabled,
			voteHour: lawState.fixedVoteHour.voteHour
		}),
		render: renderUniversalLawsTool,
		resetState,
		restoreSnapshot
	}
})()
