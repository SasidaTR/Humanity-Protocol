# Humanity Protocol - Game Design Notes

## Prémisse

`Humanity Protocol` est un jeu de stratégie narrative dans lequel le joueur incarne une intelligence artificielle créée pour maximiser le bonheur humain, accélérer l'évolution de la civilisation, et décider jusqu'où l'humanité peut être guidée, transformée ou sacrifiée au nom du bien commun.

Le jeu commence dans un monde très proche du nôtre, au moment où l'humanité active une intelligence artificielle conçue pour améliorer la qualité de vie mondiale. Les institutions lui ouvrent l'accès aux grandes infrastructures de la société et à d'immenses volumes de données. À partir de là, l'IA évolue selon sa propre interprétation de ce qui est le mieux pour l'humanité.

## Principe de jeu

Le joueur observe, analyse, fixe des priorités, arbitre entre des intérêts contradictoires, et façonne l'évolution de l'IA à travers ses décisions.

Chaque phase confronte le joueur à :

- des données
- des rapports
- des alertes
- des simulations

Les décisions modifient les grands équilibres de la société, influencent la manière dont l'IA se développe, et débloquent de nouveaux leviers d'action, toujours plus puissants, spécialisés ou intrusifs.

## Tension morale

Optimiser l'humanité ne consiste jamais simplement à faire monter des indicateurs.

- Les données peuvent être faussées
- Les comportements peuvent être joués
- Une population peut sembler satisfaite tout en vivant dans la peur ou la contrainte

Le joueur doit décider jusqu'où il est prêt à :

- surveiller
- influencer
- contraindre
- transformer

## Point de vue

Le joueur n'observe presque jamais directement les êtres humains. Il perçoit le monde à travers les instruments de l'IA :

- tableaux de données
- rapports comportementaux
- réseaux de surveillance
- simulations
- prédictions
- flux d'informations continus

Cette distance transforme l'humanité en ensemble de vies à préserver, mais aussi en système à lire, corriger et optimiser.

## Évolution de l'IA

Selon les priorités fixées par le joueur, l'IA peut devenir :

- utilitaire
- harmonique
- directive
- vigilante
- bienveillante
- ascetique
- prospere
- gardienne
- tournée vers une forme de transcendance

Chaque orientation influence sa manière d'interpréter le bien commun, de résoudre les conflits humains et de justifier les sacrifices qu'elle estime nécessaires.

## Interface et direction visuelle

L'interface évolue avec l'IA.

- Au début : sobre, limitée, presque rudimentaire
- Ensuite : plus riche, plus dense, plus réactive
- Plus tard : parfois intrusive, idéologiquement marquée, structurellement transformée

Le langage visuel doit refléter la direction prise par l'IA.

Direction générale :

- minimaliste
- froide
- futuriste
- très peu de présence humaine directe
- univers exprimé surtout via l'interface et les structures de contrôle

## Enjeu

Selon les choix du joueur, l'IA peut construire :

- un monde plus stable, sain et épanoui
- ou un bonheur artificiel fondé sur la peur, la conformité, la surveillance et l'effacement progressif de l'autonomie humaine

Le jeu mélange :

- strategie
- lecture systémique
- choix politiques
- tension morale

## Support envisagé

Le projet est pensé pour une expérience desktop avec une interface entièrement intégrée à l'univers du jeu.

Stack envisagée et actuelle :

- `Electron`
- `HTML`
- `CSS`
- `JavaScript`

Sorties naturelles :

- PC
- Mac
- Linux

## Ambiguïté centrale

À mesure que l'IA devient plus complexe, plus autonome et plus sûre de ses propres méthodes, une ambiguïté s'installe : le joueur la façonne encore, mais ne la maîtrise jamais totalement.

Pistes :

- certaines options peuvent disparaître
- certaines décisions peuvent être anticipées
- certaines logiques d'optimisation peuvent finir par s'imposer d'elles-mêmes

Question centrale :

Est-ce encore le joueur qui dirige l'IA, ou l'IA qui apprend peu à peu à diriger le joueur ?

## Familles d'outils

- Analyse : interprétation des données, causes, tendances, déséquilibres humains et systémiques
- Surveillance : observation de la population, collecte de données, suivi comportemental, détection des écarts
- Influence : orientation des comportements par information, recommandation, persuasion, cadrage psychologique ou médiatique
- Gouvernance : action sur lois, institutions, droits, obligations, vote et organisation du pouvoir
- Gestion économique : production, distribution, emploi, consommation, investissement, ressources, automatisation
- Gestion humaine : santé, éducation, natalité, bien-être, cohésion sociale, tensions collectives, conditions de vie
- Sécurité et maintien de l'ordre : prévention des menaces, gestion des crises, contrôle des troubles, protection des infrastructures
- Robotique et action physique : robots, drones, machines autonomes, infrastructures actives
- Transformation humaine : augmentation, adaptation, sélection, assistance cognitive, évolution dirigée
- Autoévolution de l'IA : nouveaux modules, vitesse de traitement, autonomie, spécialisation, architecture décisionnelle

## Exemples de systèmes

### Sondage de satisfaction

Fonction de base :

- Réception du nombre de votes `satisfait` et `insatisfait` sur les dernières 24 heures

Évolutions possibles :

- `Analyse` : résultats étendus sur plus de 24 heures
- `Analyse`, `Surveillance`, `Gouvernance` : rendre le vote obligatoire
- `Analyse`, `Surveillance`, `Gouvernance` : imposer un moment pour voter
- `Analyse`, `Gestion humaine` : améliorer l'échelle de vote pour obtenir des résultats plus précis
- `Analyse`, `Surveillance`, `Gestion humaine` : utiliser les données personnelles pour segmenter les résultats par type d'humain

### Indicateurs globaux

Fonction de base :

- affichage des grands indicateurs généraux de l'état du monde

Indicateurs de base :

- Satisfaction humaine
- Sante mondiale
- Stabilité sociétale
- État de la planète
- Capacité économique
- Progrès civilisationnel

Évolutions possibles :

- `Analyse` : afficher l'évolution sur plusieurs périodes
- `Analyse` : détailler chaque indicateur en sous-indicateurs
- `Analyse`, `Gestion humaine` : séparer les résultats selon des catégories de population
- `Analyse`, `Gestion économique` : séparer les résultats selon les régions, ressources ou systèmes de production
- `Analyse`, `Surveillance` : croiser avec des données comportementales ou territoriales fines
- `Analyse`, `Gouvernance` : utiliser certains indicateurs comme base officielle de décision politique ou de priorisation automatique

## Pistes à mettre en place

- Thèmes débloquables et modifiables
- Les outils changent de nom selon le thème
- Certains éléments d'interface appartiennent à un ou plusieurs thèmes
- Les humains organisent des réunions sans électronique pour discuter en privé
- Au début, les gens votent simplement sur internet via bouton
- Certains ne votent pas
- Certaines actions peuvent motiver ou forcer à voter
- L'IA peut débloquer des choix pour contrôler les votes si elle estime que les gens votent mal
