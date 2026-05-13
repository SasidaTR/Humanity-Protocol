const fs = require('node:fs')
const path = require('node:path')
const { app } = require('electron')
const { defaultSettings, mergeSettings } = require('../shared/settings')

function getSettingsPath(){
	return path.join(app.getPath('userData'), 'settings.json')
}

function loadSettings(){
	try {
		const raw = fs.readFileSync(getSettingsPath(), 'utf8')
		return mergeSettings(JSON.parse(raw))
	} catch {
		return { ...defaultSettings }
	}
}

function saveSettings(nextSettings){
	const settings = mergeSettings({
		...loadSettings(),
		...nextSettings
	})
	fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2))
	return settings
}

module.exports = { loadSettings, saveSettings }
