const defaultTheme = 'default'

const themes = new Set([
	'default',
	'liberale',
	'protectrice',
	'tutelaire',
	'autoritaire',
	'collectiviste',
	'technocratique',
	'hedoniste',
	'transhumaniste',
	'expansionniste',
	'nourriciere',
	'innovatrice'
])

let currentTheme = defaultTheme

function resolveTheme(themeName){
	return themes.has(themeName) ? themeName : defaultTheme
}

function applyTheme(themeName){
	const nextTheme = resolveTheme(themeName)
	document.body.dataset.theme = nextTheme
	currentTheme = nextTheme
	return nextTheme
}

function applyThemeFromSave(save){
	return applyTheme(save?.ui?.theme)
}

function buildThemeSnapshot(){
	return {
		theme: currentTheme
	}
}

function getCurrentTheme(){
	return currentTheme
}

function getThemeLabel(themeName, language = 'fr'){
	const resolvedTheme = resolveTheme(themeName)
	return window.humanityProtocolI18n.getTranslation(language, `themes.${resolvedTheme}`) || resolvedTheme
}

window.humanityProtocolTheme = {
	applyTheme,
	applyThemeFromSave,
	buildThemeSnapshot,
	defaultTheme,
	getCurrentTheme,
	getThemeLabel,
	themes: [...themes]
}
