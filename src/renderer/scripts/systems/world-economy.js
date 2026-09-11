(function(){
	const economyConfig = window.humanityProtocolConfig?.economy || {}
	const HOURS_PER_YEAR = economyConfig.hoursPerYear ?? 8766
	const MONTHS_PER_YEAR = economyConfig.monthsPerYear ?? 12
	const DAYS_PER_MONTH = economyConfig.daysPerMonth ?? 30
	const AVERAGE_MONTHLY_INCOME = economyConfig.averageMonthlyIncome ?? 1200
	const INCOME_MULTIPLIER_BY_LEVEL = economyConfig.incomeMultiplierByLevel || {}
	const ACTIVITY_INCOME_FACTOR = economyConfig.activityIncomeFactor || {}
	const AGE_INCOME_FACTOR = economyConfig.ageIncomeFactor || {}
	const RATE_PERIODS = economyConfig.ratePeriods || {
		month: 1,
		week: 7 / 30,
		day: 1 / 30
	}
	const RATE_PERIOD_IDS = Object.keys(RATE_PERIODS)
	const DEFAULT_RATE_PERIOD = RATE_PERIOD_IDS.includes('month') ? 'month' : RATE_PERIOD_IDS[0]

	const economyListeners = new Set()
	const incomeSources = new Map()

	let ratePeriod = DEFAULT_RATE_PERIOD

	function getMonthlyIncomeForLevel(incomeLevelId){
		return AVERAGE_MONTHLY_INCOME * (Number(INCOME_MULTIPLIER_BY_LEVEL[incomeLevelId]) || 0)
	}

	function getAnnualIncomeForLevel(incomeLevelId){
		return getMonthlyIncomeForLevel(incomeLevelId) * MONTHS_PER_YEAR
	}

	function getCohortIncomeFactor(cohort){
		const activityFactor = ACTIVITY_INCOME_FACTOR[cohort?.activityId] ?? ACTIVITY_INCOME_FACTOR.none ?? 1
		const ageFactor = AGE_INCOME_FACTOR[cohort?.ageGroupId] ?? 1
		return activityFactor * ageFactor
	}

	function getCohortAnnualIncome(cohort){
		return getAnnualIncomeForLevel(cohort?.incomeLevelId) * getCohortIncomeFactor(cohort)
	}

	function registerIncomeSource(sourceId, describeMonthlyChange){
		if (!sourceId || typeof describeMonthlyChange !== 'function') {
			return () => {}
		}

		incomeSources.set(sourceId, describeMonthlyChange)
		return () => {
			incomeSources.delete(sourceId)
		}
	}

	function getNetMonthlyIncomeForLevel(incomeLevelId){
		const grossMonthlyIncome = getMonthlyIncomeForLevel(incomeLevelId)
		let netMonthlyIncome = grossMonthlyIncome

		incomeSources.forEach((describeMonthlyChange) => {
			netMonthlyIncome += Number(describeMonthlyChange(incomeLevelId, grossMonthlyIncome)) || 0
		})

		return Math.max(0, netMonthlyIncome)
	}

	function sanitizeRatePeriod(nextRatePeriod){
		return RATE_PERIOD_IDS.includes(nextRatePeriod) ? nextRatePeriod : DEFAULT_RATE_PERIOD
	}

	function getRatePeriod(){
		return ratePeriod
	}

	function setRatePeriod(nextRatePeriod){
		const resolvedRatePeriod = sanitizeRatePeriod(nextRatePeriod)

		if (resolvedRatePeriod === ratePeriod) {
			return ratePeriod
		}

		ratePeriod = resolvedRatePeriod
		economyListeners.forEach((listener) => listener(ratePeriod))
		return ratePeriod
	}

	function getRatePeriodFactor(period = ratePeriod){
		return Number(RATE_PERIODS[sanitizeRatePeriod(period)]) || 1
	}

	function convertMonthlyAmount(monthlyAmount, period = ratePeriod){
		return (Number(monthlyAmount) || 0) * getRatePeriodFactor(period)
	}

	function formatAmount(amount){
		const boundedAmount = Number(amount) || 0
		const decimals = Math.abs(boundedAmount) > 0 && Math.abs(boundedAmount) < 10 ? 2 : 0

		if (decimals === 0) {
			return boundedAmount.toFixed(0)
		}

		return boundedAmount.toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '')
	}

	function subscribe(listener){
		economyListeners.add(listener)
		return () => {
			economyListeners.delete(listener)
		}
	}

	window.humanityProtocolEconomy = {
		averageMonthlyIncome: AVERAGE_MONTHLY_INCOME,
		convertMonthlyAmount,
		daysPerMonth: DAYS_PER_MONTH,
		formatAmount,
		getAnnualIncomeForLevel,
		getCohortAnnualIncome,
		getCohortIncomeFactor,
		getMonthlyIncomeForLevel,
		getNetMonthlyIncomeForLevel,
		registerIncomeSource,
		getRatePeriod,
		getRatePeriodFactor,
		hoursPerYear: HOURS_PER_YEAR,
		monthsPerYear: MONTHS_PER_YEAR,
		ratePeriodIds: [...RATE_PERIOD_IDS],
		sanitizeRatePeriod,
		setRatePeriod,
		subscribe
	}
})()
