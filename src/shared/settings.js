const ALLOWED_SIMULATION_STEP_HOURS = [
	0.0166666667,
	0.0833333333,
	0.1666666667,
	0.5,
	1,
	2,
	3
]

const defaultSettings = {
	startFullscreen: true,
	language: 'fr',
	simulationStepHours: 1,
	debug: {
		theme: 'default',
		tools: {},
		toolEvolutions: {}
	}
}

function mergeSettings(settings = {}){
	const parsedSimulationStepHours = Number(settings.simulationStepHours)
	const rawDebug = settings.debug || {}
	const nextSimulationStepHours = ALLOWED_SIMULATION_STEP_HOURS.find((value) => value === parsedSimulationStepHours)

	return {
		...defaultSettings,
		...settings,
		simulationStepHours: nextSimulationStepHours ?? defaultSettings.simulationStepHours,
		debug: {
			...defaultSettings.debug,
			...rawDebug,
			tools: rawDebug.tools && typeof rawDebug.tools === 'object' ? rawDebug.tools : {},
			toolEvolutions: rawDebug.toolEvolutions && typeof rawDebug.toolEvolutions === 'object'
				? rawDebug.toolEvolutions
				: {}
		}
	}
}

module.exports = { ALLOWED_SIMULATION_STEP_HOURS, defaultSettings, mergeSettings }
