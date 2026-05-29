const toolRegistry = new Map()
const toolsPanel = document.querySelector('#tools-panel')

let activeDraggedToolId = null
let dragPointerId = null
let dragOffsetX = 0
let dragOffsetY = 0
let nextToolLayer = 1

function getToolsContainer(){
	return toolsPanel
}

function getDefaultToolPosition(index = toolRegistry.size){
	return {
		x: 24 + (index * 28),
		y: 24 + (index * 28)
	}
}

function bringToolToFront(tool){
	tool.layer = nextToolLayer
	nextToolLayer += 1

	if (tool.shell) {
		tool.shell.style.zIndex = String(tool.layer)
	}
}

function applyToolPosition(tool){
	if (!tool?.shell) {
		return
	}

	tool.shell.style.left = `${tool.position.x}px`
	tool.shell.style.top = `${tool.position.y}px`
}

function updateCollapsedState(tool){
	if (!tool?.shell || !tool.body || !tool.collapseButton) {
		return
	}

	tool.shell.classList.toggle('is-collapsed', tool.collapsed)
	tool.body.hidden = tool.collapsed
	tool.collapseButton.textContent = tool.collapsed ? '+' : '-'
	tool.collapseButton.setAttribute('aria-expanded', String(!tool.collapsed))
}

function stopDragging(){
	activeDraggedToolId = null
	dragPointerId = null
}

function handlePointerMove(event){
	if (!activeDraggedToolId || event.pointerId !== dragPointerId) {
		return
	}

	const tool = toolRegistry.get(activeDraggedToolId)

	if (!tool?.shell) {
		stopDragging()
		return
	}

	const maxX = Math.max(0, window.innerWidth - tool.shell.offsetWidth - 12)
	const maxY = Math.max(0, window.innerHeight - tool.shell.offsetHeight - 12)

	tool.position.x = Math.max(12, Math.min(maxX, event.clientX - dragOffsetX))
	tool.position.y = Math.max(12, Math.min(maxY, event.clientY - dragOffsetY))
	applyToolPosition(tool)
}

function handlePointerUp(event){
	if (event.pointerId !== dragPointerId) {
		return
	}

	stopDragging()
}

document.addEventListener('pointermove', handlePointerMove)
document.addEventListener('pointerup', handlePointerUp)
document.addEventListener('pointercancel', handlePointerUp)

function ensureToolShell(tool){
	if (!tool || !toolsPanel) {
		return null
	}

	if (!tool.shell) {
		const shell = document.createElement('section')
		shell.className = 'tool-window'
		shell.dataset.toolId = tool.id
		shell.setAttribute('aria-label', tool.title)

		const header = document.createElement('header')
		header.className = 'tool-window-header'

		const title = document.createElement('h2')
		title.className = 'tool-window-title'
		title.textContent = tool.title

		const actions = document.createElement('div')
		actions.className = 'tool-window-actions'

		const collapseButton = document.createElement('button')
		collapseButton.type = 'button'
		collapseButton.className = 'tool-window-toggle'
		collapseButton.setAttribute('aria-label', `Reduire ${tool.title}`)
		collapseButton.addEventListener('click', () => {
			tool.collapsed = !tool.collapsed
			updateCollapsedState(tool)
		})

		actions.append(collapseButton)
		header.append(title, actions)

		const body = document.createElement('div')
		body.className = 'tool-window-body'

		header.addEventListener('pointerdown', (event) => {
			if (event.target instanceof HTMLButtonElement) {
				return
			}

			bringToolToFront(tool)
			activeDraggedToolId = tool.id
			dragPointerId = event.pointerId
			dragOffsetX = event.clientX - tool.position.x
			dragOffsetY = event.clientY - tool.position.y
		})

		shell.addEventListener('pointerdown', () => {
			bringToolToFront(tool)
		})

		shell.append(header, body)
		tool.shell = shell
		tool.header = header
		tool.body = body
		tool.collapseButton = collapseButton
		bringToolToFront(tool)
		updateCollapsedState(tool)
		applyToolPosition(tool)
	}

	if (!tool.shell.isConnected) {
		toolsPanel.append(tool.shell)
	}

	return tool.shell
}

function registerTool(definition){
	if (!definition?.id) {
		throw new Error('Tool id is required.')
	}

	const index = toolRegistry.size
	toolRegistry.set(definition.id, {
		enabled: definition.enabled !== false,
		evolutions: Array.isArray(definition.evolutions) ? definition.evolutions : [],
		title: definition.title || definition.debugLabel || definition.id,
		position: getDefaultToolPosition(index),
		collapsed: false,
		layer: 0,
		shell: null,
		header: null,
		body: null,
		collapseButton: null,
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
	ensureToolShell(tool)
	tool.onEnable?.({
		container: getToolsContainer(),
		toolBody: tool.body
	})
	return true
}

function disableTool(toolId){
	const tool = getTool(toolId)

	if (!tool) {
		return false
	}

	tool.enabled = false
	tool.onDisable?.({
		container: getToolsContainer(),
		toolBody: tool.body
	})

	if (tool.shell?.isConnected) {
		tool.shell.remove()
	}

	return true
}

function renderTools(context = {}){
	toolRegistry.forEach((tool) => {
		if (!tool.enabled) {
			return
		}

		ensureToolShell(tool)
		tool.render?.({
			...context,
			container: getToolsContainer(),
			toolBody: tool.body
		})
	})
}

function getRegisteredTools(){
	return [...toolRegistry.values()].map((tool) => ({
		id: tool.id,
		debugLabel: tool.debugLabel || tool.id,
		enabled: tool.enabled,
		evolutions: tool.evolutions || []
	}))
}

window.humanityProtocolTools = {
	disableTool,
	enableTool,
	getToolsContainer,
	getRegisteredTools,
	isToolEnabled,
	registerTool,
	renderTools
}
