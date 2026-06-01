# Lois universelles

### Identité

- ID : `3`
- Nom : `Lois universelles`
- Prototype : `universal-laws`
- Familles : `Gouvernance`, `Contrainte`
- État : concept

### Interface affichée

- liste des lois actives
- bouton d'activation par loi
- bouton d'abrogation par loi
- état global du dispositif législatif
- aucune granularité locale à ce stade

### Calculs internes

- chaque loi s'applique à l'échelle mondiale
- une loi modifie durablement une règle du monde au lieu de produire un effet ponctuel
- une loi peut avoir :
  - une condition d'activation
  - un coût politique
  - un coût matériel
  - un effet continu
  - un impact sur les convictions
- plusieurs lois peuvent être compatibles ou exclusives
- certaines lois peuvent modifier le cycle de vote humain, l'accès à des droits ou les conditions de certains outils

### Systèmes utilisés

- gouvernance mondiale
- population
- satisfaction
- temps simulé
- futurs outils politiques et sociaux

### État initial

- Type : `Gouvernance`
- Usage : définir des règles globales qui s'appliquent à toute l'humanité
- Portée : mondiale
- Action IA :
  - activer une loi
  - abroger une loi
  - maintenir un cadre normatif dans le temps

### Lois actuelles

#### Vote obligatoire

- Type : `Contrainte`
- Activation :
  - loi activable manuellement par le joueur
- Effet :
  - les humains éligibles sont tenus de voter
  - augmente fortement la participation sans rendre le vote certain
  - agit directement sur le fonctionnement du `Sondage de satisfaction`
- Sanction actuelle :
  - `Amende`
- Maintien :
  - reste actif tant que la loi n'est pas abrogée
- Rétrogradation :
  - aucune
- Impact sur les convictions :
  - à définir

##### Brouillon de comportement

- une partie de la population reste abstentionniste même sous contrainte
- le `100%` peut exister théoriquement mais doit rester rare
- une partie des non-votants peut être sanctionnée par `amende`
- les `amendes` peuvent devenir une source de `fonds`
- la loi doit modifier différemment :
  - la `capacité réelle à voter`
  - la `probabilité de voter`
  - la `satisfaction`

##### État du code actuel

- la loi augmente déjà la participation des cohortes
- cet effet varie déjà selon l'âge, l'activité, le revenu, le rapport à l'autorité, l'éducation et la santé
- les non-votants résiduels restent possibles
- une partie des non-votants résiduels est déjà convertie en `amendes`
- les `fonds` augmentent déjà à partir de ces amendes
- la loi modifie déjà aussi la `satisfaction` de manière différenciée selon les groupes
- les détails chiffrés de cette loi ne sont pas encore affichés directement dans l'outil

##### Brouillon de réactions sociales

- groupes plutôt `défavorables` :
  - `defiant`
  - `veryPoor`
  - `poor`
  - `mentalFragile`
  - `physicalFragile`
  - `dualFragile`
  - une partie des `18-34`
- groupes plutôt `neutres` :
  - `neutral`
  - `middleIncome`
  - `35-64`
  - `medium education`
- groupes plutôt `favorables` ou peu affectés :
  - `supportive`
  - `65+`
  - `workers`
  - `comfortableIncome`
  - `highIncome`
  - `high education`

##### Brouillon d'effets système

- hausse de participation surtout chez les groupes qui votent peu spontanément
- baisse de satisfaction chez les groupes qui vivent la loi comme une contrainte
- effet faible sur les groupes déjà très votants
- le résultat du sondage gagne en volume mais pas nécessairement en adhésion

### Pistes futures

- `Contrainte`
  - heure de vote imposée
  - couvre-feu
  - limitation de consommation
- `Gestion humaine`
  - accès prioritaire à certains soins
  - obligations éducatives
- `Sécurité`
  - traçabilité renforcée
  - restrictions de déplacement
- `Gouvernance`
  - hiérarchie de lois
  - groupes de lois exclusifs
  - maintien automatique de certaines lois
