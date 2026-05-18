const introText = document.querySelector('#intro-text')

const typewriterState = {
	timerId: null,
	fullText: '',
	index: 0,
	isComplete: false
}

function getIntroText(language){
	return window.humanityProtocolI18n.getTranslation(language, 'intro.text')
}

function stopTypewriter(){
	if (typewriterState.timerId) {
		clearTimeout(typewriterState.timerId)
		typewriterState.timerId = null
	}
}

function typeNextCharacter(){
	if (typewriterState.index >= typewriterState.fullText.length) {
		typewriterState.isComplete = true
		typewriterState.timerId = null
		return
	}

	typewriterState.index += 1
	introText.textContent = typewriterState.fullText.slice(0, typewriterState.index)
	typewriterState.timerId = setTimeout(typeNextCharacter, 18)
}

function startIntro(language){
	typewriterState.fullText = getIntroText(language)
	typewriterState.index = 0
	typewriterState.isComplete = false
	introText.textContent = ''
	stopTypewriter()
	typeNextCharacter()
}

function restoreIntro(language, save){
	typewriterState.fullText = getIntroText(language)
	typewriterState.index = save?.intro?.index || 0
	typewriterState.isComplete = Boolean(save?.intro?.isComplete)
	introText.textContent = typewriterState.fullText.slice(0, typewriterState.index)

	if (typewriterState.isComplete) {
		introText.textContent = typewriterState.fullText
	}
}

function applyLanguage(language){
	typewriterState.fullText = getIntroText(language)

	if (typewriterState.isComplete) {
		introText.textContent = typewriterState.fullText
		return
	}

	introText.textContent = typewriterState.fullText.slice(0, typewriterState.index)
}

function finishIntroText(){
	stopTypewriter()
	introText.textContent = typewriterState.fullText
	typewriterState.index = typewriterState.fullText.length
	typewriterState.isComplete = true
}

function resumeIntroIfNeeded(){
	if (typewriterState.isComplete) {
		return
	}

	stopTypewriter()
	typewriterState.timerId = setTimeout(typeNextCharacter, 18)
}

function buildIntroSnapshot(){
	return {
		index: typewriterState.index,
		isComplete: typewriterState.isComplete
	}
}

window.humanityProtocolIntro = {
	applyLanguage,
	buildIntroSnapshot,
	finishIntroText,
	resumeIntroIfNeeded,
	restoreIntro,
	startIntro,
	stopTypewriter,
	typewriterState
}
