const INITIAL_WORLD_POPULATION = 8_000_000_000
const INITIAL_SATISFACTION = 60
const SATISFACTION_OSCILLATION_RANGE = 6
const FEMALE_SHARE_OSCILLATION_RANGE = 0.008
const WORKER_SHARE_OSCILLATION_RANGE = 0.08
const HOURS_PER_YEAR = 365.25 * 24
const LIFE_EXPECTANCY_YEARS = 80
const TARGET_EVENTS_PER_MINUTE = 180
const TARGET_EVENTS_PER_HOUR = TARGET_EVENTS_PER_MINUTE * 60
const EVENT_BALANCE_VARIATION = 0.25
const INCOME_LEVEL_GROUPS = {
	veryPoor: 0.1,
	poor: 0.51,
	middleIncome: 0.17,
	comfortableIncome: 0.15,
	highIncome: 0.07
}
const AGE_GROUPS = {
	age0To17: {
		durationYears: 18,
		initialShare: 0.215
	},
	age18To34: {
		durationYears: 17,
		initialShare: 0.235
	},
	age35To64: {
		durationYears: 30,
		initialShare: 0.37
	},
	age65Plus: {
		durationYears: LIFE_EXPECTANCY_YEARS - 65,
		initialShare: 0.18
	}
}
const populationListeners = new Set()

const populationState = {
	total: INITIAL_WORLD_POPULATION,
	satisfaction: INITIAL_SATISFACTION,
	demographics: {
		age: {
			age0To17: AGE_GROUPS.age0To17.initialShare,
			age18To34: AGE_GROUPS.age18To34.initialShare,
			age35To64: AGE_GROUPS.age35To64.initialShare,
			age65Plus: AGE_GROUPS.age65Plus.initialShare
		},
		activity: {
			workers: 0.6,
			nonWorkers: 0.4
		},
		incomeLevel: {
			veryPoor: INCOME_LEVEL_GROUPS.veryPoor,
			poor: INCOME_LEVEL_GROUPS.poor,
			middleIncome: INCOME_LEVEL_GROUPS.middleIncome,
			comfortableIncome: INCOME_LEVEL_GROUPS.comfortableIncome,
			highIncome: INCOME_LEVEL_GROUPS.highIncome
		},
		sex: {
			female: 0.5,
			male: 0.5
		}
	},
	trend: {
		satisfactionDelta: 0,
		birthBalanceDelta: 0,
		deathBalanceDelta: 0,
		workerShareDelta: 0,
		femaleShareDelta: 0
	}
}

function createInitialPopulation(){
	return {
		total: INITIAL_WORLD_POPULATION,
		satisfaction: INITIAL_SATISFACTION,
		demographics: {
			age: {
				age0To17: AGE_GROUPS.age0To17.initialShare,
				age18To34: AGE_GROUPS.age18To34.initialShare,
				age35To64: AGE_GROUPS.age35To64.initialShare,
				age65Plus: AGE_GROUPS.age65Plus.initialShare
			},
			activity: {
				workers: 0.6,
				nonWorkers: 0.4
			},
			incomeLevel: {
				veryPoor: INCOME_LEVEL_GROUPS.veryPoor,
				poor: INCOME_LEVEL_GROUPS.poor,
				middleIncome: INCOME_LEVEL_GROUPS.middleIncome,
				comfortableIncome: INCOME_LEVEL_GROUPS.comfortableIncome,
				highIncome: INCOME_LEVEL_GROUPS.highIncome
			},
			sex: {
				female: 0.5,
				male: 0.5
			}
		},
		trend: {
			satisfactionDelta: 0,
			birthBalanceDelta: 0,
			deathBalanceDelta: 0,
			workerShareDelta: 0,
			femaleShareDelta: 0
		}
	}
}

function clamp(value, min, max){
	return Math.min(Math.max(value, min), max)
}

function buildAgeCounts(){
	const ageGroupIds = Object.keys(populationState.demographics.age)
	const rawCounts = ageGroupIds.reduce((counts, ageGroupId) => {
		counts[ageGroupId] = populationState.total * populationState.demographics.age[ageGroupId]
		return counts
	}, {})
	const roundedCounts = {}
	let assignedPopulation = 0

	ageGroupIds.forEach((ageGroupId, index) => {
		if (index === ageGroupIds.length - 1) {
			roundedCounts[ageGroupId] = Math.max(0, populationState.total - assignedPopulation)
			return
		}

		const roundedCount = Math.max(0, Math.round(rawCounts[ageGroupId]))
		roundedCounts[ageGroupId] = roundedCount
		assignedPopulation += roundedCount
	})

	return roundedCounts
}

function buildSexCounts(){
	const female = Math.round(populationState.total * populationState.demographics.sex.female)
	return {
		female,
		male: populationState.total - female
	}
}

function buildActivityCounts(){
	const ageCounts = buildAgeCounts()
	const workingAgePopulation = ageCounts.age18To34 + ageCounts.age35To64
	const workers = Math.round(workingAgePopulation * populationState.demographics.activity.workers)

	return {
		workingAgePopulation,
		workers,
		nonWorkers: Math.max(0, workingAgePopulation - workers)
	}
}

function buildIncomeLevelCounts(){
	const incomeLevelIds = Object.keys(populationState.demographics.incomeLevel)
	const rawCounts = incomeLevelIds.reduce((counts, incomeLevelId) => {
		counts[incomeLevelId] = populationState.total * populationState.demographics.incomeLevel[incomeLevelId]
		return counts
	}, {})
	const roundedCounts = {}
	let assignedPopulation = 0

	incomeLevelIds.forEach((incomeLevelId, index) => {
		if (index === incomeLevelIds.length - 1) {
			roundedCounts[incomeLevelId] = Math.max(0, populationState.total - assignedPopulation)
			return
		}

		const roundedCount = Math.max(0, Math.round(rawCounts[incomeLevelId]))
		roundedCounts[incomeLevelId] = roundedCount
		assignedPopulation += roundedCount
	})

	return roundedCounts
}

function normalizeSexShares(femaleShare){
	const nextFemaleShare = clamp(femaleShare, 0.5 - FEMALE_SHARE_OSCILLATION_RANGE, 0.5 + FEMALE_SHARE_OSCILLATION_RANGE)
	return {
		female: nextFemaleShare,
		male: 1 - nextFemaleShare
	}
}

function normalizeActivityShares(workerShare){
	const nextWorkerShare = clamp(workerShare, 0.6 - WORKER_SHARE_OSCILLATION_RANGE, 0.6 + WORKER_SHARE_OSCILLATION_RANGE)
	return {
		workers: nextWorkerShare,
		nonWorkers: 1 - nextWorkerShare
	}
}

function normalizeIncomeLevelShares(incomeLevelShares){
	const incomeLevelIds = Object.keys(INCOME_LEVEL_GROUPS)
	const sanitizedShares = incomeLevelIds.reduce((shares, incomeLevelId) => {
		shares[incomeLevelId] = Math.max(0, Number(incomeLevelShares?.[incomeLevelId]) || 0)
		return shares
	}, {})
	const totalShare = incomeLevelIds.reduce((sum, incomeLevelId) => sum + sanitizedShares[incomeLevelId], 0)

	if (totalShare <= 0) {
		return incomeLevelIds.reduce((shares, incomeLevelId) => {
			shares[incomeLevelId] = INCOME_LEVEL_GROUPS[incomeLevelId]
			return shares
		}, {})
	}

	return incomeLevelIds.reduce((shares, incomeLevelId) => {
		shares[incomeLevelId] = sanitizedShares[incomeLevelId] / totalShare
		return shares
	}, {})
}

function normalizeAgeShares(ageShares){
	const ageGroupIds = Object.keys(AGE_GROUPS)
	const sanitizedShares = ageGroupIds.reduce((shares, ageGroupId) => {
		shares[ageGroupId] = Math.max(0, Number(ageShares?.[ageGroupId]) || 0)
		return shares
	}, {})
	const totalShare = ageGroupIds.reduce((sum, ageGroupId) => sum + sanitizedShares[ageGroupId], 0)

	if (totalShare <= 0) {
		return ageGroupIds.reduce((shares, ageGroupId) => {
			shares[ageGroupId] = AGE_GROUPS[ageGroupId].initialShare
			return shares
		}, {})
	}

	return ageGroupIds.reduce((shares, ageGroupId) => {
		shares[ageGroupId] = sanitizedShares[ageGroupId] / totalShare
		return shares
	}, {})
}

function buildAgeSharesFromCounts(savedPopulation){
	const savedAge = savedPopulation?.age || {}
	const totalPopulation = Number(savedPopulation?.total) || 0
	const ageCounts = Object.keys(AGE_GROUPS).reduce((counts, ageGroupId) => {
		counts[ageGroupId] = Math.max(0, Number(savedAge?.[ageGroupId]) || 0)
		return counts
	}, {})
	const totalFromCounts = Object.values(ageCounts).reduce((sum, value) => sum + value, 0)
	const referenceTotal = totalPopulation > 0 ? totalPopulation : totalFromCounts

	if (referenceTotal <= 0) {
		return null
	}

	return normalizeAgeShares(
		Object.entries(ageCounts).reduce((shares, [ageGroupId, count]) => {
			shares[ageGroupId] = count / referenceTotal
			return shares
		}, {})
	)
}

function resolveSavedAgeShares(savedPopulation){
	const savedAgeShares = savedPopulation?.demographics?.age

	if (savedAgeShares && Object.keys(savedAgeShares).length > 0) {
		return normalizeAgeShares(savedAgeShares)
	}

	return buildAgeSharesFromCounts(savedPopulation) || normalizeAgeShares()
}

function resolveSavedFemaleShare(savedPopulation){
	const savedFemaleShare = Number(savedPopulation?.demographics?.sex?.female)

	if (Number.isFinite(savedFemaleShare)) {
		return savedFemaleShare
	}

	const savedFemaleCount = Number(savedPopulation?.sex?.female)
	const savedMaleCount = Number(savedPopulation?.sex?.male)
	const savedTotal = Number(savedPopulation?.total)
	const totalFromCounts = savedFemaleCount + savedMaleCount
	const referenceTotal = savedTotal > 0 ? savedTotal : totalFromCounts

	if (referenceTotal > 0 && Number.isFinite(savedFemaleCount)) {
		return savedFemaleCount / referenceTotal
	}

	return 0.5
}

function resolveSavedWorkerShare(savedPopulation){
	const savedWorkerShare = Number(savedPopulation?.demographics?.activity?.workers)

	if (Number.isFinite(savedWorkerShare)) {
		return savedWorkerShare
	}

	const savedWorkers = Number(savedPopulation?.activity?.workers)
	const savedNonWorkers = Number(savedPopulation?.activity?.nonWorkers)
	const totalWorkingAge = savedWorkers + savedNonWorkers

	if (totalWorkingAge > 0 && Number.isFinite(savedWorkers)) {
		return savedWorkers / totalWorkingAge
	}

	return 0.6
}

function buildIncomeLevelSharesFromCounts(savedPopulation){
	const savedIncomeLevel = savedPopulation?.incomeLevel || {}
	const totalPopulation = Number(savedPopulation?.total) || 0
	const incomeLevelCounts = Object.keys(INCOME_LEVEL_GROUPS).reduce((counts, incomeLevelId) => {
		counts[incomeLevelId] = Math.max(0, Number(savedIncomeLevel?.[incomeLevelId]) || 0)
		return counts
	}, {})
	const totalFromCounts = Object.values(incomeLevelCounts).reduce((sum, value) => sum + value, 0)
	const referenceTotal = totalPopulation > 0 ? totalPopulation : totalFromCounts

	if (referenceTotal <= 0) {
		return null
	}

	return normalizeIncomeLevelShares(
		Object.entries(incomeLevelCounts).reduce((shares, [incomeLevelId, count]) => {
			shares[incomeLevelId] = count / referenceTotal
			return shares
		}, {})
	)
}

function resolveSavedIncomeLevelShares(savedPopulation){
	const savedIncomeLevelShares = savedPopulation?.demographics?.incomeLevel

	if (savedIncomeLevelShares && Object.keys(savedIncomeLevelShares).length > 0) {
		return normalizeIncomeLevelShares(savedIncomeLevelShares)
	}

	return buildIncomeLevelSharesFromCounts(savedPopulation) || normalizeIncomeLevelShares()
}

function notifyPopulationListeners(){
	const snapshot = buildPopulationSnapshot()
	populationListeners.forEach((listener) => {
		listener(snapshot)
	})
}

function stepSimulation(stepHours = 1){
	const normalizedStepHours = Math.max(0, Number(stepHours) || 0)
	const satisfactionOffset = populationState.satisfaction - INITIAL_SATISFACTION
	const femaleShareOffset = populationState.demographics.sex.female - 0.5
	const ageCounts = buildAgeCounts()
	const childOutflow = ageCounts.age0To17 * normalizedStepHours / (AGE_GROUPS.age0To17.durationYears * HOURS_PER_YEAR)
	const youngAdultOutflow = ageCounts.age18To34 * normalizedStepHours / (AGE_GROUPS.age18To34.durationYears * HOURS_PER_YEAR)
	const matureAdultOutflow = ageCounts.age35To64 * normalizedStepHours / (AGE_GROUPS.age35To64.durationYears * HOURS_PER_YEAR)

	populationState.trend.satisfactionDelta = clamp(
		populationState.trend.satisfactionDelta - satisfactionOffset * 0.18 + (Math.random() - 0.5) * 1.2,
		-1.8,
		1.8
	)
	populationState.trend.birthBalanceDelta = clamp(
		populationState.trend.birthBalanceDelta - populationState.trend.birthBalanceDelta * 0.08 + (Math.random() - 0.5) * 0.03,
		-EVENT_BALANCE_VARIATION,
		EVENT_BALANCE_VARIATION
	)
	populationState.trend.deathBalanceDelta = clamp(
		populationState.trend.deathBalanceDelta - populationState.trend.deathBalanceDelta * 0.08 + (Math.random() - 0.5) * 0.03,
		-EVENT_BALANCE_VARIATION,
		EVENT_BALANCE_VARIATION
	)
	populationState.trend.workerShareDelta = clamp(
		populationState.trend.workerShareDelta - populationState.trend.workerShareDelta * 0.18 + (Math.random() - 0.5) * 0.0025,
		-0.015,
		0.015
	)
	populationState.trend.femaleShareDelta = clamp(
		populationState.trend.femaleShareDelta - femaleShareOffset * 0.22 + (Math.random() - 0.5) * 0.00022,
		-0.0008,
		0.0008
	)

	const targetDeaths = TARGET_EVENTS_PER_HOUR * normalizedStepHours
	const deathBalanceRate = clamp(
		1 + populationState.trend.deathBalanceDelta + ((INITIAL_SATISFACTION - populationState.satisfaction) * 0.004),
		0.75,
		1.25
	)
	const seniorDeathCapacity = Math.max(1, ageCounts.age65Plus + matureAdultOutflow)
	const deaths = Math.min(seniorDeathCapacity, targetDeaths * deathBalanceRate)
	const targetBirths = TARGET_EVENTS_PER_HOUR * normalizedStepHours
	const birthBalanceRate = clamp(
		1 + populationState.trend.birthBalanceDelta + ((populationState.satisfaction - INITIAL_SATISFACTION) * 0.004),
		0.75,
		1.25
	)
	const births = targetBirths * birthBalanceRate
	const nextAgeCounts = {
		age0To17: Math.max(0, ageCounts.age0To17 + births - childOutflow),
		age18To34: Math.max(0, ageCounts.age18To34 + childOutflow - youngAdultOutflow),
		age35To64: Math.max(0, ageCounts.age35To64 + youngAdultOutflow - matureAdultOutflow),
		age65Plus: Math.max(0, ageCounts.age65Plus + matureAdultOutflow - deaths)
	}
	const nextTotalPopulation = Math.max(
		0,
		Math.round(
			nextAgeCounts.age0To17 +
			nextAgeCounts.age18To34 +
			nextAgeCounts.age35To64 +
			nextAgeCounts.age65Plus
		)
	)

	populationState.total = nextTotalPopulation
	populationState.satisfaction = clamp(
		Math.round((populationState.satisfaction + populationState.trend.satisfactionDelta) * 10) / 10,
		INITIAL_SATISFACTION - SATISFACTION_OSCILLATION_RANGE,
		INITIAL_SATISFACTION + SATISFACTION_OSCILLATION_RANGE
	)
	populationState.demographics.activity = normalizeActivityShares(
		populationState.demographics.activity.workers +
		populationState.trend.workerShareDelta +
		((populationState.satisfaction - INITIAL_SATISFACTION) * 0.0006)
	)
	populationState.demographics.sex = normalizeSexShares(
		populationState.demographics.sex.female + populationState.trend.femaleShareDelta
	)
	populationState.demographics.age = normalizeAgeShares(nextAgeCounts)
	notifyPopulationListeners()
}

function subscribe(listener){
	populationListeners.add(listener)
	return () => {
		populationListeners.delete(listener)
	}
}

function resetPopulation(){
	const nextPopulation = createInitialPopulation()
	populationState.total = nextPopulation.total
	populationState.satisfaction = nextPopulation.satisfaction
	populationState.demographics = {
		age: { ...nextPopulation.demographics.age },
		activity: { ...nextPopulation.demographics.activity },
		incomeLevel: { ...nextPopulation.demographics.incomeLevel },
		sex: { ...nextPopulation.demographics.sex }
	}
	populationState.trend = { ...nextPopulation.trend }
	notifyPopulationListeners()
	return buildPopulationSnapshot()
}

function restorePopulation(save){
	const savedPopulation = save?.population

	if (!savedPopulation) {
		return resetPopulation()
	}

	populationState.total = Number(savedPopulation.total) || INITIAL_WORLD_POPULATION
	populationState.satisfaction = clamp(Number(savedPopulation.satisfaction) || INITIAL_SATISFACTION, 0, 100)
	populationState.demographics = {
		age: resolveSavedAgeShares(savedPopulation),
		activity: normalizeActivityShares(resolveSavedWorkerShare(savedPopulation)),
		incomeLevel: resolveSavedIncomeLevelShares(savedPopulation),
		sex: normalizeSexShares(resolveSavedFemaleShare(savedPopulation))
	}
	populationState.trend = {
		satisfactionDelta: 0,
		birthBalanceDelta: 0,
		deathBalanceDelta: 0,
		workerShareDelta: 0,
		femaleShareDelta: 0
	}
	notifyPopulationListeners()

	return buildPopulationSnapshot()
}

function buildPopulationSnapshot(){
	const ageCounts = buildAgeCounts()
	const activityCounts = buildActivityCounts()
	const incomeLevelCounts = buildIncomeLevelCounts()
	const sexCounts = buildSexCounts()
	return {
		version: 4,
		total: populationState.total,
		satisfaction: populationState.satisfaction,
		demographics: {
			age: {
				age0To17: populationState.demographics.age.age0To17,
				age18To34: populationState.demographics.age.age18To34,
				age35To64: populationState.demographics.age.age35To64,
				age65Plus: populationState.demographics.age.age65Plus
			},
			activity: {
				workers: populationState.demographics.activity.workers,
				nonWorkers: populationState.demographics.activity.nonWorkers
			},
			incomeLevel: {
				veryPoor: populationState.demographics.incomeLevel.veryPoor,
				poor: populationState.demographics.incomeLevel.poor,
				middleIncome: populationState.demographics.incomeLevel.middleIncome,
				comfortableIncome: populationState.demographics.incomeLevel.comfortableIncome,
				highIncome: populationState.demographics.incomeLevel.highIncome
			},
			sex: {
				female: populationState.demographics.sex.female,
				male: populationState.demographics.sex.male
			}
		},
		age: {
			age0To17: ageCounts.age0To17,
			age18To34: ageCounts.age18To34,
			age35To64: ageCounts.age35To64,
			age65Plus: ageCounts.age65Plus
		},
		activity: {
			workers: activityCounts.workers,
			nonWorkers: activityCounts.nonWorkers
		},
		incomeLevel: {
			veryPoor: incomeLevelCounts.veryPoor,
			poor: incomeLevelCounts.poor,
			middleIncome: incomeLevelCounts.middleIncome,
			comfortableIncome: incomeLevelCounts.comfortableIncome,
			highIncome: incomeLevelCounts.highIncome
		},
		sex: {
			female: sexCounts.female,
			male: sexCounts.male
		}
	}
}

function getPopulationSummary(){
	return buildPopulationSnapshot()
}

window.humanityProtocolPopulation = {
	buildPopulationSnapshot,
	getPopulationSummary,
	resetPopulation,
	restorePopulation,
	subscribe
}

window.humanityProtocolTime.subscribe((timeSnapshot) => {
	if (!timeSnapshot.didAdvanceSimulationStep) {
		return
	}

	for (let stepIndex = 0; stepIndex < timeSnapshot.simulationStepsAdvanced; stepIndex += 1) {
		stepSimulation(timeSnapshot.simulationStepHours)
	}
})
