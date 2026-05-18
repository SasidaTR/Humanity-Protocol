const defaultTheme = 'default'

const themes = new Set(['default', 'good', 'bad'])

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

window.humanityProtocolTheme = {
	applyTheme,
	applyThemeFromSave,
	buildThemeSnapshot,
	defaultTheme,
	getCurrentTheme,
	themes: [...themes]
}
