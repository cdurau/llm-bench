# PulseBoard – Designplan

## Themenbestimmung

Ein persönliches Werkzeug zur Alltagsplanung, das morgen abgerufen wird – ein Routine-Instrument, kein Teamsystem, keine Gamification, kein Alarm. Das Design passt sich an einen Morgen an, nicht an eine Oberfläche, die 24h genutzt wird.

## Farbpalette

| Rolle | Hell | Dunkel | Hex (HEX) |
|---|---|---|---|
| Seite | `#FAFAF9` | `#111113` | nahe-Warmweiß / tiefes Anthrazit |
| Karte | `#FFFFFF` | `#1A1A1D` | Weiß / 10%-Dunkel |
| Primärtext | `#1A1A1A` | `#EDEDED` | Near-Black |
| Sekundärtext | `#71717A` | `#98989D` | Muted-Gray |
| Akzent (aktiv) | `#247065` | `#2DB5A3` | Reifes Teal |
| Akzent-hell (Hintergrund) | `#E6F5F3` | `#153833` | |
| Abgehakt | `#6B8E7B` | `#7AAB96` | Muted Green |
| Löschen | `#C4504E` | `#E06A68` | Muted Red |

## Typografie

- **Inter** – einziger Typeface. Reiche Gewichte (400, 500, 600, 700) liefern die Hierarchie.
- **Maßstab:** 10 / 12 / 14 / 16 / 18 / 22 / 28 / 36. Kursorischer Rhythmus: 8px-Basis (8, 16, 24, 32, 40, 48).

## Struktur (Desktop)

```
┌────────────────────────────────────────────────────────────┐
│  ▎ PulseBoard                                             │  <-- dünner 3px-Akzent-Bar
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐                                │
│  │ Erled.│ │ Offen │ │ %-Zahl │  --> keine Karte, nur 3 Inline-Statistik-Blöcke
│  └──────┘ └──────┘ └──────┘                                │
│                                                             │
│  ──────────────────────────────────────────────────────────  │  <-- feine Trennlinie
│                                                             │
│  Kategorie  Kategorie  Kategorie                            │  <-- Filter (nicht Buttons)
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │ ☐ Aktivität                                           ││
│  │    Beschreibung                                         ││
│  └────────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────────┐│
│  │ ☑ Aktivität (strikethrough, ausgegraut)                  ││
│  └────────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────────┐│
│  │ ▎ Aktivität (neues Element, blau umrandet)                ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│                        +  (FAB: Aktivität hinzufügen)       │
└────────────────────────────────────────────────────────────┘

Tag-Navigation (oben links, unter Titel):
  ◀   25. September 2026   ▶
```

### Dark-Mode-Tipp

Standard ist "Licht" (Tag-Morgen). Dark-Mode kommt durch `prefers-color-scheme` oder einen Umschalter. Standard: Helle App.

### Ausschließungen (vermeiden)

- ❌ Warmes Creme + Terrakotta-Schriftart (trait 1)
- ❌ Neon-Akzent auf Schwarz (trait 2)
- ❌ 01 / 02 / 03 Zählmarker (trait 3)
- ❌ Einheitliche Radius-Karten + grauer Schatten + sanfter Gradient (trait 4)
- ❌ Gleicher Radius für jede Hierarchieebene
- ❌ ALL-CAPS-Eyebrows
- ❌ Monospace-Label
- ❌ Pfeil → am Ende des Buttons
- ❌ Shadrad-Kits, Copy-Paste-SaaS-Palette
- ❌ 1-sec-Motion-Sequence mit Hover-Effekten bei jeder Karte

### Emphasis

- Die erste interaktive Aktion ist das Anklicken des Buttons "+"; das leitet die Aktion ein.
- Der Fortschritt ist visuell: ein dünner Teal-Fortschrittsbalken über das Foto des Inhaltes.
- Die abgehakte Aktivität verschwindet nicht, sondern wird grau und durchgestrichen, bleibt aber sichtbar.

### Leere Zustände

- Keine Aufgaben → "Es ist ein ruhiger Morgen. Füge deine erste Aktivität hinzu."
- Kein Kategorie-Filter mit Daten → zeige alle.
- Wichtige Fehler (z.B. invalid JSON in localStorage) → "Daten konnten nicht geladen werden. Zurücksetzen?" (mit Button "Jetzt").

### Tastaturbedienung

- Tab-Navigation in der logischen Reihenfolge.
- Interaktive Elemente haben sichtbare Fokusringe mit `outline: 2px solid #247065; outline-offset: 2px;`.
- Enter und Leertaste schalten Checkboxen um.

### Responsive

- Desktop: 640–880px maximale Inhaltesbreite, statisch zentriert.
- Smartphone: volles Feld, Touch-Targets min. 44×44px.

## Technische Ziele

- Keinen Router verwenden – Zustand und Routing durch ein Button-Fenster und Tabs.
- Zustand: IndexedDB für Abfragen, aber localStorage als Hauptspeicher. Die Struktur ist versioniert.
- Vite + PWA (Service Worker, Manifest).
- Keine UI-Bibliothek (handwritten CSS).
- Vitest + Testing Library.
- ESLint + TypeScript strict.

## Struktur

```
├── public/
│   ├── manifest.json
│   └── favicon.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── ActivitiesPanel.tsx
│   │   ├── ActivityForm.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DayNavigator.tsx
│   │   └── CategoryFilter.tsx
│   ├── hooks/
│   │   ├── useActivities.ts
│   │   ├── useDayData.ts
│   │   └── useLocalStorage.ts
│   ├── lib/
│   │   ├── types.ts
│   │   ├── storage.ts
│   │   └── constants.ts
│   └── tests/
│       ├── useActivities.test.ts
│       ├── useDayData.test.ts
│       └── storage.test.ts
```
