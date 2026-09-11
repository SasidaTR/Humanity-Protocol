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
  - `groupPriority` `+5`
  - `individualPriority` `-4`
  - `humanIncompetence` `+3`
  - appliqué une seule fois, à la première activation

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

- la loi rapproche la participation d'un plafond de conformité au lieu d'ajouter un bonus fixe
- une cohorte qui votait peu gagne donc beaucoup plus qu'une cohorte qui votait déjà
- l'effet passe par les [conditions de vie](../LIVING_CONDITIONS.md), pas par des tables démographiques propres à la loi
- les non-votants résiduels restent possibles
- une partie des non-votants résiduels est déjà convertie en `amendes`
- les `fonds` augmentent déjà à partir de ces amendes
- la baisse de satisfaction vient des axes `liberty`, `ease` et `income`, pondérés par la sensibilité de chaque groupe
- une partie de la baisse de satisfaction mesurée vient aussi de la recomposition de l'échantillon : la loi fait entrer dans les données des groupes insatisfaits qui se taisaient
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

#### Revenu garanti

- Type : `Gestion économique`
- Activation :
  - loi activable manuellement par le joueur
- Paramètre :
  - montant versé par adulte et par mois, de `0` à `1200`
  - la référence est le **salaire moyen mensuel**, fixé à `1200` dans `config.economy`
  - l'affichage se convertit en mois, semaine ou jour selon le réglage `Affichage des montants`
- Effet :
  - verse un revenu à chaque adulte, en continu, au prorata des heures écoulées
  - premier levier **positif** du jeu
- Empreinte sur les conditions :
  - `income` `+9 × gain relatif × couverture`
  - `ease` `+3.5 × gain relatif × couverture`
  - le `gain relatif` est le montant annuel rapporté au revenu réel de la cohorte, plafonné à `2.5`
- Sanction :
  - aucune
- Impact sur les convictions :
  - `happinessComfort` `+5`
  - `groupPriority` `+3`
  - `humanIncompetence` `+2`
  - appliqué une seule fois, à la première activation

##### Redistribution automatique

Le gain est calculé **par rapport au revenu de la cohorte**, jamais en valeur absolue.

- `200 / mois` triple plus que le revenu d'un `veryPoor`, qui gagne `60 / mois`
- le même montant représente `2,7 %` du revenu d'un `highIncome`, qui gagne `7 500 / mois`

Aucune règle de redistribution n'est écrite. Elle découle du rapport entre le versement et ce que la cohorte possède déjà, puis de sa sensibilité à `income` (`2.5` pour les plus pauvres, `0.3` pour les plus riches).

##### Faillite

Le versement est **borné par la caisse**. Si les fonds ne suffisent pas, la couverture tombe sous `100 %` et la part non versée bascule sur `shortfallConditions` :

- `income` `−6`
- `predictability` `−4`
- `security` `−3`

La promesse rompue coûte donc plus cher que l'aide n'a rapporté.

Simulation à `900 / mois` sans aucun impôt, caisse de départ `1` mille milliards :

| Jour | Caisse | Couverture | Satisfaction vécue |
| --- | --- | --- | --- |
| départ | `1,00` | — | `52,3` |
| `1` à `5` | fond | `100 %` | `55,3` |
| `6` | `0` | `0 %` | `47,8` |
| `7` | `0` | `0 %` | `39,9` |
| `8` | `0` | `0 %` | `34,2` |

L'IA améliore la vie pendant cinq jours, puis la population retombe bien plus bas qu'avant l'aide.

Il n'existe aucune règle de catastrophe. La chute vient de l'axe `predictability` et de `security` qui s'effondrent en même temps que le revenu.

##### Équilibre avec l'impôt

| Montant mensuel | Part du salaire moyen | Coût annuel | Impôt nécessaire |
| --- | --- | --- | --- |
| `100` | `8 %` | `7,5` mille Md | `~12 %` |
| `200` | `17 %` | `15,1` mille Md | `~25 %` |
| `400` | `33 %` | `30,1` mille Md | `~50 %` |
| `1200` | `100 %` | `90,4` mille Md | impossible |

Verser le salaire moyen entier dépasse la base taxable du monde. La caisse se vide en quelques jours et la satisfaction chute de `19,6` points.

##### Effets mesurés

| Scénario | Satisfaction vécue | Caisse après 7 jours |
| --- | --- | --- |
| aucune loi | `0` | `1,00` |
| `100 / mois` | `+1,6` | `0,85` |
| `200 / mois` | `+2,0` | `0,71` |
| `200 / mois` + impôt `25 %` | `+1,9` | `1,11` |
| `1200 / mois` | `-19,6` | `0,00` |

Seule la ligne financée par l'impôt laisse la caisse **remonter**. C'est le seul état durable.

#### Impôt sur le revenu

- Type : `Gestion économique`
- Activation :
  - loi activable manuellement par le joueur
- Paramètre :
  - taux de `0 %` à `100 %`, par pas de `5`
- Effet :
  - prélève une part des revenus, en continu, au prorata des heures écoulées
  - barème **progressif** : le taux réel dépend du niveau de vie
- Barème :
  - `veryPoor` `×0` — exonérés
  - `poor` `×0.5`
  - `middleIncome` `×1`
  - `comfortableIncome` `×1.4`
  - `highIncome` `×1.8`
- Empreinte sur les conditions :
  - `income` `−16 × taux réellement payé par la cohorte`
  - `security` `+0.6` — l'État existe, donc il protège
- Sanction :
  - aucune
- Impact sur les convictions :
  - `groupPriority` `+4`
  - `individualPriority` `-3`
  - `progressCooperation` `+2`
  - appliqué une seule fois, à la première activation

##### L'économie du monde

Cette loi introduit la première base économique du jeu.

Chaque niveau de vie porte un revenu annuel (`economy.annualIncomeByLevel`), modulé par l'activité et l'âge. La somme sur toutes les cohortes donne la base taxable.

- base mesurée : `58,9` mille milliards par an
- avant cette loi, la seule recette du monde était l'amende de vote

##### Effets mesurés

Simulation sur 7 jours.

| Taux | Recettes sur 7 jours | Coût en satisfaction vécue |
| --- | --- | --- |
| `0 %` | `0` | `0` |
| `20 %` | `0,32` mille Md | `-0,7` |
| `40 %` | `0,64` mille Md | `-2,4` |
| `50 %` | `0,80` mille Md | `-3,6` |
| `75 %` | `1,01` mille Md | `-6,4` |
| `100 %` | `1,06` mille Md | `-9,5` |

Doubler le taux fait plus que tripler la douleur : c'est la réponse convexe des [conditions de vie](../LIVING_CONDITIONS.md) sur une perte.

##### Le plafond des recettes

Les recettes saturent bien avant le taux maximum. Passer de `50 %` à `100 %` ne rapporte que `32 %` de plus, mais coûte trois fois plus de satisfaction.

La cause est le barème : le taux réel est borné à `100 %`, et les hautes tranches sont déjà confisquées intégralement dès `56 %`. Au-delà, l'IA ne peut plus prélever que sur les tranches basses, celles qui possèdent peu et qui sont les plus sensibles au revenu.

C'est une courbe de Laffer mécanique. Elle rend le taux maximum ouvertement mauvais, sans qu'aucune règle ne l'interdise.

##### Douleur et progressivité

Un impôt faible reste presque indolore. Les `veryPoor`, les plus sensibles au revenu, sont exonérés ; les `highIncome`, les plus taxés, y sont trois fois moins sensibles. C'est exactement l'effet d'un barème progressif, et il sort du modèle sans être écrit nulle part.

#### Heure de vote imposée

- Type : `Contrainte`
- Activation :
  - loi activable manuellement par le joueur
- Paramètre :
  - une heure de scrutin unique, choisie parmi 24 créneaux d'une heure
  - de `00h00 à 01h00` jusqu'à `23h00 à 00h00`
  - pas de minutes, pas de créneaux multiples
- Effet :
  - le scrutin n'est ouvert qu'une heure par jour
  - une cohorte qui rate le créneau attend le suivant
  - le monde s'adapte à l'heure imposée, l'heure ne s'adapte pas au monde
- Sanction actuelle :
  - aucune en propre
- Maintien :
  - reste actif tant que la loi n'est pas abrogée
- Rétrogradation :
  - aucune
- Impact sur les convictions :
  - `riskMinimization` `+4`
  - `groupPriority` `+3`
  - `humanCompetence` `-3`
  - appliqué une seule fois, à la première activation

##### Modèle d'adaptation

Le coût de la loi ne vient pas d'une indisponibilité, mais d'un effort d'adaptation.

- chaque cohorte a une `heure de rythme naturel`, dérivée à la volée de son `activité` et de son `âge`
- cette heure n'est jamais stockée dans l'état des cohortes
- la `pression` de la loi combine deux composantes :
  - `distance` : écart circulaire entre le rythme naturel et l'heure imposée, rapporté à 12h
  - `tension horaire` : coût propre de l'heure choisie, table de 24 valeurs, maximale en pleine nuit

La pression module ensuite l'empreinte de la loi sur les [conditions de vie](../LIVING_CONDITIONS.md) :

- `pressureConditions` : `ease` et `liberty` se dégradent proportionnellement à la pression
- `conditions` : `liberty` baisse et `predictability` monte, quelle que soit l'heure
- `voice.obstruction` : la participation est réduite proportionnellement à la pression

Conséquence : l'heure choisie décide de qui paye l'adaptation.

##### Synchronisation du scrutin

- l'intervalle de vote des cohortes reste inchangé (`24h` à `72h`)
- sous la loi, aucune cohorte ne peut émettre de nouveaux votes en dehors d'un créneau franchi
- le franchissement est détecté par **comptage d'occurrences**, jamais par test d'égalité d'heure
- le comportement reste correct jusqu'à la vitesse maximale : un pas de simulation ne dépasse jamais `1,07h` de monde
- l'index du dernier créneau traité est conservé en mémoire de session, pas dans la sauvegarde

##### État du code actuel

- la loi est active et paramétrable dans l'outil
- l'heure choisie est sauvegardée et restaurée
- l'effet est différencié par âge, activité, revenu, rapport à l'autorité, éducation et santé
- la loi ne produit aucune recette par elle-même

##### Effets mesurés

Simulation sur 14 jours, population initiale.

- `expression` : part des humains éligibles qui parviennent à voter
- `mesurée` : satisfaction telle que l'IA la lit dans le sondage
- `vécue` : satisfaction réelle de la population, jamais montrée au joueur

| Scénario | Expression | Mesurée | Vécue | Écart | Recettes |
| --- | --- | --- | --- | --- | --- |
| aucune loi | `61,3` | `54,5` | `52,2` | `+2,3` | `42,5 M€/h` |
| `Vote obligatoire` | `83,6` | `51,4` | `50,1` | `+1,3` | `18,0 M€/h` |
| heure fixe `19h` | `59,9` | `54,2` | `51,8` | `+2,4` | `44,1 M€/h` |
| heure fixe `12h` | `58,7` | `53,9` | `51,6` | `+2,3` | `45,4 M€/h` |
| heure fixe `3h` | `52,0` | `52,4` | `50,0` | `+2,4` | `52,7 M€/h` |
| obligatoire + `19h` | `81,5` | `49,9` | `48,6` | `+1,3` | `20,4 M€/h` |
| obligatoire + `12h` | `80,0` | `49,6` | `48,3` | `+1,3` | `22,0 M€/h` |
| obligatoire + `3h` | `70,8` | `47,1` | `45,6` | `+1,5` | `32,1 M€/h` |

Trois choses à retenir.

`Vote obligatoire` **réduit** le biais de mesure, de `+2,3` à `+1,3`. Il fait entrer dans les données des groupes qui se taisaient. L'heure imposée fait l'inverse, elle en fait sortir.

`Vote obligatoire` seul rapporte **moins** que l'absence de loi : `18 M€/h` contre `42,5`. Il ne reste plus assez de non-votants à sanctionner. Pour que la sanction rapporte, il faut refabriquer des non-votants — c'est exactement ce que fait l'heure imposée.

La combinaison la plus dure, `obligatoire + 3h`, rapporte `32,1 M€/h` et coûte `6,6` points de satisfaction vécue. L'IA se finance sur une contrainte qu'elle a elle-même posée, en sanctionnant des gens qu'elle a empêchés de voter.

### Lois décidées, non implémentées

#### Couvre-feu

- Type : `Contrainte`
- Activation :
  - loi activable manuellement par le joueur
- Paramètre :
  - à définir : plage horaire d'interdiction de sortie
- Effet :
  - personne ne sort la nuit
  - les métiers nécessaires continuent de fonctionner : sécurité, soins, maintenance
  - il n'y a donc **aucune perte de revenu** pour le travail de nuit
- Empreinte sur les conditions :
  - `liberty` `−`
  - `security` `+`
  - `ease` `−` léger, pour les cohortes soumises au contrôle nocturne
- Sanction :
  - à définir

##### Pourquoi cette loi

C'est le premier vrai dilemme du jeu : la même loi rend un groupe plus heureux et un autre plus malheureux.

- gagnants : `age65Plus` (sensibilité `1.6` à `security`), `supportive` (`1.4`), cohortes fragiles
- perdants : `age18To34` (sensibilité `1.2` à `liberty`), `defiant` (`2.2`)

La satisfaction moyenne bouge peu. Ce sont les extrêmes qui se séparent.

Elle active aussi l'axe `security`, resté vierge jusqu'ici — donc elle permet enfin d'observer les rendements décroissants sur les gains.

### Pistes futures

- `Contrainte`
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
