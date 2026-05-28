const INITIAL_WORLD_POPULATION = 8_000_000_000
const INITIAL_SATISFACTION = 50
const POPULATION_OSCILLATION_RANGE = 12_000_000
const SATISFACTION_OSCILLATION_RANGE = 6
const FEMALE_SHARE_OSCILLATION_RANGE = 0.008
const populationListeners = new Set()

const populationState = {
	total: INITIAL_WORLD_POPULATION,
	satisfaction: INITIAL_SATISFACTION,
	demographics: {
		sex: {
			female: 0.5,
			male: 0.5
		}
	},
	trend: {
		populationDelta: 0,
		satisfactionDelta: 0,
		femaleShareDelta: 0
	}
}

function createInitialPopulation(){
	return {
		total: INITIAL_WORLD_POPULATION,
		satisfaction: INITIAL_SATISFACTION,
		demographics: {
			sex: {
				female: 0.5,
				male: 0.5
			}
		},
		trend: {
			populationDelta: 0,
			satisfactionDelta: 0,
			femaleShareDelta: 0
		}
	}
}

function clamp(value, min, max){
	return Math.min(Math.max(value, min), max)
}

function buildSexCounts(){
	const female = Math.round(populationState.total * populationState.demographics.sex.female)
	return {
		female,
		male: populationState.total - female
	}
}

function normalizeSexShares(femaleShare){
	const nextFemaleShare = clamp(femaleShare, 0.5 - FEMALE_SHARE_OSCILLATION_RANGE, 0.5 + FEMALE_SHARE_OSCILLATION_RANGE)
	return {
		female: nextFemaleShare,
		male: 1 - nextFemaleShare
	}
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

function notifyPopulationListeners(){
	const snapshot = buildPopulationSnapshot()
	populationListeners.forEach((listener) => {
		listener(snapshot)
	})
}

function stepSimulation(){
	const populationOffset = populationState.total - INITIAL_WORLD_POPULATION
	const satisfactionOffset = populationState.satisfaction - INITIAL_SATISFACTION
	const femaleShareOffset = populationState.demographics.sex.female - 0.5

	populationState.trend.populationDelta = clamp(
		populationState.trend.populationDelta - populationOffset * 0.015 + (Math.random() - 0.5) * 180_000,
		-700_000,
		700_000
	)
	populationState.trend.satisfactionDelta = clamp(
		populationState.trend.satisfactionDelta - satisfactionOffset * 0.18 + (Math.random() - 0.5) * 1.2,
		-1.8,
		1.8
	)
	populationState.trend.femaleShareDelta = clamp(
		populationState.trend.femaleShareDelta - femaleShareOffset * 0.22 + (Math.random() - 0.5) * 0.00022,
		-0.0008,
		0.0008
	)

	populationState.total = clamp(
		Math.round(populationState.total + populationState.trend.populationDelta),
		INITIAL_WORLD_POPULATION - POPULATION_OSCILLATION_RANGE,
		INITIAL_WORLD_POPULATION + POPULATION_OSCILLATION_RANGE
	)
	populationState.satisfaction = clamp(
		Math.round((populationState.satisfaction + populationState.trend.satisfactionDelta) * 10) / 10,
		INITIAL_SATISFACTION - SATISFACTION_OSCILLATION_RANGE,
		INITIAL_SATISFACTION + SATISFACTION_OSCILLATION_RANGE
	)
	populationState.demographics.sex = normalizeSexShares(
		populationState.demographics.sex.female + populationState.trend.femaleShareDelta
	)
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
		sex: normalizeSexShares(resolveSavedFemaleShare(savedPopulation))
	}
	populationState.trend = {
		populationDelta: 0,
		satisfactionDelta: 0,
		femaleShareDelta: 0
	}
	notifyPopulationListeners()

	return buildPopulationSnapshot()
}

function buildPopulationSnapshot(){
	const sexCounts = buildSexCounts()
	return {
		version: 2,
		total: populationState.total,
		satisfaction: populationState.satisfaction,
		demographics: {
			sex: {
				female: populationState.demographics.sex.female,
				male: populationState.demographics.sex.male
			}
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

	stepSimulation()
})
