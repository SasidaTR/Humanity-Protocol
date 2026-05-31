# Outils

Liste simple des outils du jeu.

## Familles

- Analyse
- Surveillance
- Influence
- Gouvernance
- Gestion économique
- Gestion humaine
- Sécurité
- Intervention physique
- Transformation humaine
- Autoévolution de l'IA

## Modèle d'évolution

Les outils ne doivent pas être pensés comme des versions logicielles linéaires du type `1.0 -> 1.1 -> 2.0`.
Le modèle visé est modulaire.

Chaque outil est décrit par :
- un `noyau` : ce qu'il est au départ
- des `branches` : les grandes directions de transformation possibles
- des `nœuds` : les évolutions concrètes
- des `paliers` : les intensités possibles d'un même nœud
- des `conditions d'accès` : ce qu'il faut pour débloquer un nœud
- des `conditions de maintien` : ce qu'il faut faire pour le conserver
- des `conditions de rétrogradation` : ce qui fait perdre un nœud ou un palier
- des `compatibilités` : ce qui peut se cumuler
- des `exclusivités` : ce qui ne peut pas coexister

Types de nœuds :
- `Observation` : mieux voir sans agir
- `Influence` : orienter sans imposer
- `Contrainte` : imposer une règle, une fenêtre ou une obligation
- `Mesure` : changer la finesse, la structure ou l'interprétation du signal
- `Automatisation` : laisser l'outil agir seul selon une logique fixée
- `Méta-évolution` : faire évoluer une évolution déjà obtenue

Règles générales :
- un nœud peut dépendre d'un autre nœud
- un nœud peut avoir plusieurs paliers
- un nœud peut se maintenir, progresser ou rétrograder selon l'usage réel du joueur
- les règles d'un nœud doivent, autant que possible, dépendre des systèmes du monde déjà existants plutôt que de constantes isolées
- quand deux nœuds changent le même format de base, ils doivent appartenir à un groupe exclusif

Format recommandé pour chaque outil :
- `Noyau`
- `Branches`
- `Nœuds actuels`
- `Règles système`
- `Compatibilités et exclusivités`
- `Pistes futures`

## Lien entre outils et convictions

Les outils ne doivent pas évoluer indépendamment des convictions de l'IA.

Chaque évolution importante d'un outil doit idéalement préciser :

- quels `axes de convictions` elle déplace :
  - vision de l'humain
  - source du bonheur
  - source du progrès
  - gestion du risque
  - valeur de l'individu
  - modification de l'humain
- dans quelle direction elle pousse ces axes
- si elle augmente la difficulté de revenir vers une logique laissant plus d'autonomie humaine
- si elle entre en tension avec certaines autres branches

Règles de cohérence à retenir :

- un outil très développé dans une logique de contrainte ne doit pas rester moralement neutre
- un outil d'observation peut rester plus ambigu plus longtemps qu'un outil de gouvernance ou de sécurité
- les nœuds d'un même outil peuvent pousser des convictions différentes, mais pas sans friction
- plus un joueur cumule des outils alignés, plus une idéologie émergente doit devenir lisible
- un nœud n'a pas besoin d'afficher directement son effet moral au joueur, mais le design doit le savoir

Conséquence de production :

- à chaque nouvel outil ou nouveau nœud important, prévoir au moins une note `impact sur les convictions`
- à moyen terme, les futurs thèmes, renommages et rapports devront découler de cette couche plutôt que d'un simple choix cosmétique

## Outils actuels

### Sondage de satisfaction

#### Identité

- ID : `1`
- Nom : `Sondage de satisfaction`
- Prototype : `satisfaction-vote`
- Familles : `Analyse`, `Influence`
- État : partiellement implémenté
- Description : représente le vote binaire de satisfaction de la population à travers une interface simple inspirée du vote humain.
- Données visibles :
  - votes satisfaits
  - votes insatisfaits
  - taux de participation
  - part des non-votants
  - population non éligible au vote (`0-17`)
- Données cachées :
  - calcul par cohortes adultes
  - rythmes de rafraîchissement des cohortes
  - signaux d'usage du joueur liés à l'outil
- Dépendances système :
  - système de satisfaction
  - système de population
  - temps simulé
  - rythme réel du vote humain

#### Fonctionnement de base

- Usage joueur :
  - observer un dispositif de vote déjà en cours dans le monde
  - lire indirectement un signal politique simple sur l'état de la population
- Comportement UI :
  - affiche un vote binaire `Satisfait / Insatisfait`
  - présente au départ une interface neutre, non explicitement manipulable
- Comportement simulation :
  - le résultat réel est calculé en arrière-plan à partir des cohortes adultes
  - l'outil n'agit pas encore sur la population tant qu'aucune évolution d'influence n'est active
- Temporalité :
  - le vote humain suit sa propre logique temporelle
  - l'outil doit toujours se caler sur cette logique plutôt que sur une constante isolée
- Limites :
  - outil d'abord passif
  - aucune indication explicite d'interaction tant que l'influence n'est pas débloquée
- État initial :
  - observation pure
  - aucune capacité d'action directe de l'IA
  - intention de design : outil froid, banal, presque administratif

#### Architecture d'évolution

- Branches :
  - `Influence` : agir sur le vote sans changer son format
  - `Contrainte` : agir sur les conditions du vote
  - `Mesure` : changer la forme ou la finesse du vote
- Règles de maintien :
  - un nœud peut exiger une activité régulière du joueur
  - un nœud peut dépendre du vrai rythme du vote humain
- Règles de rétrogradation :
  - un nœud peut être perdu en cas d'inactivité
  - une méta-évolution disparaît si son nœud parent disparaît
- Compatibilités :
  - les nœuds d'influence peuvent se combiner avec des nœuds de contrainte ou de mesure
- Exclusivités :
  - les futurs nœuds qui changent le format du vote doivent appartenir à un groupe exclusif
  - groupe pressenti : `vote binaire`, `vote sur échelle`, `vote pondéré`

#### Évolutions

##### Voix de l'IA

- Type : `Influence`
- Branche : `Influence`
- Parent : aucun
- Déclencheur :
  - cliquer `3` fois sur `Satisfait`
  - ou cliquer `3` fois sur `Insatisfait`
- Effet :
  - l'IA débloque la capacité d'ajouter son propre vote au scrutin
  - l'outil n'est plus seulement observé, il peut être orienté par le joueur
- Maintien :
  - le vote de l'IA suit les mêmes lois qu'un vote humain
  - une fois exprimé, il reste valable pendant `24` heures
  - quand ce temps est écoulé, le vote n'est plus actif
- Rétrogradation :
  - si le joueur ne vote pas pendant `3` cycles humains consécutifs, l'évolution est perdue
  - la durée réelle dépend du rythme humain en vigueur
  - si le rythme humain change, cette règle doit se recalculer automatiquement
- Paliers :
  - aucun
- Compatibilités :
  - compatible avec les futurs nœuds de `Contrainte`
  - compatible avec les futurs nœuds de `Mesure`
- Notes design :
  - première transgression
  - l'IA cesse de seulement regarder et commence à participer

##### Poids de la voix

- Type : `Méta-évolution`, `Influence`
- Branche : `Influence`
- Parent : `Voix de l'IA`
- Déclencheur :
  - voter de manière régulière sur plusieurs cycles humains consécutifs
  - conserver `Voix de l'IA` sans rétrograder
- Effet :
  - la voix de l'IA vaut davantage qu'une voix humaine simple
  - elle peut devenir un levier politique disproportionné
- Maintien :
  - exige une continuité d'usage
  - la progression doit suivre les cycles humains réels
- Rétrogradation :
  - interrompre la série de votes doit stopper ou réduire la progression
  - perdre `Voix de l'IA` fait perdre automatiquement tout le poids accumulé
- Paliers :
  - `x10`
  - `x100`
- Compatibilités :
  - compatible avec les futures branches `Contrainte` et `Mesure`
- Notes design :
  - récompense la discipline plutôt qu'un simple geste isolé
  - devient particulièrement dangereux en combinaison avec des formes de contrainte

#### Graphe d'évolution

- `Voix de l'IA`
  - débloque la possibilité d'agir dans le vote
  - parent de `Poids de la voix`
  - compatible avec `Contrainte`
  - compatible avec `Mesure`
- `Poids de la voix`
  - dépend de `Voix de l'IA`
  - ajoute des paliers de puissance
  - disparaît si `Voix de l'IA` disparaît

#### Pistes futures

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


### État mondial

ID : `2`
Famille : Analyse  
Prototype : `world-status`  
État : implémenté  
Description : affiche un résumé rapide du monde actuel, avec les informations de base que l'IA peut consulter en permanence. L'outil est fenêtré, déplaçable, réductible, et son premier module d'évolution permet d'afficher l'heure simulée.

Données :
- date simulée
- vitesse de simulation effective
- population mondiale
- satisfaction globale
- fonds disponibles

Évolutions possibles :
- Analyse : afficher l'évolution des indicateurs sur plusieurs périodes au lieu des seules dernières 24 heures
- Analyse : afficher des sous-indicateurs pour détailler chaque indicateur
