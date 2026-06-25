/* ============================================================
   angelslove — Verfügbare Titel-Schriftarten (Backend-Auswahl)
   ============================================================
   Zentrale Liste, die sowohl im Admin-Backend (eigene Auswahl-Liste
   mit Live-Vorschau pro Schriftart) als auch auf der öffentlichen
   Seite (Anwenden der pro Projekt gewählten Schriftart) verwendet
   wird — ein einziger Ort, an dem neue Schriftarten ergänzt werden.

   Wichtig: Schriftnamen mit Leerzeichen IMMER in einfache statt
   doppelte Anführungszeichen setzen — der Wert landet u.a. in einem
   style="..."-HTML-Attribut, doppelte Anführungszeichen darin würden
   das Attribut vorzeitig beenden und die Schriftart-Angabe komplett
   kaputt machen (siehe Bugfix-Commit 8201e0a).
   ============================================================ */
window.TITLE_FONT_OPTIONS = [
  { value: '',                          label: 'Messina Sans (Standard)',  family: "'Messina Sans', sans-serif" },
  { value: 'instrument-serif',          label: 'Instrument Serif',         family: "'Instrument Serif', serif" },
  { value: 'syne-mono',                 label: 'Syne Mono',                family: "'Syne Mono', monospace" },
  { value: 'cormorant-garamond',        label: 'Cormorant Garamond',       family: "'Cormorant Garamond', serif" },
  { value: 'cinzel',                    label: 'Cinzel',                  family: "'Cinzel', serif" },
  { value: 'press-start-2p',            label: 'Press Start 2P',           family: "'Press Start 2P', monospace" },
  { value: 'playfair-display-sc',       label: 'Playfair Display SC',     family: "'Playfair Display SC', serif" },
  { value: 'rock-salt',                 label: 'Rock Salt',                family: "'Rock Salt', cursive" },
  { value: 'reenie-beanie',             label: 'Reenie Beanie',            family: "'Reenie Beanie', cursive" },
  { value: 'julius-sans-one',           label: 'Julius Sans One',          family: "'Julius Sans One', sans-serif" },
  { value: 'libre-barcode-128',         label: 'Libre Barcode 128',        family: "'Libre Barcode 128', cursive" },
  { value: 'dotgothic16',               label: 'DotGothic16',              family: "'DotGothic16', sans-serif" },
  { value: 'betania-patmos-guideline',  label: 'Betania Patmos GuideLine', family: "'Betania Patmos GuideLine', cursive" },
  { value: 'lacquer',                   label: 'Lacquer',                  family: "'Lacquer', cursive" },
  { value: 'codystar',                  label: 'Codystar',                 family: "'Codystar', cursive" },
];

// Bequemer Lookup: gespeicherter Wert -> font-family-String, für die
// direkte Zuweisung per element.style.fontFamily (z.B. Detailseite).
window.TITLE_FONT_MAP = window.TITLE_FONT_OPTIONS.reduce((map, f) => {
  if (f.value) map[f.value] = f.family;
  return map;
}, {});
