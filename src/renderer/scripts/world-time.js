const DEFAULT_SPEED_MULTIPLIER = 1
const ALLOWED_SIMULATION_STEP_HOURS = [
	0.0166666667,
	0.0833333333,
	0.1666666667,
	0.5,
	1,
	2,
	3
]
const SPEED_TO_TIME_SCALE = {
	0: 0,
	1: 60,
	2: 120,
	3: 240
}
const DEFAULT_SIMULATION_STEP_HOURS = 1

const timeListeners = new Set()

let animationFrameId = null
let lastFrameTimestamp = null
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
	const simulationStepsAdvanced = Math.max(0, timeState.simulationStepKey - previousSimulationStepKey)
	const isSimulationPaused = !simulationRequested || speedMultiplier === 0

	return {
		version: 1,
		timestamp: timeState.currentDate.getTime(),
		isoDate: timeState.currentDate.toISOString(),
		dayKey: timeState.dayKey,
		didAdvanceDay: timeState.dayKey !== previousDayKey,
		simulationStepHours,
		didAdvanceSimulationStep: simulationStepsAdvanced > 0,
		simulationStepsAdvanced,
		speedMultiplier,
		isSimulationPaused,
		displaySpeedMultiplier: isSimulationPaused ? 0 : speedMultiplier
	}
}

function notifyTimeListeners(previousDayKey = timeState.dayKey, previousSimulationStepKey = timeState.simulationStepKey){
	const snapshot = buildTimeSnapshot(previousDayKey, previousSimulationStepKey)
	timeListeners.forEach((listener) => {
		listener(snapshot)
	})
	return snapshot
}

function advanceTime(deltaRealMs){
	const previousDayKey = timeState.dayKey
	const previousSimulationStepKey = timeState.simulationStepKey
	const timeScale = SPEED_TO_TIME_SCALE[speedMultiplier] ?? SPEED_TO_TIME_SCALE[1]

	if (timeScale <= 0 || deltaRealMs <= 0) {
		return notifyTimeListeners(previousDayKey, previousSimulationStepKey)
	}

	timeState.currentDate = new Date(
		timeState.currentDate.getTime() + deltaRealMs * timeScale
	)
	timeState.dayKey = buildDayKey(timeState.currentDate)
	timeState.simulationStepKey = buildSimulationStepKey(timeState.currentDate)
	return notifyTimeListeners(previousDayKey, previousSimulationStepKey)
}

function runTimeLoop(frameTimestamp){
	if (!simulationRequested || speedMultiplier === 0) {
		animationFrameId = null
		lastFrameTimestamp = null
		return
	}

	if (lastFrameTimestamp === null) {
		lastFrameTimestamp = frameTimestamp
		animationFrameId = requestAnimationFrame(runTimeLoop)
		return
	}

	const deltaRealMs = Math.min(250, Math.max(0, frameTimestamp - lastFrameTimestamp))
	lastFrameTimestamp = frameTimestamp
	advanceTime(deltaRealMs)
	animationFrameId = requestAnimationFrame(runTimeLoop)
}

function startSimulation(){
	simulationRequested = true

	if (animationFrameId || speedMultiplier === 0) {
		notifyTimeListeners(timeState.dayKey, timeState.simulationStepKey)
		return
	}

	lastFrameTimestamp = null
	animationFrameId = requestAnimationFrame(runTimeLoop)
	notifyTimeListeners(timeState.dayKey, timeState.simulationStepKey)
}

function stopSimulation(){
	simulationRequested = false

	if (!animationFrameId) {
		lastFrameTimestamp = null
		notifyTimeListeners(timeState.dayKey, timeState.simulationStepKey)
		return
	}

	cancelAnimationFrame(animationFrameId)
	animationFrameId = null
	lastFrameTimestamp = null
	notifyTimeListeners(timeState.dayKey, timeState.simulationStepKey)
}

function setSimulationStepHours(nextStepHours){
	const parsedStepHours = Number(nextStepHours)

	if (!Number.isFinite(parsedStepHours)) {
		return simulationStepHours
	}

	const resolvedStepHours = ALLOWED_SIMULATION_STEP_HOURS.find((value) => value === parsedStepHours)

	if (!resolvedStepHours) {
		return simulationStepHours
	}

	simulationStepHours = resolvedStepHours
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
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId)
			animationFrameId = null
		}
		lastFrameTimestamp = null
		notifyTimeListeners(timeState.dayKey, timeState.simulationStepKey)
		return speedMultiplier
	}

	if (simulationRequested) {
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId)
			animationFrameId = null
		}
		lastFrameTimestamp = null
		animationFrameId = requestAnimationFrame(runTimeLoop)
	}

	notifyTimeListeners(timeState.dayKey, timeState.simulationStepKey)
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
