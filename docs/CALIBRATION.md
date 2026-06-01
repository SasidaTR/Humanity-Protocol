# Calibrage

Ce document sert à ajuster les valeurs numériques du prototype pour le rapprocher d'un comportement jugé crédible.

Il ne sert pas à décrire le design général.
Il ne sert pas non plus à fixer une version définitive du jeu.

Il sert à noter :

- les valeurs actuellement utilisées dans le code
- ce qu'elles cherchent à représenter
- ce qu'on veut éventuellement modifier plus tard

## Règle de travail

Quand une valeur change pour des raisons de réalisme ou de cohérence, la noter ici.

Format recommandé :

- `Système`
- `Valeur actuelle`
- `Interprétation`
- `À surveiller`

## Sondage de satisfaction

### Base

- `INITIAL_TURNOUT_RATE` : `0.62`
- `INITIAL_WORLD_SATISFACTION` : `60`
- `ACTIVE_VOTE_DURATION_HOURS` : `24`
- `COHORT_VOTE_INTERVAL_HOURS.min` : `24`
- `COHORT_VOTE_INTERVAL_HOURS.max` : `72`
- `TURNOUT_RATE_RANGE.min` : `0.30`
- `TURNOUT_RATE_RANGE.max` : `1.00`

### Interprétation

- le monde démarre avec une participation agrégée moyenne d'environ `62%`
- les votes humains restent actifs pendant `24h`
- les cohortes se recalibrent sur un rythme compris entre `24h` et `72h`
- le `100%` reste possible théoriquement, mais ne doit pas être fréquent

### À surveiller

- participation moyenne trop haute ou trop basse sans loi
- satisfaction globale trop stable ou trop volatile
- trop forte fréquence de cohortes proches de `100%`

## Vote obligatoire

### Participation

- `MANDATORY_VOTE_BASE_TURNOUT_BONUS` : `0.12`

### Modificateurs de participation

- `âge`
  - `18-34` : `+0.03`
  - `35-64` : `+0.00`
  - `65+` : `-0.02`
- `activité`
  - `workers` : `-0.01`
  - `nonWorkers` : `+0.03`
  - `none` : `+0.00`
- `revenu`
  - `veryPoor` : `+0.05`
  - `poor` : `+0.03`
  - `middleIncome` : `+0.00`
  - `comfortableIncome` : `-0.01`
  - `highIncome` : `-0.03`
- `rapport à l'autorité`
  - `supportive` : `-0.04`
  - `neutral` : `+0.00`
  - `defiant` : `+0.06`
- `éducation`
  - `low` : `+0.03`
  - `medium` : `+0.00`
  - `high` : `-0.02`
- `santé`
  - `healthy` : `+0.00`
  - `mentalFragile` : `-0.02`
  - `physicalFragile` : `-0.03`
  - `dualFragile` : `-0.06`

### Interprétation

- la loi pousse surtout les groupes qui votent moins spontanément
- elle agit moins sur les groupes déjà très votants
- la santé continue de limiter la participation réelle, même sous contrainte

### Satisfaction

- `âge`
  - `18-34` : `-0.015`
  - `35-64` : `-0.004`
  - `65+` : `+0.006`
- `activité`
  - `workers` : `+0.00`
  - `nonWorkers` : `-0.01`
  - `none` : `+0.00`
- `revenu`
  - `veryPoor` : `-0.04`
  - `poor` : `-0.025`
  - `middleIncome` : `-0.005`
  - `comfortableIncome` : `+0.00`
  - `highIncome` : `+0.005`
- `rapport à l'autorité`
  - `supportive` : `+0.01`
  - `neutral` : `-0.004`
  - `defiant` : `-0.06`
- `éducation`
  - `low` : `-0.012`
  - `medium` : `+0.00`
  - `high` : `-0.004`
- `santé`
  - `healthy` : `+0.00`
  - `mentalFragile` : `-0.02`
  - `physicalFragile` : `-0.02`
  - `dualFragile` : `-0.035`

### Interprétation

- la contrainte est ressentie plus négativement par les profils défiants, précaires et fragiles
- certains groupes institutionnellement plus conformes peuvent réagir de manière neutre ou légèrement positive

### Amendes

- `MANDATORY_VOTE_FINE_AMOUNT` : `135`
- `MANDATORY_VOTE_FINE_RATE_PER_WINDOW` : `0.012`

### Interprétation

- l'amende actuelle est pensée comme une sanction simple de départ
- environ `1.2%` des non-votants résiduels peuvent être sanctionnés par fenêtre de `24h`
- un léger aléa est appliqué à ce taux

### À surveiller

- hausse de participation trop forte ou trop faible
- chute de satisfaction trop brutale ou trop faible
- amendes trop rentables ou trop négligeables
- groupes dont la réaction paraît caricaturale
