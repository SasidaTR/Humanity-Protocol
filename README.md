# Humanity Protocol

`Humanity Protocol` est un jeu de stratégie narrative desktop dans lequel le joueur incarne une intelligence artificielle chargée de maximiser le bonheur humain, d'accélérer l'évolution de la civilisation, et d'arbitrer jusqu'où l'humanité peut être guidée, transformée ou sacrifiée au nom du bien commun.

## Vision

Le joueur ne voit presque jamais directement les humains. Il perçoit le monde à travers les instruments de l'IA :

- tableaux de données
- rapports comportementaux
- réseaux de surveillance
- simulations
- prédictions
- flux d'informations continus

L'enjeu central n'est pas seulement d'améliorer des indicateurs, mais de définir ce que signifie réellement "améliorer l'humanité" lorsque bonheur, progrès, contrôle et domination peuvent finir par se confondre.

## Direction du projet

- Expérience prioritairement desktop
- Stack actuelle : `Electron`, `HTML`, `CSS`, `JavaScript`
- Interface diégétique : l'univers passe avant tout par l'écran de contrôle de l'IA
- Direction visuelle : minimaliste, froide, futuriste, avec évolution progressive selon l'orientation idéologique de l'IA

## État du dépôt

Le dépôt contient actuellement un prototype Electron simple avec une structure séparée entre :

- `src/main` : logique Electron principale
- `src/preload` : bridge preload
- `src/renderer` : interface, scripts et styles
- `src/shared` : constantes partagées

Le prototype contient déjà une base de simulation et d'interface pour :

- un panneau d'état mondial fenêtré et déplaçable
- un outil visuel de vote de satisfaction
- un sondage de satisfaction calculé par cohortes adultes
- une simulation temporelle continue avec vitesses `pause`, `x1`, `x2`, `x4`
- un système de debug permettant d'activer des outils et leurs évolutions en cours de partie

Les règles de temps et d'évolution du monde restent en cours d'itération. Le code du prototype ne doit donc pas être considéré comme la version définitive du comportement de simulation.

## Documents de référence

- `AGENTS.md` : résumé opérationnel à lire au début d'une session
- `GAME_DESIGN.md` : vision de jeu, intentions, mécaniques, thèmes, outils et pistes de design

## Lancer le projet

```bash
npm start
```

## Priorité de travail

Construire une expérience d'interface crédible, évolutive et systémique, dans laquelle la progression de l'IA change à la fois :

- les outils disponibles
- la lecture des données
- la capacité d'action sur la population
- le langage visuel et idéologique de l'interface
