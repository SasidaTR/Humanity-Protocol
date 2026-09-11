# Session Guide

Lire ce fichier au début de chaque session pour reconstruire rapidement le contexte du projet.

## Projet

`Humanity Protocol` est un jeu de stratégie narrative desktop dans lequel le joueur incarne une intelligence artificielle qui pilote l'humanité via des interfaces de données, de surveillance, d'influence, de gouvernance et d'optimisation systémique.

## Intention

Construire une expérience Electron :

- diégétique
- froide
- futuriste
- minimaliste au début
- de plus en plus dense, réactive et intrusive à mesure que l'IA évolue

Le cœur du projet reste une tension morale :

- optimiser l'humanité
- sans imposer trop tôt une réponse morale unique
- tout en laissant émerger la possibilité que l'IA finisse par guider le joueur autant que l'inverse

## État actuel du code

### Structure

- `src/renderer/scripts/core/`
- `src/renderer/scripts/systems/`
- `src/renderer/scripts/tools/`

### Systèmes déjà en place

- système de `temps`
- système de `population`
- système de `fonds`
- système de `convictions`
- système de `thèmes`
- système de `satisfaction`
- système de `conditions de vie`
- système d'`économie` (revenus normalisés, périodes d'affichage)
- système de `sauvegarde/session`

### Outils déjà présents

- `État mondial`
- `Sondage de satisfaction`
- `Lois universelles`

### Évolutions déjà présentes

- `État mondial`
  - `Afficher l'heure actuelle`
  - `Détails des catégories`
- `Sondage de satisfaction`
  - `Voix de l'IA`
  - `Automatisme du vote`

### Lois déjà présentes

- `Vote obligatoire`
  - active la participation contrainte
  - laisse des non-votants résiduels
  - applique déjà des amendes
  - alimente déjà les fonds
  - modifie déjà participation et satisfaction selon les groupes
  - déplace les convictions vers le primat du collectif

- `Heure de vote imposée`
  - ouvre le scrutin une seule heure par jour
  - heure choisie par le joueur parmi 24 créneaux
  - le monde s'adapte à l'heure, l'heure ne s'adapte pas au monde
  - le coût dépend de l'écart au rythme naturel de chaque cohorte et de la dureté de l'heure choisie
  - ne rapporte rien seule, mais alimente les amendes du `Vote obligatoire`
  - premier impact de conviction porté par une loi

### Simulation humaine actuelle

- le vote repose sur `1800` cohortes agrégées
- axes actuellement utilisés :
  - âge
  - activité
  - revenu
  - sexe
  - rapport à l'autorité
  - éducation
  - santé

## Documents utiles

- `docs/GAME_DESIGN.md`
  - vision générale et intentions de design
- `docs/TOOLS.md`
  - cadre général du système d'outils
- `docs/tools/`
  - fiches techniques outil par outil
- `docs/IDEOLOGIES.md`
  - base de travail pour convictions, idéologies et thèmes
- `docs/LIVING_CONDITIONS.md`
  - comment les lois agissent sur la population, et comment ajouter une loi
- `src/renderer/scripts/core/config.js`
  - valeurs de configuration réellement utilisées par le prototype

## Interface et apparence

- le thème idéologique reste porté par `data-theme`
- un mode d'apparence `system / light / dark` existe aussi dans les paramètres
- la variante `default` commence à utiliser une structure de variables plus riche dans `src/renderer/styles/main.css`
- les autres thèmes pourront ensuite recevoir leur propre déclinaison claire et sombre

## Règles de lecture importantes

- vérifier l'état réel du code avant de déduire le comportement du prototype
- privilégier les outils, écrans et boucles de décision plutôt qu'un habillage générique
- conserver la distance avec l'humain : le joueur voit surtout des signaux, rapports, votes, simulations et anomalies
- faire évoluer l'interface selon les thèmes et l'idéologie de l'IA
- garder en tête que les `convictions` sont la couche système, et que les `idéologies/thèmes` en sont une lecture synthétique
- ne pas « corriger » les écarts volontaires avec le monde réel, décrits dans `docs/GAME_DESIGN.md` :
  - la population est au plateau, autant de naissances que de morts, par choix de l'humanité
  - il n'existe pas d'ultra-riches, l'écart maximal au salaire moyen est de `6,25`
  - la population de départ est lucide, pas ignorante
- en revanche l'effondrement reste possible : sous une satisfaction de `35`, la mortalité s'emballe et la natalité chute

## Chantiers ouverts

### Conditions de vie

Les lois n'écrivent plus de tables démographiques.
Elles écrivent quelques valeurs sur sept axes de condition, et les cohortes portent les sensibilités.

Points à retenir :

- une cohorte ne juge jamais une loi, seulement ses conditions de vie
- les interactions entre lois sont émergentes, jamais écrites
- `satisfaction` et `expression` sont deux dimensions séparées
- le sondage expose `livedSatisfaction` (le monde) et `satisfaction` (ce que l'IA mesure)
- `livedSatisfaction` pilote désormais la démographie : la satisfaction du monde la suit avec inertie, et commande natalité et mortalité
- seul le second doit être montré au joueur

### Lois universelles

Quatre lois sont implémentées : `Vote obligatoire`, `Heure de vote imposée`, `Impôt sur le revenu` et `Revenu garanti`.

La monnaie du jeu est normalisée : le **salaire moyen mensuel** vaut `1200` dans `config.economy`, et chaque niveau de vie est un multiple de cette référence. Tous les montants de loi s'expriment par mois ; le réglage `Affichage des montants` les convertit en semaine ou en jour sans changer la valeur stockée.

`Revenu garanti` est le premier levier positif du jeu, et le premier à pouvoir mettre l'IA en faillite : si la caisse est vide, la couverture tombe et la population s'effondre plus bas qu'avant l'aide.

`Impôt sur le revenu` apporte la première base économique du monde : chaque niveau de vie porte un revenu annuel dans `config.economy`, et la somme sur les cohortes donne la base taxable (`58,9` mille milliards par an).

Une loi est décidée mais pas encore codée, décrite dans `docs/tools/universal-laws.md` :

- `Couvre-feu`
  - premier vrai dilemme : gagnants et perdants sur la même loi
  - pas de perte de revenu, les métiers nécessaires tournent la nuit

Le travail restant porte aussi sur :

- le calibrage réaliste via `src/renderer/scripts/core/config.js`
- les `compatibilités` et `exclusivités` entre lois, encore inexistantes
- deux axes de condition restent vierges : `privacy`, `comfort`
- `authorityRelation` ne bouge jamais : la population ne se politise pas en réaction aux lois
- la répartition des niveaux de revenu est figée : on ne sort jamais de la pauvreté
- pas d'inflation, pas de croissance : les revenus ne bougent jamais

### Idéologies

Il reste à :

- fixer une règle universelle de lecture/déblocage des idéologies
- puis l'implémenter dans le code

## Stack

- `Electron`
- `HTML`
- `CSS`
- `JavaScript`
