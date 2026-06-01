let currentLanguage = 'fr'
let worldPanel = null
let worldDate = null
let worldDateValue = null
let worldTimeValue = null
let worldSpeedValue = null
let worldPopulation = null
let worldPopulationSummary = null
let worldPopulationDetailToggle = null
let worldPopulationDetailLine = null
let worldSatisfaction = null
let worldFunds = null
let isPopulationDetailExpanded = false

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
		worldDateValue = document.createElement('span')
		worldDateValue.className = 'world-date-value'
		worldTimeValue = document.createElement('span')
		worldTimeValue.className = 'world-time-value'
		worldSpeedValue = document.createElement('span')
		worldSpeedValue.className = 'world-speed-value'
		worldDate.append(worldDateValue, worldTimeValue, worldSpeedValue)
		worldPopulation = document.createElement('p')
		worldPopulation.id = 'world-population'
		worldPopulationSummary = document.createElement('span')
		worldPopulationSummary.className = 'world-status-summary'
		worldPopulationDetailToggle = document.createElement('button')
		worldPopulationDetailToggle.type = 'button'
		worldPopulationDetailToggle.className = 'world-status-detail-toggle'
		worldPopulationDetailToggle.addEventListener('click', () => {
			isPopulationDetailExpanded = !isPopulationDetailExpanded
			renderWorldStatusTool({ language: currentLanguage })
		})
		worldPopulationDetailLine = document.createElement('span')
		worldPopulationDetailLine.className = 'world-status-detail-line'
		worldPopulation.append(
			worldPopulationSummary,
			worldPopulationDetailToggle,
			worldPopulationDetailLine
		)
		worldSatisfaction = document.createElement('p')
		worldSatisfaction.id = 'world-satisfaction'
		worldFunds = document.createElement('p')
		worldFunds.id = 'world-funds'

		worldPanel.append(
			worldDate,
			worldPopulation,
			worldSatisfaction,
			worldFunds
		)
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

function formatCurrentTime(timestamp, language){
	return new Intl.DateTimeFormat(language, {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	}).format(new Date(timestamp))
}

function formatSimulationSpeedIcon(speedMultiplier){
	switch (speedMultiplier) {
		case 0:
			return '⏸'
		case 1:
			return '▶'
		case 2:
			return '▶▶'
		case 3:
			return '▶▶▶▶'
		case 4:
			return '▶×8'
		case 5:
			return '▶×16'
		case 6:
			return '▶×32'
		case 7:
			return '▶×64'
		case 8:
			return '▶×128'
		case 9:
			return '▶×256'
		default:
			return '▶'
	}
}

function hideWorldPanel(){
	if (worldPanel?.isConnected) {
		worldPanel.remove()
	}
}

function showWorldPanel({ toolBody }){
	ensureWorldPanel(toolBody)
}

function renderWorldStatusTool({ language = 'fr', toolBody } = {}){
	currentLanguage = language === 'en' ? 'en' : 'fr'
	ensureWorldPanel(toolBody)
	const worldTime = window.humanityProtocolTime.getTimeSummary()
	const population = window.humanityProtocolPopulation.getPopulationSummary()
	const survey = window.humanityProtocolSatisfactionSurvey.getSurveySummary()
	const funds = window.humanityProtocolFunds.getFundsSummary()
	const populationLabel = window.humanityProtocolI18n.getTranslation(currentLanguage, 'world.population')
	const satisfactionLabel = window.humanityProtocolI18n.getTranslation(currentLanguage, 'world.satisfaction')
	const fundsLabel = window.humanityProtocolI18n.getTranslation(currentLanguage, 'world.funds')
	const showCurrentTime = window.humanityProtocolDebug.isToolEvolutionEnabled('world-status', 'show-current-time')
	const showDetailedStats = window.humanityProtocolDebug.isToolEvolutionEnabled('world-status', 'detailed-stats')
	const femaleLabel = window.humanityProtocolI18n.getTranslation(currentLanguage, 'world.female')
	const maleLabel = window.humanityProtocolI18n.getTranslation(currentLanguage, 'world.male')
	const age0To17Label = window.humanityProtocolI18n.getTranslation(currentLanguage, 'world.age0To17')
	const age18To34Label = window.humanityProtocolI18n.getTranslation(currentLanguage, 'world.age18To34')
	const age35To64Label = window.humanityProtocolI18n.getTranslation(currentLanguage, 'world.age35To64')
	const age65PlusLabel = window.humanityProtocolI18n.getTranslation(currentLanguage, 'world.age65Plus')

	if (
		!worldDate ||
		!worldDateValue ||
		!worldTimeValue ||
		!worldSpeedValue ||
		!worldPopulation ||
		!worldPopulationSummary ||
		!worldPopulationDetailToggle ||
		!worldPopulationDetailLine ||
		!worldSatisfaction ||
		!worldFunds
	) {
		return
	}

	worldDateValue.textContent = formatCurrentDate(worldTime.timestamp, currentLanguage)
	worldTimeValue.textContent = showCurrentTime ? formatCurrentTime(worldTime.timestamp, currentLanguage) : ''
	worldTimeValue.hidden = !showCurrentTime
	worldSpeedValue.textContent = formatSimulationSpeedIcon(worldTime.displaySpeedMultiplier)
	worldPopulationSummary.textContent = `${populationLabel} : ${formatPopulation(population.total, currentLanguage)}`
	worldPopulationDetailToggle.textContent = isPopulationDetailExpanded ? '▾' : '▸'
	worldPopulationDetailToggle.hidden = !showDetailedStats
	worldPopulationDetailToggle.setAttribute('aria-expanded', showDetailedStats && isPopulationDetailExpanded ? 'true' : 'false')
	if (showDetailedStats && isPopulationDetailExpanded) {
		worldPopulationDetailLine.innerHTML = [
			`${femaleLabel} : ${formatPopulation(population.sex.female, currentLanguage)}`,
			`${maleLabel} : ${formatPopulation(population.sex.male, currentLanguage)}`,
			`${age0To17Label} : ${formatPopulation(population.age.age0To17, currentLanguage)}`,
			`${age18To34Label} : ${formatPopulation(population.age.age18To34, currentLanguage)}`,
			`${age35To64Label} : ${formatPopulation(population.age.age35To64, currentLanguage)}`,
			`${age65PlusLabel} : ${formatPopulation(population.age.age65Plus, currentLanguage)}`
		].join('<br>')
		worldPopulationDetailLine.hidden = false
	} else {
		worldPopulationDetailLine.textContent = ''
		worldPopulationDetailLine.hidden = true
	}
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

window.humanityProtocolDebug.subscribe(() => {
	if (!window.humanityProtocolTools.isToolEnabled('world-status')) {
		return
	}

	renderWorldStatusTool({ language: currentLanguage })
})

window.humanityProtocolTools.registerTool({
	debugLabel: 'État mondial',
	evolutions: [
		{
			id: 'show-current-time',
			label: "Afficher l’heure actuelle"
		},
		{
			id: 'detailed-stats',
			label: 'Détails des catégories'
		}
	],
	getTitle: (language) => language === 'en' ? 'World Status' : 'État mondial',
	id: 'world-status',
	enabled: false,
	onDisable: hideWorldPanel,
	onEnable: showWorldPanel,
	render: renderWorldStatusTool
})
