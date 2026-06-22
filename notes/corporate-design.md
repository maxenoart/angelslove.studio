# angelslove — Corporate Design

Dieses Dokument fasst das Corporate Design der angelslove-Website zusammen, abgeleitet aus der aktuell implementierten `css/styles.css`. Es dient als Referenz für künftige Seiten, Komponenten und Marketingmaterial.

## 1. Markenkern

- **Name:** angelslove — immer klein geschrieben, auch am Satzanfang.
- **Wirkung:** modern, hochwertig, reduziert, mit starkem Bewegungs- und Bildfokus.
- **Grundprinzip:** viel Weißraum, klare Hierarchie, ein einziger Farbakzent (Rot) für Aufmerksamkeit.

## 2. Farben

| Token | Hex | Verwendung |
|---|---|---|
| `--red` | `#e2073b` | Primärfarbe / Akzent — Links (aktiv/hover), Buttons, Labels, Logo auf Home |
| `--black` | `#0e0e0e` | Haupttextfarbe, dunkle Flächen |
| `--white` | `#ffffff` | Hintergrund, Text auf dunklem Grund |
| `--grey-100` | `#f5f5f5` | Helle Flächen (z. B. Text-Kacheln im Grid) |
| `--grey-200` | `#e8e8e8` | Trennlinien (z. B. Nav-Border im gescrollten Zustand) |
| `--grey-400` | `#a0a0a0` | Sekundärtext, Captions, Meta-Labels |
| `--grey-700` | `#444444` | Fließtext / Subtitles auf weißem Grund |

Rot wird bewusst sparsam eingesetzt — als Signal für Interaktion (Hover, aktive Zustände) und für kleine Label-Akzente, nicht als Flächenfarbe.

## 3. Typografie

**Schriftart:** Messina Sans (Web, lokal über `@font-face` eingebunden).

Verfügbare Schnitte:

| Gewicht | Name | Verwendung |
|---|---|---|
| 300 | Light | — |
| 400 | Book | Standard-Fließtext (`body`, `p`) |
| 450 | Regular | — |
| 600 | SemiBold | Nav-Links, Buttons, Labels, Captions (alles in Großbuchstaben mit Letter-Spacing) |
| 700 | Bold | Headlines (h1–h4), Titel |
| 900 | Black | — |

Jeweils auch als Italic verfügbar (Light, Book, Bold, Black).

### Headlines

- `h1`–`h4`: **Großbuchstaben**, Gewicht 700, Letter-Spacing **-0.1em** (`--tracking-headline`), Zeilenhöhe 1.05.
- Größen (fluid via `clamp()`):
  - h1: `clamp(2.5rem, 7vw, 6rem)`
  - h2: `clamp(1.8rem, 4vw, 3.5rem)`
  - h3: `clamp(1.2rem, 2.5vw, 2rem)`
  - h4: `clamp(1rem, 1.8vw, 1.4rem)`

### Fließtext

- `p`: Gewicht 300, Zeilenhöhe 1.7.
- Subtitles/Description häufig in `--grey-700`, Größe ~1.05–1.15rem.

### Eigennamen / Firmennamen

- Personennamen und Credits werden **klein geschrieben** dargestellt (`text-transform: lowercase`), z. B. Credit-Namen im Projekt-Detail.
- Steht im Gegensatz zu Navigation/Headlines, die in Großbuchstaben gesetzt sind — das ist ein bewusster Kontrast: System-/Strukturtext groß, menschliche Namen klein.

### Mikrotypografie (Labels, Nav, Buttons, Captions)

Durchgängiges Muster für kleine UI-Texte:
- Großbuchstaben
- Gewicht 600
- Letter-Spacing 0.15–0.25em (je kleiner die Schrift, desto größer das Spacing)
- Schriftgröße 0.6–0.7rem

Beispiele: `.nav__link` (0.7rem, 0.18em), `.section__label` (0.65rem, 0.25em, rot), `.btn` (0.7rem, 0.2em).

## 4. Spacing & Layout

- **Sehr viel Weißraum:** Section-Padding `clamp(5rem, 10vw, 10rem)` vertikal.
- Seitliches Padding meist `clamp(1.5rem, 4–5vw, 5–6rem)`.
- Nav-Höhe: 72px (Desktop), 60px (Mobile ≤600px).
- Übergänge/Animationen einheitlich über `--transition: 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`.
- Scroll-Reveal-Pattern: Elemente erscheinen mit Fade + leichtem Y-Versatz (30–40px), beim Eintritt in den Viewport.

## 5. Navigation

- Fixed, 3-spaltiges Grid (Logo | Links zentriert | Spacer).
- Zwei Zustände:
  - **Dark** (transparent, über Video/Bild): weiße Links, Logo invertiert (auf Home: rot).
  - **Scrolled** (weiß, blurred Hintergrund 97% Opazität + Backdrop-Blur 14px): schwarze Links, Logo natürlich.
- Aktiver/Hover-Link: Farbe wechselt zu Rot, Unterstreichung wächst von 0 auf 100% Breite.
- Mobile (≤600px): Links ausgeblendet, Hamburger-Menü → Vollbild-Overlay (weiß, zentriert, große Links).

## 6. Buttons

Einheitlicher Grundstil: Großbuchstaben, 0.7rem, Gewicht 600, Letter-Spacing 0.2em, Padding `1rem 2.5rem`, 1.5px Border.

| Variante | Default | Hover |
|---|---|---|
| `.btn--white` | weißer Text/Rand, transparent | weißer Fill, schwarzer Text |
| `.btn--outline` | schwarzer Text/Rand, transparent | schwarzer Fill, weißer Text |
| `.btn--red` | weißer Text, roter Fill | transparent, roter Text |

Prinzip: Outline-Look in Ruhe, invertierter Fill beim Hover — konsequent über alle Varianten.

## 7. Bildsprache & Bewegung

- Vollbild-Hero-Medien (Video auf Home, Foto bei About/Projects) mit dunklem Overlay-Gradient für Lesbarkeit von Text/Nav.
- Hover-Effekte: sanftes Scale (1.015–1.045) auf Bildern/Karten, nie abrupt.
- Karten (Projects-Grid): leichte Schatten, minimal abgerundete Ecken (3px), Caption-Overlay mit Gradient von Schwarz-transparent nach oben.
- Masonry-/Grid-Layouts für Bildergalerien (Creative Space: 3 Spalten Desktop, 2 Tablet/Mobile).
- Scroll-getriebene Reveals sorgen für die geforderte "lebendige Wirkung durch Bewegung".

## 8. Responsive Breakpoints

| Breakpoint | Wirkung |
|---|---|
| `max-width: 900px` | Grids reduzieren Spalten (z. B. 3→2), Detail-Layouts werden einspaltig |
| `max-width: 600px` | Mobile-Nav (Hamburger), Grids einspaltig/zweispaltig, Nav-Höhe 60px |
| `max-height: 700px` | Home-Logo/CTA verkleinert sich (für kurze Viewports) |
| `max-height: 480px` | Weitere Verkleinerung für sehr kleine Viewports |

## 9. Designprinzipien (Zusammenfassung)

1. Eine Akzentfarbe (Rot), sparsam und gezielt eingesetzt.
2. Starker Kontrast Groß/Klein: Struktur-Text (Nav, Headlines, Labels) in Großbuchstaben mit negativem Letter-Spacing bzw. weitem Spacing; Namen klein.
3. Viel Weißraum, generöses Section-Padding.
4. Bewegung als Stilmittel — Reveals, Hover-Scale, sanfte Übergänge (0.4s Standard-Easing).
5. Starke, vollflächige Bildsprache als Träger der Markenwirkung.
6. Konsistente Mikrotypografie für alle UI-Texte (Großbuchstaben, Letter-Spacing, Gewicht 600).
