const INITIAL_TURNOUT_RATE = 0.62
const INITIAL_WORLD_SATISFACTION = 60
const TURNOUT_RATE_RANGE = {
	min: 0.3,
	max: 0.95
}
const SATISFACTION_RATE_RANGE = {
	min: 0.12,
	max: 0.92
}
const VOTE_WINDOW_HOURS = 24
const COHORT_VOTE_INTERVAL_HOURS = {
	min: 24,
	max: 72
}
const AGE_VOTER_PROFILES = {
	age18To34: {
		turnoutRate: 0.55,
		satisfactionRate: 0.56
	},
	age35To64: {
		turnoutRate: 0.72,
		satisfactionRate: 0.6
	},
	age65Plus: {
		turnoutRate: 0.78,
		satisfactionRate: 0.62
	}
}
const ACTIVITY_VOTER_MODIFIERS = {
	workers: {
		turnoutRate: 0.05,
		satisfactionRate: 0.04
	},
	nonWorkers: {
		turnoutRate: -0.05,
		satisfactionRate: -0.06
	},
	none: {
		turnoutRate: 0,
		satisfactionRate: 0
	}
}
const INCOME_LEVEL_MODIFIERS = {
	veryPoor: {
		turnoutRate: -0.1,
		satisfactionRate: -0.18
	},
	poor: {
		turnoutRate: -0.05,
		satisfactionRate: -0.1
	},
	middleIncome: {
		turnoutRate: 0,
		satisfactionRate: 0
	},
	comfortableIncome: {
		turnoutRate: 0.05,
		satisfactionRate: 0.08
	},
	highIncome: {
		turnoutRate: 0.08,
		satisfactionRate: 0.14
	}
}
const OPINION_NOISE = {
	turnoutRate: 0.025,
	satisfactionRate: 0.04
}

const surveyListeners = new Set()

const surveyState = {
	satisfiedVotes: 0,
	dissatisfiedVotes: 0,
	nonVoters: 0,
	eligibleVoters: 0,
	ineligiblePopulation: 0,
	turnoutRate: INITIAL_TURNOUT_RATE,
	voteWindowHours: VOTE_WINDOW_HOURS,
	lastUpdatedAt: Date.now(),
	cohorts: {}
}

function clamp(value, min, max){
	return Math.min(Math.max(value, min), max)
}

function roundPercentage(value){
	return Math.round(value * 10) / 10
}

function getSatisfactionVarianceFactor(rate){
	const clampedRate = clamp(rate, 0, 1)
	return 4 * clampedRate * (1 - clampedRate)
}

function getRandomCohortVoteHours(){
	const randomValue = Math.random()
	const weightedValue = randomValue * randomValue

	return COHORT_VOTE_INTERVAL_HOURS.min + (weightedValue * (COHORT_VOTE_INTERVAL_HOURS.max - COHORT_VOTE_INTERVAL_HOURS.min))
}

function getPopulationIncomeShares(populationSnapshot){
	const totalPopulation = Math.max(0, Number(populationSnapshot?.total) || 0)
	const incomeLevel = populationSnapshot?.incomeLevel || {}

	if (totalPopulation <= 0) {
		return {
			veryPoor: 0.1,
			poor: 0.51,
			middleIncome: 0.17,
			comfortableIncome: 0.15,
			highIncome: 0.07
		}
	}

	return {
		veryPoor: clamp((Number(incomeLevel.veryPoor) || 0) / totalPopulation, 0, 1),
		poor: clamp((Number(incomeLevel.poor) || 0) / totalPopulation, 0, 1),
		middleIncome: clamp((Number(incomeLevel.middleIncome) || 0) / totalPopulation, 0, 1),
		comfortableIncome: clamp((Number(incomeLevel.comfortableIncome) || 0) / totalPopulation, 0, 1),
		highIncome: clamp((Number(incomeLevel.highIncome) || 0) / totalPopulation, 0, 1)
	}
}

function getWorkingAgeActivityShares(populationSnapshot){
	const workingAgePopulation = Math.max(0, Number(populationSnapshot?.activity?.workers) || 0) + Math.max(0, Number(populationSnapshot?.activity?.nonWorkers) || 0)

	if (workingAgePopulation <= 0) {
		return {
			workers: 0.6,
			nonWorkers: 0.4
		}
	}

	return {
		workers: clamp((Number(populationSnapshot?.activity?.workers) || 0) / workingAgePopulation, 0, 1),
		nonWorkers: clamp((Number(populationSnapshot?.activity?.nonWorkers) || 0) / workingAgePopulation, 0, 1)
	}
}

function buildAdultCohorts(populationSnapshot){
	const age = populationSnapshot?.age || {}
	const incomeShares = getPopulationIncomeShares(populationSnapshot)
	const activityShares = getWorkingAgeActivityShares(populationSnapshot)
	const adultAgeCounts = {
		age18To34: Math.max(0, Number(age.age18To34) || 0),
		age35To64: Math.max(0, Number(age.age35To64) || 0),
		age65Plus: Math.max(0, Number(age.age65Plus) || 0)
	}
	const cohorts = []

	Object.entries(incomeShares).forEach(([incomeLevelId, incomeShare]) => {
		Object.entries(activityShares).forEach(([activityId, activityShare]) => {
			const age18To34Population = adultAgeCounts.age18To34 * incomeShare * activityShare
			const age35To64Population = adultAgeCounts.age35To64 * incomeShare * activityShare

			cohorts.push({
				id: `age18To34:${activityId}:${incomeLevelId}`,
				ageGroupId: 'age18To34',
				activityId,
				incomeLevelId,
				population: age18To34Population
			})
			cohorts.push({
				id: `age35To64:${activityId}:${incomeLevelId}`,
				ageGroupId: 'age35To64',
				activityId,
				incomeLevelId,
				population: age35To64Population
			})
		})

		cohorts.push({
			id: `age65Plus:none:${incomeLevelId}`,
			ageGroupId: 'age65Plus',
			activityId: 'none',
			incomeLevelId,
			population: adultAgeCounts.age65Plus * incomeShare
		})
	})

	return cohorts
}

function buildCohortTarget(cohort, baselineSatisfaction){
	const ageProfile = AGE_VOTER_PROFILES[cohort.ageGroupId]
	const activityModifiers = ACTIVITY_VOTER_MODIFIERS[cohort.activityId] || ACTIVITY_VOTER_MODIFIERS.none
	const incomeModifiers = INCOME_LEVEL_MODIFIERS[cohort.incomeLevelId] || INCOME_LEVEL_MODIFIERS.middleIncome
	const worldMoodOffset = (baselineSatisfaction - INITIAL_WORLD_SATISFACTION) / 100

	return {
		turnoutRate: clamp(
			ageProfile.turnoutRate +
			activityModifiers.turnoutRate +
			incomeModifiers.turnoutRate +
			(worldMoodOffset * 0.08),
			TURNOUT_RATE_RANGE.min,
			TURNOUT_RATE_RANGE.max
		),
		satisfactionRate: clamp(
			ageProfile.satisfactionRate +
			activityModifiers.satisfactionRate +
			incomeModifiers.satisfactionRate +
			(worldMoodOffset * 0.3),
			SATISFACTION_RATE_RANGE.min,
			SATISFACTION_RATE_RANGE.max
		)
	}
}

function getCohortSatisfactionNoise(targetRate){
	const varianceFactor = getSatisfactionVarianceFactor(targetRate)
	return OPINION_NOISE.satisfactionRate * (0.18 + (varianceFactor * 0.82))
}

function createCohortState(target){
	return {
		turnoutRate: clamp(
			target.turnoutRate + ((Math.random() - 0.5) * OPINION_NOISE.turnoutRate),
			TURNOUT_RATE_RANGE.min,
			TURNOUT_RATE_RANGE.max
		),
		satisfactionRate: clamp(
			target.satisfactionRate + ((Math.random() - 0.5) * getCohortSatisfactionNoise(target.satisfactionRate)),
			SATISFACTION_RATE_RANGE.min,
			SATISFACTION_RATE_RANGE.max
		),
		hoursUntilRefresh: getRandomCohortVoteHours()
	}
}

function advanceCohortState(cohortState, target, elapsedHours){
	if (!Number.isFinite(elapsedHours) || elapsedHours <= 0) {
		return cohortState
	}

	let hoursUntilRefresh = cohortState.hoursUntilRefresh - elapsedHours

	while (hoursUntilRefresh <= 0) {
		cohortState.turnoutRate = clamp(
			(cohortState.turnoutRate * 0.4) +
			(target.turnoutRate * 0.6) +
			((Math.random() - 0.5) * OPINION_NOISE.turnoutRate),
			TURNOUT_RATE_RANGE.min,
			TURNOUT_RATE_RANGE.max
		)
		cohortState.satisfactionRate = clamp(
			(cohortState.satisfactionRate * 0.35) +
			(target.satisfactionRate * 0.65) +
			((Math.random() - 0.5) * getCohortSatisfactionNoise(target.satisfactionRate)),
			SATISFACTION_RATE_RANGE.min,
			SATISFACTION_RATE_RANGE.max
		)
		hoursUntilRefresh += getRandomCohortVoteHours()
	}

	cohortState.hoursUntilRefresh = hoursUntilRefresh
	return cohortState
}

function buildSurveySnapshot(){
	const totalVotes = surveyState.satisfiedVotes + surveyState.dissatisfiedVotes
	const satisfaction = totalVotes > 0
		? roundPercentage((surveyState.satisfiedVotes / totalVotes) * 100)
		: INITIAL_WORLD_SATISFACTION

	return {
		version: 2,
		satisfiedVotes: surveyState.satisfiedVotes,
		dissatisfiedVotes: surveyState.dissatisfiedVotes,
		totalVotes,
		nonVoters: surveyState.nonVoters,
		eligibleVoters: surveyState.eligibleVoters,
		ineligiblePopulation: surveyState.ineligiblePopulation,
		turnoutRate: roundPercentage(surveyState.turnoutRate * 100),
		satisfaction,
		voteWindowHours: surveyState.voteWindowHours,
		lastUpdatedAt: surveyState.lastUpdatedAt,
		cohorts: surveyState.cohorts
	}
}

function notifySurveyListeners(){
	const snapshot = buildSurveySnapshot()
	surveyListeners.forEach((listener) => {
		listener(snapshot)
	})
}

function applyPopulationSnapshot(populationSnapshot, elapsedHours = 0){
	const totalPopulation = Math.max(0, Number(populationSnapshot?.total) || 0)
	const baselineSatisfaction = Number(populationSnapshot?.satisfaction) || INITIAL_WORLD_SATISFACTION
	const ineligiblePopulation = Math.max(0, Math.round(Number(populationSnapshot?.age?.age0To17) || 0))
	const eligibleVoters = Math.max(0, totalPopulation - ineligiblePopulation)

	if (totalPopulation <= 0) {
		surveyState.satisfiedVotes = 0
		surveyState.dissatisfiedVotes = 0
		surveyState.nonVoters = 0
		surveyState.eligibleVoters = 0
		surveyState.ineligiblePopulation = 0
		surveyState.turnoutRate = INITIAL_TURNOUT_RATE
		surveyState.cohorts = {}
		surveyState.lastUpdatedAt = Date.now()
		notifySurveyListeners()
		return buildSurveySnapshot()
	}

	const cohorts = buildAdultCohorts(populationSnapshot)
	let satisfiedVotes = 0
	let totalVotes = 0
	const nextCohorts = {}

	cohorts.forEach((cohort) => {
		const target = buildCohortTarget(cohort, baselineSatisfaction)
		const cohortState = surveyState.cohorts[cohort.id]
			? advanceCohortState({ ...surveyState.cohorts[cohort.id] }, target, elapsedHours)
			: createCohortState(target)
		const population = Math.max(0, cohort.population)
		const votes = Math.round(population * cohortState.turnoutRate)
		const satisfied = Math.round(votes * cohortState.satisfactionRate)

		nextCohorts[cohort.id] = cohortState
		satisfiedVotes += satisfied
		totalVotes += votes
	})

	const boundedTotalVotes = Math.min(eligibleVoters, totalVotes)
	const boundedSatisfiedVotes = Math.min(boundedTotalVotes, satisfiedVotes)

	surveyState.cohorts = nextCohorts
	surveyState.eligibleVoters = eligibleVoters
	surveyState.ineligiblePopulation = ineligiblePopulation
	surveyState.satisfiedVotes = boundedSatisfiedVotes
	surveyState.dissatisfiedVotes = Math.max(0, boundedTotalVotes - boundedSatisfiedVotes)
	surveyState.nonVoters = Math.max(0, totalPopulation - boundedTotalVotes)
	surveyState.turnoutRate = eligibleVoters > 0
		? clamp(boundedTotalVotes / eligibleVoters, TURNOUT_RATE_RANGE.min, TURNOUT_RATE_RANGE.max)
		: INITIAL_TURNOUT_RATE
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
	surveyState.cohorts = {}
	return applyPopulationSnapshot(window.humanityProtocolPopulation.getPopulationSummary())
}

function restoreSurvey(save){
	const savedSurvey = save?.survey

	if (!savedSurvey || !savedSurvey.cohorts) {
		return resetSurvey()
	}

	surveyState.satisfiedVotes = Math.max(0, Math.round(Number(savedSurvey.satisfiedVotes) || 0))
	surveyState.dissatisfiedVotes = Math.max(0, Math.round(Number(savedSurvey.dissatisfiedVotes) || 0))
	surveyState.nonVoters = Math.max(0, Math.round(Number(savedSurvey.nonVoters) || 0))
	surveyState.eligibleVoters = Math.max(0, Math.round(Number(savedSurvey.eligibleVoters) || 0))
	surveyState.ineligiblePopulation = Math.max(0, Math.round(Number(savedSurvey.ineligiblePopulation) || 0))
	surveyState.turnoutRate = clamp((Number(savedSurvey.turnoutRate) || INITIAL_TURNOUT_RATE * 100) / 100, TURNOUT_RATE_RANGE.min, TURNOUT_RATE_RANGE.max)
	surveyState.voteWindowHours = Math.max(1, Math.round(Number(savedSurvey.voteWindowHours) || VOTE_WINDOW_HOURS))
	surveyState.lastUpdatedAt = Number(savedSurvey.lastUpdatedAt) || Date.now()
	surveyState.cohorts = Object.entries(savedSurvey.cohorts).reduce((cohorts, [cohortId, cohortState]) => {
		cohorts[cohortId] = {
			turnoutRate: clamp(Number(cohortState?.turnoutRate) || INITIAL_TURNOUT_RATE, TURNOUT_RATE_RANGE.min, TURNOUT_RATE_RANGE.max),
			satisfactionRate: clamp(Number(cohortState?.satisfactionRate) || (INITIAL_WORLD_SATISFACTION / 100), SATISFACTION_RATE_RANGE.min, SATISFACTION_RATE_RANGE.max),
			hoursUntilRefresh: Math.max(0, Number(cohortState?.hoursUntilRefresh) || getRandomCohortVoteHours())
		}
		return cohorts
	}, {})

	applyPopulationSnapshot(window.humanityProtocolPopulation.getPopulationSummary(), 0)
	return buildSurveySnapshot()
}

window.humanityProtocolTime.subscribe((timeSnapshot) => {
	if (!timeSnapshot.didAdvanceSimulationStep) {
		return
	}

	for (let stepIndex = 0; stepIndex < timeSnapshot.simulationStepsAdvanced; stepIndex += 1) {
		applyPopulationSnapshot(
			window.humanityProtocolPopulation.getPopulationSummary(),
			timeSnapshot.simulationStepHours
		)
	}
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
