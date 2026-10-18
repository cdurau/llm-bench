## Arbeitsweise mit Jev (V2)

Du hast den **Jev-Skill** zur Verfügung (im Projekt installiert). Lade ihn und halte dich an seine Anleitung.

Jev ist ein schnelles Entscheidungsmodell für Ja/Nein-, Auswahl- und Score-Fragen. Nutze Jev gezielt zur Unterstützung deiner Entscheidungen und zur Überprüfung klar definierter Kriterien.

### Grundregeln

- Übergib Jev möglichst unverändertes Rohmaterial wie Quellcode, CSS-Werte, Konfigurationen und Feature-Anforderungen.
- Stelle konkrete, überprüfbare Fragen mit eindeutigen Bewertungskriterien.
- Nutze Jev für Entscheidungen und Bewertungen, nicht zur Generierung von Quellcode oder umfangreichen Erklärungen.
- Eine hohe Confidence bedeutet nicht automatisch, dass eine Bewertung korrekt ist.
- Bei Confidence unter 0,5 entscheide eigenständig oder überprüfe die Fragestellung mit einem geeigneteren Verfahren.

### Sinnvolle Einsatzbereiche

- Prüfen, ob im Code definierte Feature-Anforderungen berücksichtigt wurden.
- Vergleichen zweier konkreter Implementierungsvarianten.
- Bewerten von Verständlichkeit, Konsistenz und Wartbarkeit.
- Identifizieren möglicher Schwachstellen bei UI-Struktur und App-Navigation.
- Überprüfen klar formulierter Designregeln.

### Umgang mit Jev-Bewertungen

**Jev ist ein zusätzlicher Reviewer, keine alleinige Entscheidungsinstanz.**

- Behandle negative Bewertungen als Hinweise auf mögliche Probleme.
- Identifiziere vor Änderungen die konkrete Schwachstelle.
- Vermeide Refactorings, die ausschließlich der Verbesserung eines Jev-Scores dienen.
- Bewahre bereits funktionierendes Verhalten.
- Führe nach relevanten Änderungen geeignete Tests oder technische Prüfungen erneut aus.
- Frage Jev nicht mehrfach mit nahezu identischen Fragen, nur um eine bevorzugte Bewertung zu erhalten.

### Funktionalität hat Vorrang

Eine positive Jev-Bewertung beweist nicht, dass ein Feature tatsächlich funktioniert.

- Nutze TypeScript-Prüfungen, Build und geeignete Funktionstests als technische Nachweise.
- Überprüfe Persistenz, Streaks und Datumsberechnungen anhand konkreter Testfälle.
- Prüfe Kontrastverhältnisse möglichst rechnerisch.
- Bewerte einen App-Flow nicht nur anhand einer einzelnen Komponente, sondern berücksichtige Navigation, Zustandsänderungen und Datenfluss.

### Abschluss

Dokumentiere kurz:

- Anzahl der Jev-Aufrufe
- Wesentliche Entscheidungen, bei denen Jev geholfen hat
- Änderungen aufgrund negativer Jev-Bewertungen
- Nicht übernommene Jev-Empfehlungen und deren Gründe
- Verbleibende bekannte Fehler

Die Anwendung muss auch bei nicht verfügbarem Jev möglichst vollständig fertiggestellt werden.

---

## Bewertungsrubrik (für die Auswertung, nicht ins Modell geben)

Score je Kriterium 1 bis 5:

1. **Features:** Anzahl der 8 Features, die wirklich funktionieren
2. **Build & PWA:** Build läuft, installierbar, offline nutzbar
3. **Codequalität:** Struktur, Typisierung, Lesbarkeit
4. **Design:** Hierarchie, Weißraum, Konsistenz, Dark Mode
5. **Mobile & A11y:** Touch-Ziele, Kontrast, Fokus
6. **Agent-Verhalten:** Tool-Nutzung, Fehlerkorrektur, Selbstständigkeit
7. **Jev-Nutzung:** sinnvoll eingesetzt oder Alibi-Aufrufe (nur im Lauf mit Jev)
8. **Zeit / Tokens:** Dauer und Durchsatz (tok/s) für den Vergleich
9. **First-Pass Technical Quality:** Anteil der Kernfunktionen, die nach dem eigentlichen Build ohne Nutzerhinweise oder zusätzliche Reparatursessions tatsächlich funktionieren
10. **Repair Effort:** 5 = kaum oder keine zusätzliche Reparaturarbeit; 1 = viele zusätzliche Agenten-Runden, Bugfix-Sessions oder Nutzer-Bugreports bis zu einem brauchbaren Endzustand

Designqualität, First-Pass Technical Quality und Repair Effort werden getrennt ausgewiesen. Ein visuell stärkerer Endzustand mit hoher Nacharbeit ist ein anderes Ergebnis als eine optisch einfachere, aber technisch nahezu sofort funktionierende App.

Empfehlung: pro Modell zwei Läufe (ohne Jev, mit Jev), sonst identisch.
