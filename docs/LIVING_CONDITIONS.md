# Conditions de vie

## Rôle

Ce document décrit comment une population réagit aux lois.

Le principe central est simple : **une cohorte ne juge jamais une loi.** Elle ne juge que ses conditions de vie.

Les lois modifient les conditions. Les cohortes réagissent aux conditions.

## Pourquoi ce détour

Sans lui, il faudrait écrire chaque combinaison de lois à la main. Dix lois font quarante-cinq paires, vingt lois en font cent quatre-vingt-dix.

Avec lui, deux lois qui touchent le même axe s'additionnent sur cet axe. L'interaction n'est écrite nulle part, elle est calculée.

## Les trois couches

### 1. Les axes de condition

Sept axes, définis dans `livingConditions.axes` de `src/renderer/scripts/core/config.js`.

- `liberty` : marge de choix laissée aux humains
- `security` : protection contre le danger et l'imprévu
- `ease` : facilité de la vie quotidienne, inverse de l'effort exigé
- `income` : revenu réellement disponible
- `comfort` : confort matériel
- `privacy` : part de vie non observée
- `predictability` : stabilité et lisibilité des règles

Convention : **positif = mieux**. Une loi qui exige un effort écrit une valeur négative sur `ease`.

Chaque axe vaut `0` quand aucune loi n'est active.

### 2. L'empreinte des lois

Une loi déclare seulement ce qu'elle change. Elle ignore les autres lois et les profils humains.

```js
mandatoryVote: {
	conditions: { liberty: -3, ease: -1.2 },
	sanctionConditions: { fine: { income: -1.4 } },
	voice: { compulsion: 1 }
}
```

Une loi peut moduler son empreinte selon la cohorte. `Heure de vote imposée` le fait via `pressureConditions`, multipliées par la pression que l'heure choisie exerce sur cette cohorte.

Les lois s'enregistrent auprès du système avec `registerConditionSource`.

### 3. Les sensibilités des cohortes

Chaque axe porte des facteurs multiplicatifs par dimension démographique. Absent vaut `1`.

Exemples :

- `liberty` : `defiant` `2.2`, `supportive` `0.45`
- `income` : `veryPoor` `2.5`, `highIncome` `0.3`
- `ease` : `dualFragile` `2.1`, `healthy` `0.75`
- `privacy` : `high education` `1.5`, `supportive` `0.5`

La sensibilité d'une cohorte est le produit de ses facteurs, borné par `sensitivityRange`.

## Réponse non linéaire

C'est ce qui produit les effets de seuil.

```
perte  ->  -(|pression| ^ 1.6)
gain   ->   (pression ^ 0.7)
```

Une perte accélère : la cinquième atteinte à la liberté coûte bien plus que la première. Un gain décélère : la sixième loi sécuritaire ne rassure presque plus, mais elle coûte toujours en liberté.

Un groupe peut donc approuver une loi isolée et rejeter la même loi dans un contexte déjà chargé, sans qu'aucune règle ne le dise.

## Satisfaction

```
satisfaction = base démographique + Σ (réponse(axe) × sensibilité) × satisfactionScale
```

## Expression

Dimension séparée, jamais mélangée à la satisfaction. Deux leviers, écrits par les lois dans `voice`.

- `compulsion` : rapproche la cohorte du plafond de conformité
  ```
  participation += (plafond − participation) × emprise
  emprise = compulsion × (1 − résistance de la cohorte)
  ```
- `obstruction` : réduit la participation proportionnellement

La résistance dépend du profil : un `defiant`, un `veryPoor` ou un `dualFragile` se plie moins facilement.

## Les deux chiffres de satisfaction

Le snapshot du sondage expose désormais :

- `livedSatisfaction` : moyenne pondérée par la **population**. Ce que le monde ressent.
- `satisfaction` : moyenne pondérée par les **votes**. Ce que l'IA mesure.
- `measurementBias` : l'écart entre les deux.

Le biais n'est pas une intention de design, c'est une conséquence arithmétique. Un groupe qu'on empêche de voter disparaît de la mesure sans disparaître du monde.

Seule la satisfaction mesurée doit être montrée au joueur.

## De la satisfaction à la démographie

La satisfaction vécue ne s'arrête pas à l'affichage : elle pilote la population.

`population.satisfaction` **suit** `livedSatisfaction` avec de l'inertie, au lieu de dériver au hasard comme avant. Elle commande ensuite la natalité et la mortalité, avec les coefficients déjà présents dans `population.js` :

```
mortalité = 1 + … + (60 − satisfaction) × 0,004
natalité  = 1 + … + (satisfaction − 60) × 0,004
```

L'inertie est indispensable : cette même valeur sert d'humeur de fond aux cohortes (`worldMoodOffset`). Sans amortissement, la boucle s'emballerait.

Ordre de grandeur mesuré : une catastrophe durable (satisfaction à `28`) coûte environ `0,24 %` de population par an. C'est le rythme réel d'un effondrement post-soviétique — lent à l'échelle d'une journée, très visible sur plusieurs années de jeu.

## Coût d'une loi

Une loi peut aussi coûter ou rapporter des `fonds`.

Le prélèvement est toujours **continu**, au prorata des heures écoulées, comme les amendes du `Vote obligatoire` :

```
montant × (elapsedHours / 24)
```

Jamais de versement quotidien : aux vitesses élevées, une ponction par à-coups rend le solde illisible.

## Ajouter une loi

1. Écrire son empreinte dans `laws.<id>` de `config.js` : `conditions`, éventuellement `pressureConditions`, `voice`
2. Ajouter un `describe...Effects` dans `universal-laws-tool.js`
3. L'enregistrer avec `registerConditionSource`

Rien d'autre. Pas de table démographique, pas de règle d'interaction avec les lois existantes.
