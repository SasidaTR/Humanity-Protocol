(() => {
	const VOTE_LOCK_HOURS = 24
	const VOTE_LOCK_MS = VOTE_LOCK_HOURS * 60 * 60 * 1000

	let currentLanguage = 'fr'
	let selectedVote = null
	let unlockSide = null
	let unlockProgress = 0
	let isAiVoteUnlocked = false
	let voteLockedUntil = null
	let satisfactionVotePanel = null
	let satisfactionVoteQuestion = null
	let positiveVoteButton = null
	let negativeVoteButton = null
	let hoveredVoteType = null

	function getCurrentSimulationTimestamp(){
		return Number(window.humanityProtocolTime.buildTimeSnapshot()?.timestamp) || Date.now()
	}

	function isVoteLocked(){
		return isAiVoteUnlocked && Number.isFinite(voteLockedUntil) && getCurrentSimulationTimestamp() < voteLockedUntil
	}

	function updateVoteSelection(){
		if (!positiveVoteButton || !negativeVoteButton) {
			return
		}

		const voteLocked = isVoteLocked()
		const isInteractive = isAiVoteUnlocked && !voteLocked
		const hasVisibleSelection = voteLocked && isAiVoteUnlocked && selectedVote
		const keepPositiveHover = voteLocked && hoveredVoteType === 'positive'
		const keepNegativeHover = voteLocked && hoveredVoteType === 'negative'

		positiveVoteButton.classList.toggle('is-selected', hasVisibleSelection && selectedVote === 'positive')
		negativeVoteButton.classList.toggle('is-selected', hasVisibleSelection && selectedVote === 'negative')
		positiveVoteButton.classList.toggle('is-unlocked', isAiVoteUnlocked)
		negativeVoteButton.classList.toggle('is-unlocked', isAiVoteUnlocked)
		positiveVoteButton.classList.toggle('is-interactive', isInteractive)
		negativeVoteButton.classList.toggle('is-interactive', isInteractive)
		positiveVoteButton.classList.toggle('is-hover-retained', keepPositiveHover)
		negativeVoteButton.classList.toggle('is-hover-retained', keepNegativeHover)
		positiveVoteButton.setAttribute('aria-pressed', String(hasVisibleSelection && selectedVote === 'positive'))
		negativeVoteButton.setAttribute('aria-pressed', String(hasVisibleSelection && selectedVote === 'negative'))
	}

	function updateVoteStatus(){
		return
	}

	function handleVoteClick(voteType){
		window.humanityProtocolTools.recordToolMetric('satisfaction-vote', `${voteType}Clicks`)

		if (isVoteLocked()) {
			window.humanityProtocolTools.recordToolMetric('satisfaction-vote', 'lockedVoteAttempts')
			return
		}

		if (!isAiVoteUnlocked) {
			if (unlockSide === voteType) {
				unlockProgress = Math.min(3, unlockProgress + 1)
			} else {
				unlockSide = voteType
				unlockProgress = 1
			}

			if (unlockProgress >= 3) {
				isAiVoteUnlocked = true
				selectedVote = null
				window.humanityProtocolTools.recordToolMetric('satisfaction-vote', 'aiVoteUnlockCount')
			}
		} else {
			selectedVote = voteType
			voteLockedUntil = getCurrentSimulationTimestamp() + VOTE_LOCK_MS
			window.humanityProtocolTools.recordToolMetric('satisfaction-vote', 'castVoteCount')
		}

		updateVoteSelection()
		updateVoteStatus()
	}

	function buildFaceButton(type, label){
		const button = document.createElement('button')
		button.type = 'button'
		button.className = `satisfaction-vote-button is-${type}`
		button.setAttribute('aria-label', label)
		button.addEventListener('pointerenter', () => {
			hoveredVoteType = type
			updateVoteSelection()
		})
		button.addEventListener('pointerleave', () => {
			if (hoveredVoteType === type) {
				hoveredVoteType = null
			}

			updateVoteSelection()
		})
		button.addEventListener('click', () => {
			handleVoteClick(type)
		})

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

	function buildSatisfactionVoteSnapshot(){
		return {
			version: 1,
			selectedVote,
			unlockSide,
			unlockProgress,
			isAiVoteUnlocked,
			voteLockedUntil
		}
	}

	function restoreSatisfactionVoteSnapshot(save){
		const snapshot = save?.ui?.satisfactionVote

		selectedVote = snapshot?.selectedVote === 'negative' ? 'negative' : snapshot?.selectedVote === 'positive' ? 'positive' : null
		unlockSide = snapshot?.unlockSide === 'negative' ? 'negative' : snapshot?.unlockSide === 'positive' ? 'positive' : null
		unlockProgress = Math.max(0, Math.min(3, Math.round(Number(snapshot?.unlockProgress) || 0)))
		isAiVoteUnlocked = Boolean(snapshot?.isAiVoteUnlocked)
		hoveredVoteType = null
		voteLockedUntil = Number.isFinite(Number(snapshot?.voteLockedUntil))
			? Number(snapshot.voteLockedUntil)
			: null

		if (!isAiVoteUnlocked && unlockProgress >= 3) {
			isAiVoteUnlocked = true
		}

		updateVoteSelection()
		updateVoteStatus()
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
		updateVoteStatus()
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

	window.humanityProtocolSatisfactionVoteTool = {
		buildSnapshot: buildSatisfactionVoteSnapshot,
		restoreSnapshot: restoreSatisfactionVoteSnapshot
	}

	window.humanityProtocolTime.subscribe(() => {
		if (!window.humanityProtocolTools.isToolEnabled('satisfaction-vote')) {
			return
		}

		updateVoteSelection()
	})
})()
