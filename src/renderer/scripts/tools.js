const toolRegistry = new Map()
const toolsPanel = document.querySelector('#tools-panel')

let activeDraggedToolId = null
let dragPointerId = null
let dragOffsetX = 0
let dragOffsetY = 0
let nextToolLayer = 1
const DEFAULT_TOOL_OFFSET_X = 28
const DEFAULT_TOOL_OFFSET_Y = 24

function getNow(){
	return Date.now()
}

function ensureToolUsage(tool){
	if (!tool.usage) {
		tool.usage = {
			activationCount: 0,
			pointerDownCount: 0,
			totalEnabledMs: 0,
			totalCollapsedMs: 0,
			customMetrics: {},
			lastEnabledAt: null,
			lastCollapsedAt: null
		}
	}

	return tool.usage
}

function flushToolUsage(tool, now = getNow()){
	const usage = ensureToolUsage(tool)

	if (tool.enabled && Number.isFinite(usage.lastEnabledAt)) {
		usage.totalEnabledMs += Math.max(0, now - usage.lastEnabledAt)
		usage.lastEnabledAt = now
	}

	if (tool.enabled && tool.collapsed && Number.isFinite(usage.lastCollapsedAt)) {
		usage.totalCollapsedMs += Math.max(0, now - usage.lastCollapsedAt)
		usage.lastCollapsedAt = now
	}
}

function startToolUsage(tool, now = getNow()){
	const usage = ensureToolUsage(tool)
	usage.activationCount += 1
	usage.lastEnabledAt = now
	usage.lastCollapsedAt = tool.collapsed ? now : null
}

function stopToolUsage(tool, now = getNow()){
	const usage = ensureToolUsage(tool)
	flushToolUsage(tool, now)
	usage.lastEnabledAt = null
	usage.lastCollapsedAt = null
}

function updateCollapsedUsage(tool, now = getNow()){
	const usage = ensureToolUsage(tool)

	if (!tool.enabled) {
		usage.lastCollapsedAt = null
		return
	}

	if (tool.collapsed) {
		if (!Number.isFinite(usage.lastCollapsedAt)) {
			usage.lastCollapsedAt = now
		}
		return
	}

	if (Number.isFinite(usage.lastCollapsedAt)) {
		usage.totalCollapsedMs += Math.max(0, now - usage.lastCollapsedAt)
		usage.lastCollapsedAt = null
	}
}

function getToolsContainer(){
	return toolsPanel
}

function getDefaultToolPosition(index = toolRegistry.size){
	const estimatedWidth = 320
	const estimatedHeight = 220
	const centeredX = Math.max(12, Math.round((window.innerWidth - estimatedWidth) / 2))
	const centeredY = Math.max(12, Math.round((window.innerHeight - estimatedHeight) / 2))

	return {
		x: centeredX,
		y: centeredY
	}
}

function getSpawnToolPosition(tool){
	const basePosition = getDefaultToolPosition()
	const untouchedVisibleTools = [...toolRegistry.values()].filter((currentTool) => (
		currentTool.id !== tool.id &&
		currentTool.enabled &&
		!currentTool.hasBeenMoved &&
		currentTool.shell?.isConnected
	))
	const spawnIndex = untouchedVisibleTools.length

	return {
		x: basePosition.x + (spawnIndex * DEFAULT_TOOL_OFFSET_X),
		y: basePosition.y + (spawnIndex * DEFAULT_TOOL_OFFSET_Y)
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

	updateCollapsedUsage(tool)
	tool.shell.classList.toggle('is-collapsed', tool.collapsed)
	tool.body.hidden = tool.collapsed
	tool.collapseButton.textContent = tool.collapsed ? '+' : '-'
	tool.collapseButton.setAttribute('aria-expanded', String(!tool.collapsed))
}

function resolveToolTitle(tool, language = 'fr'){
	if (typeof tool.getTitle === 'function') {
		return tool.getTitle(language)
	}

	return tool.title
}

function updateToolShellText(tool, language = 'fr'){
	if (!tool?.shell || !tool.titleElement || !tool.collapseButton) {
		return
	}

	const resolvedTitle = resolveToolTitle(tool, language)
	tool.titleElement.textContent = resolvedTitle
	tool.shell.setAttribute('aria-label', resolvedTitle)
	tool.collapseButton.setAttribute('aria-label', `Reduire ${resolvedTitle}`)
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
	tool.hasBeenMoved = true
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

		const header = document.createElement('header')
		header.className = 'tool-window-header'

		const title = document.createElement('h2')
		title.className = 'tool-window-title'

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
			const usage = ensureToolUsage(tool)
			usage.pointerDownCount += 1
			bringToolToFront(tool)
		})

		shell.append(header, body)
		tool.shell = shell
		tool.header = header
		tool.titleElement = title
		tool.body = body
		tool.collapseButton = collapseButton
		bringToolToFront(tool)
		updateCollapsedState(tool)
		applyToolPosition(tool)
	}

	if (!tool.shell.isConnected) {
		toolsPanel.append(tool.shell)
	}

	updateToolShellText(tool, document.documentElement.lang || 'fr')

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
		usage: {
			activationCount: 0,
			pointerDownCount: 0,
			totalEnabledMs: 0,
			totalCollapsedMs: 0,
			customMetrics: {},
			lastEnabledAt: null,
			lastCollapsedAt: null
		},
		title: definition.title || definition.debugLabel || definition.id,
		position: getDefaultToolPosition(index),
		hasBeenMoved: false,
		collapsed: false,
		layer: 0,
		shell: null,
		header: null,
		titleElement: null,
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

	if (tool.enabled) {
		ensureToolShell(tool)
		return true
	}

	tool.enabled = true
	if (!tool.hasBeenMoved) {
		tool.position = getSpawnToolPosition(tool)
	}
	startToolUsage(tool)
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

	if (!tool.enabled) {
		return true
	}

	stopToolUsage(tool)
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

function buildLayoutSnapshot(){
	const now = getNow()

	return {
		tools: [...toolRegistry.values()].reduce((snapshot, tool) => {
			flushToolUsage(tool, now)
			snapshot[tool.id] = {
				position: {
					x: Math.round(Number(tool.position?.x) || 0),
					y: Math.round(Number(tool.position?.y) || 0)
				},
				collapsed: Boolean(tool.collapsed),
				layer: Math.max(0, Math.round(Number(tool.layer) || 0)),
				hasBeenMoved: Boolean(tool.hasBeenMoved),
				usage: {
					activationCount: Math.max(0, Math.round(Number(tool.usage?.activationCount) || 0)),
					pointerDownCount: Math.max(0, Math.round(Number(tool.usage?.pointerDownCount) || 0)),
					totalEnabledMs: Math.max(0, Math.round(Number(tool.usage?.totalEnabledMs) || 0)),
					totalCollapsedMs: Math.max(0, Math.round(Number(tool.usage?.totalCollapsedMs) || 0)),
					customMetrics: { ...(tool.usage?.customMetrics || {}) }
				}
			}
			return snapshot
		}, {})
	}
}

function restoreLayout(layoutSnapshot){
	const savedTools = layoutSnapshot?.tools || {}
	let highestLayer = 0

	toolRegistry.forEach((tool) => {
		const savedTool = savedTools[tool.id]

		if (!savedTool) {
			return
		}

		tool.position = {
			x: Math.max(12, Math.round(Number(savedTool.position?.x) || tool.position.x)),
			y: Math.max(12, Math.round(Number(savedTool.position?.y) || tool.position.y))
		}
		tool.collapsed = Boolean(savedTool.collapsed)
		tool.layer = Math.max(0, Math.round(Number(savedTool.layer) || 0))
		tool.hasBeenMoved = Boolean(savedTool.hasBeenMoved)
		tool.usage = {
			activationCount: Math.max(0, Math.round(Number(savedTool.usage?.activationCount) || 0)),
			pointerDownCount: Math.max(0, Math.round(Number(savedTool.usage?.pointerDownCount) || 0)),
			totalEnabledMs: Math.max(0, Math.round(Number(savedTool.usage?.totalEnabledMs) || 0)),
			totalCollapsedMs: Math.max(0, Math.round(Number(savedTool.usage?.totalCollapsedMs) || 0)),
			customMetrics: { ...(savedTool.usage?.customMetrics || {}) },
			lastEnabledAt: tool.enabled ? getNow() : null,
			lastCollapsedAt: tool.enabled && tool.collapsed ? getNow() : null
		}
		highestLayer = Math.max(highestLayer, tool.layer)
		updateCollapsedState(tool)
		applyToolPosition(tool)

		if (tool.shell) {
			tool.shell.style.zIndex = String(tool.layer)
		}
	})

	nextToolLayer = Math.max(1, highestLayer + 1)
}

function centerToolLayout(){
	nextToolLayer = 1

	toolRegistry.forEach((tool) => {
		tool.usage.lastCollapsedAt = null
		tool.position = getDefaultToolPosition()
		tool.hasBeenMoved = false
		tool.collapsed = false
		tool.layer = 0
		updateCollapsedState(tool)
		applyToolPosition(tool)
	})
}

function recordToolMetric(toolId, metricName, delta = 1){
	const tool = getTool(toolId)

	if (!tool || !metricName) {
		return false
	}

	const usage = ensureToolUsage(tool)
	const currentValue = Number(usage.customMetrics[metricName]) || 0
	usage.customMetrics[metricName] = currentValue + delta
	return true
}

function getRegisteredTools(){
	return [...toolRegistry.values()].map((tool) => ({
		id: tool.id,
		debugLabel: tool.debugLabel || tool.id,
		enabled: tool.enabled,
		evolutions: tool.evolutions || [],
		usage: {
			activationCount: tool.usage?.activationCount || 0,
			pointerDownCount: tool.usage?.pointerDownCount || 0,
			totalEnabledMs: tool.usage?.totalEnabledMs || 0,
			totalCollapsedMs: tool.usage?.totalCollapsedMs || 0,
			customMetrics: { ...(tool.usage?.customMetrics || {}) }
		}
	}))
}

window.humanityProtocolTools = {
	buildLayoutSnapshot,
	disableTool,
	enableTool,
	getToolsContainer,
	getRegisteredTools,
	isToolEnabled,
	centerToolLayout,
	recordToolMetric,
	registerTool,
	restoreLayout,
	renderTools
}
