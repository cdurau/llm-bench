# PulseBoard — Projektplanung

## Design-Konzept

**Stil:** Schweizer Typografie, clean, fokussiert, persönlich
**Farbschema:**
- Hintergrund: warmes Off-White (#F8F7F4)
- Text: tiefes Dunkelblau (#1A2B4A)
- Akzent: Koralle (#E86F4C) für Fortschritt
- Kategorie-Farben: gedeckte Pastelltöne

**Typografie:**
- Schrift: systemische Sans-Serif-Familie
- Starke Hierarchie durch Gewichtung und Größe
- Einbezogene Checkboxen als funktionale Elemente

**Layout-Prinzipien:**
- Content-forward, minimale Chrome
- Echte Checkboxen, keine dekorativen Symbole
- Klare Trennung zwischen Tätigkeitsliste und Dashboard
- Kategorie-Tags als Info, nicht als Dekoration

## Tech-Stack

- React 19 mit TypeScript
- Vite als Build-Tool
- TanStack Router für Navigation
- Zustand für State Management
- Vitest + React Testing Library für Tests
- localStorage für Persistenz (einfach, zuverlässig, kein Build-Problem)
- PWA mit Workbox für Caching

## Implementierungsphasen

### Phase 1: Fundament ✅
- Projektstruktur aufsetzen
- TypeScript, Vite, ESLint konfigurieren
- Dependencies installieren

### Phase 2: Kernfunktionalität
- Typen und Datenmodell
- Zustand Store mit Persistenz
- Aktivitäten CRUD (erstellen, bearbeiten, löschen)
- Tagesstatus-Tracking

### Phase 3: UI und UX
- Dashboard mit Fortschrittsanzeige
- Tagesnavigation (vorher/nachher/heute)
- Responsive Layout
- Dark Mode
- Empty States und Fehlermeldungen

### Phase 4: PWA
- Web App Manifest
- Service Worker mit Workbox
- Offline-Fähigkeit testen

### Phase 5: Qualität
- Unit Tests (Zustand, Datenoperationen)
- Integration Tests (komplette User Flows)
- Lint und Typ-Checking
- Production Build
