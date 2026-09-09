const livingConditionsConfig = window.humanityProtocolConfig?.livingConditions || {}
const CONDITION_AXES = livingConditionsConfig.axes || {}
const CONDITION_AXIS_IDS = Object.keys(CONDITION_AXES)
const ESCALATING_EXPONENT = livingConditionsConfig.escalatingExponent ?? 1.6
const DIMINISHING_EXPONENT = livingConditionsConfig.diminishingExponent ?? 0.7
const SATISFACTION_SCALE = livingConditionsConfig.satisfactionScale ?? 0.028
const SENSITIVITY_RANGE = livingConditionsConfig.sensitivityRange || {
	min: 0.2,
	max: 3
}
const VOICE_CONFIG = livingConditionsConfig.voice || {}
const VOICE_COMPLIANCE_CEILING = VOICE_CONFIG.complianceCeiling ?? 0.92
const VOICE_COMPULSION_RESISTANCE = VOICE_CONFIG.compulsionResistance || {}
const VOICE_OBSTRUCTION_SCALE = VOICE_CONFIG.obstructionScale ?? 0.09

const COHORT_DIMENSIONS = {
	age: 'ageGroupId',
	activity: 'activityId',
	income: 'incomeLevelId',
	authorityRelation: 'authorityRelationId',
	education: 'educationId',
	health: 'healthId'
}

const conditionSources = new Map()

function clamp(value, min, max){
	return Math.min(Math.max(value, min), max)
}

function buildEmptyAxisValues(){
	return CONDITION_AXIS_IDS.reduce((values, axisId) => {
		values[axisId] = 0
		return values
	}, {})
}

function getCohortSensitivity(axisId, cohort){
	const axisSensitivities = CONDITION_AXES[axisId] || {}

	const sensitivity = Object.entries(COHORT_DIMENSIONS).reduce((total, [dimensionId, cohortKey]) => {
		const dimensionFactors = axisSensitivities[dimensionId]

		if (!dimensionFactors) {
			return total
		}

		return total * (dimensionFactors[cohort[cohortKey]] ?? 1)
	}, 1)

	return clamp(sensitivity, SENSITIVITY_RANGE.min, SENSITIVITY_RANGE.max)
}

function respondToPressure(value){
	if (value === 0) {
		return 0
	}

	return value > 0
		? Math.pow(value, DIMINISHING_EXPONENT)
		: -Math.pow(-value, ESCALATING_EXPONENT)
}

function registerConditionSource(sourceId, describeEffects){
	if (!sourceId || typeof describeEffects !== 'function') {
		return () => {}
	}

	conditionSources.set(sourceId, describeEffects)
	return () => {
		conditionSources.delete(sourceId)
	}
}

function collectCohortEffects(cohort){
	const conditions = buildEmptyAxisValues()
	const voice = {
		compulsion: 0,
		obstruction: 0
	}

	conditionSources.forEach((describeEffects) => {
		const effects = describeEffects(cohort)

		if (!effects) {
			return
		}

		Object.entries(effects.conditions || {}).forEach(([axisId, value]) => {
			if (!Object.prototype.hasOwnProperty.call(conditions, axisId)) {
				return
			}

			conditions[axisId] += Number(value) || 0
		})

		voice.compulsion += Number(effects.voice?.compulsion) || 0
		voice.obstruction += Number(effects.voice?.obstruction) || 0
	})

	return {
		conditions,
		voice
	}
}

function getCompulsionResistance(cohort){
	const resistance = Object.entries(COHORT_DIMENSIONS).reduce((total, [dimensionId, cohortKey]) => {
		const dimensionFactors = VOICE_COMPULSION_RESISTANCE[dimensionId]

		if (!dimensionFactors) {
			return total
		}

		return total + (dimensionFactors[cohort[cohortKey]] || 0)
	}, Number(VOICE_COMPULSION_RESISTANCE.base) || 0)

	return clamp(resistance, 0, 0.95)
}

function applyVoiceToTurnout(turnoutRate, cohort, voice){
	let nextTurnoutRate = turnoutRate

	if (voice.compulsion > 0) {
		const grip = clamp(voice.compulsion, 0, 1) * (1 - getCompulsionResistance(cohort))
		nextTurnoutRate += (VOICE_COMPLIANCE_CEILING - nextTurnoutRate) * grip
	}

	if (voice.obstruction > 0) {
		nextTurnoutRate *= Math.max(0, 1 - (voice.obstruction * VOICE_OBSTRUCTION_SCALE))
	}

	return nextTurnoutRate
}

function getCohortImpact(cohort){
	if (conditionSources.size === 0) {
		return {
			satisfactionDelta: 0,
			voice: {
				compulsion: 0,
				obstruction: 0
			},
			conditions: buildEmptyAxisValues()
		}
	}

	const effects = collectCohortEffects(cohort)
	const satisfactionDelta = CONDITION_AXIS_IDS.reduce((total, axisId) => {
		const pressure = effects.conditions[axisId]

		if (pressure === 0) {
			return total
		}

		return total + (respondToPressure(pressure) * getCohortSensitivity(axisId, cohort))
	}, 0) * SATISFACTION_SCALE

	return {
		satisfactionDelta,
		voice: effects.voice,
		conditions: effects.conditions
	}
}

window.humanityProtocolLivingConditions = {
	applyVoiceToTurnout,
	axisIds: [...CONDITION_AXIS_IDS],
	getCohortImpact,
	getCohortSensitivity,
	registerConditionSource,
	respondToPressure
}
