const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('humanityProtocol', {
	quit: () => ipcRenderer.send('app:quit'),
	loadSettings: () => ipcRenderer.invoke('settings:load'),
	updateSettings: (nextSettings) => ipcRenderer.invoke('settings:update', nextSettings),
	listSaves: () => ipcRenderer.invoke('save:list'),
	loadSave: (saveId) => ipcRenderer.invoke('save:load', saveId),
	loadLatestSave: () => ipcRenderer.invoke('save:latest'),
	updateSave: (nextSave) => ipcRenderer.invoke('save:update', nextSave),
	deleteSave: (saveId) => ipcRenderer.invoke('save:delete', saveId)
})
