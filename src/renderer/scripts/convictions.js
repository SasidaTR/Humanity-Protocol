const CONVICTION_DEFINITIONS = [
	{
		id: 'humanCompetence',
		axis: 'humanVision',
		label: 'Humains competents',
		defaultValue: 50
	},
	{
		id: 'humanIncompetence',
		axis: 'humanVision',
		label: 'Humains incompetents',
		defaultValue: 50
	},
	{
		id: 'humanDangerousness',
		axis: 'humanVision',
		label: 'Humains dangereux',
		defaultValue: 50
	},
	{
		id: 'happinessFreedom',
		axis: 'happinessSource',
		label: 'Bonheur par liberte',
		defaultValue: 50
	},
	{
		id: 'happinessSecurity',
		axis: 'happinessSource',
		label: 'Bonheur par securite',
		defaultValue: 50
	},
	{
		id: 'happinessComfort',
		axis: 'happinessSource',
		label: 'Bonheur par confort',
		defaultValue: 50
	},
	{
		id: 'happinessMeaning',
		axis: 'happinessSource',
		label: 'Bonheur par sens',
		defaultValue: 50
	},
	{
		id: 'progressCompetition',
		axis: 'progressSource',
		label: 'Progres par concurrence',
		defaultValue: 50
	},
	{
		id: 'progressCooperation',
		axis: 'progressSource',
		label: 'Progres par cooperation',
		defaultValue: 50
	},
	{
		id: 'progressResearch',
		axis: 'progressSource',
		label: 'Progres par recherche',
		defaultValue: 50
	},
	{
		id: 'progressExpansion',
		axis: 'progressSource',
		label: 'Progres par expansion',
		defaultValue: 50
	},
	{
		id: 'riskAcceptance',
		axis: 'riskManagement',
		label: 'Risque accepte',
		defaultValue: 50
	},
	{
		id: 'riskMinimization',
		axis: 'riskManagement',
		label: 'Risque minimise',
		defaultValue: 50
	},
	{
		id: 'individualPriority',
		axis: 'individualValue',
		label: 'Individu prioritaire',
		defaultValue: 50
	},
	{
		id: 'groupPriority',
		axis: 'individualValue',
		label: 'Groupe prioritaire',
		defaultValue: 50
	},
	{
		id: 'humanPreservation',
		axis: 'humanTransformation',
		label: 'Humain preserve',
		defaultValue: 50
	},
	{
		id: 'humanEvolution',
		axis: 'humanTransformation',
		label: 'Humain transforme',
		defaultValue: 50
	}
]

const CONVICTION_VALUE_RANGE = {
	min: 0,
	max: 100
}

const convictionDefinitionsById = CONVICTION_DEFINITIONS.reduce((registry, definition) => {
	registry[definition.id] = definition
	return registry
}, {})

const convictionListeners = new Set()

const convictionState = {
	values: buildDefaultValues(),
	lastUpdatedAt: Date.now()
}

function buildDefaultValues(){
	return CONVICTION_DEFINITIONS.reduce((values, definition) => {
		values[definition.id] = definition.defaultValue
		return values
	}, {})
}

function clampConvictionValue(value){
	return Math.min(
		CONVICTION_VALUE_RANGE.max,
		Math.max(CONVICTION_VALUE_RANGE.min, Math.round(Number(value) || 0))
	)
}

function sanitizeConvictionValues(nextValues = {}){
	return CONVICTION_DEFINITIONS.reduce((values, definition) => {
		const rawValue = Object.prototype.hasOwnProperty.call(nextValues, definition.id)
			? nextValues[definition.id]
			: definition.defaultValue
		values[definition.id] = clampConvictionValue(rawValue)
		return values
	}, {})
}

function buildConvictionsSnapshot(){
	return {
		version: 1,
		values: { ...convictionState.values },
		lastUpdatedAt: convictionState.lastUpdatedAt
	}
}

function notifyConvictionListeners(){
	const snapshot = buildConvictionsSnapshot()
	convictionListeners.forEach((listener) => {
		listener(snapshot)
	})
	return snapshot
}

function applyConvictionValues(nextValues = {}, options = {}){
	const shouldNotify = options.notify !== false
	convictionState.values = sanitizeConvictionValues(nextValues)
	convictionState.lastUpdatedAt = Date.now()

	if (shouldNotify) {
		return notifyConvictionListeners()
	}

	return buildConvictionsSnapshot()
}

function resetConvictions(){
	return applyConvictionValues(buildDefaultValues())
}

function restoreConvictions(save){
	const savedConvictions = save?.convictions

	if (!savedConvictions?.values) {
		return resetConvictions()
	}

	convictionState.values = sanitizeConvictionValues(savedConvictions.values)
	convictionState.lastUpdatedAt = Number(savedConvictions.lastUpdatedAt) || Date.now()
	return notifyConvictionListeners()
}

function getConvictionValue(convictionId){
	if (!convictionDefinitionsById[convictionId]) {
		return null
	}

	return convictionState.values[convictionId]
}

function setConvictionValue(convictionId, nextValue){
	if (!convictionDefinitionsById[convictionId]) {
		return buildConvictionsSnapshot()
	}

	return applyConvictionValues({
		...convictionState.values,
		[convictionId]: nextValue
	})
}

function adjustConvictionValue(convictionId, delta){
	if (!convictionDefinitionsById[convictionId]) {
		return buildConvictionsSnapshot()
	}

	const currentValue = getConvictionValue(convictionId) || 0
	return setConvictionValue(convictionId, currentValue + (Number(delta) || 0))
}

function adjustConvictions(deltas = {}){
	const nextValues = { ...convictionState.values }

	Object.entries(deltas).forEach(([convictionId, delta]) => {
		if (!convictionDefinitionsById[convictionId]) {
			return
		}

		nextValues[convictionId] = getConvictionValue(convictionId) + (Number(delta) || 0)
	})

	return applyConvictionValues(nextValues)
}

function subscribe(listener){
	convictionListeners.add(listener)
	return () => {
		convictionListeners.delete(listener)
	}
}

window.humanityProtocolConvictions = {
	adjustConvictionValue,
	adjustConvictions,
	buildConvictionsSnapshot,
	definitions: CONVICTION_DEFINITIONS.map((definition) => ({ ...definition })),
	getConvictionValue,
	getState: buildConvictionsSnapshot,
	resetConvictions,
	restoreConvictions,
	setConvictionValue,
	subscribe,
	valueRange: { ...CONVICTION_VALUE_RANGE }
}

resetConvictions()
