const toolRegistry = new Map()

function registerTool(definition){
	if (!definition?.id) {
		throw new Error('Tool id is required.')
	}

	toolRegistry.set(definition.id, {
		enabled: definition.enabled !== false,
		...definition
	})
}

function getTool(toolId){
	return toolRegistry.get(toolId) || null
}

function isToolEnabled(toolId){
	return Boolean(getTool(toolId)?.enabled)
}

function enableTool(toolId){
	const tool = getTool(toolId)

	if (!tool) {
		return false
	}

	tool.enabled = true
	tool.onEnable?.()
	return true
}

function disableTool(toolId){
	const tool = getTool(toolId)

	if (!tool) {
		return false
	}

	tool.enabled = false
	tool.onDisable?.()
	return true
}

function renderTools(context = {}){
	toolRegistry.forEach((tool) => {
		if (!tool.enabled) {
			return
		}

		tool.render?.(context)
	})
}

function getRegisteredTools(){
	return [...toolRegistry.values()].map((tool) => ({
		id: tool.id,
		enabled: tool.enabled
	}))
}

window.humanityProtocolTools = {
	disableTool,
	enableTool,
	getRegisteredTools,
	isToolEnabled,
	registerTool,
	renderTools
}
