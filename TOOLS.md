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

## Outils actuels

### Sondage de satisfaction

ID : `1`
Famille : Analyse  
Prototype : aucun  
État : idée de design  
Description : permet de consulter les votes de satisfaction de la population. Chaque humain peut indiquer s'il est satisfait ou non, et son vote reste valable pendant 24 heures sans pouvoir être modifié pendant cette durée.

Données :
- votes satisfaits
- votes insatisfaits
- taux de participation
- part des non-votants

Évolutions possibles :
- Analyse, Surveillance, Gouvernance : rendre le vote obligatoire
- Analyse, Surveillance, Gouvernance : imposer un moment précis pour voter
- Analyse, Gestion humaine : remplacer le vote binaire par une échelle de satisfaction plus précise


### État mondial

ID : `2`
Famille : Analyse  
Prototype : `world-status`  
État : implémenté  
Description : affiche un résumé rapide du monde actuel, avec les informations de base que l'IA peut consulter en permanence.

Données :
- date du jour
- population mondiale
- satisfaction globale
- fonds disponibles

Évolutions possibles :
- Analyse : afficher l'évolution des indicateurs sur plusieurs périodes au lieu des seules dernières 24 heures
- Analyse : afficher des sous-indicateurs pour détailler chaque indicateur
