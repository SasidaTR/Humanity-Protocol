(() => {
	let currentLanguage = 'fr'
	let selectedVote = null
	let satisfactionVotePanel = null
	let satisfactionVoteQuestion = null
	let positiveVoteButton = null
	let negativeVoteButton = null

	function updateVoteSelection(){
		if (!positiveVoteButton || !negativeVoteButton) {
			return
		}

		positiveVoteButton.classList.toggle('is-selected', selectedVote === 'positive')
		negativeVoteButton.classList.toggle('is-selected', selectedVote === 'negative')
		positiveVoteButton.setAttribute('aria-pressed', String(selectedVote === 'positive'))
		negativeVoteButton.setAttribute('aria-pressed', String(selectedVote === 'negative'))
	}

	function buildFaceButton(type, label){
		const button = document.createElement('button')
		button.type = 'button'
		button.className = `satisfaction-vote-button is-${type}`
		button.setAttribute('aria-label', label)
		button.disabled = true

		const face = document.createElement('span')
		face.className = 'satisfaction-vote-face'

		const eyes = document.createElement('span')
		eyes.className = 'satisfaction-vote-eyes'

		const mouth = document.createElement('span')
		mouth.className = 'satisfaction-vote-mouth'

		const text = document.createElement('span')
		text.className = 'satisfaction-vote-label'
		text.textContent = label

		face.append(eyes, mouth)
		button.append(face, text)
		return button
	}

	function ensureSatisfactionVotePanel(container){
		if (!container) {
			return null
		}

		if (!satisfactionVotePanel) {
			satisfactionVotePanel = document.createElement('section')
			satisfactionVotePanel.className = 'satisfaction-vote-panel'

			satisfactionVoteQuestion = document.createElement('p')
			satisfactionVoteQuestion.className = 'satisfaction-vote-question'

			const actions = document.createElement('div')
			actions.className = 'satisfaction-vote-actions'

			positiveVoteButton = buildFaceButton('positive', '')
			negativeVoteButton = buildFaceButton('negative', '')

			actions.append(positiveVoteButton, negativeVoteButton)
			satisfactionVotePanel.append(satisfactionVoteQuestion, actions)
		}

		if (!satisfactionVotePanel.isConnected) {
			container.append(satisfactionVotePanel)
		}

		return satisfactionVotePanel
	}

	function hideSatisfactionVotePanel(){
		if (satisfactionVotePanel?.isConnected) {
			satisfactionVotePanel.remove()
		}
	}

	function showSatisfactionVotePanel({ toolBody }){
		ensureSatisfactionVotePanel(toolBody)
	}

	function renderSatisfactionVoteTool({ language = 'fr', toolBody } = {}){
		currentLanguage = language === 'en' ? 'en' : 'fr'
		ensureSatisfactionVotePanel(toolBody)

		if (!satisfactionVoteQuestion || !positiveVoteButton || !negativeVoteButton) {
			return
		}

		const question = window.humanityProtocolI18n.getTranslation(currentLanguage, 'satisfactionVote.question')
		const positiveLabel = window.humanityProtocolI18n.getTranslation(currentLanguage, 'satisfactionVote.positive')
		const negativeLabel = window.humanityProtocolI18n.getTranslation(currentLanguage, 'satisfactionVote.negative')
		const positiveText = positiveVoteButton.querySelector('.satisfaction-vote-label')
		const negativeText = negativeVoteButton.querySelector('.satisfaction-vote-label')

		satisfactionVoteQuestion.textContent = question
		positiveVoteButton.setAttribute('aria-label', positiveLabel)
		negativeVoteButton.setAttribute('aria-label', negativeLabel)

		if (positiveText) {
			positiveText.textContent = positiveLabel
		}

		if (negativeText) {
			negativeText.textContent = negativeLabel
		}

		updateVoteSelection()
	}

	window.humanityProtocolTools.registerTool({
		debugLabel: 'Vote de satisfaction',
		getTitle: (language) => window.humanityProtocolI18n.getTranslation(language === 'en' ? 'en' : 'fr', 'satisfactionVote.title'),
		id: 'satisfaction-vote',
		enabled: false,
		onDisable: hideSatisfactionVotePanel,
		onEnable: showSatisfactionVotePanel,
		render: renderSatisfactionVoteTool
	})
})()
