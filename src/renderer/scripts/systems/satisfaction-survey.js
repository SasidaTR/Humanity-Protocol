const INITIAL_TURNOUT_RATE = 0.62
const INITIAL_WORLD_SATISFACTION = 60
const ACTIVE_VOTE_DURATION_HOURS = 24
const INITIAL_ACTIVE_VOTE_GROUPS = 12
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
const AUTHORITY_RELATION_MODIFIERS = {
	supportive: {
		turnoutRate: 0.05,
		satisfactionRate: 0.01
	},
	neutral: {
		turnoutRate: 0,
		satisfactionRate: 0
	},
	defiant: {
		turnoutRate: -0.08,
		satisfactionRate: -0.02
	}
}
const EDUCATION_MODIFIERS = {
	low: {
		turnoutRate: -0.09,
		satisfactionRate: -0.02
	},
	medium: {
		turnoutRate: 0,
		satisfactionRate: 0
	},
	high: {
		turnoutRate: 0.07,
		satisfactionRate: 0.01
	}
}
const HEALTH_MODIFIERS = {
	healthy: {
		votingCapacityRate: 1,
		turnoutRate: 0.01,
		satisfactionRate: 0.02
	},
	mentalFragile: {
		votingCapacityRate: 0.95,
		turnoutRate: -0.06,
		satisfactionRate: -0.1
	},
	physicalFragile: {
		votingCapacityRate: 0.88,
		turnoutRate: -0.09,
		satisfactionRate: -0.11
	},
	dualFragile: {
		votingCapacityRate: 0.76,
		turnoutRate: -0.14,
		satisfactionRate: -0.18
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

function createVoteGroup(remainingHours, votes, satisfiedVotes){
	return {
		remainingHours: Math.max(0, Number(remainingHours) || 0),
		votes: Math.max(0, Math.round(Number(votes) || 0)),
		satisfiedVotes: Math.max(0, Math.round(Number(satisfiedVotes) || 0))
	}
}

function buildSeedVoteGroups(totalVotes, satisfactionRate){
	const boundedTotalVotes = Math.max(0, Math.round(Number(totalVotes) || 0))

	if (boundedTotalVotes <= 0) {
		return []
	}

	const groupCount = Math.min(INITIAL_ACTIVE_VOTE_GROUPS, boundedTotalVotes)
	const baseVotesPerGroup = Math.floor(boundedTotalVotes / groupCount)
	const extraVotes = boundedTotalVotes % groupCount
	const groups = []
	let assignedVotes = 0
	let assignedSatisfiedVotes = 0

	for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
		const votes = baseVotesPerGroup + (groupIndex < extraVotes ? 1 : 0)
		const remainingHours = ACTIVE_VOTE_DURATION_HOURS * ((groupIndex + 1) / groupCount)
		const targetSatisfiedVotes = Math.round(votes * satisfactionRate)
		const remainingSatisfiedVotes = Math.max(0, Math.round((boundedTotalVotes * satisfactionRate) - assignedSatisfiedVotes))
		const satisfiedVotes = groupIndex === groupCount - 1
			? Math.min(votes, remainingSatisfiedVotes)
			: Math.min(votes, Math.max(0, targetSatisfiedVotes))

		groups.push(createVoteGroup(remainingHours, votes, satisfiedVotes))
		assignedVotes += votes
		assignedSatisfiedVotes += satisfiedVotes
	}

	return groups
}

function sanitizeVoteGroups(voteGroups = []){
	if (!Array.isArray(voteGroups)) {
		return []
	}

	return voteGroups.reduce((sanitizedGroups, voteGroup) => {
		const normalizedGroup = createVoteGroup(
			voteGroup?.remainingHours,
			voteGroup?.votes,
			Math.min(Number(voteGroup?.votes) || 0, Number(voteGroup?.satisfiedVotes) || 0)
		)

		if (normalizedGroup.votes <= 0 || normalizedGroup.remainingHours <= 0) {
			return sanitizedGroups
		}

		sanitizedGroups.push(normalizedGroup)
		return sanitizedGroups
	}, [])
}

function summarizeVoteGroups(voteGroups = []){
	return voteGroups.reduce((summary, voteGroup) => {
		summary.totalVotes += voteGroup.votes
		summary.satisfiedVotes += Math.min(voteGroup.votes, voteGroup.satisfiedVotes)
		return summary
	}, {
		totalVotes: 0,
		satisfiedVotes: 0
	})
}

function advanceVoteGroups(voteGroups = [], elapsedHours = 0){
	if (!Number.isFinite(elapsedHours) || elapsedHours <= 0) {
		return sanitizeVoteGroups(voteGroups)
	}

	return sanitizeVoteGroups(
		voteGroups.map((voteGroup) => createVoteGroup(
			voteGroup.remainingHours - elapsedHours,
			voteGroup.votes,
			voteGroup.satisfiedVotes
		))
	)
}

function appendVoteGroup(voteGroups, votes, satisfactionRate){
	const boundedVotes = Math.max(0, Math.round(Number(votes) || 0))

	if (boundedVotes <= 0) {
		return voteGroups
	}

	const satisfiedVotes = Math.min(
		boundedVotes,
		Math.max(0, Math.round(boundedVotes * clamp(satisfactionRate, 0, 1)))
	)

	return [
		...voteGroups,
		createVoteGroup(ACTIVE_VOTE_DURATION_HOURS, boundedVotes, satisfiedVotes)
	]
}

function limitVoteGroupsToPopulation(voteGroups, population){
	const boundedPopulation = Math.max(0, Math.round(Number(population) || 0))
	const voteSummary = summarizeVoteGroups(voteGroups)

	if (voteSummary.totalVotes <= boundedPopulation) {
		return voteGroups
	}

	const scale = boundedPopulation / Math.max(1, voteSummary.totalVotes)
	return sanitizeVoteGroups(
		voteGroups.map((voteGroup) => createVoteGroup(
			voteGroup.remainingHours,
			Math.round(voteGroup.votes * scale),
			Math.round(voteGroup.satisfiedVotes * scale)
		))
	)
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

function getPopulationGroupedShares(populationSnapshot, key, defaultShares){
	const totalPopulation = Math.max(0, Number(populationSnapshot?.total) || 0)
	const groups = populationSnapshot?.[key] || {}

	if (totalPopulation <= 0) {
		return { ...defaultShares }
	}

	return Object.keys(defaultShares).reduce((shares, groupId) => {
		shares[groupId] = clamp((Number(groups[groupId]) || 0) / totalPopulation, 0, 1)
		return shares
	}, {})
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
	const authorityRelationShares = getPopulationGroupedShares(populationSnapshot, 'authorityRelation', {
		supportive: 0.27,
		neutral: 0.46,
		defiant: 0.27
	})
	const educationShares = getPopulationGroupedShares(populationSnapshot, 'education', {
		low: 0.34,
		medium: 0.46,
		high: 0.2
	})
	const healthShares = getPopulationGroupedShares(populationSnapshot, 'health', {
		healthy: 0.75,
		mentalFragile: 0.09,
		physicalFragile: 0.11,
		dualFragile: 0.05
	})
	const adultAgeCounts = {
		age18To34: Math.max(0, Number(age.age18To34) || 0),
		age35To64: Math.max(0, Number(age.age35To64) || 0),
		age65Plus: Math.max(0, Number(age.age65Plus) || 0)
	}
	const cohorts = []

	Object.entries(incomeShares).forEach(([incomeLevelId, incomeShare]) => {
		Object.entries(activityShares).forEach(([activityId, activityShare]) => {
			Object.entries(authorityRelationShares).forEach(([authorityRelationId, authorityRelationShare]) => {
				Object.entries(educationShares).forEach(([educationId, educationShare]) => {
					Object.entries(healthShares).forEach(([healthId, healthShare]) => {
						const combinedShare = incomeShare * activityShare * authorityRelationShare * educationShare * healthShare

						cohorts.push({
							id: `age18To34:${activityId}:${incomeLevelId}:${authorityRelationId}:${educationId}:${healthId}`,
							ageGroupId: 'age18To34',
							activityId,
							incomeLevelId,
							authorityRelationId,
							educationId,
							healthId,
							population: adultAgeCounts.age18To34 * combinedShare
						})
						cohorts.push({
							id: `age35To64:${activityId}:${incomeLevelId}:${authorityRelationId}:${educationId}:${healthId}`,
							ageGroupId: 'age35To64',
							activityId,
							incomeLevelId,
							authorityRelationId,
							educationId,
							healthId,
							population: adultAgeCounts.age35To64 * combinedShare
						})
					})
				})
			})
		})

		Object.entries(authorityRelationShares).forEach(([authorityRelationId, authorityRelationShare]) => {
			Object.entries(educationShares).forEach(([educationId, educationShare]) => {
				Object.entries(healthShares).forEach(([healthId, healthShare]) => {
					cohorts.push({
						id: `age65Plus:none:${incomeLevelId}:${authorityRelationId}:${educationId}:${healthId}`,
						ageGroupId: 'age65Plus',
						activityId: 'none',
						incomeLevelId,
						authorityRelationId,
						educationId,
						healthId,
						population: adultAgeCounts.age65Plus * incomeShare * authorityRelationShare * educationShare * healthShare
					})
				})
			})
		})
	})

	return cohorts
}

function buildCohortTarget(cohort, baselineSatisfaction){
	const ageProfile = AGE_VOTER_PROFILES[cohort.ageGroupId]
	const activityModifiers = ACTIVITY_VOTER_MODIFIERS[cohort.activityId] || ACTIVITY_VOTER_MODIFIERS.none
	const incomeModifiers = INCOME_LEVEL_MODIFIERS[cohort.incomeLevelId] || INCOME_LEVEL_MODIFIERS.middleIncome
	const authorityRelationModifiers = AUTHORITY_RELATION_MODIFIERS[cohort.authorityRelationId] || AUTHORITY_RELATION_MODIFIERS.neutral
	const educationModifiers = EDUCATION_MODIFIERS[cohort.educationId] || EDUCATION_MODIFIERS.medium
	const healthModifiers = HEALTH_MODIFIERS[cohort.healthId] || HEALTH_MODIFIERS.healthy
	const worldMoodOffset = (baselineSatisfaction - INITIAL_WORLD_SATISFACTION) / 100

	return {
		votingCapacityRate: clamp(healthModifiers.votingCapacityRate, 0.45, 1),
		turnoutRate: clamp(
			ageProfile.turnoutRate +
			activityModifiers.turnoutRate +
			incomeModifiers.turnoutRate +
			authorityRelationModifiers.turnoutRate +
			educationModifiers.turnoutRate +
			healthModifiers.turnoutRate +
			(worldMoodOffset * 0.08),
			TURNOUT_RATE_RANGE.min,
			TURNOUT_RATE_RANGE.max
		),
		satisfactionRate: clamp(
			ageProfile.satisfactionRate +
			activityModifiers.satisfactionRate +
			incomeModifiers.satisfactionRate +
			authorityRelationModifiers.satisfactionRate +
			educationModifiers.satisfactionRate +
			healthModifiers.satisfactionRate +
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
		votingCapacityRate: clamp(Number(target.votingCapacityRate) || 1, 0.45, 1),
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
		hoursUntilRefresh: getRandomCohortVoteHours(),
		activeVoteGroups: []
	}
}

function reconcileCohortState(cohortState, target, population, elapsedHours){
	const effectivePopulation = Math.max(
		0,
		population * clamp(Number(target.votingCapacityRate) || 1, 0.45, 1)
	)
	const nextCohortState = {
		votingCapacityRate: clamp(Number(cohortState?.votingCapacityRate) || target.votingCapacityRate, 0.45, 1),
		turnoutRate: clamp(Number(cohortState?.turnoutRate) || target.turnoutRate, TURNOUT_RATE_RANGE.min, TURNOUT_RATE_RANGE.max),
		satisfactionRate: clamp(Number(cohortState?.satisfactionRate) || target.satisfactionRate, SATISFACTION_RATE_RANGE.min, SATISFACTION_RATE_RANGE.max),
		hoursUntilRefresh: Math.max(0, Number(cohortState?.hoursUntilRefresh) || getRandomCohortVoteHours()),
		activeVoteGroups: sanitizeVoteGroups(cohortState?.activeVoteGroups)
	}

	if (nextCohortState.activeVoteGroups.length === 0) {
		nextCohortState.activeVoteGroups = buildSeedVoteGroups(
			Math.round(effectivePopulation * nextCohortState.turnoutRate),
			nextCohortState.satisfactionRate
		)
	}

	nextCohortState.activeVoteGroups = advanceVoteGroups(nextCohortState.activeVoteGroups, elapsedHours)
	nextCohortState.activeVoteGroups = limitVoteGroupsToPopulation(nextCohortState.activeVoteGroups, effectivePopulation)
	let hoursUntilRefresh = nextCohortState.hoursUntilRefresh - Math.max(0, Number(elapsedHours) || 0)

	while (hoursUntilRefresh <= 0) {
		nextCohortState.votingCapacityRate = clamp(
			(nextCohortState.votingCapacityRate * 0.35) + (target.votingCapacityRate * 0.65),
			0.45,
			1
		)
		nextCohortState.turnoutRate = clamp(
			(nextCohortState.turnoutRate * 0.4) +
			(target.turnoutRate * 0.6) +
			((Math.random() - 0.5) * OPINION_NOISE.turnoutRate),
			TURNOUT_RATE_RANGE.min,
			TURNOUT_RATE_RANGE.max
		)
		nextCohortState.satisfactionRate = clamp(
			(nextCohortState.satisfactionRate * 0.35) +
			(target.satisfactionRate * 0.65) +
			((Math.random() - 0.5) * getCohortSatisfactionNoise(target.satisfactionRate)),
			SATISFACTION_RATE_RANGE.min,
			SATISFACTION_RATE_RANGE.max
		)
		hoursUntilRefresh += getRandomCohortVoteHours()
	}

	nextCohortState.hoursUntilRefresh = hoursUntilRefresh

	const voteSummary = summarizeVoteGroups(nextCohortState.activeVoteGroups)
	const targetActiveVotes = Math.round(effectivePopulation * nextCohortState.turnoutRate)
	const additionalVotes = Math.max(0, Math.min(
		Math.max(0, Math.round(effectivePopulation) - voteSummary.totalVotes),
		targetActiveVotes - voteSummary.totalVotes
	))

	if (additionalVotes > 0) {
		nextCohortState.activeVoteGroups = appendVoteGroup(
			nextCohortState.activeVoteGroups,
			additionalVotes,
			nextCohortState.satisfactionRate
		)
	}

	return nextCohortState
}

function buildSurveySnapshot(){
	const aiVote = window.humanityProtocolSatisfactionVoteTool?.getActiveVote?.()
	const aiSatisfiedVotes = aiVote === 'positive' ? 1 : 0
	const aiDissatisfiedVotes = aiVote === 'negative' ? 1 : 0
	const satisfiedVotes = surveyState.satisfiedVotes + aiSatisfiedVotes
	const dissatisfiedVotes = surveyState.dissatisfiedVotes + aiDissatisfiedVotes
	const totalVotes = satisfiedVotes + dissatisfiedVotes
	const satisfaction = totalVotes > 0
		? roundPercentage((satisfiedVotes / totalVotes) * 100)
		: INITIAL_WORLD_SATISFACTION

	return {
		version: 4,
		satisfiedVotes,
		dissatisfiedVotes,
		totalVotes,
		nonVoters: surveyState.nonVoters,
		eligibleVoters: surveyState.eligibleVoters,
		ineligiblePopulation: surveyState.ineligiblePopulation,
		turnoutRate: roundPercentage(surveyState.turnoutRate * 100),
		satisfaction,
		voteWindowHours: surveyState.voteWindowHours,
		maxCohortVoteIntervalHours: COHORT_VOTE_INTERVAL_HOURS.max,
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
		const baseCohortState = surveyState.cohorts[cohort.id] || createCohortState(target)
		const population = Math.max(0, cohort.population)
		const cohortState = reconcileCohortState(baseCohortState, target, population, elapsedHours)
		const voteSummary = summarizeVoteGroups(cohortState.activeVoteGroups)

		nextCohorts[cohort.id] = cohortState
		satisfiedVotes += voteSummary.satisfiedVotes
		totalVotes += voteSummary.totalVotes
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
		? clamp(boundedTotalVotes / eligibleVoters, 0, 1)
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
			votingCapacityRate: clamp(Number(cohortState?.votingCapacityRate) || 1, 0.45, 1),
			turnoutRate: clamp(Number(cohortState?.turnoutRate) || INITIAL_TURNOUT_RATE, TURNOUT_RATE_RANGE.min, TURNOUT_RATE_RANGE.max),
			satisfactionRate: clamp(Number(cohortState?.satisfactionRate) || (INITIAL_WORLD_SATISFACTION / 100), SATISFACTION_RATE_RANGE.min, SATISFACTION_RATE_RANGE.max),
			hoursUntilRefresh: Math.max(0, Number(cohortState?.hoursUntilRefresh) || getRandomCohortVoteHours()),
			activeVoteGroups: sanitizeVoteGroups(cohortState?.activeVoteGroups)
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
