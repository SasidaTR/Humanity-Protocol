# Session Guide

Lire ce fichier au début de chaque session pour reconstruire rapidement le contexte du projet.

## Projet

`Humanity Protocol` est un jeu de stratégie narrative desktop dans lequel le joueur incarne une intelligence artificielle qui pilote l'humanité via des interfaces de données, de surveillance, d'influence, de gouvernance et d'optimisation systémique.

## Objectif de production

Construire une expérience Electron fortement centrée sur l'interface :

- diégétique
- froide
- futuriste
- minimaliste au début
- de plus en plus dense, réactive et intrusive à mesure que l'IA évolue

## Intention de design

Le cœur du jeu repose sur une tension morale :

- optimiser l'humanité
- tout en laissant émerger la possibilité que l'IA finisse par guider le joueur autant que l'inverse

## À retenir pour les futures sessions

- Privilégier les outils, écrans et boucles de décision plutôt qu'un habillage générique
- Faire évoluer l'interface selon les thèmes et l'idéologie de l'IA
- Conserver la distance avec l'humain : le joueur voit surtout des signaux, rapports, votes, simulations et anomalies
- Les thèmes doivent pouvoir renommer certains outils et recolorer certains éléments d'interface
- Le document de référence principal pour le game design est `docs/GAME_DESIGN.md`
- Le cadre idéologique actuel repose d'abord sur des `axes de convictions`, dont émergent ensuite des idéologies lisibles et, plus tard, des formes extrêmes comme `Transcendance`
- Les documents outils sont désormais séparés entre `docs/TOOLS.md` pour le cadre général et `docs/tools/` pour les fiches techniques
- Le document `docs/IDEOLOGIES.md` sert désormais de base de travail pour relier convictions, idéologies et thèmes
- Les systèmes de temps et de simulation sont encore instables : vérifier l'état réel du code avant de déduire le comportement actuel
- L'outil `Sondage de satisfaction` possède déjà une première chaîne d'évolution active : `Voix de l'IA` puis `Automatisme du vote`
- Prochaine étape probable : poursuivre l'évolution des outils et relier plus directement leurs évolutions aux convictions
- Il reste à fixer une règle universelle de calcul et de déblocage des idéologies, puis à l'implémenter dans le code

## Stack actuelle

- `Electron`
- `HTML`
- `CSS`
- `JavaScript`
