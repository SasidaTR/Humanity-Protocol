const DEFAULT_TICK_INTERVAL_MS = 1000
const DEFAULT_SPEED_MULTIPLIER = 1
const SPEED_TO_SIMULATED_MINUTES_PER_TICK = {
	0: 0,
	1: 1,
	2: 2,
	3: 4
}
const DEFAULT_SIMULATION_STEP_HOURS = 1

const timeListeners = new Set()

let tickTimerId = null
let speedMultiplier = DEFAULT_SPEED_MULTIPLIER
let simulationRequested = false
let simulationStepHours = DEFAULT_SIMULATION_STEP_HOURS

const timeState = createInitialTimeState()

function createInitialTimeState(referenceDate = new Date()){
	const currentDate = new Date(referenceDate)

	return {
		currentDate,
		dayKey: buildDayKey(currentDate),
		simulationStepKey: buildSimulationStepKey(currentDate)
	}
}

function buildDayKey(date){
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, '0'),
		String(date.getDate()).padStart(2, '0')
	].join('-')
}

function buildSimulationStepKey(date){
	return Math.floor(date.getTime() / (simulationStepHours * 60 * 60 * 1000))
}

function buildTimeSnapshot(previousDayKey = timeState.dayKey, previousSimulationStepKey = timeState.simulationStepKey){
	return {
		version: 1,
		timestamp: timeState.currentDate.getTime(),
		isoDate: timeState.currentDate.toISOString(),
		dayKey: timeState.dayKey,
		didAdvanceDay: timeState.dayKey !== previousDayKey,
		simulationStepHours,
		didAdvanceSimulationStep: timeState.simulationStepKey !== previousSimulationStepKey,
		speedMultiplier
	}
}

function notifyTimeListeners(previousDayKey = timeState.dayKey, previousSimulationStepKey = timeState.simulationStepKey){
	const snapshot = buildTimeSnapshot(previousDayKey, previousSimulationStepKey)
	timeListeners.forEach((listener) => {
		listener(snapshot)
	})
	return snapshot
}

function advanceTime(){
	const previousDayKey = timeState.dayKey
	const previousSimulationStepKey = timeState.simulationStepKey
	const simulatedMinutesPerTick = SPEED_TO_SIMULATED_MINUTES_PER_TICK[speedMultiplier] ?? SPEED_TO_SIMULATED_MINUTES_PER_TICK[1]
	timeState.currentDate = new Date(
		timeState.currentDate.getTime() + simulatedMinutesPerTick * 60 * 1000
	)
	timeState.dayKey = buildDayKey(timeState.currentDate)
	timeState.simulationStepKey = buildSimulationStepKey(timeState.currentDate)
	notifyTimeListeners(previousDayKey, previousSimulationStepKey)
}

function runTimeLoop(){
	if (!simulationRequested || speedMultiplier === 0) {
		tickTimerId = null
		return
	}

	advanceTime()
	tickTimerId = setTimeout(runTimeLoop, DEFAULT_TICK_INTERVAL_MS)
}

function startSimulation(){
	simulationRequested = true

	if (tickTimerId || speedMultiplier === 0) {
		return
	}

	tickTimerId = setTimeout(runTimeLoop, DEFAULT_TICK_INTERVAL_MS)
}

function stopSimulation(){
	simulationRequested = false

	if (!tickTimerId) {
		return
	}

	clearTimeout(tickTimerId)
	tickTimerId = null
}

function setSimulationStepHours(nextStepHours){
	const parsedStepHours = Number(nextStepHours)

	if (!Number.isFinite(parsedStepHours)) {
		return simulationStepHours
	}

	simulationStepHours = Math.max(1, Math.min(3, Math.round(parsedStepHours)))
	timeState.simulationStepKey = buildSimulationStepKey(timeState.currentDate)
	notifyTimeListeners(timeState.dayKey, timeState.simulationStepKey)
	return simulationStepHours
}

function setSpeedMultiplier(nextMultiplier){
	const parsedMultiplier = Number(nextMultiplier)

	if (!Number.isFinite(parsedMultiplier)) {
		return speedMultiplier
	}

	speedMultiplier = Math.max(0, Math.min(3, Math.round(parsedMultiplier)))

	if (speedMultiplier === 0) {
		if (tickTimerId) {
			clearTimeout(tickTimerId)
			tickTimerId = null
		}
		return speedMultiplier
	}

	if (simulationRequested) {
		if (tickTimerId) {
			clearTimeout(tickTimerId)
			tickTimerId = null
		}
		tickTimerId = setTimeout(runTimeLoop, DEFAULT_TICK_INTERVAL_MS)
	}

	return speedMultiplier
}

function normalizeSpeedMultiplier(nextMultiplier){
	if (!Number.isFinite(nextMultiplier)) {
		return DEFAULT_SPEED_MULTIPLIER
	}

	return Math.max(0, Math.min(3, Math.round(nextMultiplier)))
}

function subscribe(listener){
	timeListeners.add(listener)
	return () => {
		timeListeners.delete(listener)
	}
}

function resetTime(referenceDate = new Date()){
	const nextState = createInitialTimeState(referenceDate)
	timeState.currentDate = nextState.currentDate
	timeState.dayKey = nextState.dayKey
	timeState.simulationStepKey = nextState.simulationStepKey
	speedMultiplier = DEFAULT_SPEED_MULTIPLIER
	return notifyTimeListeners(timeState.dayKey, timeState.simulationStepKey)
}

function restoreTime(save){
	const savedTime = save?.time

	if (!savedTime?.timestamp) {
		return resetTime()
	}

	const restoredDate = new Date(savedTime.timestamp)

	if (Number.isNaN(restoredDate.getTime())) {
		return resetTime()
	}

	timeState.currentDate = restoredDate
	timeState.dayKey = buildDayKey(restoredDate)
	timeState.simulationStepKey = buildSimulationStepKey(restoredDate)
	speedMultiplier = normalizeSpeedMultiplier(Number(savedTime.speedMultiplier))
	return notifyTimeListeners(timeState.dayKey, timeState.simulationStepKey)
}

function buildTimeStateSnapshot(){
	return {
		version: 1,
		timestamp: timeState.currentDate.getTime(),
		simulationStepHours,
		speedMultiplier
	}
}

window.humanityProtocolTime = {
	buildTimeSnapshot: buildTimeStateSnapshot,
	getTimeSummary: () => buildTimeSnapshot(timeState.dayKey),
	resetTime,
	restoreTime,
	setSimulationStepHours,
	setSpeedMultiplier,
	startSimulation,
	stopSimulation,
	subscribe
}

resetTime()
