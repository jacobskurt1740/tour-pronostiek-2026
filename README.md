# Tour Pronostiek 2026

Familie Tourmanager met live klassement, ploegen, kopmannen, wissels en trui-voorspellingen.

## Aanpassen
Alle gegevens staan in:

`data/tour-data.json`

Daar voeg je deelnemers, ploegen en later ritresultaten toe.

## Ritresultaat toevoegen
Voeg in `stages` een object toe zoals:

```json
{
  "number": 1,
  "name": "Rit 1",
  "results": ["Naam winnaar", "Naam tweede", "Naam derde"]
}
```

Vul bij voorkeur de top 25 in. De site berekent automatisch punten voor renners die in de ploegen zitten.
