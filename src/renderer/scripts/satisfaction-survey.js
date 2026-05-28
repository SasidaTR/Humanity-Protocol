const INITIAL_TURNOUT_RATE = 0.62
const TURNOUT_RATE_RANGE = {
	min: 0.3,
	max: 0.95
}
const TURNOUT_VARIATION = 0.08
const SATISFACTION_VARIATION = 0.03
const VOTE_WINDOW_HOURS = 24

const surveyListeners = new Set()

const surveyState = {
	satisfiedVotes: 0,
	dissatisfiedVotes: 0,
	nonVoters: 0,
	turnoutRate: INITIAL_TURNOUT_RATE,
	voteWindowHours: VOTE_WINDOW_HOURS,
	lastUpdatedAt: Date.now()
}

function clamp(value, min, max){
	return Math.min(Math.max(value, min), max)
}

function roundPercentage(value){
	return Math.round(value * 10) / 10
}

function buildSurveySnapshot(){
	const totalVotes = surveyState.satisfiedVotes + surveyState.dissatisfiedVotes
	const satisfaction = totalVotes > 0
		? roundPercentage((surveyState.satisfiedVotes / totalVotes) * 100)
		: 50

	return {
		version: 1,
		satisfiedVotes: surveyState.satisfiedVotes,
		dissatisfiedVotes: surveyState.dissatisfiedVotes,
		totalVotes,
		nonVoters: surveyState.nonVoters,
		turnoutRate: roundPercentage(surveyState.turnoutRate * 100),
		satisfaction,
		voteWindowHours: surveyState.voteWindowHours,
		lastUpdatedAt: surveyState.lastUpdatedAt
	}
}

function notifySurveyListeners(){
	const snapshot = buildSurveySnapshot()
	surveyListeners.forEach((listener) => {
		listener(snapshot)
	})
}

function applyPopulationSnapshot(populationSnapshot){
	const totalPopulation = Number(populationSnapshot?.total) || 0
	const baselineSatisfaction = Number(populationSnapshot?.satisfaction) || 50

	if (totalPopulation <= 0) {
		surveyState.satisfiedVotes = 0
		surveyState.dissatisfiedVotes = 0
		surveyState.nonVoters = 0
		surveyState.turnoutRate = INITIAL_TURNOUT_RATE
		surveyState.lastUpdatedAt = Date.now()
		notifySurveyListeners()
		return buildSurveySnapshot()
	}

	const targetTurnoutRate = clamp(
		0.55 + ((baselineSatisfaction - 50) * 0.004) + (Math.random() - 0.5) * TURNOUT_VARIATION,
		TURNOUT_RATE_RANGE.min,
		TURNOUT_RATE_RANGE.max
	)
	const turnoutRate = clamp(
		surveyState.turnoutRate * 0.65 + targetTurnoutRate * 0.35,
		TURNOUT_RATE_RANGE.min,
		TURNOUT_RATE_RANGE.max
	)
	const totalVotes = Math.round(totalPopulation * turnoutRate)
	const satisfiedShare = clamp(
		(baselineSatisfaction / 100) + (Math.random() - 0.5) * SATISFACTION_VARIATION,
		0,
		1
	)
	const satisfiedVotes = Math.round(totalVotes * satisfiedShare)

	surveyState.turnoutRate = turnoutRate
	surveyState.satisfiedVotes = satisfiedVotes
	surveyState.dissatisfiedVotes = totalVotes - satisfiedVotes
	surveyState.nonVoters = totalPopulation - totalVotes
	surveyState.lastUpdatedAt = Date.now()

	notifySurveyListeners()
	return buildSurveySnapshot()
}

function subscribe(listener){
	surveyListeners.add(listener)
	return () => {
		surveyListeners.delete(listener)
	}
}

function resetSurvey(){
	return applyPopulationSnapshot(window.humanityProtocolPopulation.getPopulationSummary())
}

function restoreSurvey(save){
	const savedSurvey = save?.survey

	if (!savedSurvey) {
		return resetSurvey()
	}

	surveyState.satisfiedVotes = Math.max(0, Math.round(Number(savedSurvey.satisfiedVotes) || 0))
	surveyState.dissatisfiedVotes = Math.max(0, Math.round(Number(savedSurvey.dissatisfiedVotes) || 0))
	surveyState.nonVoters = Math.max(0, Math.round(Number(savedSurvey.nonVoters) || 0))
	surveyState.turnoutRate = clamp((Number(savedSurvey.turnoutRate) || INITIAL_TURNOUT_RATE * 100) / 100, TURNOUT_RATE_RANGE.min, TURNOUT_RATE_RANGE.max)
	surveyState.voteWindowHours = Math.max(1, Math.round(Number(savedSurvey.voteWindowHours) || VOTE_WINDOW_HOURS))
	surveyState.lastUpdatedAt = Number(savedSurvey.lastUpdatedAt) || Date.now()

	notifySurveyListeners()
	return buildSurveySnapshot()
}

window.humanityProtocolTime.subscribe((timeSnapshot) => {
	if (!timeSnapshot.didAdvanceSimulationStep) {
		return
	}

	applyPopulationSnapshot(window.humanityProtocolPopulation.getPopulationSummary())
})

window.humanityProtocolSatisfactionSurvey = {
	applyPopulationSnapshot,
	buildSurveySnapshot,
	getSurveySummary: buildSurveySnapshot,
	resetSurvey,
	restoreSurvey,
	subscribe
}

resetSurvey()
