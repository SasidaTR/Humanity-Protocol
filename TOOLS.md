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
Prototype : `satisfaction-vote`  
État : partiellement implémenté  
Description : permet de représenter le vote binaire de satisfaction de la population. Le prototype actuel affiche une interface de vote non interactive pour l'IA, tandis que le calcul réel du sondage est produit en arrière-plan à partir de cohortes adultes.

Données :
- votes satisfaits
- votes insatisfaits
- taux de participation
- part des non-votants
- population non éligible au vote (`0-17`)

Évolutions possibles :
- Analyse, Surveillance, Gouvernance : rendre le vote obligatoire
- Analyse, Surveillance, Gouvernance : imposer un moment précis pour voter
- Analyse, Gestion humaine : remplacer le vote binaire par une échelle de satisfaction plus précise
- Analyse : détailler la satisfaction par âge, activité et niveau de vie


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
