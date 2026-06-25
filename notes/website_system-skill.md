# angelslove — Website System Documentation

> **Methodik-Hinweis:** Dieses Dokument basiert auf einer vollständigen Code-Analyse der live implementierten Website (`index.html`, `css/styles.css`, `js/main.js`, `js/*.js`, `admin/*`, `notes/*`, `Website/*/*.js` sowie der Supabase-Schema-Datei). Alle Aussagen sind **Beobachtungen aus dem tatsächlichen Code**, nicht Annahmen. Stellen, an denen eine Interpretation oder Begründung über das rein Beobachtbare hinausgeht (das "Warum"), sind explizit als solche markiert (🔎 *Interpretation*). Es gibt aktuell **keine Inhalte in der Live-Datenbank** (`projects-data.js` ist ein leeres Array, echte Projekte kommen aus Supabase) — alle Beispiele beziehen sich auf die Struktur/Logik, nicht auf konkrete, aktuell befüllte Projekte.

---

## Inhaltsverzeichnis

1. [Website Overview](#1-website-overview)
2. [Information Architecture](#2-information-architecture)
3. [User Flow Analysis](#3-user-flow-analysis)
4. [Design System](#4-design-system)
5. [Component Library](#5-component-library)
6. [Visual Language](#6-visual-language)
7. [Brand Identity](#7-brand-identity)
8. [Content Strategy](#8-content-strategy)
9. [Conversion System](#9-conversion-system)
10. [Responsive Design Analysis](#10-responsive-design-analysis)
11. [Reusable Design Rules](#11-reusable-design-rules)
12. [Development Guidelines](#12-development-guidelines)
13. [CI/CD Master Reference](#13-cicd-master-reference)

---

## 1. Website Overview

### Hauptzweck
angelslove ist die Portfolio- und Akquise-Website eines zweiköpfigen Kreativstudios (Film, Fotografie, Design/visuelle Kommunikation) aus der Schweiz. Die Seite dient drei Zwecken: Werk präsentieren (Projects, Creative Space), Studio/Personen vorstellen (About Us) und Anfragen generieren (Book Us / Contact). Ein eigenes Admin-Backend (Supabase-gestützt) erlaubt das Pflegen von Projekten, Anfragen und Analytics ohne Code-Zugriff.

### Zielgruppe
🔎 *Interpretation, abgeleitet aus Inhalt/Ton:* Potenzielle Auftraggeber aus Musik/Kreativbranche (Musikvideos als Kategorie-Beispiel im Admin-Formular), sowie allgemein Personen/Unternehmen, die Film-, Foto- oder Designleistungen beauftragen wollen. Sekundär: Branchenkollegen/Inspiration-Suchende (Creative Space als "lebendiges Archiv").

### Markenpositionierung
Reduziertes, hochwertiges Boutique-Studio mit zwei klar benannten Köpfen (lennyleisi, maxeno) statt anonymer Agentur-Fassade. Positionierung über Bildsprache und Handwerk, nicht über Textmenge — die Seite enthält bewusst wenig Fließtext.

### Tonalität
Deutsch, persönlich-direkt, ohne Floskeln. Eigenzitate der Gründer ("Den guten Seemann erkennt man im Sturm", "Le détail fait la perfection…") ersetzen klassische Mission-Statements. CTAs sind knapp und imperativ ("JETZT ANFRAGEN", "ABSENDEN").

### Kommunikationsstil
Kurze Sätze, wenig Fachjargon, persönliche Anekdoten in den Bios statt Leistungslisten. Großbuchstaben für Struktur (Nav, Labels, Headlines), Kleinbuchstaben für Menschen/Marke (Eigennamen, "angelslove").

### Emotionale Wirkung
Durch Vollbild-Video/Foto-Heros, Scroll-Reveals und sanfte Hover-Bewegung soll die Seite lebendig und filmisch wirken statt statisch-broschürenhaft — konsistent mit der Projektvorgabe "Lebendige Wirkung durch Bewegung und starke Bildsprache".

### Primäre User Goals
- Sich schnell einen Eindruck vom Stil/Können des Studios verschaffen (Creative Space, Projects).
- Ein bestimmtes Projekt im Detail ansehen (Video, BTS, Credits, Galerie).
- Die Personen hinter dem Studio kennenlernen (About Us).
- Kontakt aufnehmen / Anfrage stellen (Book Us).

### Primäre Business Goals
- Lead-Generierung über das Kontaktformular (Formspree + parallele Speicherung in Supabase `inquiries`).
- Markenwahrnehmung als hochwertiges, modernes Studio statt austauschbarer Freelancer.
- Eigenständige Pflege des Portfolios ohne Entwickler (Admin-Backend).
- Verständnis des Besucherverhaltens über eigenes, datensparsames Tracking (kein Drittanbieter-Cookie, anonyme Session-ID).

---

## 2. Information Architecture

### Technischer Aufbau
Die Website ist **eine einzige HTML-Datei** (`index.html`), keine Mehrseiten-Struktur im klassischen Sinn. Alle "Seiten" sind `<section>`/`<main>`-Blöcke mit `class="page"`, die per JavaScript (`js/main.js`, Funktion `showPage(id)`) ein- bzw. ausgeblendet werden. Navigation erfolgt über URL-Hashes (`#home`, `#projects`, …), die per `history.pushState` synchron gehalten werden — Vor-/Zurück-Buttons des Browsers funktionieren (`popstate`-Listener).

Ausnahme: `admin/index.html` ist eine eigenständige, separate HTML-Datei (eigenes Login, eigenes CSS/JS) und kein Teil der `.page`-Logik der Hauptseite.

### Sitemap

```
angelslove (index.html, Single-Page-App via Hash-Routing)
│
├── #home                  HOME           (Vollbild-Video, Logo, 2 CTAs)
│     └── (scrollt direkt weiter in) ──┐
│                                       ▼
├── #creative-space        CREATIVE SPACE (Masonry-Galerie, "Mehr laden")
│                            ↳ Klick auf Item → #project-detail (jeweiliges Projekt)
│
├── #projects              PROJECTS       (Filter, Suche, Projekt-Grid)
│     └── #project-detail  PROJECT DETAIL (dynamisch befüllt per openProject(id))
│            ↳ Video-Projekt: YouTube-Embed + BTS + Credits
│            ↳ Foto/Design-Projekt: Banner + Galerie + Meta
│
├── #about                 ABOUT US       (Hero-Foto, Intro, 2 Personenprofile)
│
├── #book                  CONTACT US     (Kontaktinfo + Formular, rot)
│     └── Erfolgsmeldung (Overlay, kein eigener Hash)
│
├── #impressum             IMPRESSUM      (Rechtliches, Link zu Admin)
│     └── admin/index.html  ADMIN-LOGIN → DASHBOARD (separate Datei, eigenes Auth)
│            ├── Projekte (CRUD)
│            ├── Anfragen (gelesen aus "inquiries")
│            └── Statistik (Charts aus "analytics_events")
│
└── lightbox (kein Hash, globales Overlay) — Vollbild für Galerie-/BTS-Bilder
```

### Navigationsmenü (Hauptseite)
Fixiertes Header-Grid (Logo | Links zentriert | Spacer), Reihenfolge der Links:

| Position | Label | Ziel | Anmerkung |
|---|---|---|---|
| Logo (links) | Schmetterlings-Bildmarke | `#home` | fungiert als Home-Button |
| 1 | CREATIVE SPACE | `#creative-space` | |
| 2 | PROJECTS | `#projects` | |
| 3 | ABOUT US | `#about` | |
| 4 | CONTACT US | `#book` | Hash-ID `book`, Label "CONTACT US" — bewusste Diskrepanz zwischen internem Namen ("Book Us") und sichtbarem Label |

Mobile: identische Linkliste in einem Vollbild-Overlay-Menü (`#mobile-menu`), per Hamburger-Icon (`#nav-toggle`) geöffnet.

**Impressum** ist *nicht* im Hauptmenü, sondern nur im Footer jeder Seite verlinkt — bewusste Trennung zwischen werbenden Kern-Seiten und Pflichtangaben.

### Footer-Struktur
Auf jeder klassischen Seite (Creative Space, Projects, Project Detail, About, Book, Impressum) identisch aufgebaut:

```
[© 2026 angelslove — all rights reserved]   [info@angelslove.ch]  [@angelslove.studio]  [Impressum]   [Bildmarke-Logo]
```

Reihenfolge: Copyright → E-Mail → Instagram → Impressum-Link → Logo. Farblich passt sich der Footer dem Seitenhintergrund an (z. B. weiß-transparent auf der roten Book-Us-Seite, gedimmt auf dunklen Seiten).

### Verlinkungen zwischen Seiten ("Page-Next"-Pattern)
Jede Hauptseite endet (vor dem Footer) mit einem klickbaren "Weiter zu …"-Block (`.page-next`), der linear zur nächsten Seite führt:

`Home → Creative Space → Projects → About Us → Contact Us`

Auf der Detailseite zeigt der Block stattdessen rückwärts: "Zurück zu Projects". Dieses Pattern ersetzt eine klassische Sitemap-Navigation durch eine geführte, lineare Erzähl-Reise.

### Content-Beziehungen
- **Projects** und **Creative Space** teilen sich dieselbe Datenquelle: Cover- und BTS-Bilder aus `PROJECTS` (Supabase-Tabelle `projects`) werden in Creative Space automatisch gemischt und als Galerie dargestellt; ein Klick führt direkt in die jeweilige Projekt-Detailseite (`openProject(id)`).
- **Project Detail** ist vollständig datengetrieben: kein statisches HTML pro Projekt, sondern ein generisches Template, das per `type` (`video` / `photo` / `design`) zwei unterschiedliche Layout-Modi rendert.
- **Admin** verwaltet exakt die Datenmenge, die auf der öffentlichen Seite konsumiert wird (1:1-Feldmapping project-form ↔ Supabase-Tabelle `projects`).

---

## 3. User Flow Analysis

### Einstiegspunkte
- **Homepage** (`/` bzw. `/#home`) — Standardeinstieg, da `init()` in `main.js` ohne Hash automatisch `home` zeigt.
- **Direktlinks per Hash** (`#projects`, `#about`, `#book`, …) — funktionieren dank `location.hash`-Auswertung beim Laden; teilbare Deep-Links möglich, allerdings ohne projektspezifischen Hash für `project-detail` (Detailseiten sind nicht direkt verlinkbar/bookmarkbar, da `openProject(id)` nur per Klick aus dem Grid erreichbar ist — 🔎 *Beobachtung, kein Deep-Link-Mechanismus für einzelne Projekte vorhanden*).
- **Social/Footer-Links** — Instagram (`@angelslove.studio`, zusätzlich personalisierte Profile `@lenny.leisi`, `@maxeno.art` auf About Us) und `mailto:info@angelslove.ch`.
- **Impressum → Admin-Login** — versteckter, aber bewusst zugänglicher Einstieg ins Backend für die Studio-Betreiber selbst.

### Flow A — Besucher → Home → Creative Space → Projekt → Kontakt
**Ziel:** Stil kennenlernen, ein konkretes Projekt vertiefen, Kontakt aufnehmen.
**Trigger:** Ankunft auf der Startseite, sofortiger Eindruck durch Vollbild-Video.
**Interaktionen:** Scrollen von Home direkt in Creative Space (technisch: beide Seiten bleiben gemeinsam im DOM gemountet und verhalten sich wie eine durchgehende Onepager-Strecke, siehe `FLOW_IDS = ['home', 'creative-space']`); Klick auf ein Bild im Masonry-Grid → `openProject(id)` → Project Detail.
**CTAs:** "INSPIRE ME" (Home, führt zu Creative Space) und "CONTACT US" (Home, direkt zu Book Us) als alternative Sofort-Abzweigung.
**Exit Points:** Footer-Links (Instagram, E-Mail) als Exit ohne Formular; oder Abbruch ohne Aktion (kein Exit-Intent-Mechanismus vorhanden).

### Flow B — Besucher → Projects → Projekt-Detail → Zurück → About Us → Kontakt
**Ziel:** Portfolio gezielt durchsuchen/filtern, danach Studio-Hintergrund prüfen, dann anfragen.
**Trigger:** Direkter Klick auf "PROJECTS" in der Navigation.
**Interaktionen:** Filter-Buttons (Alle/Video/Fotografie/Design) bzw. mobiles Dropdown; Live-Suche über Lupe-Icon (`projects-search`); Klick auf Karte → Detail; "Zurück zu Projects"-Block; linearer "Weiter zu About Us"-Block am Seitenende.
**CTAs:** Projekt-Karten selbst sind die Haupt-CTA (gesamte Karte klickbar, `role="button"`); am Ende von About Us zusätzlich "JETZT ANFRAGEN" (→ Book Us).
**Exit Points:** Footer; Lightbox-Schließen ohne Folgeaktion.

### Flow C — Besucher → About Us → Kontakt
**Ziel:** Vertrauen über die Personen aufbauen, dann direkt anfragen.
**Trigger:** Klick auf "ABOUT US" oder organischer Linearfluss vom vorherigen Block.
**Interaktionen:** Scroll durch Hero-Foto (mit Namensoverlay beider Gründer), Intro-Absatz, zwei Personenprofile mit Zitat + Instagram-Link.
**CTA:** "JETZT ANFRAGEN" (`.about__cta`, rot) sowie der lineare "Weiter zu CONTACT US"-Block.
**Exit Points:** individuelle Instagram-Profile (führen weg von der Seite, `target="_blank"`).

### Flow D — Besucher → Inspiration (Creative Space) → Projekt → (kein Rückweg zu Creative Space, sondern weiter zu Projects)
**Ziel:** Inspirationsgetriebene Entdeckung statt zielgerichteter Suche.
**Trigger:** Scroll von Home weiter nach unten, ohne aktiven Klick auf Navigation.
**Interaktionen:** "Mehr laden"-Button lädt clientseitig weitere Bilder nach (Batch-Größe 36, Limit 90 Items gesamt — siehe `CS_PAGE_SIZE`/`CS_CARD_LIMIT`); Klick auf beliebiges Bild → Projekt-Detail des zugehörigen Projekts.
**Exit Points:** Footer am Ende von Creative Space, oder Sprung über Navigation in andere Sektion.

### Flow E — Kontaktformular (Conversion-kritischer Pfad)
**Ziel:** Anfrage erfolgreich abschicken.
**Trigger:** "CONTACT US" in Nav, "JETZT ANFRAGEN" auf About Us, oder "CONTACT US" auf Home.
**Interaktionen:** 4 Pflichtfelder (Name, E-Mail, Betreff, Nachricht) mit Live-Validierung (Fehlerzustand wird beim Tippen automatisch wieder entfernt); Submit-Button wechselt zu "..." während des Sendens.
**Validierungslogik:** Name/Betreff/Nachricht = nicht leer; E-Mail = Regex-Check `^[^\s@]+@[^\s@]+\.[^\s@]+$`.
**Backend:** Doppelte Zustellung — primär an Formspree (`https://formspree.io/f/mlgkegka`), zusätzlich (nicht-blockierend, "best effort") ein Insert in die Supabase-Tabelle `inquiries`, damit die Anfrage auch im Admin-Dashboard sichtbar ist.
**Erfolgszustand:** Kreisförmiger Reveal-Overlay (`.success-overlay`), der sich vom exakten Klickpunkt des Absenden-Buttons aus ausbreitet (`clip-path: circle()`, Ursprung dynamisch per `--ox`/`--oy` gesetzt) — invertiertes Farbschema (weiß/rot statt rot/weiß) als visuelles Signal "Zustand gewechselt". Zwei Folge-CTAs: "ZUR STARTSEITE" / "ZURÜCK" (zur vorher besuchten Seite, gemerkt in `pageBeforeContact`).
**Exit Points:** Beide Overlay-Buttons, oder schließen des Tabs (kein expliziter Schließen-Button auf dem Overlay selbst).

---

## 4. Design System

### 4.1 Farben

Alle Farben sind als CSS-Variablen in `:root` definiert (`css/styles.css`, Zeilen 48–61). Es gibt **keine separaten Werte für Border/Hover/Overlay-Farben** als eigene Token — diese werden situativ aus den Basisfarben mit Transparenz (`rgba()`) abgeleitet.

| Token | Hex | RGB | Verwendung | Priorität |
|---|---|---|---|---|
| `--red` | `#e2073b` | 226, 7, 59 | Primärfarbe/Marken-Akzent: Logo (auf Home), aktive/Hover-Nav-Links, `.btn--red`, Section-Labels, Detail-Kategorie-Labels, Book-Us-Hintergrund, Required-Sternchen im Formular | **Primary** |
| `--black` | `#0e0e0e` | 14, 14, 14 | Haupttextfarbe, Hintergrund von Projects/Project-Detail (Dark-Theme-Bereiche), Image-Placeholder-Hintergrund | **Primary** |
| `--white` | `#ffffff` | 255, 255, 255 | Standard-Seitenhintergrund, Text auf dunklem/rotem Grund, Mobile-Menü-Hintergrund | **Primary** |
| `--grey-100` | `#f5f5f5` | 245, 245, 245 | Shimmer-Skeleton-Basis (Bild-Lazyload), Hover-Hintergrund von `.page-next`, leerer Galerie-Platzhalter | Secondary |
| `--grey-200` | `#e8e8e8` | 232, 232, 232 | Trennlinien: Nav-Border (scrolled state), Footer-Border, `.page-next`-Border, Impressum-Divider | Secondary |
| `--grey-400` | `#a0a0a0` | 160, 160, 160 | Sekundärtext: Footer-Copy/Links, Meta-Labels (Detail-Seite), Page-Next-Label, Instagram-Handle-Link | Secondary |
| `--grey-700` | `#444444` | 68, 68, 68 | Fließtext auf weißem Grund (Subtitles, Bios, Beschreibungen) | Secondary |

**Designregel (explizit, aus `notes/corporate-design.md` übernommen und im Code verifiziert):** Rot wird **nie** als großflächiger Hintergrund für inhaltstragende Bereiche verwendet außer auf der Kontaktseite (`#book`, bewusste CI/CD-Ausnahme laut Code-Kommentar "BOOK US — CI/CD red background"). Überall sonst ist Rot ein punktuelles Signal für Interaktivität (Hover, aktiver Zustand, Label).

**Kontext-Overlay-Farben (situativ, nicht tokenisiert):**
- Dunkle Bild-Overlays: `rgba(0,0,0,0.25–0.78)` als Gradient, je nach Hero (Home, About, Projects, Project-Detail-Banner).
- Such-/Filter-Borders auf dunklem Grund: `rgba(255,255,255,0.5–0.6)`.
- Lightbox-Hintergrund: `rgba(10,10,10,0.96)`.

### 4.2 Typografie

**Schriftfamilie:** Messina Sans, lokal per `@font-face` aus `.otf`-Dateien eingebunden (kein Web-Font-Service für die Hauptschrift). Verfügbare Gewichte: 300 (Light), 400 (Book), 450 (Regular), 600 (SemiBold), 700 (Bold), 900 (Black) — jeweils auch Italic-Varianten vorhanden, aber im aktuellen CSS nicht aktiv genutzt (🔎 *Beobachtung: Italic-Dateien liegen vor, werden aber an keiner Stelle im CSS referenziert — Reserve für zukünftige Verwendung*).

**Zusätzliche, optionale Display-Schriften** (nur für Projekt-**Titel**, nicht für UI-Text, eingebunden über Google Fonts): Instrument Serif, Syne Mono, Cormorant Garamond, Cinzel, Press Start 2P, Playfair Display SC, Rock Salt, Reenie Beanie, Julius Sans One, Libre Barcode 128, DotGothic16, Betania Patmos GuideLine, Lacquer, Codystar. Auswahl erfolgt **pro Projekt** im Admin-Backend (`window.TITLE_FONT_OPTIONS` in `js/title-fonts.js`) und wird sowohl auf der Projekt-Karte als auch auf der Detailseite per inline `style="font-family:…"` angewendet. Einzelne Schriften haben individuelle Größenkorrekturen im CSS, weil sie bei gleicher `font-size` optisch größer/kleiner wirken (z. B. Press Start 2P kleiner skaliert, Reenie Beanie größer skaliert — siehe `css/styles.css` Zeilen 853–881).

**Globale Tracking-Regel:** `--tracking-headline: -0.1em` — exakt die im Briefing geforderte Laufweite von -100 (entspricht -0.1em). Wird auf alle `h1`–`h4` sowie auf `.detail__title`, `.page-next__title`, `.about__hero-name`, `.detail__credit-name`, `.book__phone` angewendet.

| Texttyp | Tag/Klasse | Größe (fluid) | Gewicht | Case | Letter-Spacing | Farbe (Standard) |
|---|---|---|---|---|---|---|
| Hero-Headline | `h1` | `clamp(2.5rem, 7vw, 6rem)` | 700 | UPPERCASE | -0.1em | `--black` (kontextabhängig invertiert) |
| Section Title | `h2` | `clamp(1.8rem, 4vw, 3.5rem)` | 700 | UPPERCASE | -0.1em | `--black` |
| Card/Detail Title | `h3` bzw. `.project-card__title` / `.detail__title` | `clamp(1.2rem, 2.5vw, 2rem)` (h3) bzw. eigene clamp-Werte | 700 | UPPERCASE | -0.1em | weiß auf Bild-Overlay, rot für Kategorie |
| Paragraph | `p` | Basis (kein eigenes clamp) | 300 | normal | normal | `--grey-700` (auf weißem Grund) |
| Small Text / Labels | `.section__label`, `.detail__meta-label`, `.footer__copy` | 0.6–0.7rem | 600 | UPPERCASE | 0.15–0.25em | `--red` (Section-Label) bzw. `--grey-400` |
| Buttons | `.btn` | 0.7rem | 600 | UPPERCASE | 0.2em | variantenabhängig |
| Navigation | `.nav__link` | 0.7rem | 600 | UPPERCASE | 0.18em | weiß/schwarz (state-abhängig) |
| Eigennamen (Personen/Credits) | `.about__person-name`, `.detail__credit-name`, `.about__hero-name` | variabel | 400–700 | **lowercase** | -0.1em (wo Headline-Klasse) | `--black`/weiß |

**Mikrotypografie-Muster (durchgängig über die ganze Seite):** Jeder kleine UI-Text (Nav, Buttons, Section-Labels, Meta-Labels, Footer) folgt exakt demselben Dreiklang: Großbuchstaben + Gewicht 600 + Letter-Spacing 0.15–0.25em, Schriftgröße 0.6–0.7rem. Je kleiner die Schrift, desto größer das Letter-Spacing (kompensiert die geringere Lesbarkeit kleiner Großbuchstaben-Texte).

**Bewusster Kontrast (Designprinzip, im Code konsequent umgesetzt):** Struktur-/System-Text (Navigation, Headlines, Labels, Buttons) ist immer GROSS mit negativem oder weitem Letter-Spacing gesetzt; menschliche Namen (Personen, Credits, "angelslove" selbst) sind immer klein geschrieben (`text-transform: lowercase`). Dies entspricht exakt der Projektvorgabe "Namen und Firmennamen sollen vorne klein geschrieben sein" und "Navigation und Headlines in Grossbuchstaben".

**Lesbarkeit:** Fließtext durchgehend mit `line-height: 1.7` (Basis) bzw. bis zu 1.85 bei Beschreibungstexten auf Bildhintergrund (`.detail__desc`, `.detail__gallery-desc`) — höhere Zeilenhöhe kompensiert geringeren Kontrast auf Bild/Dunkel-Hintergrund. Maximale Textbreiten werden konsequent über `max-width` begrenzt (z. B. `.about__intro` 720px, `.cs__subtitle` 500px, `.detail__gallery-desc`/`.detail__banner-text` 680px) statt volle Containerbreite — verhindert zu lange Zeilen.

### 4.3 Spacing-System

**Section-Padding (vertikal):** `clamp(5rem, 10vw, 10rem)` als generelle `.section`-Basisregel — sehr großzügig, skaliert aber mit Viewport-Breite statt fix zu sein.

**Section-Padding (horizontal):** `clamp(1.5rem, 4–5vw, 5–6rem)` als wiederkehrendes Muster über praktisch alle Content-Container (`.cs__header`, `.projects__body`, `.about__content`, `.book__inner`, `.detail__content`, Footer).

**Rhythmik-Tabelle (aus dem Code extrahiert):**

| Abstand | Wert | Wo |
|---|---|---|
| Zwischen Sektionen (Page-Next-Block) | `clamp(4rem, 8vw, 7rem)` margin-top | Übergang zur nächsten "Seite" |
| Zwischen Headline-Block und Folgeinhalt | `clamp(2.5rem, 5vw, 5rem)` (`.cs__header`) bis `clamp(5rem, 9vw, 9rem)` (`.about__intro`) | je nach Seite unterschiedlich gewichtet |
| Zwischen Titel und Subtitle/Text | `1.2rem`–`2rem` | `.cs__subtitle`, `.about__intro h1` |
| Zwischen Cards (Projects-Grid) | `clamp(1.25rem, 2.5vw, 2rem)` | `.projects__grid` gap |
| Zwischen Creative-Space-Items | `0.75rem` (Desktop), `0.5rem` (Mobile ≤600px) | `.cs__grid`/`.cs__column` gap |
| Innerhalb Detail-Meta-Block | `1.75rem` zwischen Items | `.detail__meta-list` gap |
| Footer-Innenabstand | `3rem` vertikal | `.footer` padding |
| Nav-Innenabstand horizontal | `clamp(1.5rem, 4vw, 4rem)` | `.nav` padding |

🔎 *Interpretation:* Die durchgehende Verwendung von `clamp()` statt fixer Pixelwerte ist das zentrale Mittel, mit dem "viel White Space" responsiv funktioniert, ohne auf jedem Breakpoint einzeln nachjustiert werden zu müssen — Abstände schrumpfen organisch mit der Viewport-Breite.

### 4.4 Layout-System

**Grid-Systeme (kontextabhängig, kein einheitliches 12-Spalten-Grid):**
- Navigation: 3-Spalten-Grid `auto 1fr auto` (Logo | Links | Spacer).
- Project-Cards: `repeat(auto-fill, minmax(min(320px, 100%), 1fr))` — selbstorganisierendes Grid ohne feste Spaltenzahl.
- Detail-Body (Video-Projekte): `1.4fr 1fr` (Beschreibung breiter als Meta-Spalte).
- Book-Us-Formular-Bereich: `1fr 1.4fr` (Formular breiter als Kontaktinfo).
- About-Us-Personen: `1fr 1fr` (gleich breite Spalten).
- Detail-Galerie (Design-Typ): `repeat(3, 1fr)` festes Crop-Raster; Detail-Galerie (Foto-Typ): CSS `columns: 3` (echtes Masonry, unbeschnittene Bildverhältnisse).
- Creative Space: **kein** CSS-Grid/Columns, sondern echte, per JavaScript erzeugte Spalten-`<div>`s (`.cs__column`), um beim Nachladen ("Mehr laden") ein Neu-Balancieren der Spalten zu verhindern (Karten bleiben an ihrer Position).

**Max-Widths:**
- Impressum-Inhalt: `max-width: 760px`, zentriert.
- Textblöcke: 500–720px je Kontext (siehe Typografie-Tabelle).
- Sonst: kein globaler Site-Container mit fixer Max-Breite — Sektionen sind durchgehend `100%` breit mit responsivem Innenabstand (`clamp()` statt fixer Container).

**Responsive Breakpoints (vollständige Liste aus dem CSS):**

| Breakpoint | Typ | Wirkung |
|---|---|---|
| `max-width: 900px` | Tablet | Detail-Body wird 1-spaltig, About-People-Gap reduziert, Book-Body 1-spaltig, Detail-Galerie 2-spaltig/2-Columns |
| `max-width: 600px` | Mobile | `--nav-h` auf 60px, Desktop-Nav-Links ausgeblendet → Hamburger, Projects-Grid 1-spaltig, Filter-Buttons → Dropdown, About-People 1-spaltig, Footer wird vertikal gestapelt |
| `max-height: 700px` | niedrige Viewports (z. B. Querformat-Handys) | Home-Logo verkleinert, CTA-Abstand reduziert |
| `max-height: 480px` | sehr niedrige Viewports | Home-Logo weiter verkleinert, CTA-Buttons kompakter (kleinere Schrift/Padding) |

🔎 *Beobachtung:* Es gibt **zwei orthogonale Breakpoint-Achsen** — Breite (Layout/Spalten) und Höhe (Home-Hero-Skalierung). Das ist ein bewusstes Pattern, um auf kurzen Viewports (z. B. Landscape-Phones) sicherzustellen, dass die Home-CTAs ohne Scrollen sichtbar bleiben.

---

## 5. Component Library

### 5.1 Header / Navigation (`.nav`)
**Zweck:** Globale, immer fixierte Orientierung + Home-Rücksprung.
**Aufbau:** 3-Spalten-Grid, Logo-Bildmarke (Schmetterling, 34×34px) links als Home-Link, vier Textlinks zentriert, rechter Spacer zur optischen Balance (identische Breite wie Logo), Hamburger nur mobil sichtbar.
**Varianten:**
- `.nav--dark`: transparent, weiße Links — über Vollbild-Medien (Home, About-Hero, Projects-Hero, Project-Detail).
- `.nav--scrolled`: weißer Hintergrund (97% Opazität) + 14px Backdrop-Blur, schwarze Links — Standard-Subpage-Zustand.
- Seitenspezifische Scrolled-Overrides: rot auf Book-Us (`body.is-book`), near-black auf Projects/Project-Detail (`body.is-projects`).
**Zustände:** `.active`/`:hover` auf Links → Farbe wechselt zu Rot + Unterstreichung wächst von 0 auf 100% Breite (`::after`-Pseudoelement, `width`-Transition). Logo-Filter wechselt situativ zwischen normal/invertiert/rot (`body.is-home`).
**Responsive:** ≤600px verschwinden die Inline-Links komplett, Hamburger-Icon erscheint, öffnet `.nav__mobile` als fullscreen Fade+Stagger-Overlay (keine Kreis-Animation, das ist dem Kontaktformular-Erfolg vorbehalten).
**Designregel:** Logo bleibt immer 34px, unabhängig vom Nav-Zustand — einzige fixe (nicht-fluid) Komponentenmaßgabe im gesamten Header.

### 5.2 Mobile Menu (`.nav__mobile`)
**Zweck:** Vollbild-Navigationsersatz auf kleinen Screens.
**Aufbau:** Weißer Vollbild-Overlay, zentrierte, große (1.5rem) Links, gestaffelte Eingangsanimation (jeder Link 70ms später als der vorherige, via `transition-delay`).
**Zustände:** `.open`-Klasse steuert Opacity/Visibility/Pointer-Events; Hamburger transformiert sich gleichzeitig zu einem X (`rotate(45deg)`/`rotate(-45deg)` auf den äußeren Strichen, mittlerer Strich faded aus).

### 5.3 Hero Section (kontextabhängige Variante, kein einzelnes Component, aber wiederkehrendes Pattern)
**Zweck:** Sofortiger visueller Eindruck beim Seiteneinstieg.
**Varianten:**
- **Home:** Vollbild-Video (lokal, `<video autoplay muted loop>`), dunkles Overlay (`rgba(0,0,0,0.45)`), zentriertes Logo, CTAs unten verankert.
- **About Us:** Vollbild-Foto beider Gründer, Gradient-Overlay, beide Namen unten links/rechts verankert mit Rollenbezeichnung.
- **Projects:** Sticky (nicht fixed — technische Notwendigkeit wegen Transform auf `.page`), zufälliges Projekt-Cover, fadet beim Scrollen zu Schwarz statt sich zu bewegen (Scroll-Listener `onProjectsHeroScroll`, 90% Viewport-Höhe Fade-Distanz).
- **Project Detail (Foto/Design):** Banner mit Titel-Overlay unten links, fadet nach unten zur Seitenfarbe aus, direkt gefolgt von der Galerie (kein Leerraum).
**Designregel:** Jeder Hero nutzt denselben Grundbaustein — Vollbild-Medium + Gradient-Overlay (Lesbarkeits-Sicherung) + Text/Logo-Overlay verankert an einer Kante. 🔎 *Interpretation:* Dieses wiederkehrende Pattern ist die zentrale Umsetzung von "starker Bildsprache" und sollte bei neuen Seiten zwingend wiederverwendet werden, statt ein neues Hero-Konzept zu erfinden.

### 5.4 Project Cards (`.project-card`)
**Zweck:** Portfolio-Überblick im Grid, Eintrittspunkt zur Detailseite.
**Aufbau:** Flush-Bild (kein weißes Kartenpanel), 3:2-Aspect-Ratio-Thumbnail, Typ-Label oben links (mix-blend-mode: difference — funktioniert auf jedem Bildhintergrund ohne zusätzliche Box), Kategorie + Titel als Gradient-Overlay unten.
**Variationen:** Titel kann optionale Display-Schriftart tragen (`data-title-font`), mit individuellen Größenkorrekturen je Schriftart.
**Zustände:** `.revealed` (Scroll-Reveal-Eintritt), `:hover` → Karte skaliert 1.015×, Bild im Inneren zusätzlich 1.04× (doppelte, leicht unterschiedliche Scale-Werte für Tiefenwirkung), Shadow verstärkt sich.
**Responsive:** Grid wird bei kleinen Screens automatisch 1-spaltig (`auto-fill`-Mechanik, kein expliziter Media-Query nötig außer für die Filterleiste).
**Designregel:** Titel ist immer einzeilig, lange Titel werden mit Ellipsis abgeschnitten statt die Karte zu verlängern — Kartenhöhe bleibt im Grid konsistent.

### 5.5 Filter & Suche (`.projects__filters`, `.projects__search`)
**Zweck:** Portfolio nach Typ filtern bzw. per Freitext durchsuchen.
**Aufbau:** Desktop: 4 rechteckige Outline-Buttons (Alle/Video/Fotografie/Design) + rechtsbündige, einklappbare Lupen-Suche. Mobile: Buttons werden durch ein randloses Dropdown ersetzt, Suche bleibt als reine Lupe ohne Box.
**Zustände:** `.active` (Filter, rote Füllung), `.is-open` (Suchfeld, expandiert von 0 auf `clamp(160px, 30vw, 240px)` Breite mit Opacity-Fade); Icon wechselt zwischen Lupe/Kreuz je nach offen/geschlossen.
**Designregel:** Keine abgerundeten Ecken auf Filter-Buttons (sharp, rectangular) — konsistent mit dem generellen Minimal-Eckenradius-Prinzip der Seite (einzige Ausnahme: Project-Card mit 3px Radius).

### 5.6 Buttons (`.btn`)
**Zweck:** Einheitliches CTA-System für die gesamte Seite.
**Aufbau:** Großbuchstaben, 0.7rem, Gewicht 600, Letter-Spacing 0.2em, Padding `1rem 2.5rem`, 1.5px Border (kein Fill im Ruhezustand außer `--red`-Variante).
**Variationen:**

| Klasse | Ruhezustand | Hover | Einsatzort |
|---|---|---|---|
| `.btn--white` | weißer Text/Rand, transparent | weiße Füllung, schwarzer Text | Home ("INSPIRE ME") |
| `.btn--red` | weißer Text, roter Fill | transparent, roter Text | Home ("CONTACT US"), About ("JETZT ANFRAGEN") |
| `.btn--outline` | schwarzer Text/Rand | schwarze Füllung, weißer Text | Impressum ("Admin-Login") |
| `.btn--book` | weißer Text/Rand | weiße Füllung, roter Text | Kontaktformular ("ABSENDEN") |
| `.btn--overlay` | roter Text/Rand | rote Füllung, weißer Text | Erfolgsmeldung-Overlay |

**Designregel (konsequent über alle Varianten):** Outline-Look in Ruhe, **invertierter Fill** beim Hover — niemals ein zusätzlicher Farbton, nur Tausch von Vordergrund/Hintergrund der bereits vorhandenen zwei Farben der jeweiligen Variante.

### 5.7 Forms / Inputs (`.form-field`)
**Zweck:** Kontaktaufnahme.
**Aufbau:** Transparente Inputs ohne Box, nur Unterstrich (`border-bottom`), Label klein/Großbuchstaben/grau darüber, Pflichtfeld-Sternchen rot.
**Zustände:** `:focus` → Unterstrich wird weiß/voll deckend; `.has-error` → Unterstrich wird heller/deckender + Fehlertext erscheint darunter (initial `display:none`, wird erst bei Fehler eingeblendet — kein Layout-Sprung im Normalfall, da der Platz erst bei Bedarf entsteht).
**Sonderfall Autofill:** Explizites Overriding der Browser-Autofill-Styles (Chrome/Safari würde sonst eine weiße Box hinter ausgefüllten Feldern zeigen), damit das transparente Design erhalten bleibt.
**Designregel:** Formulare haben **keine** umschließende Box/Card — sie liegen frei auf dem roten Seitenhintergrund, einzig durch die Linien strukturiert. Dies unterscheidet sie bewusst von "Standard-Formular"-Optik.

### 5.8 Contact Section (`#book`)
**Zweck:** Conversion-Endpunkt.
**Aufbau:** Zweispaltig — links statische Kontaktinfo (Telefon, Antwortzeit-Versprechen, E-Mail, Instagram, mit dezenten Trennstrichen), rechts das Formular.
**Besonderheit:** Einzige Seite mit vollflächigem `--red`-Hintergrund (CI/CD-Ausnahme, im Code explizit kommentiert).
**Zustand:** Erfolgsmeldung als kreisförmiges Reveal-Overlay (`.success-overlay`), Ursprung exakt am Klickpunkt des Submit-Buttons, invertiertes Farbschema.

### 5.9 Gallery / Masonry-Elemente
**Creative Space (`.cs__grid`):** JS-generierte Spalten (2/3/4 je Breakpoint), zufällig durchmischte Bilder (Cover + BTS aller Projekte), 4 wechselnde Seitenverhältnisse (4:3, 3:4, 1:1, 16:9) pro Spalte gleichmäßig verteilt (eigener Queue-Algorithmus, damit Spaltenenden nicht zu unterschiedlich hoch werden). Shimmer-Skeleton-Ladezustand pro Bild (`.cs__img-wrap`/`is-loaded`-Klasse beim `onload`). Caption unten links im Bild selbst, `mix-blend-mode: difference` (kein zusätzlicher Hintergrund nötig).
**Project-Detail-Galerie (Foto-Typ, `.detail__gallery--masonry`):** CSS-`columns`, unbeschnittene, native Seitenverhältnisse — bewusster Unterschied zu Design-Typ (festes Crop-Raster `repeat(3,1fr)`), weil Fotografie als Disziplin ihre Bildkomposition nicht verlieren soll.
**BTS-Grid (Video-Typ):** Festes 2×2-Grid, 4:3 Aspect-Ratio, max. 4 Bilder.

### 5.10 Lightbox (`.lightbox`)
**Zweck:** Vollbild-Betrachtung von Galerie-/BTS-Bildern.
**Aufbau:** Globales Fixed-Overlay (`rgba(10,10,10,0.96)`), zentriertes Bild (`object-fit: contain`), Prev/Next-Pfeile, Close-Button.
**Interaktionen:** Tastatur (Escape/←/→), Touch-Swipe (Schwellwert 50px), Klick außerhalb des Bildes schließt.
**Designregel:** Wird sowohl von Foto/Design-Galerien als auch von Video-BTS-Grids gemeinsam genutzt — ein einziges, wiederverwendbares Overlay statt mehrerer spezialisierter Modals.

### 5.11 Page-Next-Navigation (`.page-next`)
**Zweck:** Erzeugt einen linearen "nächste Seite"-Lesefluss am Ende jeder Hauptseite.
**Aufbau:** Flex-Reihe, Label klein/grau ("Weiter zu"), großer Headline-Titel der Zielseite, Pfeil rechts.
**Zustand:** `:hover` → Hintergrund hellt leicht auf, Titel + Pfeil färben sich rot, Pfeil verschiebt sich 8px nach rechts.
**Variante:** Auf der Detailseite umgekehrt (Pfeil gespiegelt, Text rechtsbündig, Label "Zurück zu").

### 5.12 Footer (`.footer`)
**Zweck:** Wiederkehrender Pflicht-Abschluss jeder Seite (Kontakt, Impressum, Branding).
**Aufbau:** Flex-Reihe (Copyright | Links-Gruppe | Logo), auf Mobile vertikal gestapelt.
**Designregel:** Farblogik folgt immer dem Seitenkontext (gedimmtes Grau auf Weiß, halbtransparentes Weiß auf Rot/Dunkel) — nie ein fester Footer-Farbwert unabhängig vom Träger.

### 5.13 Admin-Dashboard-Komponenten (separates System, `admin/`)
Eigenständiges, funktional getrenntes UI (eigenes `admin.css`, `admin.js`) mit: Login-Screen, Sidebar-Navigation (Projekte/Anfragen/Statistik), Projekt-Formular-Modal (inkl. Font-Picker mit Live-Vorschau, Drag&Drop-sortierbare Galerie-Uploads, Credits-Zeilen mit Rollen-/Namens-Presets via `<datalist>`), KPI-Karten + Chart.js-Diagramme in der Statistik-Ansicht. 🔎 *Beobachtung:* Das Admin-Backend übernimmt bewusst nicht das visuelle CI der Hauptseite 1:1 (eigenes CSS), da es ein reines Arbeitswerkzeug für die Studio-Betreiber ist, kein nach außen gerichtetes Markenerlebnis — sollte aber bei Weiterentwicklung nicht zu stark von der Kernpalette (Rot/Schwarz/Weiß) abweichen.

---

## 6. Visual Language

### Bildsprache
- **Bildtypen:** Vollbild-Video (Home), Porträtfoto beider Gründer (About), projektbezogene Cover-/BTS-/Galeriebilder (Fotografie, Film-Set, Design).
- **Farbgebung/Kontrast:** Durchgängig dunkle Overlays auf hellen/bunten Originalbildern zur Textlesbarkeit — kein einheitlicher Filter/Grading über alle Bilder im Code erzwungen (🔎 *Beobachtung: Farbkonsistenz der Bilder selbst liegt in der Verantwortung des hochgeladenen Materials, nicht der Website-Logik*).
- **Komposition:** Vollflächig, randlos ("full-bleed") bei Heroes; Karten/Galerien immer mit `object-fit: cover` (Crop-Toleranz) außer in der Foto-Masonry-Galerie, die explizit unbeschnitten bleibt.

### Icons
**Stil:** Nur zwei Custom-SVG-Icons im gesamten Frontend verwendet — Lupe und Kreuz für die Projektsuche (`viewBox 24×24`, `stroke="currentColor"`, 2px Strichbreite, abgerundete Linecaps). Kein Icon-Set/-Library eingebunden.
**Größe:** 15×15px (Inline-SVG-Attribute).
**Einsatzregel:** Icons erben Farbe via `currentColor`/`stroke` und reagieren dadurch automatisch auf Hover-Farbwechsel (Rot) — keine separate Icon-Farblogik nötig.

### Grafische Elemente
- **Linien:** Sehr dünne Trennstriche (1–1.5px) für Footer, Nav-Border, Dividers (`.book__divider`, `.impressum__divider`) — nie dicker als 1.5px irgendwo im System.
- **Formen:** Keine dekorativen geometrischen Formen (Kreise, Blobs) außer der funktionalen Kreis-Reveal-Animation des Erfolgs-Overlays.
- **Overlays:** Lineare Gradients von transparent zu schwarz (0–100% je nach Kontext), nie radiale Gradients außer dem Such-Erfolgs-Clip-Path.
- **Blur:** Ausschließlich auf der gescrollten Navigation (`backdrop-filter: blur(14px)`) — kein Glassmorphism an anderer Stelle.
- **Schatten:** Nur auf Project-Cards (`box-shadow: 0 1.5rem 3rem rgba(0,0,0,0.22)`, verstärkt sich beim Hover) — sonst durchgehend schattenfrei (flaches, kantiges Design).
- **Eckenradius:** Praktisch 0 überall, einzige Ausnahme Project-Card mit 3px — bewusst minimal, kein "rundes" UI-Vokabular.

### Animationen
| Typ | Dauer/Timing | Wo |
|---|---|---|
| Standard-Übergang | `0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)` (`--transition`) | Farbwechsel, Border, Background — überall als Basis-Easing |
| Scroll-Reveal | `0.7s ease`, Y-Versatz 30–40px, gestaffelt (80ms pro Element via `IntersectionObserver`) | Alle `.reveal`/`.cs__item`/`.project-card`-Elemente |
| Hover-Scale (Bilder) | `0.5–0.6s ease`, Faktor 1.015–1.045 | Project-Cards, Creative-Space-Items, BTS-/Galerie-Bilder |
| Mobile-Menü-Open | `0.35s ease` (Fade) + gestaffeltes Link-Stagger (70ms Differenz) | `.nav__mobile` |
| Erfolgs-Overlay | `0.9s cubic-bezier(0.65,0,0.35,1)` Clip-Path-Expansion, Content-Fade mit 0.45s Delay | Kontaktformular-Erfolg |
| Hamburger → X | `0.35s cubic-bezier(0.65,0,0.35,1)` (Rotation), `0.25s ease` (Opacity) | Nav-Toggle |
| Page-Transition | `0.45s ease` (Opacity + TranslateY 12px) | Seitenwechsel via `showPage()` |
| Bild-Shimmer | `1.4s ease-in-out infinite` | Creative-Space-Lazyload-Skeleton |

**Designprinzip:** Es gibt **zwei Easing-Familien** — ein "weiches" Standard-Easing (`cubic-bezier(0.25, 0.46, 0.45, 0.94)`) für kontinuierliche State-Wechsel (Farben, Hover) und ein "schnelleres/snappier" Easing (`cubic-bezier(0.65,0,0.35,1)`) für sichtbare Reveal-/Reise-Animationen (Hamburger, Erfolgs-Kreis). 🔎 *Interpretation:* Diese Trennung sorgt dafür, dass alltägliche Hover-Effekte ruhig wirken, während besondere Momente (Formular-Erfolg) bewusst dynamischer/dramatischer animiert sind.

---

## 7. Brand Identity

### Persönlichkeit
Reduziert, präzise, selbstbewusst-leise. Zwei Gründer mit klar unterscheidbaren, aber gleichwertig präsentierten Rollen (DOP & Editor / Director & Designer).

### Werte
🔎 *Interpretation aus Content:* Handwerk vor Lautstärke ("Den guten Seemann erkennt man im Sturm"), Liebe zum Detail ("Le détail fait la perfection, et la perfection n'est pas un détail"), persönliche Verantwortung statt anonymer Agentur-Struktur.

### Tonalität
Deutsch mit persönlichen Fremdsprachen-Zitaten (Französisch) als Charakter-Element — kein durchgehend mehrsprachiger Seitenaufbau, sondern punktuelle, authentische Einsprengsel.

### Positionierung
Boutique-Studio, das Nähe zum Kunden ("Wir melden uns innerhalb von 24 Stunden", direkte Telefonnummer statt nur Formular) mit visueller Hochwertigkeit (Vollbild-Medien, präzises Typografie-System) kombiniert.

### Markenwirkung
Adjektive, die das System konsequent erzeugt: **reduziert, präzise, filmisch, hochwertig, persönlich, modern, dynamisch (durch Bewegung), klar strukturiert.**

### Zielgruppenansprache
Direkt, Du-Ansprache in Formularen ("Dein Name", "deine@email.ch"), aber Sie-Form an anderer Stelle nicht erkennbar verwendet (🔎 *Beobachtung: Formular nutzt informelles "Du", restlicher Seitentext bleibt überwiegend neutral/unpersönlich formuliert — leicht uneinheitlich, aber durchgehend nicht-distanziert*).

### Emotionale Wirkung
Bewegtbild + sanfte Mikrobewegungen sollen Lebendigkeit erzeugen, ohne unruhig zu wirken — alle Animationen sind gedämpft (kleine Scale-Faktoren, keine harten Sprünge, abgesehen vom bewusst dramatischen Erfolgs-Reveal).

---

## 8. Content Strategy

### Ton of Voice
Knapp, persönlich, unaufgeregt. Keine Superlative oder Marketing-Sprache ("der beste...", "revolutionär") an irgendeiner Stelle im Code gefunden.

### Satzlängen
Kurz bis mittel; Bio-Texte bestehen aus 2–3 Sätzen plus einem abschließenden Zitat. Überschriften sind grundsätzlich sehr kurz (1–4 Wörter, oft mit Zeilenumbruch `<br>` bewusst gesetzt, z. B. "Wir sind<br>angelslove.", "Lass uns<br>zusammenarbeiten.").

### Wortwahl
Handwerksbezogene, konkrete Begriffe (DOP, Editor, Gear, Cut & Color) statt abstrakter Buzzwords. Eigenname "angelslove" wird **immer klein geschrieben**, auch am Satzanfang ("Wir sind angelslove") — feste Markenregel.

### CTA-Stil
Imperativ, sehr kurz, immer in Großbuchstaben: "INSPIRE ME", "CONTACT US", "JETZT ANFRAGEN", "ABSENDEN", "MEHR LADEN" (de facto "Mehr laden" als Ausnahme — dieser Button ist **nicht** großgeschrieben im Markup, einzige Abweichung vom sonst durchgehenden Uppercase-Button-Pattern. 🔎 *Beobachtung: CSS erzwingt zwar `text-transform` nicht explizit auf `.cs__load-more`, sollte bei Konsistenzprüfung beachtet werden*).

### Überschriftenstil
Headline + ergänzender Lauftext-Untertitel als Standardmuster (Section-Label in Rot → H1 → kurzer Fließtext-Absatz). Wird auf jeder Hauptseite wiederholt (Creative Space, About, Book Us, Impressum).

### Storytelling-Muster
Personenbezogene Erzählung statt Leistungsliste: Statt "Wir bieten Video, Foto, Design" erzählt die Seite über **wer** diese Leistungen erbringt (zwei benannte Personen mit Bio, Zitat, Social-Link). Projekt-Erzählung erfolgt über Behind-the-Scenes-Material (zeigt Prozess, nicht nur Endergebnis).

**Regel für zukünftige Texte:** Neue Seiten/Sektionen sollten dem Muster **Rotes Label → kurze Großbuchstaben-Headline (max. 4 Worte, ggf. mit `<br>`) → kurzer Fließtext-Absatz in Grey-700 mit begrenzter max-width** folgen. Keine langen Marketing-Absätze; lieber mehr persönliche, konkrete Aussagen.

---

## 9. Conversion System

### CTA-Platzierungen
- **Home:** zwei gleichwertige CTAs direkt im ersten Bildschirm (kein Scrollen nötig).
- **About Us:** ein CTA am Ende des Inhalts, nachdem Vertrauen aufgebaut wurde (Personenprofile).
- **Jede Hauptseite:** linearer "Weiter zu …"-Block, der implizit zur nächsten Conversion-relevanten Seite führt (endet immer in Richtung Contact Us).
- **Projekt-Karten/Creative-Space-Items:** keine expliziten CTAs, aber jedes Bild ist klickbar (gesamte Fläche = CTA) — niedrige Eintrittsbarriere für Engagement.

### Kontaktmöglichkeiten
Drei parallele Kanäle, alle gleichzeitig auf der Book-Us-Seite sichtbar: Telefon (`tel:`-Link, aktuell ohne Nummer im `href`-Attribut hinterlegt — 🔎 *Beobachtung: `<a href="tel:" class="book__phone">+41 77 501 52 19</a>` — die Telefonnummer steht nur als Text da, der `tel:`-Link selbst ist leer, Klick würde also keinen Anruf auslösen*), E-Mail (reiner Text, kein `mailto:`-Link an dieser Stelle, im Gegensatz zum Footer, wo `mailto:info@angelslove.ch` korrekt verlinkt ist), Instagram (reiner Text, kein Link an dieser Stelle, im Gegensatz zum Footer-Instagram-Link). Formular als vierter, primärer Kanal.

### Vertrauenselemente
- Konkretes Antwortzeit-Versprechen ("Wir melden uns innerhalb von 24 Stunden").
- Echte Namen + Gesichter (Foto-Hero auf About) statt Stock-Bildsprache.
- Direkte persönliche Instagram-Profile (nicht nur ein Studio-Account) als Transparenz-Signal.
- Rechtliche Vollständigkeit (Impressum nach Schweizer Recht vorhanden, inkl. Haftungsausschluss/Urheberrecht).

### Social Proof
🔎 *Beobachtung:* Es gibt **keine** klassischen Social-Proof-Elemente (Testimonials, Logos von Kunden, Bewertungen, Followerzahlen) im aktuellen Code. Das Portfolio selbst (Projects/Creative Space) fungiert als impliziter Qualitätsbeweis.

### Lead-Generierung-Mechanismen
- Primär: Kontaktformular mit doppelter Persistenz (Formspree + Supabase `inquiries`), sodass keine Anfrage verloren geht, selbst wenn der externe Dienst ausfällt.
- Sekundär: Eigenes Analytics-System (`analytics_events`) erlaubt Nachverfolgung, welche Projekte/Seiten am meisten Engagement erzeugen — datenbasierte Optimierung künftiger Inhalte, ohne Drittanbieter-Tracking-Cookies.

🔎 *Warum das funktioniert (Interpretation):* Die niedrige Eintrittsbarriere (kein Pflicht-Login, kein Multi-Step-Funnel, nur ein Formular mit vier Feldern) minimiert Absprungpunkte; die sofortige, visuell auffällige Erfolgsbestätigung (Kreis-Reveal) gibt dem Nutzer unmittelbares positives Feedback, was Formular-Abbruchängste ("hat es wirklich funktioniert?") reduziert.

---

## 10. Responsive Design Analysis

### Desktop (>900px)
Volle Mehrspalten-Layouts (3–4 Spalten Creative Space, 3 Spalten Galerie, 2 Spalten About/Detail-Body/Book-Body), Filter als einzelne Buttons, Navigation komplett inline sichtbar, große Hero-Schriftgrößen (`clamp()`-Obergrenzen greifen).

### Tablet (600–900px)
Spaltenanzahl reduziert sich eine Stufe (Creative Space 3 statt 4, Detail-Galerie 2 statt 3), zweispaltige Layouts (Detail-Body, Book-Body, About-People) werden einspaltig, Navigation bleibt noch inline (Umbruch erst bei 600px).

### Mobile (≤600px)
- **Navigation:** komplette Umstellung auf Hamburger + Vollbild-Overlay-Menü; `--nav-h` schrumpft von 72px auf 60px.
- **Komponenten:** Filter-Buttons werden durch natives Dropdown ersetzt (kein Platz für 4+ Buttons nebeneinander), Suchfeld bleibt boxless.
- **Bildskalierung:** Home-Logo/CTA skaliert zusätzlich nach Viewport-**Höhe** (separate `max-height`-Breakpoints), nicht nur Breite — verhindert abgeschnittene CTAs auf kurzen Screens.
- **Typografie:** Schriftgrößen folgen durchgehend `clamp()`-Untergrenzen, zusätzlich einzelne harte Overrides (z. B. `.book__header h1` explizit auf `clamp(1.8rem, 9vw, 2.6rem)` verkleinert, da der generische H1-Wert auf Mobile zu groß für den zweizeiligen Titel wäre).
- **Galerie:** Fotografie-Masonry bleibt bewusst 2-spaltig (nicht 1-spaltig) auch auf kleinsten Screens, um den Bildcharakter nicht zu sehr zu verkleinern; Design-Galerie wird 1-spaltig.
- **iOS-Sonderfall:** Suchfeld-Schriftgröße explizit auf `16px` gesetzt, um das automatische Zoom-Verhalten von iOS Safari bei Fokus auf kleinere Inputs zu verhindern — 🔎 *technische Detailmaßnahme, kein gestalterisches Element, aber für Cross-Device-Konsistenz wichtig*.

### Allgemeines Verhalten über alle drei Stufen
Kein Layout-System wechselt abrupt — durch konsequente `clamp()`-Verwendung verändern sich die meisten Werte bereits kontinuierlich zwischen den Breakpoints, die Media Queries greifen nur dort ein, wo sich die **Struktur** (Spaltenzahl, Sichtbarkeit von Elementen) und nicht nur die **Größe** ändern muss.

---

## 11. Reusable Design Rules

Diese Regeln sind **explizit formuliert**, damit neue Seiten/Komponenten ohne Rückfrage zum bestehenden System passen.

1. **Neue Hauptsektion aufbauen:** Section-Label (rot, 0.65rem, 600, 0.25em Spacing) → H1/H2 (Uppercase, -0.1em Tracking) → optionaler Fließtext-Absatz (Grey-700, max-width begrenzt) → Inhalt → Page-Next-Block → Footer. Vertikales Section-Padding `clamp(5rem, 10vw, 10rem)`, horizontal `clamp(1.5rem, 4–5vw, 5–6rem)`.

2. **Neue Card gestalten:** Bild flush (kein weißes Panel um das Bild), Typ-/Status-Label via `mix-blend-mode: difference` statt zusätzlicher Box, Titel + Kategorie als Gradient-Overlay unten, Hover = sanfte Scale (1.015–1.045) + verstärkter Schatten, niemals harte Sprünge oder Rotation. Eckenradius maximal 3px, sonst 0.

3. **Neue Seite anlegen (im SPA-Modell):** Neuer `<section class="page" id="…">` Block in `index.html`, Eintrag in `PAGE_DISPLAY` (`main.js`) mit korrektem CSS-`display`-Wert, Nav-Verhalten festlegen (`setNavDark()` falls Vollbild-Hero, sonst `setNavScrolled()`), ggf. Body-Klasse für Sonderhintergrund (`is-book`/`is-projects`-Pattern als Vorlage), `theme-color`-Meta passend setzen.

4. **Neuen CTA gestalten:** Immer `.btn`-Basisklasse + eine der bestehenden Farbvarianten verwenden (niemals neue Button-Farbe ohne Rückbindung an Rot/Schwarz/Weiß einführen), Großbuchstaben + 0.7rem + 600 + 0.2em Tracking, Outline-Ruhezustand mit Fill-Invertierung beim Hover.

5. **Neues Projekt darstellen:** Strikt eines der drei Typen (`video`/`photo`/`design`) wählen — diese Entscheidung steuert automatisch das komplette Detail-Layout (Banner+Galerie vs. Video+BTS+Credits). Keine Mischformen im Datenmodell vorgesehen; ein Projekt mit sowohl Video als auch Foto-Galerie würde aktuell nicht unterstützt (🔎 *Beobachtung, ggf. zukünftige Erweiterung nötig*).

6. **Neue Typografie-Variante (z. B. weitere Display-Schrift für Titel):** Eintrag in `window.TITLE_FONT_OPTIONS` (`js/title-fonts.js`) ergänzen (value/label/family), Google-Fonts-Link in **beiden** HTML-Dateien (`index.html` UND `admin/index.html`) erweitern, bei deutlich abweichender visueller Größe einen `[data-title-font="…"]`-Override in `styles.css` ergänzen (Vorlage: Press Start 2P / Rock Salt / Reenie Beanie Beispiele).

7. **Farbeinsatz:** Rot bleibt Akzent, nicht Fläche — Ausnahme nur für die explizit als "CI/CD-Test" markierte Book-Us-Seite. Neue dunkle ("Dark-Theme")-Seiten folgen dem in Projects/Project-Detail etablierten Muster: `--black`-Hintergrund, weißer Text, Footer/Page-Next-Farben per `rgba(255,255,255,…)`-Abstufungen statt neuer Grau-Token.

8. **Bewegung:** Standard-Easing (`--transition`) für alle State-Wechsel verwenden; Reveal-Pattern (`.reveal`-Klasse + `IntersectionObserver`) für jedes neue Scroll-In-Element wiederverwenden, nicht neu erfinden. Gestaffeltes Erscheinen (80ms-Schritte) bei Listen/Grids beibehalten.

9. **Spacing:** Niemals fixe `px`-Werte für Section-/Content-Abstände verwenden — immer `clamp(min, präferiert-vw, max)`, angelehnt an die in Abschnitt 4.3 dokumentierten Wertebereiche.

10. **Eigennamen vs. System-Text:** Jeder neue Text, der eine Person, Firma oder Marke benennt, wird klein geschrieben (`text-transform: lowercase`); jeder neue Navigations-, Label- oder Headline-Text wird groß geschrieben (`text-transform: uppercase`). Diese Regel hat im gesamten Code keine Ausnahme.

---

## 12. Development Guidelines

### Architekturmuster
**Single-Page-Application ohne Framework** — reines Vanilla JavaScript, kein Build-Step, kein Bundler, kein Component-Framework (React/Vue/etc.). Routing erfolgt manuell über URL-Hash + `history.pushState`/`popstate`. Seiten sind vorgerenderte, im DOM bereits vorhandene `<section>`-Blöcke, die per `display`-Toggle gezeigt/verborgen werden (kein dynamisches Nachladen von HTML-Templates für die Hauptseiten — nur die *Inhalte* innerhalb der Seiten wie Projekt-Grid/Detail werden per JS aus Daten generiert).

### Datenfluss
```
Supabase (projects-Tabelle)
   → js/supabase-projects.js  (lädt async, ersetzt window.PROJECTS)
   → js/main.js                (buildProjectCards / buildCreativeSpace / buildProjectsHero
                                  lesen ausschließlich aus dem globalen PROJECTS-Array)
Website/PROJECTS/projects-data.js → liefert das initiale, leere Fallback-Array,
   falls Supabase nicht erreichbar ist (Offline-Sicherheit).
```
🔎 *Wichtige Designentscheidung:* Die Website funktioniert auch komplett ohne Backend-Verbindung (degradiert dann nur auf eine leere Projektliste) — es gibt keinen blockierenden Ladezustand/Spinner, der die Seite unbenutzbar macht.

### Naming Conventions
- **CSS:** BEM-ähnliches Schema mit doppeltem Unterstrich für Elemente (`.nav__link`, `.detail__credit-name`) und doppeltem Bindestrich für Modifier/Varianten (`.btn--red`, `.nav--scrolled`). Komponentenpräfixe sind kurz und sprechend (`cs__`, `detail__`, `book__`, `about__`).
- **IDs:** werden ausschließlich für JS-Hooks und Hash-Routing-Ziele verwendet (`id="home"`, `id="cs-grid"`), nie für Styling (kein `#id { … }` für visuelle Regeln außer seitenspezifischen Overrides wie `#book { background: var(--red); }`, die bewusst Seiten-Scoping statt Klassen nutzen).
- **JS-Funktionen:** sprechende, englische camelCase-Namen (`showPage`, `openProject`, `buildCreativeSpace`), Kommentare durchgehend auf Deutsch (Erklärung von Geschäftslogik/Entscheidungen für das Team).

### CSS-Struktur
Eine einzige globale Datei (`css/styles.css`, ~1860 Zeilen), in klar mit ASCII-Trennlinien-Kommentaren markierte Abschnitte gegliedert (`/* === NAVIGATION === */`, `/* === HOME === */`, …) statt einer Aufteilung in mehrere Dateien — bewusst monolithisch für einfaches Deployment ohne Build-Step. Variablen zentral in `:root`. Responsive Regeln am Ende der Datei gesammelt (nicht inline pro Komponente), gegliedert nach Breakpoint statt nach Komponente.

### Layout-Logik
Bevorzugt Flexbox für 1-dimensionale Anordnungen (Nav, Footer, Buttons, Form-Felder) und CSS-Grid für 2-dimensionale/Karten-Layouts (Project-Grid, About-People, Detail-Body). Masonry-Effekte werden je nach Anforderung unterschiedlich gelöst: CSS `columns` (Foto-Galerie, einfacher Fall ohne Nachladen) vs. echte JS-generierte Spalten-DOM-Elemente (Creative Space, weil inkrementelles Nachladen sonst bestehende Karten verschieben würde) — bewusste, kommentierte Technik-Entscheidung im Code.

### Responsiveness-Strategie
`clamp()` als Standardwerkzeug für fließende Skalierung; Media Queries nur für strukturelle Brüche (Spaltenzahl, Sichtbarkeit). `dvh`-Einheiten (`100dvh`, `92dvh`, `60dvh`) statt `vh` an allen Stellen verwendet, an denen mobile Browser-UI (Adressleiste etc.) sonst Sprünge verursachen würde — durchgehend mit `vh`-Fallback davor für ältere Browser. `env(safe-area-inset-…)` wird für Notch/Home-Indicator-sichere Positionierung von Nav und Home-CTAs verwendet.

### Datenmodell (Supabase, aus `notes/supabase-schema.sql`)
- **`projects`**: `id, type(video|photo|design), category, title, date, gear, long_desc, video, cover, bts(jsonb[]), credits(jsonb[]), published(bool)`. 🔎 *Beobachtung:* Im SQL-Schema fehlen die Felder `title_font` und `gallery`, die jedoch im JS (`supabase-projects.js`, `admin.js`) bereits aktiv gelesen/geschrieben werden (`row.title_font`, `row.gallery`) — das vorliegende `migration_add_gallery.sql` ergänzt vermutlich genau diese Lücke; bei künftigen Schema-Änderungen sollte das Basis-Schema entsprechend nachgezogen/dokumentiert werden, damit beide Dateien synchron bleiben.
- **`inquiries`**: `name, email, subject, message, is_read`. RLS: jeder darf einfügen, nur authentifizierte Nutzer dürfen lesen/verwalten.
- **`analytics_events`**: `event_type(pageview|dwell|click), page, session_id, referrer, device_type, dwell_seconds, target`. RLS: jeder darf einfügen (kein Login fürs Tracking nötig), nur authentifiziert lesbar.
- **Storage-Bucket `project-images`**: öffentlich lesbar, Schreiben/Ändern/Löschen nur authentifiziert.

### Security/Datenschutz-Pattern
Kein Cookie-Consent-Banner im Code gefunden — konsistent damit, dass kein Drittanbieter-Tracking (Google Analytics o. ä.) eingebunden ist; das selbstgebaute Tracking verwendet ausschließlich `sessionStorage` (verschwindet beim Schließen des Tabs) statt persistenter Cookies und erhebt laut Code-Kommentar bewusst keine IP-Adressen oder Namen.

---

## 13. CI/CD Master Reference

Diese Sektion fasst alle vorherigen Abschnitte als kompakte, direkt nutzbare Markenrichtlinie zusammen.

### Markenkern
- Name **immer** klein geschrieben: „angelslove" — auch am Satzanfang.
- Ein Studio, zwei sichtbare, namentlich genannte Köpfe statt anonymer Agentur-Stimme.

### Farben (verbindlich)
| Rolle | Hex |
|---|---|
| Primär/Akzent | `#e2073b` |
| Text/Dark-Flächen | `#0e0e0e` |
| Hintergrund/Text auf Dunkel | `#ffffff` |
| Helle Fläche/Skeleton | `#f5f5f5` |
| Trennlinie | `#e8e8e8` |
| Sekundärtext | `#a0a0a0` |
| Fließtext auf Weiß | `#444444` |

Regel: Rot = Akzent/Interaktion, nie Fläche (Ausnahme einzig Contact-Us-Seite).

### Typografie (verbindlich)
- Schrift: **Messina Sans** (lokal, kein Web-Font-Dienst), Gewichte 300/400/450/600/700/900.
- Headlines (`h1`–`h4`): Großbuchstaben, Gewicht 700, Letter-Spacing **−0.1em** ("Laufweite −100"), Zeilenhöhe 1.05.
- UI-Mikrotext (Nav, Buttons, Labels): Großbuchstaben, Gewicht 600, Letter-Spacing 0.15–0.25em, 0.6–0.7rem.
- Eigennamen/Marke: immer Kleinbuchstaben.
- Optionale Display-Schriften nur für Projekt-Titel, zentral verwaltet in `js/title-fonts.js`.

### Komponenten (verbindlich)
- Buttons: Outline-Ruhezustand, Fill-Invertierung beim Hover, vier Farbvarianten (weiß/rot/outline/book), nie neue Farbe einführen.
- Karten: flush, randlos, Gradient-Caption-Overlay, max. 3px Eckenradius.
- Heroes: Vollbild-Medium + Gradient-Overlay + verankerter Text/Logo-Overlay als Wiederholungsmuster für jede neue Hero-Sektion.

### Bildsprache
Vollflächig, dunkles Overlay zur Lesbarkeit, Crop via `object-fit: cover` außer bei Fotografie-Galerien (dort unbeschnitten/Masonry).

### Tonalität
Deutsch, persönlich-direkt, kurze Sätze, Zitate statt Mission-Statements, CTAs imperativ und kurz.

### Animationen (verbindlich)
- Standard-Easing: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`, 0.4s.
- Reveal-Pattern: Fade + 30–40px Y-Versatz, IntersectionObserver, 80ms-Staffelung.
- Hover-Scale: 1.015–1.045, niemals abrupt.
- Besondere Momente (Formular-Erfolg, Hamburger): schnelleres Easing `cubic-bezier(0.65,0,0.35,1)`.

### Layout-Regeln
- Section-Padding vertikal: `clamp(5rem, 10vw, 10rem)`.
- Section-Padding horizontal: `clamp(1.5rem, 4–5vw, 5–6rem)`.
- Textspalten: max-width 500–720px, nie volle Containerbreite.
- Eckenradius: 0, Ausnahme Project-Card (3px).
- Schatten: nur auf Project-Cards.

### Whitespace-Regeln
Immer `clamp()` statt fixer Werte; je kleiner der Viewport, desto enger (nie sprunghaft), Struktur ändert sich nur an den zwei definierten Breakpoints (900px, 600px) plus zwei Höhen-Breakpoints (700px, 480px) für die Home-Hero-Skalierung.

### Responsive-Regeln
Breakpoints: 900px (Tablet, Spaltenreduktion), 600px (Mobile, Nav-Umbau + Dropdown-Filter), zusätzlich `max-height`-Breakpoints für kurze Viewports. `dvh`-Einheiten + `safe-area-inset` für mobile Browser-Eigenheiten.

### Design-Prinzipien
1. Eine Akzentfarbe, sparsam eingesetzt.
2. Großbuchstaben für Struktur, Kleinbuchstaben für Menschen/Marke.
3. Viel Weißraum, generöses, fluid skalierendes Padding.
4. Bewegung als durchgehendes, aber gedämpftes Stilmittel.
5. Vollflächige Bildsprache als primärer Markenträger.
6. Konsistente Mikrotypografie für jeden UI-Text ohne Ausnahme.

### UX-Prinzipien
- Linearer, geführter Seitenfluss (Page-Next-Pattern) ergänzt klassische Navigation, statt sie zu ersetzen.
- Datengetriebene, generische Templates statt Einzelseiten pro Projekt — Konsistenz ist durch Code, nicht durch manuelle Disziplin erzwungen.
- Funktioniert robust auch ohne Backend-Verbindung (Fallback-Daten, keine harten Ladezustände).
- Conversion-Pfad ist immer maximal zwei Klicks von jeder Seite entfernt (Nav-Link „CONTACT US" oder Page-Next-Kette).

### Markenprinzipien
- Authentizität über Hochglanz-Anonymität: echte Namen, echte Zitate, direkte Telefonnummer.
- Werk spricht für sich: kein Social Proof/Testimonial-Apparat, Portfolio selbst ist der Beweis.
- Schweizer Rechtssicherheit (vollständiges Impressum) als stilles Vertrauenssignal.

---

## Offene Punkte / zu klärende Annahmen (für zukünftige Bearbeiter)

Diese Punkte sind **Beobachtungen von Inkonsistenzen im aktuellen Code**, keine Vermutungen über Absicht — sie sollten bei der nächsten Überarbeitung bewusst entschieden (behalten oder korrigiert) werden:

- `tel:`-Link auf der Kontaktseite ist leer (`href="tel:"`) — Klick löst keinen Anruf aus, obwohl die Nummer als Text sichtbar ist.
- E-Mail und Instagram-Handle in `.book__info` sind reiner Text ohne `mailto:`/Profil-Link, während dieselben Angaben im Footer korrekt verlinkt sind.
- `"Mehr laden"`-Button (Creative Space) ist im Markup nicht in Großbuchstaben geschrieben, weicht damit vom sonst durchgehenden Uppercase-Button-Standard ab.
- Supabase-Basis-Schema (`notes/supabase-schema.sql`) listet nicht die Felder `title_font` und `gallery`, die im Frontend/Admin bereits aktiv verwendet werden (vermutlich durch `supabase/migration_add_gallery.sql` ergänzt — beide Dateien sollten zusammengeführt/synchronisiert werden).
- Einzelne Projekte sind nicht per direktem URL-Hash teilbar/bookmarkbar (nur über Klick aus Grid/Creative-Space erreichbar).
- Italic-Schriftschnitte von Messina Sans liegen als Dateien vor, werden aber aktuell nirgends im CSS eingesetzt.
