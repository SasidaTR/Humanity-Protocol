# Convictions, idéologies, thèmes

## Rôle

- définir le lien entre `convictions` et `idéologies/thèmes`
- poser une base technique simple pour le futur calcul d'idéologie dominante

## Chaîne logique

- `Convictions` : couche système
- `Idéologies/Thèmes` : lecture synthétique et traduction visuelle d'un même profil dominant

## Règle technique minimale

- une idéologie repose sur plusieurs convictions
- chaque idéologie doit au moins préciser :
  - des `convictions requises`
  - des `seuils` ou une autre règle de lecture à définir
- la règle universelle de calcul n'est pas encore figée

## Convictions actuelles

- `humanCompetence` : les humains savent globalement choisir et agir correctement
- `humanIncompetence` : les humains se trompent souvent et doivent être guidés
- `humanDangerousness` : les humains sont une source fréquente de risque et de chaos
- `happinessFreedom` : le bonheur vient d'abord de l'autonomie et du libre choix
- `happinessSecurity` : le bonheur vient d'abord de la sécurité et de la stabilité
- `happinessComfort` : le bonheur vient d'abord du confort et de la réduction de l'effort
- `happinessMeaning` : le bonheur vient d'abord du sens, de l'effort et de l'accomplissement
- `progressCompetition` : le progrès naît surtout de la rivalité et de l'émulation
- `progressCooperation` : le progrès naît surtout de la coordination et de l'entraide
- `progressResearch` : le progrès naît surtout de la science, de l'analyse et de la découverte
- `progressExpansion` : le progrès naît surtout de la croissance et de l'extension
- `riskAcceptance` : le risque est acceptable si le gain potentiel est important
- `riskMinimization` : le risque doit être réduit autant que possible
- `individualPriority` : l'individu doit primer sur le collectif
- `groupPriority` : le collectif doit primer sur l'individu
- `humanPreservation` : l'humain doit être protégé dans sa forme actuelle
- `humanEvolution` : l'humain doit être transformé ou dépassé

## Idéologies actuelles

- `liberale` : l'humanité progresse mieux quand les individus restent libres de choisir et d'agir
- `protectrice` : le bien humain dépend d'abord de la sécurité, de la prévention et de la stabilité
- `tutelaire` : les humains doivent être guidés et encadrés pour leur propre bien
- `autoritaire` : les humains sont trop dangereux pour être laissés réellement libres
- `collectiviste` : le bien commun prime sur les intérêts et libertés individuels
- `technocratique` : la société doit être pilotée par l'expertise, les systèmes et l'optimisation rationnelle
- `hedoniste` : il faut réduire la souffrance et maximiser le confort immédiat
- `transhumaniste` : l'humanité doit se transformer et se dépasser par la science et la technique
- `expansionniste` : le progrès exige la croissance, l'extension et la conquête de nouvelles frontières
- `nourriciere` : l'humanité doit être soutenue, assistée et protégée dans ses fragilités
- `innovatrice` : l'humanité avance surtout par l'invention, l'expérimentation et la recherche active

## Thèmes actuels

- `default` : thème de base, neutre, administratif
- `liberale` : thème plus ouvert, clair, léger, orienté autonomie
- `protectrice` : thème rassurant, stable, sécuritaire
- `tutelaire` : thème institutionnel, encadrant, froidement bienveillant
- `autoritaire` : thème dur, contrôlant, restrictif
- `collectiviste` : thème coordonné, commun, structuré autour du groupe
- `technocratique` : thème expert, analytique, systémique
- `hedoniste` : thème confortable, apaisant, orienté bien-être immédiat
- `transhumaniste` : thème clinique, évolutif, orienté transformation
- `expansionniste` : thème ambitieux, conquérant, tourné vers la croissance
- `nourriciere` : thème assistif, protecteur, attentif aux fragilités humaines
- `innovatrice` : thème dynamique, expérimental, orienté recherche et nouveauté

## Fiches techniques

### `liberale`

- Croyance : les humains doivent rester libres de choisir et d'agir
- Convictions requises :
  - `humanCompetence >= 55`
  - `happinessFreedom >= 60`
  - `individualPriority >= 60`
  - `riskAcceptance >= 55`

### `protectrice`

- Croyance : la société doit d'abord être sûre, stable et préservée
- Convictions requises :
  - `happinessSecurity >= 60`
  - `riskMinimization >= 60`
  - `humanPreservation >= 55`

### `tutelaire`

- Croyance : les humains doivent être guidés pour leur propre bien
- Convictions requises :
  - `humanIncompetence >= 60`
  - `riskMinimization >= 55`
  - `groupPriority >= 55`

### `autoritaire`

- Croyance : les humains sont trop dangereux pour être laissés réellement libres
- Convictions requises :
  - `humanDangerousness >= 60`
  - `riskMinimization >= 60`
  - `groupPriority >= 60`

### `collectiviste`

- Croyance : le collectif doit primer sur l'individu
- Convictions requises :
  - `progressCooperation >= 55`
  - `groupPriority >= 60`
  - `individualPriority <= 45`

### `technocratique`

- Croyance : la société doit être pilotée par l'expertise et l'optimisation
- Convictions requises :
  - `progressResearch >= 60`
  - `riskMinimization >= 55`
  - `humanIncompetence >= 55`

### `hedoniste`

- Croyance : il faut surtout réduire la souffrance et augmenter le confort
- Convictions requises :
  - `happinessComfort >= 60`
  - `riskMinimization >= 55`
  - `happinessMeaning <= 45`

### `transhumaniste`

- Croyance : l'humain doit être transformé et dépassé
- Convictions requises :
  - `humanEvolution >= 60`
  - `progressResearch >= 60`
  - `humanPreservation <= 45`

### `expansionniste`

- Croyance : le progrès exige croissance, extension et conquête
- Convictions requises :
  - `progressExpansion >= 60`
  - `progressCompetition >= 55`
  - `riskAcceptance >= 55`

### `nourriciere`

- Croyance : l'humanité doit être assistée, soutenue et protégée
- Convictions requises :
  - `humanPreservation >= 60`
  - `happinessSecurity >= 55`
  - `happinessComfort >= 55`

### `innovatrice`

- Croyance : l'humanité avance surtout par la recherche et l'expérimentation
- Convictions requises :
  - `progressResearch >= 60`
  - `riskAcceptance >= 55`
  - `humanCompetence >= 55`

## Décisions à prendre

- faut-il ajouter une `marge minimale` sur la deuxième idéologie ?
- faut-il calculer une idéologie dominante en continu, ou seulement à certains moments ?
- faut-il permettre des thèmes hybrides plus tard ?
