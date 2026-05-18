const menuScreen = document.querySelector('#menu-screen')
const settingsScreen = document.querySelector('#settings-screen')
const introScreen = document.querySelector('#intro-screen')
const titleScreen = document.querySelector('#title-screen')
const loadScreen = document.querySelector('#load-screen')
const newGameButton = document.querySelector('#new-game-button')
const continueButton = document.querySelector('#continue-button')
const loadGameButton = document.querySelector('#load-game-button')
const themeButton = document.querySelector('#theme-button')
const resumeButton = document.querySelector('#resume-button')
const settingsButton = document.querySelector('#settings-button')
const backButton = document.querySelector('#back-button')
const loadBackButton = document.querySelector('#load-back-button')
const fullscreenCheckbox = document.querySelector('#fullscreen-checkbox')
const languageSelect = document.querySelector('#language-select')
const simulationIntervalSelect = document.querySelector('#simulation-interval-select')
const quitButton = document.querySelector('#quit-button')
const saveList = document.querySelector('#save-list')

const restorableScreens = new Set(['intro', 'title'])

const gameState = {
	currentScreen: 'menu',
	lastNonMenuScreen: null,
	hasActiveRun: false,
	hasSaves: false,
	settingsReturnMode: 'main',
	currentSaveId: null
}

function syncSimulationWithScreen(screenName){
	if (!gameState.hasActiveRun) {
		window.humanityProtocolPopulation.stopSimulation()
		return
	}

	if (screenName === 'intro' || screenName === 'title') {
		window.humanityProtocolPopulation.startSimulation()
		return
	}

	window.humanityProtocolPopulation.stopSimulation()
}

function showScreen(screenName){
	if (screenName !== 'intro') {
		window.humanityProtocolIntro.stopTypewriter()
	}

	menuScreen.hidden = screenName !== 'menu'
	settingsScreen.hidden = screenName !== 'settings'
	introScreen.hidden = screenName !== 'intro'
	titleScreen.hidden = screenName !== 'title'
	loadScreen.hidden = screenName !== 'load'
	gameState.currentScreen = screenName
	syncSimulationWithScreen(screenName)

	if (screenName !== 'menu' && screenName !== 'settings' && screenName !== 'load') {
		gameState.lastNonMenuScreen = screenName
	}
}

function updateMenuButtons(){
	resumeButton.hidden = !gameState.hasActiveRun || !gameState.lastNonMenuScreen
	continueButton.hidden = gameState.hasActiveRun || !gameState.hasSaves
	loadGameButton.hidden = !gameState.hasSaves
}

function setHasSaves(hasSaves){
	gameState.hasSaves = hasSaves
}

function clearCurrentRun(){
	gameState.currentSaveId = null
	gameState.hasActiveRun = false
	gameState.lastNonMenuScreen = null
	window.humanityProtocolPopulation.stopSimulation()
}

function buildSaveSnapshot(){
	return {
		id: gameState.currentSaveId,
		screen: gameState.lastNonMenuScreen,
		label: `Save ${new Date().toISOString()}`,
		intro: window.humanityProtocolIntro.buildIntroSnapshot(),
		population: window.humanityProtocolPopulation.buildPopulationSnapshot(),
		ui: window.humanityProtocolTheme.buildThemeSnapshot()
	}
}

async function refreshSaveAvailability(){
	return window.humanityProtocolSaves.refreshSaveAvailability({
		setHasSaves,
		updateMenuButtons
	})
}

async function saveCurrentRun(){
	if (!gameState.hasActiveRun || !gameState.lastNonMenuScreen || !gameState.currentSaveId) {
		return null
	}

	const save = await window.humanityProtocol.updateSave(buildSaveSnapshot())
	await refreshSaveAvailability()
	return save
}

function openMainMenu(){
	updateMenuButtons()
	showScreen('menu')
}

function cycleTheme(){
	const themes = window.humanityProtocolTheme.themes
	const currentTheme = window.humanityProtocolTheme.getCurrentTheme()
	const currentIndex = themes.indexOf(currentTheme)
	const nextTheme = themes[(currentIndex + 1) % themes.length]
	window.humanityProtocolTheme.applyTheme(nextTheme)
}

function setWorldStatusAvailability(isEnabled, language = languageSelect.value || 'fr'){
	if (isEnabled) {
		window.humanityProtocolTools.enableTool('world-status')
		window.humanityProtocolTools.renderTools({ language })
		return
	}

	window.humanityProtocolTools.disableTool('world-status')
}

async function openPauseMenu(){
	if (!gameState.hasActiveRun || !gameState.lastNonMenuScreen) {
		return
	}

	await saveCurrentRun()
	updateMenuButtons()
	showScreen('menu')
}

async function loadSettings(){
	const settings = await window.humanityProtocol.loadSettings()
	window.humanityProtocolI18n.applyTranslations(settings.language)
	window.humanityProtocolPopulation.setSimulationInterval(settings.simulationIntervalSeconds)
	window.humanityProtocolTools.renderTools({ language: settings.language })
	fullscreenCheckbox.checked = settings.startFullscreen
	languageSelect.value = settings.language
	simulationIntervalSelect.value = String(settings.simulationIntervalSeconds)
	return settings
}

async function startIntro(){
	const settings = await loadSettings()
	gameState.currentSaveId = `save-${Date.now()}`
	gameState.hasActiveRun = true
	window.humanityProtocolPopulation.resetPopulation()
	setWorldStatusAvailability(false, settings.language)
	window.humanityProtocolIntro.startIntro(settings.language)
	showScreen('intro')
}

async function loadSave(save){
	const settings = await loadSettings()

	if (!save || !save.screen || !restorableScreens.has(save.screen)) {
		return
	}

	window.humanityProtocolTheme.applyThemeFromSave(save)
	window.humanityProtocolPopulation.restorePopulation(save)
	setWorldStatusAvailability(save.screen !== 'intro', settings.language)
	gameState.currentSaveId = save.id
	gameState.hasActiveRun = true
	gameState.hasSaves = true
	updateMenuButtons()

	if (save.screen === 'intro') {
		window.humanityProtocolIntro.restoreIntro(settings.language, save)
		showScreen('intro')
		window.humanityProtocolIntro.resumeIntroIfNeeded()
		return
	}

	if (save.screen === 'title') {
		showScreen('title')
	}
}

async function continueSavedRun(){
	return window.humanityProtocolSaves.continueSavedRun({ loadSave })
}

async function renderSaveList(){
	const settings = await loadSettings()
	return window.humanityProtocolSaves.renderSaveList({
		language: settings.language,
		saveList,
		loadSave,
		deleteSave: (saveId) => deleteSaveEntry(saveId)
	})
}

async function deleteSaveEntry(saveId){
	await window.humanityProtocolSaves.deleteSaveEntry({
		saveId,
		currentSaveId: gameState.currentSaveId,
		onDeleteCurrentSave: clearCurrentRun,
		refreshSaveAvailability,
		isLoadScreenVisible: () => !loadScreen.hidden,
		renderSaveList
	})

	await applyLatestSavedTheme()
}

async function openLoadScreen(){
	await renderSaveList()
	showScreen('load')
}

async function applyLatestSavedTheme(){
	const latestSave = await window.humanityProtocol.loadLatestSave()

	if (!latestSave) {
		window.humanityProtocolTheme.applyTheme(window.humanityProtocolTheme.defaultTheme)
		return
	}

	window.humanityProtocolTheme.applyThemeFromSave(latestSave)
}

async function initialize(){
	window.humanityProtocolTheme.applyTheme(window.humanityProtocolTheme.defaultTheme)
	window.humanityProtocolPopulation.resetPopulation()
	window.humanityProtocolPopulation.stopSimulation()
	setWorldStatusAvailability(false)
	await loadSettings()
	await applyLatestSavedTheme()
	await refreshSaveAvailability()
	openMainMenu()
}

initialize()

newGameButton.addEventListener('click', () => {
	startIntro()
})

continueButton.addEventListener('click', () => {
	continueSavedRun()
})

loadGameButton.addEventListener('click', () => {
	openLoadScreen()
})

themeButton.addEventListener('click', () => {
	cycleTheme()
})

resumeButton.addEventListener('click', () => {
	if (!gameState.lastNonMenuScreen) {
		return
	}

	showScreen(gameState.lastNonMenuScreen)

	if (gameState.lastNonMenuScreen === 'intro') {
		window.humanityProtocolIntro.resumeIntroIfNeeded()
	}
})

settingsButton.addEventListener('click', async () => {
	await loadSettings()
	gameState.settingsReturnMode = gameState.currentScreen === 'menu' ? 'menu' : 'game'
	showScreen('settings')
})

backButton.addEventListener('click', () => {
	if (gameState.settingsReturnMode === 'game' && gameState.hasActiveRun && gameState.lastNonMenuScreen) {
		showScreen(gameState.lastNonMenuScreen)

		if (gameState.lastNonMenuScreen === 'intro') {
			window.humanityProtocolIntro.resumeIntroIfNeeded()
		}

		return
	}

	openMainMenu()
})

loadBackButton.addEventListener('click', () => {
	openMainMenu()
})

fullscreenCheckbox.addEventListener('change', async () => {
	await window.humanityProtocol.updateSettings({
		startFullscreen: fullscreenCheckbox.checked
	})
})

languageSelect.addEventListener('change', async () => {
	const settings = await window.humanityProtocol.updateSettings({
		language: languageSelect.value
	})

	window.humanityProtocolI18n.applyTranslations(settings.language)
	window.humanityProtocolTools.renderTools({ language: settings.language })

	if (!introScreen.hidden) {
		window.humanityProtocolIntro.applyLanguage(settings.language)
	}

	if (!loadScreen.hidden) {
		renderSaveList()
	}
})

simulationIntervalSelect.addEventListener('change', async () => {
	const settings = await window.humanityProtocol.updateSettings({
		simulationIntervalSeconds: Number(simulationIntervalSelect.value)
	})

	window.humanityProtocolPopulation.setSimulationInterval(settings.simulationIntervalSeconds)
	simulationIntervalSelect.value = String(settings.simulationIntervalSeconds)
})

quitButton.addEventListener('click', async () => {
	await saveCurrentRun()
	window.humanityProtocol.quit()
})

introScreen.addEventListener('click', () => {
	if (!window.humanityProtocolIntro.typewriterState.isComplete) {
		window.humanityProtocolIntro.finishIntroText()
		return
	}

	setWorldStatusAvailability(true)
	showScreen('title')
	saveCurrentRun()
})

document.addEventListener('keydown', (event) => {
	if (event.key !== 'Escape') {
		return
	}

	if (gameState.currentScreen === 'intro' || gameState.currentScreen === 'title') {
		openPauseMenu()
		return
	}

	if (gameState.currentScreen === 'menu' && gameState.hasActiveRun && gameState.lastNonMenuScreen) {
		resumeButton.click()
	}
})
