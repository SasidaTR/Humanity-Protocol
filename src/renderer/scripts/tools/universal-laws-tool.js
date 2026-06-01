(function(){
	const MANDATORY_VOTE_FINE_AMOUNT = 135
	const MANDATORY_VOTE_FINE_RATE_PER_WINDOW = 0.012

	const LAW_DEFINITIONS = {
		mandatoryVote: {
			id: 'mandatoryVote',
			defaultEnabled: false,
			sanctions: ['fine']
		}
	}

	let currentLanguage = 'fr'
	let lawsPanel = null
	let lawElements = {}
	const lawState = {
		mandatoryVote: {
			enabled: LAW_DEFINITIONS.mandatoryVote.defaultEnabled,
			sanctionId: LAW_DEFINITIONS.mandatoryVote.sanctions[0],
			lastFineCount: 0,
			lastFineRevenue: 0,
			totalFineCount: 0,
			totalFineRevenue: 0
		}
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
		sanctionGroup.className = 'universal-laws-detail-group'

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

		effectGroup.append(effectValue)
		sanctionGroup.append(sanctionValue, sanctionSelect)
		body.append(effectGroup, sanctionGroup)

		row.append(toggleLabel, body)

		lawElements[lawId] = {
			row,
			checkbox,
			name,
			effectValue,
			sanctionValue,
			sanctionSelect
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
			version: 3,
			laws: Object.entries(lawState).reduce((snapshot, [lawId, state]) => {
				snapshot[lawId] = {
					enabled: Boolean(state.enabled),
					sanctionId: state.sanctionId,
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

		Object.keys(LAW_DEFINITIONS).forEach((lawId) => {
			const definition = getLawDefinition(lawId)
			const savedLaw = savedLaws[lawId]
			const defaultSanctionId = definition.sanctions[0]
			const nextSanctionId = definition.sanctions.includes(savedLaw?.sanctionId)
				? savedLaw.sanctionId
				: defaultSanctionId

			lawState[lawId] = {
				enabled: Boolean(savedLaw?.enabled),
				sanctionId: nextSanctionId,
				lastFineCount: Math.max(0, Math.round(Number(savedLaw?.lastFineCount) || 0)),
				lastFineRevenue: Math.max(0, Math.round(Number(savedLaw?.lastFineRevenue) || 0)),
				totalFineCount: Math.max(0, Math.round(Number(savedLaw?.totalFineCount) || 0)),
				totalFineRevenue: Math.max(0, Math.round(Number(savedLaw?.totalFineRevenue) || 0))
			}
		})
	}

	function resetState(){
		Object.keys(LAW_DEFINITIONS).forEach((lawId) => {
			const definition = getLawDefinition(lawId)
			lawState[lawId] = {
				enabled: Boolean(definition.defaultEnabled),
				sanctionId: definition.sanctions[0],
				lastFineCount: 0,
				lastFineRevenue: 0,
				totalFineCount: 0,
				totalFineRevenue: 0
			}
		})
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
		render: renderUniversalLawsTool,
		resetState,
		restoreSnapshot
	}
})()
