const INITIAL_WORLD_POPULATION = 8_000_000_000
const INITIAL_SATISFACTION = 50
const POPULATION_OSCILLATION_RANGE = 12_000_000
const SATISFACTION_OSCILLATION_RANGE = 6
const FEMALE_SHARE_OSCILLATION_RANGE = 0.008
const DEFAULT_SIMULATION_INTERVAL_MS = 1500

const populationListeners = new Set()
let simulationTimerId = null
let simulationIntervalMs = DEFAULT_SIMULATION_INTERVAL_MS

const populationState = {
	total: INITIAL_WORLD_POPULATION,
	satisfaction: INITIAL_SATISFACTION,
	sexShare: {
		female: 0.5,
		male: 0.5
	},
	trend: {
		populationDelta: 0,
		satisfactionDelta: 0,
		femaleShareDelta: 0
	},
	sex: {
		female: INITIAL_WORLD_POPULATION / 2,
		male: INITIAL_WORLD_POPULATION / 2
	}
}

function createInitialPopulation(){
	return {
		total: INITIAL_WORLD_POPULATION,
		satisfaction: INITIAL_SATISFACTION,
		sexShare: {
			female: 0.5,
			male: 0.5
		},
		trend: {
			populationDelta: 0,
			satisfactionDelta: 0,
			femaleShareDelta: 0
		},
		sex: {
			female: INITIAL_WORLD_POPULATION / 2,
			male: INITIAL_WORLD_POPULATION / 2
		}
	}
}

function clamp(value, min, max){
	return Math.min(Math.max(value, min), max)
}

function rebuildSexCounts(){
	populationState.sex.female = Math.round(populationState.total * populationState.sexShare.female)
	populationState.sex.male = populationState.total - populationState.sex.female
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
	const femaleShareOffset = populationState.sexShare.female - 0.5

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
	populationState.sexShare.female = clamp(
		populationState.sexShare.female + populationState.trend.femaleShareDelta,
		0.5 - FEMALE_SHARE_OSCILLATION_RANGE,
		0.5 + FEMALE_SHARE_OSCILLATION_RANGE
	)
	populationState.sexShare.male = 1 - populationState.sexShare.female
	rebuildSexCounts()
	notifyPopulationListeners()
}

function runSimulationLoop(){
	stepSimulation()
	simulationTimerId = setTimeout(runSimulationLoop, simulationIntervalMs)
}

function startSimulation(){
	if (simulationTimerId) {
		return
	}

	simulationTimerId = setTimeout(runSimulationLoop, simulationIntervalMs)
}

function stopSimulation(){
	if (!simulationTimerId) {
		return
	}

	clearTimeout(simulationTimerId)
	simulationTimerId = null
}

function setSimulationInterval(seconds){
	const nextSeconds = Number(seconds)

	if (!Number.isFinite(nextSeconds) || nextSeconds <= 0) {
		return simulationIntervalMs / 1000
	}

	simulationIntervalMs = nextSeconds * 1000

	if (simulationTimerId) {
		stopSimulation()
		startSimulation()
	}

	return nextSeconds
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
	populationState.sexShare = { ...nextPopulation.sexShare }
	populationState.trend = { ...nextPopulation.trend }
	populationState.sex = { ...nextPopulation.sex }
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
	populationState.sexShare = {
		female: clamp(Number(savedPopulation?.sex?.female) / populationState.total || 0.5, 0.485, 0.515),
		male: 0.5
	}
	populationState.sexShare.male = 1 - populationState.sexShare.female
	populationState.trend = {
		populationDelta: 0,
		satisfactionDelta: 0,
		femaleShareDelta: 0
	}
	populationState.sex = {
		female: Number(savedPopulation?.sex?.female) || 0,
		male: Number(savedPopulation?.sex?.male) || 0
	}

	rebuildSexCounts()
	notifyPopulationListeners()

	return buildPopulationSnapshot()
}

function buildPopulationSnapshot(){
	return {
		total: populationState.total,
		satisfaction: populationState.satisfaction,
		sex: {
			female: populationState.sex.female,
			male: populationState.sex.male
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
	setSimulationInterval,
	startSimulation,
	stopSimulation,
	subscribe
}
