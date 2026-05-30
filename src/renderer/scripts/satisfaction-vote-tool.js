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
	let satisfactionVoteCard = null
	let satisfactionVoteEyebrow = null
	let satisfactionVoteQuestionMeta = null
	let satisfactionVoteNotice = null
	let satisfactionVoteQuestion = null
	let satisfactionVoteFootnote = null
	let positiveVoteButton = null
	let negativeVoteButton = null
	let hoveredVoteType = null

	function syncDebugAiVoteEvolution(){
		if (!window.humanityProtocolDebug) {
			return
		}

		const debugState = window.humanityProtocolDebug.getState()
		const activeEvolutions = new Set(debugState.toolEvolutions['satisfaction-vote'] || [])
		const isDebugChecked = activeEvolutions.has('ai-vote')

		if (isDebugChecked === isAiVoteUnlocked) {
			return
		}

		if (isAiVoteUnlocked) {
			activeEvolutions.add('ai-vote')
		} else {
			activeEvolutions.delete('ai-vote')
		}

		window.humanityProtocolDebug.updateDebugState({
			toolEvolutions: {
				...debugState.toolEvolutions,
				'satisfaction-vote': [...activeEvolutions]
			}
		})
	}

	function getCurrentSimulationTimestamp(){
		return Number(window.humanityProtocolTime.buildTimeSnapshot()?.timestamp) || Date.now()
	}

	function isVoteLocked(){
		return isAiVoteUnlocked && Number.isFinite(voteLockedUntil) && getCurrentSimulationTimestamp() < voteLockedUntil
	}

	function setAiVoteUnlocked(nextIsUnlocked, { syncDebug = true } = {}){
		isAiVoteUnlocked = Boolean(nextIsUnlocked)

		if (!isAiVoteUnlocked) {
			selectedVote = null
			voteLockedUntil = null
			unlockSide = null
			unlockProgress = 0
		}

		if (syncDebug) {
			syncDebugAiVoteEvolution()
		}

		updateVoteSelection()
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
				setAiVoteUnlocked(true)
				window.humanityProtocolTools.recordToolMetric('satisfaction-vote', 'aiVoteUnlockCount')
			}
		} else {
			selectedVote = voteType
			voteLockedUntil = getCurrentSimulationTimestamp() + VOTE_LOCK_MS
			window.humanityProtocolTools.recordToolMetric('satisfaction-vote', 'castVoteCount')
		}
		updateVoteStatus()
	}

	function buildFaceButton(type, label, description){
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

		const badge = document.createElement('span')
		badge.className = 'satisfaction-vote-badge'
		badge.setAttribute('aria-hidden', 'true')

		const badgeIcon = document.createElement('span')
		badgeIcon.className = 'satisfaction-vote-badge-icon'
		badgeIcon.textContent = type === 'positive' ? '+' : '−'

		const copy = document.createElement('span')
		copy.className = 'satisfaction-vote-copy'

		const text = document.createElement('span')
		text.className = 'satisfaction-vote-label'
		text.textContent = label

		const helper = document.createElement('span')
		helper.className = 'satisfaction-vote-helper'
		helper.textContent = description

		badge.append(badgeIcon)
		copy.append(text, helper)
		button.append(badge, copy)
		return button
	}

	function ensureSatisfactionVotePanel(container){
		if (!container) {
			return null
		}

		if (!satisfactionVotePanel) {
			satisfactionVotePanel = document.createElement('section')
			satisfactionVotePanel.className = 'satisfaction-vote-panel'

			satisfactionVoteCard = document.createElement('div')
			satisfactionVoteCard.className = 'satisfaction-vote-card'

			satisfactionVoteEyebrow = document.createElement('p')
			satisfactionVoteEyebrow.className = 'satisfaction-vote-eyebrow'

			satisfactionVoteQuestionMeta = document.createElement('p')
			satisfactionVoteQuestionMeta.className = 'satisfaction-vote-meta'

			satisfactionVoteNotice = document.createElement('p')
			satisfactionVoteNotice.className = 'satisfaction-vote-notice'

			satisfactionVoteQuestion = document.createElement('p')
			satisfactionVoteQuestion.className = 'satisfaction-vote-question'

			const actions = document.createElement('div')
			actions.className = 'satisfaction-vote-actions'

			positiveVoteButton = buildFaceButton('positive', '', '')
			negativeVoteButton = buildFaceButton('negative', '', '')

			satisfactionVoteFootnote = document.createElement('p')
			satisfactionVoteFootnote.className = 'satisfaction-vote-footnote'

			actions.append(positiveVoteButton, negativeVoteButton)
			satisfactionVoteCard.append(
				satisfactionVoteEyebrow,
				satisfactionVoteQuestionMeta,
				satisfactionVoteQuestion,
				satisfactionVoteNotice,
				actions,
				satisfactionVoteFootnote
			)
			satisfactionVotePanel.append(satisfactionVoteCard)
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

	function resetSatisfactionVoteState(){
		hoveredVoteType = null
		setAiVoteUnlocked(false)
		updateVoteStatus()
		return buildSatisfactionVoteSnapshot()
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

		syncDebugAiVoteEvolution()
		updateVoteSelection()
		updateVoteStatus()
	}

	function renderSatisfactionVoteTool({ language = 'fr', toolBody } = {}){
		currentLanguage = language === 'en' ? 'en' : 'fr'
		ensureSatisfactionVotePanel(toolBody)

		if (
			!satisfactionVoteQuestion ||
			!satisfactionVoteEyebrow ||
			!satisfactionVoteQuestionMeta ||
			!satisfactionVoteNotice ||
			!satisfactionVoteFootnote ||
			!positiveVoteButton ||
			!negativeVoteButton
		) {
			return
		}

		const eyebrow = window.humanityProtocolI18n.getTranslation(currentLanguage, 'satisfactionVote.eyebrow')
		const meta = window.humanityProtocolI18n.getTranslation(currentLanguage, 'satisfactionVote.meta')
		const notice = window.humanityProtocolI18n.getTranslation(currentLanguage, 'satisfactionVote.notice')
		const question = window.humanityProtocolI18n.getTranslation(currentLanguage, 'satisfactionVote.question')
		const positiveLabel = window.humanityProtocolI18n.getTranslation(currentLanguage, 'satisfactionVote.positive')
		const positiveHelper = window.humanityProtocolI18n.getTranslation(currentLanguage, 'satisfactionVote.positiveHelper')
		const negativeLabel = window.humanityProtocolI18n.getTranslation(currentLanguage, 'satisfactionVote.negative')
		const negativeHelper = window.humanityProtocolI18n.getTranslation(currentLanguage, 'satisfactionVote.negativeHelper')
		const footnote = window.humanityProtocolI18n.getTranslation(currentLanguage, 'satisfactionVote.footnote')
		const positiveText = positiveVoteButton.querySelector('.satisfaction-vote-label')
		const positiveHelperText = positiveVoteButton.querySelector('.satisfaction-vote-helper')
		const negativeText = negativeVoteButton.querySelector('.satisfaction-vote-label')
		const negativeHelperText = negativeVoteButton.querySelector('.satisfaction-vote-helper')

		satisfactionVoteEyebrow.textContent = eyebrow
		satisfactionVoteQuestionMeta.textContent = meta
		satisfactionVoteQuestion.textContent = question
		satisfactionVoteNotice.textContent = notice
		satisfactionVoteFootnote.textContent = footnote
		positiveVoteButton.setAttribute('aria-label', positiveLabel)
		negativeVoteButton.setAttribute('aria-label', negativeLabel)

		if (positiveText) {
			positiveText.textContent = positiveLabel
		}

		if (negativeText) {
			negativeText.textContent = negativeLabel
		}

		if (positiveHelperText) {
			positiveHelperText.textContent = positiveHelper
		}

		if (negativeHelperText) {
			negativeHelperText.textContent = negativeHelper
		}

		updateVoteSelection()
		updateVoteStatus()
	}

	window.humanityProtocolTools.registerTool({
		debugLabel: 'Vote de satisfaction',
		evolutions: [
			{
				id: 'ai-vote',
				label: "Voix de l'IA"
			}
		],
		getTitle: (language) => window.humanityProtocolI18n.getTranslation(language === 'en' ? 'en' : 'fr', 'satisfactionVote.title'),
		id: 'satisfaction-vote',
		enabled: false,
		onDisable: hideSatisfactionVotePanel,
		onEnable: showSatisfactionVotePanel,
		render: renderSatisfactionVoteTool
	})

	window.humanityProtocolSatisfactionVoteTool = {
		buildSnapshot: buildSatisfactionVoteSnapshot,
		resetState: resetSatisfactionVoteState,
		restoreSnapshot: restoreSatisfactionVoteSnapshot,
		isAiVoteUnlocked: () => isAiVoteUnlocked,
		setAiVoteUnlocked
	}

	window.humanityProtocolTime.subscribe(() => {
		if (!window.humanityProtocolTools.isToolEnabled('satisfaction-vote')) {
			return
		}

		updateVoteSelection()
	})

	window.humanityProtocolDebug.subscribe(() => {
		const shouldUnlockAiVote = window.humanityProtocolDebug.isToolEvolutionEnabled('satisfaction-vote', 'ai-vote')

		if (shouldUnlockAiVote !== isAiVoteUnlocked) {
			setAiVoteUnlocked(shouldUnlockAiVote, { syncDebug: false })
		}

		if (window.humanityProtocolTools.isToolEnabled('satisfaction-vote')) {
			updateVoteSelection()
		}
	})
})()
