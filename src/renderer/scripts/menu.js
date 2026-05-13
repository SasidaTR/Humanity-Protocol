const menuScreen = document.querySelector('#menu-screen')
const settingsScreen = document.querySelector('#settings-screen')
const introScreen = document.querySelector('#intro-screen')
const titleScreen = document.querySelector('#title-screen')
const loadScreen = document.querySelector('#load-screen')
const newGameButton = document.querySelector('#new-game-button')
const continueButton = document.querySelector('#continue-button')
const loadGameButton = document.querySelector('#load-game-button')
const resumeButton = document.querySelector('#resume-button')
const settingsButton = document.querySelector('#settings-button')
const backButton = document.querySelector('#back-button')
const loadBackButton = document.querySelector('#load-back-button')
const fullscreenCheckbox = document.querySelector('#fullscreen-checkbox')
const languageSelect = document.querySelector('#language-select')
const quitButton = document.querySelector('#quit-button')
const introText = document.querySelector('#intro-text')
const saveList = document.querySelector('#save-list')

const restorableScreens = new Set(['intro', 'title'])

const typewriterState = {
	timerId: null,
	fullText: '',
	index: 0,
	isComplete: false
}

const gameState = {
	currentScreen: 'menu',
	lastNonMenuScreen: null,
	hasActiveRun: false,
	hasSaves: false,
	settingsReturnMode: 'main',
	currentSaveId: null
}

function showScreen(screenName){
	if (screenName !== 'intro') {
		stopTypewriter()
	}

	menuScreen.hidden = screenName !== 'menu'
	settingsScreen.hidden = screenName !== 'settings'
	introScreen.hidden = screenName !== 'intro'
	titleScreen.hidden = screenName !== 'title'
	loadScreen.hidden = screenName !== 'load'
	gameState.currentScreen = screenName

	if (screenName !== 'menu' && screenName !== 'settings' && screenName !== 'load') {
		gameState.lastNonMenuScreen = screenName
	}
}

function updateMenuButtons(){
	resumeButton.hidden = !gameState.hasActiveRun || !gameState.lastNonMenuScreen
	continueButton.hidden = gameState.hasActiveRun || !gameState.hasSaves
	loadGameButton.hidden = !gameState.hasSaves
}

function openMainMenu(){
	updateMenuButtons()
	showScreen('menu')
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
	fullscreenCheckbox.checked = settings.startFullscreen
	languageSelect.value = settings.language
	return settings
}

function stopTypewriter(){
	if (typewriterState.timerId) {
		clearTimeout(typewriterState.timerId)
		typewriterState.timerId = null
	}
}

function finishIntroText(){
	stopTypewriter()
	introText.textContent = typewriterState.fullText
	typewriterState.index = typewriterState.fullText.length
	typewriterState.isComplete = true
}

function typeNextCharacter(){
	if (typewriterState.index >= typewriterState.fullText.length) {
		typewriterState.isComplete = true
		typewriterState.timerId = null
		return
	}

	typewriterState.index += 1
	introText.textContent = typewriterState.fullText.slice(0, typewriterState.index)
	typewriterState.timerId = setTimeout(typeNextCharacter, 18)
}

function resumeIntroIfNeeded(){
	if (typewriterState.isComplete) {
		return
	}

	stopTypewriter()
	typewriterState.timerId = setTimeout(typeNextCharacter, 18)
}

function buildSaveSnapshot(){
	return {
		id: gameState.currentSaveId,
		screen: gameState.lastNonMenuScreen,
		label: `Save ${new Date().toISOString()}`,
		intro: {
			index: typewriterState.index,
			isComplete: typewriterState.isComplete
		}
	}
}

async function refreshSaveAvailability(){
	const saves = await window.humanityProtocol.listSaves()
	gameState.hasSaves = saves.length > 0
	updateMenuButtons()
	return saves
}

async function saveCurrentRun(){
	if (!gameState.hasActiveRun || !gameState.lastNonMenuScreen || !gameState.currentSaveId) {
		return null
	}

	const save = await window.humanityProtocol.updateSave(buildSaveSnapshot())
	await refreshSaveAvailability()
	return save
}

async function startIntro(){
	const settings = await loadSettings()
	typewriterState.fullText = window.humanityProtocolI18n.getTranslation(settings.language, 'intro.text')
	typewriterState.index = 0
	typewriterState.isComplete = false
	introText.textContent = ''
	gameState.currentSaveId = `save-${Date.now()}`
	gameState.hasActiveRun = true
	showScreen('intro')
	stopTypewriter()
	typeNextCharacter()
}

function restoreIntroFromSave(settings, save){
	typewriterState.fullText = window.humanityProtocolI18n.getTranslation(settings.language, 'intro.text')
	typewriterState.index = save?.intro?.index || 0
	typewriterState.isComplete = Boolean(save?.intro?.isComplete)
	introText.textContent = typewriterState.fullText.slice(0, typewriterState.index)

	if (typewriterState.isComplete) {
		introText.textContent = typewriterState.fullText
	}
}

async function loadSave(save){
	const settings = await loadSettings()

	if (!save || !save.screen || !restorableScreens.has(save.screen)) {
		return
	}

	if (save.screen === 'intro') {
		gameState.currentSaveId = save.id
		gameState.hasActiveRun = true
		gameState.hasSaves = true
		updateMenuButtons()
		restoreIntroFromSave(settings, save)
		showScreen('intro')
		resumeIntroIfNeeded()
		return
	}

	if (save.screen === 'title') {
		gameState.currentSaveId = save.id
		gameState.hasActiveRun = true
		gameState.hasSaves = true
		updateMenuButtons()
		showScreen('title')
	}
}

async function continueSavedRun(){
	const save = await window.humanityProtocol.loadLatestSave()

	if (!save) {
		return
	}

	await loadSave(save)
}

async function deleteSaveEntry(saveId){
	if (!saveId) {
		return
	}

	if (gameState.currentSaveId === saveId) {
		gameState.currentSaveId = null
		gameState.hasActiveRun = false
		gameState.lastNonMenuScreen = null
	}

	await window.humanityProtocol.deleteSave(saveId)
	await refreshSaveAvailability()

	if (!loadScreen.hidden) {
		await renderSaveList()
	}
}

async function renderSaveList(){
	const settings = await loadSettings()
	const saves = await window.humanityProtocol.listSaves()
	saveList.replaceChildren()

	if (saves.length === 0) {
		const emptyState = document.createElement('p')
		emptyState.textContent = window.humanityProtocolI18n.getTranslation(settings.language, 'load.empty')
		saveList.append(emptyState)
		return
	}

	saves
		.sort((left, right) => right.updatedAt - left.updatedAt)
		.forEach((save) => {
			const row = document.createElement('div')
			const loadButton = document.createElement('button')
			const deleteButton = document.createElement('button')

			loadButton.type = 'button'
			loadButton.textContent = `${save.label} - ${new Date(save.updatedAt).toLocaleString(settings.language)}`
			loadButton.addEventListener('click', () => {
				loadSave(save)
			})

			deleteButton.type = 'button'
			deleteButton.textContent = window.humanityProtocolI18n.getTranslation(settings.language, 'load.delete')
			deleteButton.addEventListener('click', () => {
				deleteSaveEntry(save.id)
			})

			row.append(loadButton, deleteButton)
			saveList.append(row)
		})
}

async function openLoadScreen(){
	await renderSaveList()
	showScreen('load')
}

async function initialize(){
	await loadSettings()
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

resumeButton.addEventListener('click', () => {
	if (!gameState.lastNonMenuScreen) {
		return
	}

	showScreen(gameState.lastNonMenuScreen)

	if (gameState.lastNonMenuScreen === 'intro') {
		resumeIntroIfNeeded()
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
			resumeIntroIfNeeded()
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

	if (!introScreen.hidden) {
		typewriterState.fullText = window.humanityProtocolI18n.getTranslation(settings.language, 'intro.text')

		if (typewriterState.isComplete) {
			introText.textContent = typewriterState.fullText
		} else {
			introText.textContent = typewriterState.fullText.slice(0, typewriterState.index)
		}
	}

	if (!loadScreen.hidden) {
		renderSaveList()
	}
})

quitButton.addEventListener('click', async () => {
	await saveCurrentRun()
	window.humanityProtocol.quit()
})

introScreen.addEventListener('click', () => {
	if (!typewriterState.isComplete) {
		finishIntroText()
		return
	}

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
