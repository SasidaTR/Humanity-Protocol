const translations = {
	fr: {
		app: {
			title: 'Humanity Protocol'
		},
		menu: {
			newGame: 'Nouvelle partie',
			continue: 'Continuer',
			loadGame: 'Charger partie',
			resume: 'Reprendre',
			settings: 'Paramètres',
			quit: 'Quitter'
		},
		settings: {
			title: 'Paramètres',
			fullscreen: 'Plein écran',
			language: 'Langue',
			languageFr: 'Français',
			languageEn: 'Anglais',
			back: 'Retour au menu'
		},
		intro: {
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
		},
		load: {
			title: 'Charger partie',
			back: 'Retour au menu',
			empty: 'Aucune sauvegarde',
			delete: 'Supprimer'
		},
		chapter: {
			title: 'Lorem Ipsum'
		}
	},
	en: {
		app: {
			title: 'Humanity Protocol'
		},
		menu: {
			newGame: 'New game',
			continue: 'Continue',
			loadGame: 'Load game',
			resume: 'Resume',
			settings: 'Settings',
			quit: 'Quit'
		},
		settings: {
			title: 'Settings',
			fullscreen: 'Fullscreen',
			language: 'Language',
			languageFr: 'French',
			languageEn: 'English',
			back: 'Back to menu'
		},
		intro: {
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
		},
		load: {
			title: 'Load game',
			back: 'Back to menu',
			empty: 'No saves',
			delete: 'Delete'
		},
		chapter: {
			title: 'Lorem Ipsum'
		}
	}
}

function getTranslation(language, key){
	return key.split('.').reduce((value, part) => value && value[part], translations[language])
}

function applyTranslations(language){
	const nextLanguage = translations[language] ? language : 'fr'
	document.documentElement.lang = nextLanguage

	document.querySelectorAll('[data-i18n]').forEach((element) => {
		const key = element.dataset.i18n
		const value = getTranslation(nextLanguage, key)

		if (!value) {
			return
		}

		element.textContent = value

		if (element.tagName === 'TITLE') {
			document.title = value
		}
	})
}

window.humanityProtocolI18n = {
	applyTranslations,
	getTranslation
}
