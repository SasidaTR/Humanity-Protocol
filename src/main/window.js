const path = require('node:path')
const { BrowserWindow } = require('electron')
const { loadSettings } = require('./settings-store')

function createMainWindow(){
	const settings = loadSettings()
	const win = new BrowserWindow({
		width:1280,
		height:720,
		fullscreen:settings.startFullscreen,
		title:'Humanity Protocol',
		webPreferences:{
			preload:path.join(__dirname, '../preload/preload.js'),
			contextIsolation:true,
			nodeIntegration:false
		}
	})

	win.loadFile(path.join(__dirname, '../../index.html'))

	return win
}

module.exports = { createMainWindow }
