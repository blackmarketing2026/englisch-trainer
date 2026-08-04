# Englisch Trainer

Eine lokal nutzbare Englisch-Lernplattform für ein tägliches 30-Minuten-System: lesen, aktiv abrufen, frei sprechen.

## Funktionen

- Lerninhalte als Wörter, Redewendungen, Satzbausteine oder vollständige Sätze
- Lokale Speicherung mit IndexedDB
- Aktive Lernliste mit standardmäßig 9 Inhalten und automatischer Nachpflege
- Phase 1: englische Sätze lesen und laut wiederholen
- Phase 2: Deutsch ins Englische übersetzen, Lösung anzeigen, selbst bewerten
- Phase 3: freies Sprechen mit wechselnden Themen
- Listen für aktive, wartende und gelernte Inhalte
- Statistiken, Lernserie, Export, Import und vollständiges Zurücksetzen
- Mobile Bottom-Navigation und responsive Desktop-Ansicht

## Technik

- React
- TypeScript
- Vite
- Tailwind CSS
- Dexie.js / IndexedDB
- React Router
- Lucide Icons
- Vitest

## Installation

```bash
npm install
```

## Lokaler Start

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Test

```bash
npm run test
```

## Projektstruktur

```text
src/
  components/
  hooks/
  logic/
  pages/
  services/
  types/
  utils/
```

Die Fachlogik liegt in `src/logic`, die IndexedDB-Anbindung in `src/services`, UI-Seiten in `src/pages`.

## Datenspeicherung

Vokabeln können online in `data/vocabulary.json` im GitHub-Repository gespeichert werden. Dafür braucht die Vercel-API ein GitHub-Token als Environment Variable:

```text
VOCABULARY_GITHUB_TOKEN=<GitHub Fine-grained Token mit Contents: Read and write>
GITHUB_OWNER=blackmarketing2026
GITHUB_REPO=englisch-trainer
GITHUB_BRANCH=main
```

Ohne Token kann die App keine Vokabeln speichern. Vokabeln werden nicht auf lokalen Geräten gespeichert, sondern nur über die Online-API in der Projektdatei.

## Backup und Wiederherstellung

Unter Einstellungen gibt es einen Bereich "Daten und Sicherung". Dort können alle Daten als JSON exportiert, wieder importiert, zusammengeführt oder vollständig gelöscht werden.

## GitHub-Push

```bash
git init
git add .
git commit -m "Initial version of English learning platform"
git branch -M main
git remote add origin <GITHUB-REPOSITORY-URL>
git push -u origin main
```

## Vercel-Deployment

1. Repository zu GitHub pushen.
2. In Vercel ein neues Projekt aus dem Repository erstellen.
3. Framework Preset: Vite.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
