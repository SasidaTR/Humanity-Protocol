const { app, BrowserWindow, ipcMain } = require('electron')
const { createMainWindow } = require('./src/main/window')
const { loadSettings, saveSettings } = require('./src/main/settings-store')
const { loadSaves, loadLatestSave, saveGame, deleteSave } = require('./src/main/save-store')

ipcMain.on('app:quit', () => {
	app.quit()
})

ipcMain.handle('settings:load', () => {
	return loadSettings()
})

ipcMain.handle('settings:update', (event, nextSettings) => {
	const settings = saveSettings(nextSettings)
	const window = BrowserWindow.fromWebContents(event.sender)

	if (window) {
		window.setFullScreen(settings.startFullscreen)
	}

	return settings
})

ipcMain.handle('save:list', () => {
	return loadSaves()
})

ipcMain.handle('save:latest', () => {
	return loadLatestSave()
})

ipcMain.handle('save:update', (_event, nextSave) => {
	return saveGame(nextSave)
})

ipcMain.handle('save:delete', (_event, saveId) => {
	return deleteSave(saveId)
})

app.whenReady().then(() => {
	createMainWindow()

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createMainWindow()
		}
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
