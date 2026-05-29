const defaultDebugState = {
	theme: window.humanityProtocolTheme.defaultTheme,
	tools: {},
	toolEvolutions: {}
}

const debugState = {
	...defaultDebugState
}

const debugListeners = new Set()

function sanitizeTheme(themeName){
	return window.humanityProtocolTheme.themes.includes(themeName)
		? themeName
		: window.humanityProtocolTheme.defaultTheme
}

function sanitizeToolOverrides(nextTools = {}){
	return Object.entries(nextTools).reduce((tools, [toolId, isEnabled]) => {
		tools[toolId] = Boolean(isEnabled)
		return tools
	}, {})
}

function getKnownEvolutionIdsByTool(){
	return window.humanityProtocolTools.getRegisteredTools().reduce((registry, tool) => {
		registry[tool.id] = new Set((tool.evolutions || []).map((evolution) => evolution.id))
		return registry
	}, {})
}

function sanitizeToolEvolutions(nextToolEvolutions = {}){
	const knownEvolutionIdsByTool = getKnownEvolutionIdsByTool()

	return Object.entries(nextToolEvolutions).reduce((toolEvolutions, [toolId, evolutionIds]) => {
		const knownEvolutionIds = knownEvolutionIdsByTool[toolId]

		if (!knownEvolutionIds || !Array.isArray(evolutionIds)) {
			return toolEvolutions
		}

		const uniqueEvolutionIds = new Set()
		evolutionIds.forEach((evolutionId) => {
			if (knownEvolutionIds.has(evolutionId)) {
				uniqueEvolutionIds.add(evolutionId)
			}
		})

		toolEvolutions[toolId] = [...uniqueEvolutionIds]
		return toolEvolutions
	}, {})
}

function buildStateSnapshot(){
	return {
		theme: debugState.theme,
		tools: { ...debugState.tools },
		toolEvolutions: Object.entries(debugState.toolEvolutions).reduce((snapshot, [toolId, evolutionIds]) => {
			snapshot[toolId] = [...evolutionIds]
			return snapshot
		}, {})
	}
}

function buildDefaultStateSnapshot(){
	return {
		theme: defaultDebugState.theme,
		tools: {},
		toolEvolutions: {}
	}
}

function notifyDebugListeners(){
	const snapshot = buildStateSnapshot()
	debugListeners.forEach((listener) => {
		listener(snapshot)
	})
	return snapshot
}

function applyDebugState(nextState = {}){
	debugState.theme = sanitizeTheme(nextState.theme)
	debugState.tools = sanitizeToolOverrides(nextState.tools)
	debugState.toolEvolutions = sanitizeToolEvolutions(nextState.toolEvolutions)
	window.humanityProtocolTheme.applyTheme(debugState.theme)
	return notifyDebugListeners()
}

function updateDebugState(partialState = {}){
	return applyDebugState({
		...buildStateSnapshot(),
		...partialState
	})
}

function getToolOverride(toolId){
	return Object.prototype.hasOwnProperty.call(debugState.tools, toolId)
		? debugState.tools[toolId]
		: null
}

function isToolEvolutionEnabled(toolId, evolutionId){
	return Boolean(debugState.toolEvolutions[toolId]?.includes(evolutionId))
}

function subscribe(listener){
	debugListeners.add(listener)
	return () => {
		debugListeners.delete(listener)
	}
}

applyDebugState(buildStateSnapshot())

window.humanityProtocolDebug = {
	applyDebugState,
	getState: buildStateSnapshot,
	getToolOverride,
	isToolEvolutionEnabled,
	resetDebugState: () => applyDebugState(buildDefaultStateSnapshot()),
	subscribe,
	updateDebugState
}
