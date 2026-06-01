const defaultTheme = 'default'
const defaultAppearanceMode = 'system'
const appearanceModes = new Set(['system', 'light', 'dark'])

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
let currentAppearanceMode = defaultAppearanceMode
let currentResolvedAppearance = 'light'

const systemAppearanceQuery = typeof window.matchMedia === 'function'
	? window.matchMedia('(prefers-color-scheme: dark)')
	: null

function resolveTheme(themeName){
	return themes.has(themeName) ? themeName : defaultTheme
}

function resolveAppearanceMode(appearanceMode){
	return appearanceModes.has(appearanceMode) ? appearanceMode : defaultAppearanceMode
}

function resolveSystemAppearance(){
	return systemAppearanceQuery?.matches ? 'dark' : 'light'
}

function syncAppearanceDataset(){
	const resolvedAppearance = currentAppearanceMode === 'system'
		? resolveSystemAppearance()
		: currentAppearanceMode
	document.body.dataset.appearanceMode = currentAppearanceMode
	document.body.dataset.appearance = resolvedAppearance
	currentResolvedAppearance = resolvedAppearance
	return resolvedAppearance
}

function applyTheme(themeName){
	const nextTheme = resolveTheme(themeName)
	document.body.dataset.theme = nextTheme
	currentTheme = nextTheme
	return nextTheme
}

function applyAppearanceMode(appearanceMode){
	currentAppearanceMode = resolveAppearanceMode(appearanceMode)
	return syncAppearanceDataset()
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

function getCurrentAppearanceMode(){
	return currentAppearanceMode
}

function getResolvedAppearance(){
	return currentResolvedAppearance
}

function getThemeLabel(themeName, language = 'fr'){
	const resolvedTheme = resolveTheme(themeName)
	return window.humanityProtocolI18n.getTranslation(language, `themes.${resolvedTheme}`) || resolvedTheme
}

if (systemAppearanceQuery && typeof systemAppearanceQuery.addEventListener === 'function') {
	systemAppearanceQuery.addEventListener('change', () => {
		if (currentAppearanceMode === 'system') {
			syncAppearanceDataset()
		}
	})
} else if (systemAppearanceQuery && typeof systemAppearanceQuery.addListener === 'function') {
	systemAppearanceQuery.addListener(() => {
		if (currentAppearanceMode === 'system') {
			syncAppearanceDataset()
		}
	})
}

syncAppearanceDataset()

window.humanityProtocolTheme = {
	applyTheme,
	applyAppearanceMode,
	applyThemeFromSave,
	buildThemeSnapshot,
	defaultTheme,
	defaultAppearanceMode,
	getCurrentAppearanceMode,
	getCurrentTheme,
	getResolvedAppearance,
	getThemeLabel,
	appearanceModes: [...appearanceModes],
	themes: [...themes]
}
