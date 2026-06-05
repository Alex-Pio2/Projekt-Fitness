# FitPlan

Private offline-first Fitness-PWA für Trainingspläne, Trainingslogs und Fortschrittsanalyse.

## Nutzung über GitHub Pages

Die App ist als statische PWA gebaut. GitHub Pages kann sie direkt aus dem Repository-Root ausliefern.

Empfohlene GitHub-Pages-Einstellung im Repository `Alex-Pio2/Projekt-Fitness`:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

Danach ist die App unter dieser Adresse erreichbar:

`https://alex-pio2.github.io/Projekt-Fitness/`

Die App kann in Safari geöffnet und über **Teilen > Zum Home-Bildschirm** installiert werden.

## Daten

Trainingspläne, Übungen, Sätze, Notizen und Analyse-Daten werden lokal im Browser-Speicher des iPhones gespeichert. Die App nutzt IndexedDB und fragt persistente Speicherung per `navigator.storage.persist()` an.

Backups werden als JSON-Datei exportiert und können wieder importiert werden.
