const menuScreen = document.querySelector('#menu-screen')
const menuMainView = document.querySelector('#menu-main-view')
const menuSettingsView = document.querySelector('#menu-settings-view')
const menuLoadView = document.querySelector('#menu-load-view')
const introScreen = document.querySelector('#intro-screen')
const gameScreen = document.querySelector('#game-screen')
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
const screens = {
	menu: menuScreen,
	intro: introScreen,
	game: gameScreen
}

const restorableScreens = new Set(['intro', 'game'])

const gameState = {
	currentScreen: 'menu',
	hasSaves: false,
	menuView: 'main'
}

function showScreen(screenName){
	if (screenName !== 'intro') {
		window.humanityProtocolIntro.stopTypewriter()
	}

	Object.entries(screens).forEach(([name, screen]) => {
		const isActive = name === screenName
		screen.classList.toggle('is-active', isActive)
		screen.setAttribute('aria-hidden', String(!isActive))
	})

	gameState.currentScreen = screenName
	window.humanityProtocolSession.setCurrentScreen(screenName)
}

function isScreenActive(screen){
	return screen.classList.contains('is-active')
}

function showMenuView(viewName){
	const views = {
		main: menuMainView,
		settings: menuSettingsView,
		load: menuLoadView
	}

	Object.entries(views).forEach(([name, view]) => {
		const isActive = name === viewName
		view.classList.toggle('is-active', isActive)
		view.setAttribute('aria-hidden', String(!isActive))
	})

	gameState.menuView = views[viewName] ? viewName : 'main'
}

function updateMenuButtons(){
	resumeButton.hidden = !window.humanityProtocolSession.hasActiveRun() || !window.humanityProtocolSession.getLastNonMenuScreen()
	continueButton.hidden = window.humanityProtocolSession.hasActiveRun() || !gameState.hasSaves
	loadGameButton.hidden = !gameState.hasSaves
}

function setHasSaves(hasSaves){
	gameState.hasSaves = hasSaves
}

async function refreshSaveAvailability(){
	return window.humanityProtocolSaves.refreshSaveAvailability({
		setHasSaves,
		updateMenuButtons
	})
}

function openMainMenu(){
	showMenuView('main')
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

async function openPauseMenu(){
	if (!window.humanityProtocolSession.hasActiveRun() || !window.humanityProtocolSession.getLastNonMenuScreen()) {
		return
	}

	await window.humanityProtocolSession.pauseRun()
	showMenuView('main')
	updateMenuButtons()
	showScreen('menu')
}

async function loadSettings(){
	const settings = await window.humanityProtocol.loadSettings()
	window.humanityProtocolI18n.applyTranslations(settings.language)
	window.humanityProtocolTime.setSimulationStepHours(settings.simulationStepHours)
	window.humanityProtocolTools.renderTools({ language: settings.language })
	fullscreenCheckbox.checked = settings.startFullscreen
	languageSelect.value = settings.language
	simulationIntervalSelect.value = String(settings.simulationStepHours)
	return settings
}

async function startIntro(){
	const settings = await loadSettings()
	window.humanityProtocolSession.startNewRun()
	window.humanityProtocolIntro.startIntro(settings.language)
	showScreen('intro')
}

async function loadSave(save){
	const settings = await loadSettings()

	if (!save || !save.screen || !restorableScreens.has(save.screen)) {
		return
	}

	window.humanityProtocolTheme.applyThemeFromSave(save)
	window.humanityProtocolSession.restoreRun(save)
	gameState.hasSaves = true
	updateMenuButtons()

	if (save.screen === 'intro') {
		window.humanityProtocolIntro.restoreIntro(settings.language, save)
		showScreen('intro')
		window.humanityProtocolIntro.resumeIntroIfNeeded()
		return
	}

	if (save.screen === 'game') {
		showScreen('game')
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
		currentSaveId: window.humanityProtocolSession.getCurrentSaveId(),
		onDeleteCurrentSave: window.humanityProtocolSession.clearCurrentRun,
		refreshSaveAvailability,
		isLoadScreenVisible: () => gameState.currentScreen === 'menu' && gameState.menuView === 'load',
		renderSaveList
	})

	await applyLatestSavedTheme()
}

async function openLoadScreen(){
	await renderSaveList()
	showMenuView('load')
	showScreen('menu')
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
	window.humanityProtocolSession.configureSession({
		getLanguage: () => languageSelect.value || document.documentElement.lang || 'fr',
		refreshSaveAvailability
	})
	window.humanityProtocolSession.initializeSession()
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
	const lastNonMenuScreen = window.humanityProtocolSession.getLastNonMenuScreen()

	if (!lastNonMenuScreen) {
		return
	}

	showScreen(lastNonMenuScreen)

	if (lastNonMenuScreen === 'intro') {
		window.humanityProtocolIntro.resumeIntroIfNeeded()
	}
})

settingsButton.addEventListener('click', async () => {
	await loadSettings()
	showMenuView('settings')
	showScreen('menu')
})

backButton.addEventListener('click', () => {
	showMenuView('main')
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

	if (isScreenActive(introScreen)) {
		window.humanityProtocolIntro.applyLanguage(settings.language)
	}

	if (gameState.currentScreen === 'menu' && gameState.menuView === 'load') {
		renderSaveList()
	}
})

simulationIntervalSelect.addEventListener('change', async () => {
	const settings = await window.humanityProtocol.updateSettings({
		simulationStepHours: Number(simulationIntervalSelect.value)
	})

	window.humanityProtocolTime.setSimulationStepHours(settings.simulationStepHours)
	simulationIntervalSelect.value = String(settings.simulationStepHours)
})

quitButton.addEventListener('click', async () => {
	await window.humanityProtocolSession.saveCurrentRun()
	window.humanityProtocol.quit()
})

introScreen.addEventListener('click', () => {
	if (!window.humanityProtocolIntro.typewriterState.isComplete) {
		window.humanityProtocolIntro.finishIntroText()
		return
	}

	window.humanityProtocolTools.enableTool('world-status')
	window.humanityProtocolTools.renderTools({ language: languageSelect.value || 'fr' })
	showScreen('game')
	window.humanityProtocolSession.saveCurrentRun()
})

document.addEventListener('keydown', (event) => {
	const speedShortcuts = new Map([
		['@', 0],
		['&', 1],
		['é', 2],
		['"', 3]
	])
	const requestedSpeed = speedShortcuts.get(event.key)

	if (requestedSpeed !== undefined) {
		window.humanityProtocolTime.setSpeedMultiplier(requestedSpeed)
		return
	}

	if (event.key !== 'Escape') {
		return
	}

	if (gameState.currentScreen === 'intro' || gameState.currentScreen === 'game') {
		openPauseMenu()
		return
	}

	if (gameState.currentScreen === 'menu' && gameState.menuView !== 'main') {
		showMenuView('main')
		return
	}

	if (gameState.currentScreen === 'menu' && window.humanityProtocolSession.hasActiveRun() && window.humanityProtocolSession.getLastNonMenuScreen()) {
		resumeButton.click()
	}
})
