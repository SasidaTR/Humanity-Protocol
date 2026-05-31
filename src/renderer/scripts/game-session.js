const AUTOSAVE_INTERVAL_MS = 10 * 60 * 1000
const resumableScreens = new Set(['intro', 'game'])

let autosaveTimerId = null
let autosaveInFlight = false

const sessionState = {
	currentScreen: 'menu',
	lastNonMenuScreen: null,
	hasActiveRun: false,
	currentSaveId: null
}

const sessionDependencies = {
	getLanguage: () => 'fr',
	refreshSaveAvailability: async () => {}
}

function getLanguage(){
	return sessionDependencies.getLanguage?.() || 'fr'
}

function setToolAvailability(toolId, isEnabled){
	const language = getLanguage()

	if (!sessionState.hasActiveRun || sessionState.lastNonMenuScreen !== 'game') {
		window.humanityProtocolTools.disableTool(toolId)
		return
	}

	const toolOverride = window.humanityProtocolDebug.getToolOverride(toolId)
	const shouldEnable = toolOverride === null ? isEnabled : toolOverride

	if (shouldEnable) {
		window.humanityProtocolTools.enableTool(toolId)
		window.humanityProtocolTools.renderTools({ language })
		return
	}

	window.humanityProtocolTools.disableTool(toolId)
}

function syncToolAvailability(){
	const isWorldStatusAvailable = sessionState.hasActiveRun && sessionState.lastNonMenuScreen !== 'intro'
	setToolAvailability('satisfaction-vote', isWorldStatusAvailable)
	setToolAvailability('world-status', isWorldStatusAvailable)
}

function syncSimulationWithScreen(screenName){
	if (!sessionState.hasActiveRun) {
		window.humanityProtocolTime.stopSimulation()
		return
	}

	if (resumableScreens.has(screenName)) {
		window.humanityProtocolTime.startSimulation()
		return
	}

	window.humanityProtocolTime.stopSimulation()
}

function stopAutosave(){
	if (!autosaveTimerId) {
		return
	}

	clearInterval(autosaveTimerId)
	autosaveTimerId = null
}

async function saveCurrentRun(){
	if (
		!sessionState.hasActiveRun ||
		sessionState.lastNonMenuScreen !== 'game' ||
		!sessionState.currentSaveId
	) {
		return null
	}

	const save = await window.humanityProtocol.updateSave(buildSaveSnapshot())
	await sessionDependencies.refreshSaveAvailability()
	return save
}

function startAutosave(){
	if (autosaveTimerId) {
		return
	}

	autosaveTimerId = setInterval(async () => {
		if (autosaveInFlight) {
			return
		}

		autosaveInFlight = true

		try {
			await saveCurrentRun()
		} finally {
			autosaveInFlight = false
		}
	}, AUTOSAVE_INTERVAL_MS)
}

function syncAutosaveWithScreen(screenName){
	if (!sessionState.hasActiveRun) {
		stopAutosave()
		return
	}

	if (screenName === 'game') {
		startAutosave()
		return
	}

	stopAutosave()
}

function buildSaveSnapshot(){
	return {
		id: sessionState.currentSaveId,
		screen: sessionState.lastNonMenuScreen,
		label: `Save ${new Date().toISOString()}`,
		time: window.humanityProtocolTime.buildTimeSnapshot(),
		intro: window.humanityProtocolIntro.buildIntroSnapshot(),
		population: window.humanityProtocolPopulation.buildPopulationSnapshot(),
		survey: window.humanityProtocolSatisfactionSurvey.buildSurveySnapshot(),
		funds: window.humanityProtocolFunds.buildFundsSnapshot(),
		ui: {
			...window.humanityProtocolTheme.buildThemeSnapshot(),
			toolLayout: window.humanityProtocolTools.buildLayoutSnapshot(),
			satisfactionVote: window.humanityProtocolSatisfactionVoteTool.buildSnapshot()
		}
	}
}

function setCurrentScreen(screenName){
	sessionState.currentScreen = screenName
	syncSimulationWithScreen(screenName)
	syncAutosaveWithScreen(screenName)

	if (resumableScreens.has(screenName)) {
		sessionState.lastNonMenuScreen = screenName
	}

	syncToolAvailability()
}

function configureSession(nextDependencies = {}){
	Object.assign(sessionDependencies, nextDependencies)
}

function resetRunSystems(){
	window.humanityProtocolTime.resetTime()
	window.humanityProtocolPopulation.resetPopulation()
	window.humanityProtocolSatisfactionSurvey.resetSurvey()
	window.humanityProtocolFunds.resetFunds()
	window.humanityProtocolSatisfactionVoteTool.resetState()
}

function resetRunState({ resetTools = false, clearSaveId = false } = {}){
	sessionState.hasActiveRun = false
	sessionState.lastNonMenuScreen = null

	if (clearSaveId) {
		sessionState.currentSaveId = null
	}

	window.humanityProtocolTime.stopSimulation()
	stopAutosave()
	syncToolAvailability()

	if (resetTools) {
		window.humanityProtocolTools.resetToolRuntime()
	}

	resetRunSystems()
}

function initializeSession(){
	resetRunState({ resetTools: true, clearSaveId: true })
}

function clearCurrentRun(){
	resetRunState({ resetTools: true, clearSaveId: true })
}

function startNewRun(){
	resetRunState({ resetTools: true, clearSaveId: true })
	sessionState.currentSaveId = `save-${Date.now()}`
	sessionState.hasActiveRun = true
	sessionState.lastNonMenuScreen = null
	syncToolAvailability()
}

function restoreRun(save){
	sessionState.currentSaveId = save.id
	sessionState.hasActiveRun = true
	sessionState.lastNonMenuScreen = save.screen
	if (save?.ui?.toolLayout) {
		window.humanityProtocolTools.restoreLayout(save.ui.toolLayout)
	} else {
		window.humanityProtocolTools.centerToolLayout()
	}
	window.humanityProtocolTime.restoreTime(save)
	window.humanityProtocolPopulation.restorePopulation(save)
	window.humanityProtocolSatisfactionSurvey.restoreSurvey(save)
	window.humanityProtocolFunds.restoreFunds(save)
	window.humanityProtocolSatisfactionVoteTool.restoreSnapshot(save)
	syncToolAvailability()
}

async function pauseRun(){
	if (!sessionState.hasActiveRun || !sessionState.lastNonMenuScreen) {
		return null
	}

	return saveCurrentRun()
}

window.humanityProtocolSession = {
	clearCurrentRun,
	configureSession,
	getCurrentSaveId: () => sessionState.currentSaveId,
	getCurrentScreen: () => sessionState.currentScreen,
	getLastNonMenuScreen: () => sessionState.lastNonMenuScreen,
	hasActiveRun: () => sessionState.hasActiveRun,
	initializeSession,
	pauseRun,
	restoreRun,
	saveCurrentRun,
	setCurrentScreen,
	startNewRun
}

window.humanityProtocolDebug.subscribe(() => {
	syncToolAvailability()
})
