let currentLanguage = 'fr'
let worldPanel = null
let worldDate = null
let worldPopulation = null
let worldSatisfaction = null
let worldFunds = null

function ensureWorldPanel(container){
	if (!container) {
		return null
	}

	if (!worldPanel) {
		worldPanel = document.createElement('section')
		worldPanel.id = 'world-panel'
		worldPanel.setAttribute('aria-label', 'État mondial')

		worldDate = document.createElement('p')
		worldDate.id = 'world-date'
		worldPopulation = document.createElement('p')
		worldPopulation.id = 'world-population'
		worldSatisfaction = document.createElement('p')
		worldSatisfaction.id = 'world-satisfaction'
		worldFunds = document.createElement('p')
		worldFunds.id = 'world-funds'

		worldPanel.append(worldDate, worldPopulation, worldSatisfaction, worldFunds)
	}

	if (!worldPanel.isConnected) {
		container.append(worldPanel)
	}

	return worldPanel
}

function formatPopulation(value, language){
	return new Intl.NumberFormat(language).format(value)
}

function formatFunds(value, language){
	return new Intl.NumberFormat(language).format(value)
}

function formatCurrentDate(timestamp, language){
	return new Intl.DateTimeFormat(language, {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(new Date(timestamp))
}

function hideWorldPanel(){
	if (worldPanel?.isConnected) {
		worldPanel.remove()
	}
}

function showWorldPanel({ container }){
	ensureWorldPanel(container)
}

function renderWorldStatusTool({ language = 'fr', container } = {}){
	currentLanguage = language === 'en' ? 'en' : 'fr'
	ensureWorldPanel(container)
	const worldTime = window.humanityProtocolTime.getTimeSummary()
	const population = window.humanityProtocolPopulation.getPopulationSummary()
	const survey = window.humanityProtocolSatisfactionSurvey.getSurveySummary()
	const funds = window.humanityProtocolFunds.getFundsSummary()
	const dateLabel = window.humanityProtocolI18n.getTranslation(currentLanguage, 'world.date')
	const populationLabel = window.humanityProtocolI18n.getTranslation(currentLanguage, 'world.population')
	const satisfactionLabel = window.humanityProtocolI18n.getTranslation(currentLanguage, 'world.satisfaction')
	const fundsLabel = window.humanityProtocolI18n.getTranslation(currentLanguage, 'world.funds')

	if (!worldDate || !worldPopulation || !worldSatisfaction || !worldFunds) {
		return
	}

	worldDate.textContent = `${dateLabel} : ${formatCurrentDate(worldTime.timestamp, currentLanguage)}`
	worldPopulation.textContent = `${populationLabel} : ${formatPopulation(population.total, currentLanguage)}`
	worldSatisfaction.textContent = `${satisfactionLabel} : ${survey.satisfaction}%`
	worldFunds.textContent = `${fundsLabel} : ${formatFunds(funds.available, currentLanguage)}`
}

window.humanityProtocolTime.subscribe(() => {
	if (!window.humanityProtocolTools.isToolEnabled('world-status')) {
		return
	}

	renderWorldStatusTool({ language: currentLanguage })
})

window.humanityProtocolPopulation.subscribe(() => {
	if (!window.humanityProtocolTools.isToolEnabled('world-status')) {
		return
	}

	renderWorldStatusTool({ language: currentLanguage })
})

window.humanityProtocolSatisfactionSurvey.subscribe(() => {
	if (!window.humanityProtocolTools.isToolEnabled('world-status')) {
		return
	}

	renderWorldStatusTool({ language: currentLanguage })
})

window.humanityProtocolFunds.subscribe(() => {
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
