const menuScreen = document.querySelector('#menu-screen')
const menuMainView = document.querySelector('#menu-main-view')
const menuSettingsView = document.querySelector('#menu-settings-view')
const menuDebugView = document.querySelector('#menu-debug-view')
const menuLoadView = document.querySelector('#menu-load-view')
const introScreen = document.querySelector('#intro-screen')
const gameScreen = document.querySelector('#game-screen')
const newGameButton = document.querySelector('#new-game-button')
const continueButton = document.querySelector('#continue-button')
const loadGameButton = document.querySelector('#load-game-button')
const resumeButton = document.querySelector('#resume-button')
const settingsButton = document.querySelector('#settings-button')
const debugButton = document.querySelector('#debug-button')
const backButton = document.querySelector('#back-button')
const debugBackButton = document.querySelector('#debug-back-button')
const loadBackButton = document.querySelector('#load-back-button')
const fullscreenCheckbox = document.querySelector('#fullscreen-checkbox')
const skipIntroCheckbox = document.querySelector('#skip-intro-checkbox')
const languageSelect = document.querySelector('#language-select')
const simulationIntervalSelect = document.querySelector('#simulation-interval-select')
const debugThemeSelect = document.querySelector('#debug-theme-select')
const debugToolsList = document.querySelector('#debug-tools-list')
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
	menuView: 'main',
	settings: null
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
		debug: menuDebugView,
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
	debugButton.hidden = window.humanityProtocolSession.getLastNonMenuScreen() !== 'game'
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

function getCurrentLanguage(){
	return languageSelect.value || document.documentElement.lang || 'fr'
}

function getDebugSettings(){
	return window.humanityProtocolDebug.getState()
}

function syncDebugControls(){
	const debugSettings = getDebugSettings()
	const language = getCurrentLanguage()
	debugThemeSelect.innerHTML = ''

	window.humanityProtocolTheme.themes.forEach((themeName) => {
		const option = document.createElement('option')
		option.value = themeName
		option.textContent = window.humanityProtocolTheme.getThemeLabel(themeName, language)
		debugThemeSelect.append(option)
	})

	debugThemeSelect.value = debugSettings.theme

	debugToolsList.innerHTML = ''
	window.humanityProtocolTools.getRegisteredTools().forEach((tool) => {
		const hasExplicitOverride = Object.prototype.hasOwnProperty.call(debugSettings.tools, tool.id)
		const toolSection = document.createElement('section')
		toolSection.className = 'debug-tool'
		const label = document.createElement('label')
		label.className = 'debug-option'
		const checkbox = document.createElement('input')
		checkbox.type = 'checkbox'
		checkbox.dataset.toolId = tool.id
		checkbox.checked = hasExplicitOverride ? debugSettings.tools[tool.id] === true : tool.enabled
		const text = document.createElement('span')
		text.textContent = tool.debugLabel
		label.append(checkbox, text)
		toolSection.append(label)

		if (tool.evolutions.length > 0) {
			const evolutionsList = document.createElement('div')
			evolutionsList.className = 'debug-evolutions'
			evolutionsList.hidden = !checkbox.checked

			tool.evolutions.forEach((evolution) => {
				const evolutionLabel = document.createElement('label')
				evolutionLabel.className = 'debug-option'
				const evolutionCheckbox = document.createElement('input')
				evolutionCheckbox.type = 'checkbox'
				evolutionCheckbox.dataset.toolId = tool.id
				evolutionCheckbox.dataset.evolutionId = evolution.id
				evolutionCheckbox.checked = (debugSettings.toolEvolutions[tool.id] || []).includes(evolution.id)
				const evolutionText = document.createElement('span')
				evolutionText.textContent = evolution.label
				evolutionLabel.append(evolutionCheckbox, evolutionText)
				evolutionsList.append(evolutionLabel)
			})

			toolSection.append(evolutionsList)
		}

		debugToolsList.append(toolSection)
	})
}

async function updateDebugSettings(partialDebugSettings){
	window.humanityProtocolDebug.updateDebugState(partialDebugSettings)
	window.humanityProtocolTools.renderTools({ language: getCurrentLanguage() })
	syncDebugControls()
	return window.humanityProtocolDebug.getState()
}

async function openDebugMenu(){
	if (window.humanityProtocolSession.getLastNonMenuScreen() !== 'game') {
		openMainMenu()
		return
	}

	if (!gameState.settings) {
		await loadSettings()
	}

	syncDebugControls()
	showMenuView('debug')
	showScreen('menu')
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
	gameState.settings = settings
	window.humanityProtocolI18n.applyTranslations(settings.language)
	window.humanityProtocolTime.setSimulationStepHours(settings.simulationStepHours)
	window.humanityProtocolTools.renderTools({ language: settings.language })
	fullscreenCheckbox.checked = settings.startFullscreen
	skipIntroCheckbox.checked = settings.skipIntroOnNewGame === true
	languageSelect.value = settings.language
	simulationIntervalSelect.value = String(settings.simulationStepHours)
	syncDebugControls()
	return settings
}

async function startNewGame(){
	window.humanityProtocolDebug.resetDebugState()
	const settings = await loadSettings()
	window.humanityProtocolSession.startNewRun()
	window.humanityProtocolTools.renderTools({ language: settings.language })

	if (settings.skipIntroOnNewGame) {
		showScreen('game')
		window.humanityProtocolSession.saveCurrentRun()
		return
	}

	window.humanityProtocolIntro.startIntro(settings.language)
	showScreen('intro')
}

async function loadSave(save){
	window.humanityProtocolDebug.resetDebugState()
	const settings = await loadSettings()

	if (!save || !save.screen || !restorableScreens.has(save.screen)) {
		return
	}

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
	window.humanityProtocolTheme.applyTheme(getDebugSettings().theme)
}

async function initialize(){
	window.humanityProtocolDebug.resetDebugState()
	window.humanityProtocolTheme.applyTheme(window.humanityProtocolTheme.defaultTheme)
	window.humanityProtocolSession.configureSession({
		getLanguage: () => getCurrentLanguage(),
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
	startNewGame()
})

continueButton.addEventListener('click', () => {
	continueSavedRun()
})

loadGameButton.addEventListener('click', () => {
	openLoadScreen()
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

debugButton.addEventListener('click', async () => {
	await openDebugMenu()
})

backButton.addEventListener('click', () => {
	showMenuView('main')
})

debugBackButton.addEventListener('click', () => {
	showMenuView('main')
})

loadBackButton.addEventListener('click', () => {
	openMainMenu()
})

fullscreenCheckbox.addEventListener('change', async () => {
	const settings = await window.humanityProtocol.updateSettings({
		startFullscreen: fullscreenCheckbox.checked
	})
	gameState.settings = settings
})

skipIntroCheckbox.addEventListener('change', async () => {
	const settings = await window.humanityProtocol.updateSettings({
		skipIntroOnNewGame: skipIntroCheckbox.checked
	})
	gameState.settings = settings
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

	syncDebugControls()

	gameState.settings = settings
})

simulationIntervalSelect.addEventListener('change', async () => {
	const settings = await window.humanityProtocol.updateSettings({
		simulationStepHours: Number(simulationIntervalSelect.value)
	})

	window.humanityProtocolTime.setSimulationStepHours(settings.simulationStepHours)
	simulationIntervalSelect.value = String(settings.simulationStepHours)
	gameState.settings = settings
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

	showScreen('game')
	window.humanityProtocolSession.saveCurrentRun()
})

debugThemeSelect.addEventListener('change', async () => {
	await updateDebugSettings({
		theme: debugThemeSelect.value
	})
})

debugToolsList.addEventListener('change', async (event) => {
	const input = event.target

	if (!(input instanceof HTMLInputElement) || input.type !== 'checkbox' || !input.dataset.toolId) {
		return
	}

	const debugSettings = getDebugSettings()

	if (input.dataset.evolutionId) {
		const activeEvolutions = new Set(debugSettings.toolEvolutions[input.dataset.toolId] || [])
		const isSatisfactionVoteTool = input.dataset.toolId === 'satisfaction-vote'
		const isAiVoteEvolution = input.dataset.evolutionId === 'ai-vote'
		const isAutoVoteEvolution = input.dataset.evolutionId === 'auto-vote'

		if (input.checked) {
			activeEvolutions.add(input.dataset.evolutionId)

			if (isSatisfactionVoteTool && isAutoVoteEvolution) {
				activeEvolutions.add('ai-vote')
			}
		} else {
			activeEvolutions.delete(input.dataset.evolutionId)

			if (isSatisfactionVoteTool && isAiVoteEvolution) {
				activeEvolutions.delete('auto-vote')
			}
		}

		await updateDebugSettings({
			toolEvolutions: {
				...debugSettings.toolEvolutions,
				[input.dataset.toolId]: [...activeEvolutions]
			}
		})
		return
	}

		await updateDebugSettings({
			tools: {
				...debugSettings.tools,
				[input.dataset.toolId]: input.checked
			},
			toolEvolutions: input.checked
				? debugSettings.toolEvolutions
				: {
					...debugSettings.toolEvolutions,
					[input.dataset.toolId]: []
				}
		})
	})

document.addEventListener('keydown', (event) => {
	const speedShortcuts = new Map([
		['@', 0],
		['&', 1],
		['é', 2],
		['"', 3],
		["'", 4],
		['(', 5],
		['-', 6],
		['è', 7],
		['_', 8],
		['ç', 9]
	])
	const speedShortcutCodes = new Map([
		['Digit0', 0],
		['Digit1', 1],
		['Digit2', 2],
		['Digit3', 3],
		['Digit4', 4],
		['Digit5', 5],
		['Digit6', 6],
		['Digit7', 7],
		['Digit8', 8],
		['Digit9', 9]
	])
	const requestedSpeed = speedShortcuts.get(event.key) ?? speedShortcutCodes.get(event.code)

	if (requestedSpeed !== undefined) {
		window.humanityProtocolTime.setSpeedMultiplier(requestedSpeed)

		if (
			gameState.currentScreen === 'menu' &&
			window.humanityProtocolSession.hasActiveRun() &&
			window.humanityProtocolSession.getLastNonMenuScreen()
		) {
			const lastNonMenuScreen = window.humanityProtocolSession.getLastNonMenuScreen()
			showScreen(lastNonMenuScreen)

			if (lastNonMenuScreen === 'intro') {
				window.humanityProtocolIntro.resumeIntroIfNeeded()
			}
		}

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
		if (gameState.menuView === 'debug' && window.humanityProtocolSession.getLastNonMenuScreen() !== 'game') {
			openMainMenu()
			return
		}

		showMenuView('main')
		return
	}

	if (gameState.currentScreen === 'menu' && window.humanityProtocolSession.hasActiveRun() && window.humanityProtocolSession.getLastNonMenuScreen()) {
		resumeButton.click()
	}
})
