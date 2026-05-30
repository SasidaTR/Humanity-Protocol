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
			debug: 'Debug',
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
		debug: {
			title: 'Debug',
			theme: 'Thème',
			tools: 'Outils',
			back: 'Retour au menu'
		},
		world: {
			funds: 'Fonds disponibles',
			population: 'Population mondiale',
			satisfaction: 'Satisfaction'
		},
		satisfactionVote: {
			title: 'Satisfaction',
			eyebrow: 'Consultation citoyenne',
			meta: 'Expression libre et anonyme',
			notice: 'Votre réponse contribue au suivi de la qualité de vie collective.',
			question: 'Êtes-vous satisfait ?',
			positive: 'Satisfait',
			positiveHelper: 'Ma situation me convient actuellement.',
			negative: 'Insatisfait',
			negativeHelper: 'Ma situation devrait être améliorée.',
			footnote: 'Une seule réponse est prise en compte pendant la période de consultation.'
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
			debug: 'Debug',
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
		debug: {
			title: 'Debug',
			theme: 'Theme',
			tools: 'Tools',
			back: 'Back to menu'
		},
		world: {
			funds: 'Available funds',
			population: 'World population',
			satisfaction: 'Satisfaction'
		},
		satisfactionVote: {
			title: 'Satisfaction',
			eyebrow: 'Public consultation',
			meta: 'Free and anonymous response',
			notice: 'Your answer contributes to the monitoring of collective quality of life.',
			question: 'Are you satisfied?',
			positive: 'Satisfied',
			positiveHelper: 'My current situation is acceptable.',
			negative: 'Dissatisfied',
			negativeHelper: 'My current situation should be improved.',
			footnote: 'Only one response is counted during the consultation period.'
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
