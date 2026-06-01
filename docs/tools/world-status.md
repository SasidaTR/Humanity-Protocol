# État mondial

### Identité

- ID : `2`
- Nom : `État mondial`
- Prototype : `world-status`
- Familles : `Analyse`
- État : implémenté

### Interface affichée

- fenêtre déplaçable
- fenêtre réductible
- date simulée
- vitesse de simulation effective
- population mondiale
- satisfaction globale
- fonds disponibles

### Calculs internes

- lecture continue d'indicateurs mondiaux agrégés
- aucune action directe sur le monde
- dépend de l'état courant de la simulation
- sert de point d'entrée pour lire les grands équilibres du monde

### Systèmes utilisés

- temps simulé
- population mondiale
- satisfaction globale
- économie globale

### État initial

- Type : `Analyse`
- Usage : lecture continue des indicateurs mondiaux de base
- Portée : mondiale

### Évolutions actuelles

- `Afficher l'heure actuelle`
  - ajoute l'heure simulée complète à côté de la date
  - activable dans le debug

- `Détails des catégories`
  - ajoute un petit dépliage sur `Population mondiale`
  - affiche actuellement :
    - `Femmes`
    - `Hommes`
    - `0-17 ans`
    - `18-34 ans`
    - `35-64 ans`
    - `65+ ans`
  - activable dans le debug

### Pistes futures

- `Analyse`
  - afficher l'évolution des indicateurs sur plusieurs périodes
  - étendre les détails à d'autres catégories mondiales
  - afficher des écarts par région ou par groupe humain
  - croiser certains indicateurs avec des lois actives ou d'autres outils
