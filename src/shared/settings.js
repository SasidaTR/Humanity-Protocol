const defaultSettings = {
	startFullscreen: true,
	language: 'fr',
	simulationStepHours: 1
}

function mergeSettings(settings = {}){
	const parsedSimulationStepHours = Number(settings.simulationStepHours)

	return {
		...defaultSettings,
		...settings,
		simulationStepHours: Number.isFinite(parsedSimulationStepHours)
			? Math.max(1, Math.min(3, Math.round(parsedSimulationStepHours)))
			: defaultSettings.simulationStepHours
	}
}

module.exports = { defaultSettings, mergeSettings }
