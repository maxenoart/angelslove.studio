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

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/10.jpg',
    aspectRatio: '3/4',
    caption:     'Video — Still',
    accent:      false,
    delay:       '0s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/11.jpg',
    aspectRatio: '16/9',
    caption:     'Motion Design',
    accent:      false,
    delay:       '0.08s',
  },

  {
    type:        'media',
    src:         'Website/CREATIVE_SPACE/assets/12.jpg',
    aspectRatio: '1/1',
    caption:     'Color Study',
    accent:      false,
    delay:       '0.16s',
  },

];
