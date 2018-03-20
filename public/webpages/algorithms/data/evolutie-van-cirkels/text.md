Ik heb hiervoor [The Naure of Code, hoofdstuk 9](http://natureofcode.com/book/chapter-9-the-evolution-of-code/) bekeken.

Er zijn drie verschillende soorten van het evolutionaire algoritme:

* Traditioneel:
Gebruikt fitness van een resultaat om tot een bepaald doel te komen. Wanneer er bijvoorbeeld geraden wordt op een nummer dat in de buurt van het doel zit, kan het programma een beetje afwijken van de vorige gok om het goede getal te raden.
Een voorbeeld is [dit programma](https://xviniette.github.io/FlappyLearning/) dat Flappy Bird speelt.

* Interactief:
De gebruiker geeft input en die input wordt gebruikt voor een beter resultaat.
Een voorbeeld is de [evolutie van muzieknummers](http://darwintunes.org/) door keuze van melodies.

* Ecosysteem:
Je kunt ook evolutie zoals het er in de echte wereld uitziet nabootsen. Dat heb ik geprobeert in mijn profielwerkstuk. De overgave van eigenschappen beïnvloeden het gedrag van organismen. Het grote verschil met de traditionele versie is dat er sprake is van dood en geboorte in plaats van een fitness beoordeling.


Vaak ontdek ik een nieuwe algemene strategie. Wanneer ik die heb geleerd denk ik er vaak aan als oplossing voor een probleem. Zo los ik met recursie iets op wat met een loop kan. Dit kan ook een probleem zijn, vaak is willekeurigheid niet nodig maar ik gebruik het wel. Doordat je na een tijdje verschillende gereedschappen hebt kan je vaak de beste oplossing voor een probleem zien.
Een zo’n algemene oplossing is dit algoritme. Zo is het binary search algoritme heel specifiek voor een doel. Maar voor dat doel zou je ook het evolutionair algoritme kunnen gebruiken.
Het is een handig algoritme om te beheersen.

Tegenwoordig wordt het minder gebruikt in machine learning dan eerst omdat het veel computerkracht kost. Er wordt veel van deep learning gebruik gemaakt. In de toekomst wanneer snelheid meer toeneemt zal dit misschien weer meer gebruikt worden.

Ik heb trouwens iets geleerd over optimalisatie. Een _optimaal algoritme_ bestaat niet. Er bestaan wel slechte algoritmes en goede. Maar het is altijd een afweging tussen geheugen, snelheid, hoeveel processorkracht nodig is.
En er is ook nog een afweging tussen hoeveel computerkracht nodig is en hoe makkelijk het te programmeren is. Het beste zou zijn om in 1 en 0 te programmeren of iets realistischer in C. Maar veel mensen gebruiken Python omdat het beter te begrijpen is. En het is duurder om een snel algoritme te maken dan om meer computers te gebruiken.


Het algoritme is gebaseerd op de natuur. Er worden enkele biologische termen gebruikt voor het nadenken over de uitvoer. Hoewel het niet per se klopt, spreken we over een populatie van instanties die hun eigenschappen overdragen aan hun kinderen. Voor de implementatie zijn enkele zaken nodig:

1. Erfelijkheid:
De informatie die tot een deel van de oplossing heeft geleid blijft bewaart. Anders zou je elke iteratie opnieuw moeten beginnen.

2. Variatie:
Er moet soms een afwijking zijn om dichter bij de oplossing te komen. Als er geen verandering is zal alles gelijk blijven. Er zijn altijd meerdere instanties die vergeleken worden om te kijken wat werkt.
Vaak is er nog een verschil in wat je ziet (beweging) en de data waar die beweging op gebaseerd is.

3. Selectie:
Er moet gemeten worden hoe dichtbij de oplossing een instantie is. Dit wordt ook wel fitness genoemd. Dit kan bijvoorbeeld de afstand tot een doellocatie zijn. De fitness kan uitgedrukt worden als percentage om te zorgen dat een oplossing die dichtbij het doel zit meer voorkomt. Je wil niet dat de data met een lagere fitness verloren gaat want in een andere combinatie kan het juist sucessvoller zijn.

Variatie wordt hier wat uitgebreider besproken. Er zijn namelijk, net als in de natuur, verschillende manieren om er voor te zorgen:

* Je kunt het kind een exacte kopie van de gekozen ouder maken.

* Je kunt een mutatie toevoegen na optie 1. Hierdoor is er toch variatie. Er wordt dan gebruik gemaakt van een bepaalde kans dat er een verandering optreedt.

* Je kunt de helft van de informatie van een ouder en de andere helft van de andere nemen. Hierdoor krijg je een combinatie van de succesvolle individuen. Er zijn verschillende combinaties mogelijk en er kunnen dus meerdere verschillende kinderen gemaakt worden.



Samengevat zijn de volgende stappen nodig:

1. Beginpopulatie aanmaken.
2. Selecteren op de meest succesvolle uit de populatie.
3. De gekozen individuen combineren tot een nieuwe populatie.
4. Herhalen tot een bepaald doel bereikt is. _Terug naar stap 1._



Voorbeelden / ideeën van toepassingen zijn:

- Raden van een zin of nummer waarbij het eindresultaat bekend is.
- De snelste weg naar een locatie op een veld zoeken.
- De meest efficïente waardes van een programma bepalen.
- Een ander algoritme optimaliseren.
