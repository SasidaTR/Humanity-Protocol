# Outils

## Rôle

Ce document décrit le cadre général du système d'outils.

Les fiches détaillées sont séparées dans `tools/`.

## Familles

Les familles servent à classer les outils par forme d'action et de pouvoir.
Elles décrivent surtout ce que fait un outil, pas l'idéologie finale de l'IA.

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

## Familles, convictions, idéologies

Le système fonctionne en trois couches :

- `Famille` : ce que l'outil permet de faire
- `Convictions` : ce que l'usage de l'outil apprend progressivement à l'IA
- `Idéologie` : ce que l'IA devient quand plusieurs convictions se renforcent ensemble

Conséquence :

- les familles restent utiles pour organiser les outils
- les convictions portent le sens moral et idéologique du système
- les idéologies émergent ensuite comme lecture synthétique de cette évolution

## Modèle d'évolution

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

### Types de nœuds

- `Observation` : mieux voir sans agir
- `Influence` : orienter sans imposer
- `Contrainte` : imposer une règle, une fenêtre ou une obligation
- `Mesure` : changer la finesse, la structure ou l'interprétation du signal
- `Automatisation` : laisser l'outil agir seul selon une logique fixée
- `Méta-évolution` : faire évoluer une évolution déjà obtenue

### Règles générales

- un nœud peut dépendre d'un autre nœud
- un nœud peut avoir plusieurs paliers
- un nœud peut se maintenir, progresser ou rétrograder selon l'usage réel du joueur
- les règles d'un nœud doivent dépendre autant que possible des systèmes du monde déjà existants
- quand deux nœuds changent le même format de base, ils doivent appartenir à un groupe exclusif

## Lien entre outils et convictions

Les outils participent à la formation des convictions de l'IA.

Chaque évolution importante d'un outil doit préciser autant que possible :

- quels `axes de convictions` elle déplace
- dans quelle direction elle les pousse
- si elle augmente l'inertie idéologique
- si elle complique un retour vers plus d'autonomie humaine
- si elle entre en tension avec d'autres branches ou d'autres outils

Par défaut, les impacts sur les convictions sont `cumulatifs`.

- débloquer un nœud ajoute son impact propre
- débloquer ensuite un nœud enfant ou une méta-évolution ajoute un impact supplémentaire
- un impact ne remplace un impact précédent que si la fiche le précise explicitement
- les exclusivités peuvent empêcher certains cumuls si deux branches ne peuvent pas coexister

### Axes à suivre

- vision de l'humain
- source du bonheur
- source du progrès
- gestion du risque
- valeur de l'individu
- modification de l'humain

### Règles de cohérence

- un outil très développé dans une logique de contrainte ne doit pas rester moralement neutre
- un outil d'observation peut rester plus ambigu plus longtemps qu'un outil de gouvernance ou de sécurité
- les nœuds d'un même outil peuvent pousser des convictions différentes, mais pas sans friction
- plus un joueur cumule des outils alignés, plus une idéologie émergente doit devenir lisible
- un nœud n'a pas besoin d'afficher directement son effet moral au joueur, mais le design doit le savoir

## Format recommandé pour une fiche outil

- `Identité`
- `Données`
- `Dépendances système`
- `État initial`
- `Architecture d'évolution`
- `Impact convictions`
- `Nœuds actuels`
- `Pistes futures`

Format conseillé :

- phrases minimales
- listes courtes
- valeurs chiffrées dès que possible
- un nœud = une lecture rapide

## Fiches actuelles

- [Index des fiches](tools/README.md)
- [Sondage de satisfaction](tools/satisfaction-vote.md)
- [État mondial](tools/world-status.md)
