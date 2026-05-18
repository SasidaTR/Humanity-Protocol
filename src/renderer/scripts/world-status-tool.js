const worldPanel = document.querySelector('#world-panel')
const worldPopulation = document.querySelector('#world-population')
const worldSatisfaction = document.querySelector('#world-satisfaction')
let currentLanguage = 'fr'

function formatPopulation(value, language){
	return new Intl.NumberFormat(language).format(value)
}

function hideWorldPanel(){
	if (worldPanel) {
		worldPanel.hidden = true
	}
}

function showWorldPanel(){
	if (worldPanel) {
		worldPanel.hidden = false
	}
}

function renderWorldStatusTool({ language = 'fr' } = {}){
	currentLanguage = language === 'en' ? 'en' : 'fr'
	const population = window.humanityProtocolPopulation.getPopulationSummary()
	const populationLabel = window.humanityProtocolI18n.getTranslation(currentLanguage, 'world.population')
	const satisfactionLabel = window.humanityProtocolI18n.getTranslation(currentLanguage, 'world.satisfaction')

	if (!worldPopulation || !worldSatisfaction) {
		return
	}

	worldPopulation.textContent = `${populationLabel} : ${formatPopulation(population.total, currentLanguage)}`
	worldSatisfaction.textContent = `${satisfactionLabel} : ${population.satisfaction}%`
}

window.humanityProtocolPopulation.subscribe(() => {
	if (!window.humanityProtocolTools.isToolEnabled('world-status')) {
		return
	}

	renderWorldStatusTool({ language: currentLanguage })
})

window.humanityProtocolTools.registerTool({
	id: 'world-status',
	enabled: false,
	onDisable: hideWorldPanel,
	onEnable: showWorldPanel,
	render: renderWorldStatusTool
})
