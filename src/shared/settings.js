const defaultSettings = {
	startFullscreen: true,
	language: 'fr',
	simulationIntervalSeconds: 1.5
}

function mergeSettings(settings = {}){
	return {
		...defaultSettings,
		...settings
	}
}

module.exports = { defaultSettings, mergeSettings }
