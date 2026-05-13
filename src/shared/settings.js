const defaultSettings = {
	startFullscreen: true,
	language: 'fr'
}

function mergeSettings(settings = {}){
	return {
		...defaultSettings,
		...settings
	}
}

module.exports = { defaultSettings, mergeSettings }
