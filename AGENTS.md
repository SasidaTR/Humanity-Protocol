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

## Chantiers ouverts

### Vote obligatoire

Le socle existe déjà.
Le travail restant porte surtout sur :

- le calibrage réaliste via `src/renderer/scripts/core/config.js`
- le lien avec les `convictions`
- l'ajout futur d'autres lois et d'autres sanctions

### Idéologies

Il reste à :

- fixer une règle universelle de lecture/déblocage des idéologies
- puis l'implémenter dans le code

## Stack

- `Electron`
- `HTML`
- `CSS`
- `JavaScript`
