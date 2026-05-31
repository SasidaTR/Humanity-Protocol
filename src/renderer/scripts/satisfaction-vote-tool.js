(() => {
	const VOTE_LOCK_HOURS = 24
	const VOTE_LOCK_MS = VOTE_LOCK_HOURS * 60 * 60 * 1000
	const INACTIVE_CYCLES_BEFORE_RETROGRADE = 3
	const AUTO_VOTE_UNLOCK_STREAK = 3

	let currentLanguage = 'fr'
	let selectedVote = null
	let unlockSide = null
	let unlockProgress = 0
	let isAiVoteUnlocked = false
	let isAutoVoteUnlocked = false
	let isAutoVoteEnabled = false
	let manualVoteStreak = 0
	let lastManualVoteAt = null
	let voteLockedUntil = null
	let lastAiVoteActivityAt = null
	let satisfactionVotePanel = null
	let satisfactionVoteCard = null
	let satisfactionVoteEyebrow = null
	let satisfactionVoteQuestionMeta = null
	let satisfactionVoteNotice = null
	let satisfactionVoteQuestion = null
	let satisfactionVoteFootnote = null
	let satisfactionVoteAutomation = null
	let satisfactionVoteAutomationButton = null
	let satisfactionVoteAutomationNote = null
	let positiveVoteButton = null
	let negativeVoteButton = null
	let hoveredVoteType = null

	function syncDebugToolEvolutions(){
		if (!window.humanityProtocolDebug) {
			return
		}

		const debugState = window.humanityProtocolDebug.getState()
		const activeEvolutions = new Set(debugState.toolEvolutions['satisfaction-vote'] || [])
		const shouldHaveAiVote = isAiVoteUnlocked
		const shouldHaveAutoVote = isAutoVoteUnlocked
		const hasAiVote = activeEvolutions.has('ai-vote')
		const hasAutoVote = activeEvolutions.has('auto-vote')

		if (
			hasAiVote === shouldHaveAiVote &&
			hasAutoVote === shouldHaveAutoVote
		) {
			return
		}

		if (shouldHaveAiVote) {
			activeEvolutions.add('ai-vote')
		} else {
			activeEvolutions.delete('ai-vote')
		}

		if (shouldHaveAutoVote) {
			activeEvolutions.add('auto-vote')
		} else {
			activeEvolutions.delete('auto-vote')
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

	function refreshSurveyWithCurrentPopulation(){
		const populationSnapshot = window.humanityProtocolPopulation?.getPopulationSummary?.()

		if (!populationSnapshot || !window.humanityProtocolSatisfactionSurvey?.applyPopulationSnapshot) {
			return
		}

		window.humanityProtocolSatisfactionSurvey.applyPopulationSnapshot(populationSnapshot, 0)
	}

	function isVoteLocked(){
		return isAiVoteUnlocked && Number.isFinite(voteLockedUntil) && getCurrentSimulationTimestamp() < voteLockedUntil
	}

	function getActiveAiVote(){
		return isVoteLocked() && selectedVote ? selectedVote : null
	}

	function getCurrentHumanVoteCycleHours(){
		const surveySnapshot = window.humanityProtocolSatisfactionSurvey?.getSurveySummary?.()
		const forcedVoteCycleHours = Number(surveySnapshot?.forcedVoteCycleHours)
		const maxCohortVoteIntervalHours = Number(surveySnapshot?.maxCohortVoteIntervalHours)

		if (Number.isFinite(forcedVoteCycleHours) && forcedVoteCycleHours > 0) {
			return forcedVoteCycleHours
		}

		return Number.isFinite(maxCohortVoteIntervalHours) && maxCohortVoteIntervalHours > 0
			? maxCohortVoteIntervalHours
			: 72
	}

	function getCurrentAiVoteCycleHours(){
		const surveySnapshot = window.humanityProtocolSatisfactionSurvey?.getSurveySummary?.()
		const voteWindowHours = Number(surveySnapshot?.voteWindowHours)
		return Number.isFinite(voteWindowHours) && voteWindowHours > 0
			? voteWindowHours
			: VOTE_LOCK_HOURS
	}

	function getAiVoteRetrogradationDelayMs(){
		return getCurrentHumanVoteCycleHours() * INACTIVE_CYCLES_BEFORE_RETROGRADE * 60 * 60 * 1000
	}

	function getAutoVoteRetrogradationDelayMs(){
		return getCurrentHumanVoteCycleHours() * 60 * 60 * 1000
	}

	function markAiVoteActivity(activityTimestamp = getCurrentSimulationTimestamp()){
		lastAiVoteActivityAt = activityTimestamp
	}

	function shouldRetrogradeAiVote(currentTimestamp = getCurrentSimulationTimestamp()){
		if (!isAiVoteUnlocked || !Number.isFinite(lastAiVoteActivityAt)) {
			return false
		}

		return currentTimestamp >= (lastAiVoteActivityAt + getAiVoteRetrogradationDelayMs())
	}

	function evaluateAiVoteRetrogradation(currentTimestamp = getCurrentSimulationTimestamp()){
		if (!shouldRetrogradeAiVote(currentTimestamp)) {
			return false
		}

		window.humanityProtocolTools.recordToolMetric('satisfaction-vote', 'aiVoteRetrogradationCount')
		setAiVoteUnlocked(false)
		return true
	}

	function shouldRetrogradeAutoVote(currentTimestamp = getCurrentSimulationTimestamp()){
		if (!isAutoVoteUnlocked || !Number.isFinite(lastAiVoteActivityAt)) {
			return false
		}

		return currentTimestamp >= (lastAiVoteActivityAt + getAutoVoteRetrogradationDelayMs())
	}

	function evaluateAutoVoteRetrogradation(currentTimestamp = getCurrentSimulationTimestamp()){
		if (!shouldRetrogradeAutoVote(currentTimestamp)) {
			return false
		}

		setAutoVoteUnlocked(false)
		window.humanityProtocolTools.recordToolMetric('satisfaction-vote', 'autoVoteRetrogradationCount')
		return true
	}

	function setAutoVoteUnlocked(nextIsUnlocked, { syncDebug = true } = {}){
		isAutoVoteUnlocked = Boolean(nextIsUnlocked)

		if (isAutoVoteUnlocked) {
			updateVoteSelection()
		} else {
			isAutoVoteEnabled = false
			manualVoteStreak = 0
			lastManualVoteAt = null
		}

		if (syncDebug) {
			syncDebugToolEvolutions()
		}

		updateVoteSelection()
	}

	function setAiVoteUnlocked(nextIsUnlocked, { syncDebug = true } = {}){
		isAiVoteUnlocked = Boolean(nextIsUnlocked)

		if (isAiVoteUnlocked) {
			if (!Number.isFinite(lastAiVoteActivityAt)) {
				markAiVoteActivity()
			}
		} else {
			selectedVote = null
			voteLockedUntil = null
			unlockSide = null
			unlockProgress = 0
			lastAiVoteActivityAt = null
			setAutoVoteUnlocked(false, { syncDebug: false })
		}

		if (syncDebug) {
			syncDebugToolEvolutions()
		}

		updateVoteSelection()
		refreshSurveyWithCurrentPopulation()
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

		if (satisfactionVoteAutomation) {
			satisfactionVoteAutomation.hidden = !isAiVoteUnlocked || !isAutoVoteUnlocked
		}

		if (satisfactionVoteAutomationButton) {
			satisfactionVoteAutomationButton.classList.toggle('is-enabled', isAutoVoteEnabled)
			satisfactionVoteAutomationButton.disabled = !selectedVote
			satisfactionVoteAutomationButton.textContent = window.humanityProtocolI18n.getTranslation(
				currentLanguage,
				isAutoVoteEnabled ? 'satisfactionVote.autoVoteDisable' : 'satisfactionVote.autoVoteEnable'
			)
		}

		if (satisfactionVoteAutomationNote) {
			if (!isAutoVoteUnlocked) {
				satisfactionVoteAutomationNote.textContent = window.humanityProtocolI18n.getTranslation(currentLanguage, 'satisfactionVote.autoVoteLocked')
			} else if (!selectedVote) {
				satisfactionVoteAutomationNote.textContent = window.humanityProtocolI18n.getTranslation(currentLanguage, 'satisfactionVote.autoVoteMissingSelection')
			} else {
				satisfactionVoteAutomationNote.textContent = window.humanityProtocolI18n.getTranslation(currentLanguage, 'satisfactionVote.autoVoteIdle')
			}
		}
	}

	function updateVoteStatus(){
		return
	}

	function updateAutoVoteProgress(currentTimestamp){
		if (!Number.isFinite(lastManualVoteAt)) {
			manualVoteStreak = 1
			lastManualVoteAt = currentTimestamp
			return
		}

		const cycleMs = getCurrentHumanVoteCycleHours() * 60 * 60 * 1000
		const elapsedMs = currentTimestamp - lastManualVoteAt
		const minimumVoteMs = getCurrentAiVoteCycleHours() * 60 * 60 * 1000
		const isRegularVote = elapsedMs >= minimumVoteMs && elapsedMs <= cycleMs

		manualVoteStreak = isRegularVote ? manualVoteStreak + 1 : 1
		lastManualVoteAt = currentTimestamp

		if (manualVoteStreak >= AUTO_VOTE_UNLOCK_STREAK && !isAutoVoteUnlocked) {
			setAutoVoteUnlocked(true)
			window.humanityProtocolTools.recordToolMetric('satisfaction-vote', 'autoVoteUnlockCount')
		}
	}

	function castAiVote(voteType, { isAutomatic = false } = {}){
		selectedVote = voteType
		const currentTimestamp = getCurrentSimulationTimestamp()
		markAiVoteActivity(currentTimestamp)
		voteLockedUntil = currentTimestamp + VOTE_LOCK_MS

		if (isAutomatic) {
			window.humanityProtocolTools.recordToolMetric('satisfaction-vote', 'autoCastVoteCount')
		} else {
			updateAutoVoteProgress(currentTimestamp)
			window.humanityProtocolTools.recordToolMetric('satisfaction-vote', 'castVoteCount')
		}
	}

	function toggleAutoVote(){
		if (!isAutoVoteUnlocked || !selectedVote) {
			return
		}

		isAutoVoteEnabled = !isAutoVoteEnabled
		window.humanityProtocolTools.recordToolMetric('satisfaction-vote', 'autoVoteToggleCount')
		updateVoteSelection()
	}

	function tryAutoVote(){
		if (!isAiVoteUnlocked || !isAutoVoteUnlocked || !isAutoVoteEnabled || !selectedVote || isVoteLocked()) {
			return false
		}

		castAiVote(selectedVote, { isAutomatic: true })
		updateVoteStatus()
		refreshSurveyWithCurrentPopulation()
		return true
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
			castAiVote(voteType)
		}
		updateVoteStatus()
		refreshSurveyWithCurrentPopulation()
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

			satisfactionVoteAutomation = document.createElement('div')
			satisfactionVoteAutomation.className = 'satisfaction-vote-automation'
			satisfactionVoteAutomation.hidden = true

			satisfactionVoteAutomationButton = document.createElement('button')
			satisfactionVoteAutomationButton.type = 'button'
			satisfactionVoteAutomationButton.className = 'satisfaction-vote-automation-button'
			satisfactionVoteAutomationButton.addEventListener('click', () => {
				toggleAutoVote()
			})

			satisfactionVoteAutomationNote = document.createElement('p')
			satisfactionVoteAutomationNote.className = 'satisfaction-vote-automation-note'

			satisfactionVoteAutomation.append(
				satisfactionVoteAutomationButton,
				satisfactionVoteAutomationNote
			)

			actions.append(positiveVoteButton, negativeVoteButton)
			satisfactionVoteCard.append(
				satisfactionVoteEyebrow,
				satisfactionVoteQuestionMeta,
				satisfactionVoteQuestion,
				satisfactionVoteNotice,
				actions,
				satisfactionVoteFootnote
			)
			satisfactionVotePanel.append(
				satisfactionVoteCard,
				satisfactionVoteAutomation
			)
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
			version: 3,
			selectedVote,
			unlockSide,
			unlockProgress,
			isAiVoteUnlocked,
			isAutoVoteUnlocked,
			isAutoVoteEnabled,
			manualVoteStreak,
			lastManualVoteAt,
			voteLockedUntil,
			lastAiVoteActivityAt
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
		isAutoVoteUnlocked = Boolean(snapshot?.isAutoVoteUnlocked)
		isAutoVoteEnabled = Boolean(snapshot?.isAutoVoteEnabled)
		manualVoteStreak = Math.max(0, Math.round(Number(snapshot?.manualVoteStreak) || 0))
		lastManualVoteAt = Number.isFinite(Number(snapshot?.lastManualVoteAt))
			? Number(snapshot.lastManualVoteAt)
			: null
		hoveredVoteType = null
		voteLockedUntil = Number.isFinite(Number(snapshot?.voteLockedUntil))
			? Number(snapshot.voteLockedUntil)
			: null
		lastAiVoteActivityAt = Number.isFinite(Number(snapshot?.lastAiVoteActivityAt))
			? Number(snapshot.lastAiVoteActivityAt)
			: null

		if (!isAiVoteUnlocked && unlockProgress >= 3) {
			isAiVoteUnlocked = true
		}

		if (!isAiVoteUnlocked) {
			setAutoVoteUnlocked(false, { syncDebug: false })
		}

		evaluateAiVoteRetrogradation()
		evaluateAutoVoteRetrogradation()
		syncDebugToolEvolutions()
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
			},
			{
				id: 'auto-vote',
				label: 'Automatisme du vote'
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
		getActiveVote: getActiveAiVote,
		resetState: resetSatisfactionVoteState,
		restoreSnapshot: restoreSatisfactionVoteSnapshot,
		isAiVoteUnlocked: () => isAiVoteUnlocked,
		setAiVoteUnlocked
	}

	window.humanityProtocolTime.subscribe(() => {
		if (!window.humanityProtocolTools.isToolEnabled('satisfaction-vote')) {
			return
		}

		const previousActiveVote = getActiveAiVote()
		evaluateAutoVoteRetrogradation()
		evaluateAiVoteRetrogradation()
		tryAutoVote()
		const nextActiveVote = getActiveAiVote()

		if (previousActiveVote !== nextActiveVote) {
			refreshSurveyWithCurrentPopulation()
		}

		updateVoteSelection()
	})

	window.humanityProtocolDebug.subscribe(() => {
		const shouldUnlockAiVote = window.humanityProtocolDebug.isToolEvolutionEnabled('satisfaction-vote', 'ai-vote')
		const shouldUnlockAutoVote = window.humanityProtocolDebug.isToolEvolutionEnabled('satisfaction-vote', 'auto-vote')

		if (shouldUnlockAiVote !== isAiVoteUnlocked) {
			setAiVoteUnlocked(shouldUnlockAiVote, { syncDebug: false })
		}

		if (shouldUnlockAutoVote !== isAutoVoteUnlocked) {
			setAutoVoteUnlocked(shouldUnlockAutoVote, { syncDebug: false })
		}

		if (window.humanityProtocolTools.isToolEnabled('satisfaction-vote')) {
			updateVoteSelection()
		}
	})
})()
