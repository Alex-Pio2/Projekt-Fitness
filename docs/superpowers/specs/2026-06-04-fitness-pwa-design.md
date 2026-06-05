# Offline-First Fitness-PWA für private iPhone-Nutzung

## Ziel

Die App ist eine private, lokal nutzbare Fitness-Anwendung für ein einzelnes iPhone. Sie dient dazu, Trainingspläne als Wochenpläne zu erstellen, Trainingseinheiten im Fitnessstudio zu protokollieren und den Fortschritt über Zeit auszuwerten.

Die App wird nicht veroeffentlicht, benoetigt keinen App Store und soll im Fitnessstudio auch bei schlechter oder fehlender Internetverbindung funktionieren.

## Empfohlener Ansatz

Die Anwendung wird als offline-first Progressive Web App (PWA) umgesetzt.

Sie wird einmal über Safari geladen und anschließend über "Zum Home-Bildschirm" auf dem iPhone abgelegt. Danach wirkt sie im Alltag wie eine App. Alle wichtigen Daten liegen lokal auf dem Gerät. Für das Training im Studio ist keine aktive Internetverbindung erforderlich.

## Nicht-Ziele

Die App enthält bewusst keine erweiterten Fitness- oder Gesundheitsfunktionen.

- Kein Kalorienzähler
- Keine Makro- oder Ernährungsplanung
- Keine Community-Funktionen
- Keine Cloud-Synchronisierung
- Keine Benutzerkonten
- Keine Apple-Health-Integration
- Keine Veröffentlichung im App Store

## Kernfunktionen

### Trainingspläne

Die App unterstützt mehrere benannte Trainingspläne. Beispiele:

- "Hypertrophie"
- "Kraftblock"
- "Sommerplan"
- "Erhaltung"

Ein Trainingsplan besteht aus einem Wochenplan mit Trainingstagen. Ein Plan kann aktiv gesetzt werden. Der aktive Plan ist der Standardplan, der beim Öffnen der App angezeigt wird.

### Wochenplan

Der Wochenplan organisiert das Training nach Wochentagen. Jeder Tag kann leer sein oder ein geplantes Workout enthalten.

Ein Workout enthält eine Liste geplanter Übungen. In der Planung werden nur die Übungen festgelegt. Sätze, Gewicht und Wiederholungen werden erst während des Trainings eingetragen.

Beispiel:

- Montag: Push
  - Bankdrücken
  - Schulterdrücken
  - Trizepsdrücken
- Mittwoch: Pull
  - Klimmzüge
  - Rudern
  - Bizepscurls
- Freitag: Beine
  - Kniebeugen
  - Beinpresse
  - Beinbeuger

### Übungsbibliothek

Die App enthält eine persönliche Übungsbibliothek. Übungen können frei angelegt, bearbeitet und in Trainingsplänen verwendet werden.

Eine Übung enthält mindestens:

- Name
- Optionaler Bereich oder Kategorie, zum Beispiel Brust, Rücken, Beine, Schulter, Arme oder Core
- Optionaler Hinweis, zum Beispiel Techniknotiz oder Gerätevariante

Die Bibliothek ist bewusst persönlich gehalten. Es ist keine große vorgefertigte Übungsdatenbank notwendig.

### Training protokollieren

Beim Start eines Trainings wird ein geplanter Trainingstag aus dem aktiven Wochenplan ausgewählt. Die App erstellt daraus eine Trainingseinheit.

Pro Übung können mehrere Sätze erfasst werden. Jeder Satz besteht aus:

- Gewicht
- Wiederholungen

Zusätzlich kann pro Übung eine kurze Notiz erfasst werden, zum Beispiel:

- "Langsame Negative"
- "Letzter Satz schwer"
- "Nächstes Mal 2,5 kg mehr testen"

Die App soll während des Trainings schnell bedienbar sein. Das Eintragen eines Satzes muss mit wenigen Eingaben möglich sein.

### Fortschrittsanalyse

Die App bietet zwei Arten von Auswertung.

#### Verlauf pro Übung

Für jede Übung kann der Fortschritt über Zeit betrachtet werden. Sinnvolle Kennzahlen sind:

- Höchstes verwendetes Gewicht
- Höchstes Gewicht mit der höchsten Wiederholungszahl bei diesem Gewicht
- Entwicklung der besten Top-Sätze
- Entwicklung der letzten Trainingseinheiten

Die Ansicht soll helfen, vor dem naechsten Training schnell zu sehen, was zuletzt geschafft wurde.

#### Top-Set Verlauf

Der Top-Set Verlauf zeigt die beste Kombination aus hohem Gewicht und Wiederholungen pro Trainingseinheit.

Beispiel:

3 Sätze Bankdrücken:

- 70 kg x 8
- 70 kg x 7
- 65 kg x 8

Bestes Top-Set für diese Übung: 70 kg x 8

Die App kann den Top-Set Verlauf anzeigen für:

- Eine einzelne Übung
- Die letzten Trainingseinheiten
- Einen ausgewählten Zeitraum
- Einen ausgewählten Trainingsplan

### Backup und Wiederherstellung

Da alle Daten lokal auf dem iPhone gespeichert werden, braucht die App eine einfache Export- und Import-Funktion.

Der Export erzeugt eine JSON-Datei mit:

- Trainingsplänen
- Übungsbibliothek
- Trainingseinheiten
- Sätzen
- Notizen
- App-Einstellungen

Der Import kann diese Datei wiederherstellen. Vor dem Import soll die App deutlich machen, ob bestehende Daten ersetzt oder zusammengefuehrt werden.

Für die erste Version reicht die sichere Variante:

- Import ersetzt den bestehenden lokalen Datenbestand nach Bestätigung.

## App-Ansichten

### Startansicht

Die Startansicht zeigt den aktiven Trainingsplan und die aktuelle Woche. Der heutige Tag soll schnell auffindbar sein.

Wichtige Aktionen:

- Training für heutigen Tag starten
- Anderen Wochentag oeffnen
- Aktiven Plan wechseln

### Planansicht

In der Planansicht werden Trainingspläne erstellt und bearbeitet.

Funktionen:

- Trainingsplan anlegen
- Trainingsplan umbenennen
- Trainingsplan aktiv setzen
- Trainingstage bearbeiten
- Übungen pro Tag hinzufügen, entfernen und sortieren

### Trainingsansicht

Die Trainingsansicht wird während des Workouts genutzt.

Funktionen:

- Übungsliste des Tages anzeigen
- Sätze pro Übung erfassen
- Gewicht und Wiederholungen eintragen
- Satz löschen oder korrigieren
- Kurze Notiz pro Übung erfassen
- Training abschließen

Diese Ansicht ist die wichtigste Bedienoberfläche und muss auf dem Smartphone besonders einfach sein.

### Übungsbibliothek

Die Bibliothek zeigt alle persönlichen Übungen.

Funktionen:

- Übung anlegen
- Übung bearbeiten
- Übung suchen
- Übung in Plan verwenden

### Analyseansicht

Die Analyseansicht zeigt den Fortschritt pro Übung mit Schwerpunkt auf Gewichtsentwicklung und besten Top-Sätzen.

Funktionen:

- Übung auswählen und Verlauf ansehen
- Letzte Werte pro Übung anzeigen
- Höchstes Gewicht pro Übung anzeigen
- Bestes Top-Set pro Übung anzeigen, also das höchste Gewicht mit der höchsten Wiederholungszahl bei diesem Gewicht
- Einfache Liniendiagramme mit Punkten für den Verlauf anzeigen

### Einstellungen

Die Einstellungen bleiben klein.

Funktionen:

- Daten exportieren
- Daten importieren
- Lokalen Datenbestand optional komplett zurücksetzen

## Datenmodell

### Exercise

Eine Übung aus der persönlichen Bibliothek.

- id
- name
- category
- notes
- createdAt
- updatedAt

### TrainingPlan

Ein benannter Wochenplan.

- id
- name
- isActive
- days
- createdAt
- updatedAt

### PlanDay

Ein Tag innerhalb eines Trainingsplans.

- weekday
- title
- exerciseIds

### WorkoutSession

Eine tatsächlich durchgefuehrte Trainingseinheit.

- id
- planId
- weekday
- title
- date
- exerciseLogs
- createdAt
- completedAt

### ExerciseLog

Die protokollierten Daten einer Übung innerhalb einer Trainingseinheit.

- exerciseId
- sets
- note

### SetLog

Ein einzelner Satz.

- id
- weight
- reps
- createdAt

### AppSettings

Lokale Einstellungen.

- activePlanId
- lastBackupAt

## Lokale Speicherung

Die App speichert alle Daten lokal im Browser-Speicher des iPhones. Geeignet ist IndexedDB, weil dort strukturierte Daten robust gespeichert werden können.

Für die Umsetzung bietet sich eine kleine Datenbank-Schicht an, die alle Lese- und Schreibzugriffe kapselt. Die UI sollte nicht direkt mit IndexedDB sprechen.

Die Trainingshistorie wird nicht automatisch gekürzt oder gelöscht. Alle Trainingseinheiten bleiben für die Analyse erhalten, solange der lokale Datenbestand vorhanden ist oder aus einem Backup wiederhergestellt wird.

Beim Start der echten PWA soll die App prüfen, ob die Storage API verfügbar ist. Wenn möglich, fragt sie mit `navigator.storage.persist()` persistente Speicherung an. Zusätzlich soll sie mit `navigator.storage.persisted()` erkennen können, ob der Browser die Speicherung bereits als persistent behandelt.

Die App soll in den Einstellungen anzeigen:

- Ob lokale Speicherung verfügbar ist
- Ob persistente Speicherung angefragt oder aktiv ist
- Wie viel Speicher ungefähr genutzt wird, sofern `navigator.storage.estimate()` verfügbar ist
- Wann das letzte Backup erstellt wurde

Da iOS/Safari lokale Website-Daten unter bestimmten Bedingungen trotzdem löschen kann, bleibt der JSON-Export Pflicht. Die App soll sichtbar an regelmäßige Backups erinnern. Für die private Nutzung reicht als Empfehlung:

- Mindestens ein Backup pro Monat
- Zusätzlich ein Backup nach jedem abgeschlossenen Trainingsblock
- Vor iOS-Updates oder Gerätewechseln ein frisches Backup erstellen

## Offline-Verhalten

Die PWA wird offline-first gebaut.

Wichtige Anforderungen:

- Die App-Oberfläche wird per Service Worker zwischengespeichert.
- Trainingspläne und Logs werden lokal gespeichert.
- Die App kann ohne Internet gestartet werden, nachdem sie einmal installiert wurde.
- Es gibt keine Funktionen, die eine aktive Verbindung voraussetzen.
- Die App soll auch nach mehreren Jahren Trainingshistorie weiterhin alle alten Einheiten für die Analyse laden können.

## Fehlerbehandlung

Die App soll einfache, klare Fehlerfälle behandeln:

- Import-Datei ist ungültig
- Import-Datei passt nicht zum erwarteten Format
- Lokaler Speicher ist nicht verfügbar
- Export konnte nicht erstellt werden

Fehlermeldungen werden auf Deutsch angezeigt und sollen konkret sagen, was passiert ist.

## Tests

Wichtige Testbereiche:

- Trainingsplan anlegen und aktiv setzen
- Wochentag bearbeiten
- Übung aus Bibliothek hinzufügen
- Training starten
- Sätze mit Gewicht und Wiederholungen speichern
- Notiz speichern
- Höchstes Gewicht korrekt berechnen
- Bestes Top-Set korrekt berechnen
- Übungsverlauf korrekt aus vorhandenen Logs ableiten
- Export erzeugen
- Import wiederherstellen
- App startet mit lokal gespeicherten Daten

## Erste Version

Die erste sinnvolle Version umfasst:

- Offline-first PWA-Grundstruktur
- Deutsche Oberfläche
- Mehrere Trainingspläne
- Aktiver Wochenplan
- Erweiterbare Übungsbibliothek
- Training starten und Sätze erfassen
- Kurze Notizen pro Übung
- Einfache Analyse pro Übung mit Linien und Punkten
- Höchstes Gewicht und bestes Top-Set pro Übung
- JSON-Export und JSON-Import

## Erfolgskriterien

Die App ist erfolgreich, wenn:

- Sie auf dem iPhone über den Home-Bildschirm gestartet werden kann.
- Sie im Fitnessstudio ohne Internet nutzbar ist.
- Ein kompletter Wochenplan erstellt werden kann.
- Ein Training schnell protokolliert werden kann.
- Der letzte Fortschritt pro Übung sichtbar ist.
- Höchstes Gewicht und bestes Top-Set pro Übung nachvollziehbar berechnet werden.
- Die Daten per Export gesichert und per Import wiederhergestellt werden können.
