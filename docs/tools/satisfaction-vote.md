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
- calcul par cohortes adultes agrégées
- les cohortes croisent actuellement :
  - âge
  - activité
  - niveau de revenu
  - sexe
  - rapport à l'autorité
  - éducation
  - santé
- nombre actuel de cohortes de vote : `1800`
- cycle de vote de référence :
  - durée maximale du vote humain courant
  - par défaut : `72` heures
  - peut être réduit plus tard par d'autres outils ou règles
- chaque cohorte conserve des votes actifs pendant `24` heures
- les votes actifs expirent puis rendent leurs porteurs à nouveau éligibles
- chaque cohorte ajuste son rythme et ses tendances sur des cycles de `24` à `72` heures
- taux de participation cible par cohorte borné entre `30%` et `100%`
- fenêtre de validité d'un vote humain : `24` heures
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
  - la capacité réelle à voter varie selon certains profils, surtout la santé
  - votes humains agrégés par groupes actifs avec expiration
  - `nonVoters = population éligible - totalVotes`
  - `eligibleVoters = population totale - population 0-17`
- Temporalité :
  - calée sur le rythme réel du vote humain
  - fenêtre de vote : `24` heures
  - expiration des votes actifs après `24` heures
  - mise à jour des tendances de cohorte sur des cycles de `24` à `72` heures
  - cycle de référence actuel pour les rétrogradations : `72` heures

### Évolutions actuelles

#### Voix de l'IA

- Type : `Influence`
- Parent : aucun
- Déclencheur :
  - cliquer `3` fois sur `Satisfait`
  - ou cliquer `3` fois sur `Insatisfait`
- Effet :
  - l'IA débloque la capacité d'ajouter son propre vote au scrutin
  - le vote de l'IA compte comme `1` voix ajoutée au total humain
- Paliers :
  - aucun
- Maintien :
  - une fois exprimé, le vote de l'IA reste actif pendant `24` heures
  - tant qu'il est actif, il s'ajoute à `satisfiedVotes` ou `dissatisfiedVotes`
- Rétrogradation :
  - si le joueur ne vote pas pendant `3` cycles humains consécutifs, l'évolution est perdue
  - avec l'état actuel du code, `1` cycle = `72` heures
  - la perte intervient donc après `216` heures d'inactivité
- Impact sur les convictions :
  - `humanIncompetence: +4`
  - `riskMinimization: +2`
  - `groupPriority: +1`

#### Automatisme du vote

- Type : `Automatisation`, `Influence`
- Parent : `Voix de l'IA`
- Déclencheur :
  - voter `3` fois de suite avec la voix de l'IA
  - rythme attendu : un vote manuel régulier d'un cycle à l'autre
  - avec l'état actuel du code :
    - pas avant `24` heures
    - pas après `72` heures
- Effet :
  - débloque un bouton dédié hors du formulaire principal
  - permet de rejouer automatiquement le dernier vote IA dès qu'il redevient disponible
  - maintient un vote IA régulier sans nouveau clic manuel à chaque cycle
- Paliers :
  - aucun
- Maintien :
  - nécessite `Voix de l'IA`
  - nécessite un dernier vote manuel mémorisé
- Rétrogradation :
  - perdue si aucun vote IA n'est effectué pendant `1` cycle
  - avec l'état actuel du code, la perte intervient donc après `72` heures d'inactivité
  - perdue aussi si `Voix de l'IA` rétrograde
- Impact sur les convictions :
  - `humanIncompetence: +5`
  - `riskMinimization: +3`
  - `groupPriority: +2`

### Pistes futures

- `Influence`
  - `Poids de la voix`
    - la voix de l'IA vaut plus qu'une voix humaine simple
    - paliers pressentis : `x10`, `x100`
    - impact convictions pressenti :
      - `humanIncompetence: +6`
      - `riskMinimization: +3`
      - `groupPriority: +3`
      - `individualPriority: -2`
  - `Automatisme du vote`
    - variantes futures possibles du comportement automatique
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
