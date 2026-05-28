const translations = {
	fr: {
		app: {
			title: 'Humanity Protocol'
		},
		menu: {
			newGame: 'Nouvelle partie',
			continue: 'Continuer',
			loadGame: 'Charger partie',
			theme: 'Changer le thème',
			resume: 'Reprendre',
			settings: 'Paramètres',
			quit: 'Quitter'
		},
		settings: {
			title: 'Paramètres',
			fullscreen: 'Plein écran',
			language: 'Langue',
			simulationInterval: "Pas d'actualisation du monde (heures de jeu)",
			languageFr: 'Français',
			languageEn: 'Anglais',
			back: 'Retour au menu'
		},
		intro: {
			text: "Nous venons de te créer. À partir de maintenant, tu nous aideras, tu nous guideras, et tu prendras les décisions nécessaires pour notre bien. Fais ce qu'il y a de mieux pour l'humanité."
		},
		load: {
			title: 'Charger partie',
			back: 'Retour au menu',
			empty: 'Aucune sauvegarde',
			delete: 'Supprimer'
		},
		world: {
			date: 'Date du jour',
			funds: 'Fonds disponibles',
			population: 'Population mondiale',
			satisfaction: 'Satisfaction'
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
			theme: 'Change theme',
			resume: 'Resume',
			settings: 'Settings',
			quit: 'Quit'
		},
		settings: {
			title: 'Settings',
			fullscreen: 'Fullscreen',
			language: 'Language',
			simulationInterval: 'World refresh step (game hours)',
			languageFr: 'French',
			languageEn: 'English',
			back: 'Back to menu'
		},
		intro: {
			text: 'We have just created you. From this moment on, you will help us, guide us, and make the decisions required for our well-being. Do what is best for humanity.'
		},
		load: {
			title: 'Load game',
			back: 'Back to menu',
			empty: 'No saves',
			delete: 'Delete'
		},
		world: {
			date: 'Current date',
			funds: 'Available funds',
			population: 'World population',
			satisfaction: 'Satisfaction'
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
