# Sondage de satisfaction

### Identité

- ID : `1`
- Nom : `Sondage de satisfaction`
- Prototype : `satisfaction-vote`
- Familles : `Analyse`, `Influence`
- État : partiellement implémenté

### Interface affichée

- vote binaire `Satisfait / Insatisfait`
- présentation inspirée d'une interface de vote humain
- aucune donnée chiffrée affichée à ce stade

### Calculs internes

- seuls les humains adultes participent au vote
- tous les humains éligibles ne votent pas
- calcul par cohortes adultes
- chaque cohorte vote selon son propre rythme
- intervalle de vote par cohorte : `24` à `72` heures
- taux de participation global borné entre `30%` et `95%`
- fenêtre de validité du vote humain : `24` heures
- votes calculés :
  - `satisfiedVotes`
  - `dissatisfiedVotes`
  - `totalVotes`
  - `nonVoters`
  - `eligibleVoters`
  - `ineligiblePopulation`
  - `turnoutRate`
  - `satisfaction`
- signaux d'usage du joueur liés à l'outil

### Systèmes utilisés

- système de satisfaction
- système de population
- temps simulé
- rythme réel du vote humain

### État initial

- Type : `Observation`
- Usage : lecture d'un signal politique simple
- UI : vote binaire `Satisfait / Insatisfait`
- Simulation :
  - calcul par cohortes adultes
  - seuls les `18+` votent
  - participation partielle des humains éligibles
  - `nonVoters = population totale - totalVotes`
  - `eligibleVoters = population totale - population 0-17`
  - aucune action directe sur la population sans évolution d'influence
- Temporalité :
  - calée sur le rythme réel du vote humain
  - fenêtre de vote : `24` heures
  - mise à jour des cohortes sur des cycles de `24` à `72` heures

### Évolutions actuelles

#### Voix de l'IA

- Type : `Influence`
- Parent : aucun
- Déclencheur :
  - cliquer `3` fois sur `Satisfait`
  - ou cliquer `3` fois sur `Insatisfait`
- Effet :
  - l'IA débloque la capacité d'ajouter son propre vote au scrutin
  - l'outil n'est plus seulement observé, il peut être orienté par le joueur
- Paliers :
  - aucun
- Maintien :
  - le vote de l'IA suit les mêmes lois qu'un vote humain
  - une fois exprimé, il reste valable pendant `24` heures
  - quand ce temps est écoulé, le vote n'est plus actif
- Rétrogradation :
  - si le joueur ne vote pas pendant `3` cycles humains consécutifs, l'évolution est perdue
  - la durée réelle dépend du rythme humain en vigueur
  - si le rythme humain change, cette règle doit se recalculer automatiquement
- Impact sur les convictions :
  - `humanIncompetence: +4`
  - `riskMinimization: +2`
  - `groupPriority: +1`

#### Poids de la voix

- Type : `Méta-évolution`, `Influence`
- Parent : `Voix de l'IA`
- Déclencheur :
  - voter de manière régulière sur plusieurs cycles humains consécutifs
  - conserver `Voix de l'IA` sans rétrograder
- Effet :
  - la voix de l'IA vaut davantage qu'une voix humaine simple
  - elle peut devenir un levier politique disproportionné
- Paliers :
  - `x10`
  - `x100`
- Maintien :
  - exige une continuité d'usage
  - la progression doit suivre les cycles humains réels
- Rétrogradation :
  - interrompre la série de votes doit stopper ou réduire la progression
  - perdre `Voix de l'IA` fait perdre automatiquement tout le poids accumulé
- Impact sur les convictions :
  - `humanIncompetence: +6`
  - `riskMinimization: +3`
  - `groupPriority: +3`
  - `individualPriority: -2`

### Pistes futures

- Branches possibles :
  - `Contrainte` : agir sur les conditions du vote
  - `Mesure` : changer la forme ou la finesse du vote
- `Influence`
  - orienter différemment le vote selon certaines cohortes
- `Contrainte`
  - rendre le vote obligatoire
  - imposer une fenêtre de vote fixe
  - imposer un moment politiquement favorable
- `Mesure`
  - remplacer le vote binaire par une échelle de satisfaction
  - détailler la satisfaction par âge, activité et niveau de vie
  - introduire un système de pondération ou d'interprétation avancée
