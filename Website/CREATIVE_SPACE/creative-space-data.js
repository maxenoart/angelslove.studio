/* ============================================================
   angelslove — Creative Space Inhalte
   ============================================================
   Jedes Item ist entweder ein Medienelement oder ein Textblock.

   MEDIA-Item:
   {
     type:        'media',
     src:         'Website/CREATIVE_SPACE/assets/dateiname.jpg',
     aspectRatio: '4/3',   ← Seitenverhältnis des Bildes
     caption:     'Beschriftung unter dem Bild',
     accent:      false,   ← true = roter Hintergrund als Platzhalter
     delay:       '0s',    ← Einblend-Verzögerung
   }

   TEXT-Item:
   {
     type:    'text',
     heading: 'Kurze Headline',
     text:    'Längerer Beschreibungstext.',
     delay:   '0s',
   }

   Bilder kommen in: Website/CREATIVE_SPACE/assets/
   ============================================================ */

const CREATIVE_SPACE_ITEMS = [

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/01.jpg',
    aspectRatio: '4/3',
    caption:     'Film — Behind the Scenes',
    accent:      false,
    delay:       '0s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/02.jpg',
    aspectRatio: '3/4',
    caption:     'Photography — Detail',
    accent:      false,
    delay:       '0.08s',
  },

  {
    type:    'text',
    heading: 'Alles beginnt\nmit einer Idee.',
    text:    'Wir glauben an die Kraft des Erzählens. Jedes Bild, jede Sekunde Film trägt eine Geschichte in sich.',
    delay:   '0.16s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/03.jpg',
    aspectRatio: '1/1',
    caption:     'Graphic — Experiment',
    accent:      false,
    delay:       '0.04s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/04.jpg',
    aspectRatio: '16/9',
    caption:     'Video — Showreel',
    accent:      true,
    delay:       '0.12s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/05.jpg',
    aspectRatio: '3/4',
    caption:     'Photography — Portrait',
    accent:      false,
    delay:       '0.20s',
  },

  {
    type:    'text',
    heading: 'Licht. Farbe.\nBewegung.',
    text:    'Unsere Arbeit entsteht zwischen Spontaneität und Präzision — zwischen Intuition und Handwerk.',
    delay:   '0s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/06.jpg',
    aspectRatio: '4/3',
    caption:     'Behind the Scenes',
    accent:      false,
    delay:       '0.08s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/07.jpg',
    aspectRatio: '1/1',
    caption:     'Illustration — Concept',
    accent:      false,
    delay:       '0.16s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/08.jpg',
    aspectRatio: '3/2',
    caption:     'Campaign',
    accent:      true,
    delay:       '0.04s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/09.jpg',
    aspectRatio: '4/5',
    caption:     'Photography — Mood',
    accent:      false,
    delay:       '0.12s',
  },

  {
    type:    'text',
    heading: 'Zwischen Idee\nund Realität.',
    text:    'Creative Space ist unser digitales Skizzenbuch — ein Ort für Versuche, Einblicke und Inspiration.',
    delay:   '0.20s',
  },

  /* ---- Reihe 2 ---- */

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/02.jpg',
    aspectRatio: '1/1',
    caption:     'Photography — Closeup',
    accent:      false,
    delay:       '0s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/04.jpg',
    aspectRatio: '4/3',
    caption:     'Video — Set',
    accent:      false,
    delay:       '0.08s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/06.jpg',
    aspectRatio: '3/4',
    caption:     'Behind the Scenes',
    accent:      false,
    delay:       '0.16s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/01.jpg',
    aspectRatio: '16/9',
    caption:     'Film — On Set',
    accent:      true,
    delay:       '0.04s',
  },

  {
    type:    'text',
    heading: 'Spontan.\nPräzise.',
    text:    'Jedes Projekt verlangt sein eigenes Tempo — manchmal Bauchgefühl, manchmal Millimeterarbeit.',
    delay:   '0.12s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/08.jpg',
    aspectRatio: '3/4',
    caption:     'Campaign — Detail',
    accent:      false,
    delay:       '0.20s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/03.jpg',
    aspectRatio: '4/5',
    caption:     'Graphic — Layout',
    accent:      false,
    delay:       '0s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/09.jpg',
    aspectRatio: '1/1',
    caption:     'Photography — Mood II',
    accent:      false,
    delay:       '0.08s',
  },

  {
    type:    'text',
    heading: 'Inspiration\nüberall.',
    text:    'Ob Strasse, Set oder Studio — gute Bilder entstehen dort, wo man genau hinschaut.',
    delay:   '0.16s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/05.jpg',
    aspectRatio: '4/3',
    caption:     'Portrait — Study',
    accent:      false,
    delay:       '0.04s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/07.jpg',
    aspectRatio: '3/2',
    caption:     'Illustration — Sketch',
    accent:      true,
    delay:       '0.12s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/04.jpg',
    aspectRatio: '1/1',
    caption:     'Video — Frame',
    accent:      false,
    delay:       '0.20s',
  },

  /* ---- Reihe 3 ---- */

  {
    type:    'text',
    heading: 'Handwerk\ntrifft Kunst.',
    text:    'Technik ist das Werkzeug — die Idee ist, was bleibt.',
    delay:   '0s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/06.jpg',
    aspectRatio: '1/1',
    caption:     'Set — Detail',
    accent:      false,
    delay:       '0.08s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/01.jpg',
    aspectRatio: '3/4',
    caption:     'Film — Crew',
    accent:      false,
    delay:       '0.16s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/09.jpg',
    aspectRatio: '4/3',
    caption:     'Photography — Light',
    accent:      false,
    delay:       '0.04s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/02.jpg',
    aspectRatio: '4/5',
    caption:     'Photography — Frame II',
    accent:      true,
    delay:       '0.12s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/08.jpg',
    aspectRatio: '1/1',
    caption:     'Campaign — Closeup',
    accent:      false,
    delay:       '0.20s',
  },

  {
    type:    'text',
    heading: 'Jedes Detail\nzählt.',
    text:    'Kleine Entscheidungen machen den Unterschied zwischen gut und unvergesslich.',
    delay:   '0s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/03.jpg',
    aspectRatio: '3/2',
    caption:     'Graphic — Pattern',
    accent:      false,
    delay:       '0.08s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/05.jpg',
    aspectRatio: '1/1',
    caption:     'Portrait — Closeup',
    accent:      false,
    delay:       '0.16s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/07.jpg',
    aspectRatio: '4/3',
    caption:     'Illustration — Detail',
    accent:      false,
    delay:       '0.04s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/04.jpg',
    aspectRatio: '3/4',
    caption:     'Video — Crew at Work',
    accent:      false,
    delay:       '0.12s',
  },

  {
    type:    'text',
    heading: 'Mehr sehen.\nMehr fühlen.',
    text:    'Das ist erst ein Ausschnitt — folge uns für mehr aus unserem Studio.',
    delay:   '0.20s',
  },

];
