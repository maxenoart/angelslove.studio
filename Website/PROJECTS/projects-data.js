/* ============================================================
   angelslove — Projektdaten
   ============================================================
   Bilder kommen alle in einen einzigen Ordner:
   Website/PROJECTS/assets/

   Benennung:
     namedesprojekts-00-cover.jpg   ← Coverbild (Card)
     namedesprojekts-01-bts.jpg     ← Behind the Scenes 1
     namedesprojekts-02-bts.jpg     ← Behind the Scenes 2
     namedesprojekts-03-bts.jpg     ← Behind the Scenes 3
     namedesprojekts-04-bts.jpg     ← Behind the Scenes 4

   Neues Projekt hinzufügen:
   1. Bilder in Website/PROJECTS/assets/ ablegen
   2. Eintrag unten kopieren und anpassen
   ============================================================ */

const PROJECTS = [

  {
    id:       1,
    category: 'Spec Commercial',
    title:    'Hope Dies Last',
    date:     '2025-11-14',
    gear:     'Sony FX3, Sigma 35mm Art, DJI RS3',
    longDesc: 'Ursprünglich wollten wir lediglich mit dem Low-Shutter-Effekt experimentieren und herausfinden, welche kreativen Möglichkeiten darin stecken. Dafür bauten wir ein simples Setup auf und nahmen einige Aufnahmen auf. Erst ein Jahr später entdeckten wir das Footage wieder. Statt es in den Tiefen der Festplatte verschwinden zu lassen, beschlossen wir, daraus etwas Neues zu erschaffen. So entstand ein experimentelles Projekt, das Bild und Musik miteinander verbindet und den Zuschauer auf eine verspielte, kreative Reise mitnimmt.',
    video:    'BiXmgiFpW5o',
    cover:    'Website/PROJECTS/assets/hope-dies-last-00-cover.jpg',
    bts: [
      'Website/PROJECTS/assets/hope-dies-last-01-bts.jpg',
      'Website/PROJECTS/assets/hope-dies-last-02-bts.jpg',
      'Website/PROJECTS/assets/hope-dies-last-03-bts.jpg',
      'Website/PROJECTS/assets/hope-dies-last-04-bts.jpg',
    ],
    credits: [
      { role: 'Director',                name: 'maxeno' },
      { role: 'Director of Photography', name: 'maxeno' },
      { role: 'Creative Lead',           name: 'lennyleisi' },
      { role: 'Edit & Color',            name: 'maxeno' },
    ],
  },

  {
    id:       2,
    category: 'Mini Dokumentation',
    title:    'Hinterhof Olten',
    date:     '2026-01-01',
    gear:     'Sony ZV-E1, Sony A7iv, Sony GM 24-70mm, Dzofilm Vespid Prime',
    longDesc: 'Im Rahmen eines Schulprojekts produzierten wir zu dritt eine Mini-Dokumentation über den Second-Hand-Laden Hinterhof in Olten. Der Film beleuchtet nicht nur den Laden und seine Philosophie, sondern setzt sich auch mit den Auswirkungen von Fast Fashion und der Bedeutung nachhaltiger Konsumentscheidungen auseinander. Durch Interviews, authentische Einblicke und dokumentarische Bildgestaltung entstand ein Film, der sowohl die Menschen hinter dem Projekt als auch die gesellschaftliche Relevanz von Second-Hand-Kultur in den Fokus rückt. Ziel war es, ein informatives und visuell ansprechendes Porträt zu schaffen, das zum Nachdenken über den eigenen Konsum anregt',
    video:    'LMY4xhYFwdU',
    cover:    'Website/PROJECTS/assets/hinterhof-olten-00-cover.jpg',
    bts: [
      'Website/PROJECTS/assets/hinterhof-olten-01-bts.jpg',
      'Website/PROJECTS/assets/hinterhof-olten-02-bts.jpg',
      'Website/PROJECTS/assets/hinterhof-olten-03-bts.jpg',
      'Website/PROJECTS/assets/hinterhof-olten-04-bts.jpg',
    ],
    credits: [
      { role: 'Director',      name: 'maxeno' },
      { role: 'Creative Lead', name: 'lennyleisi' },
    ],
  },

  {
    id:       3,
    category: 'Musikvideo',
    title:    'Dnapsta - Valhalla',
    date:     '2026-03-27',
    gear:     'Sony ZV-E1, Dzofilm Vespid Prime',
    longDesc: 'Für den Song „Valhalla“ von Dnapsta produzierten wir ein Musikvideo mit einer düsteren und atmosphärischen Bildsprache. Durch gezielte Lichtsetzung, kontrastreiche Aufnahmen und cineastische Kamerabewegungen entstand eine visuelle Welt, die die Stimmung und Energie des Tracks unterstreicht. Der Fokus lag darauf, die Musik nicht nur zu begleiten, sondern ihre Atmosphäre visuell zu verstärken. Das Resultat ist ein stilistisch starkes Musikvideo mit einem dunklen, modernen Look und einer klaren visuellen Identität.',
    video:    'jUtAYLDrjJo',
    cover:    'Website/PROJECTS/assets/valhalla-00-cover.jpg',
    bts: [
      'Website/PROJECTS/assets/valhalla-01-bts.jpg',
      'Website/PROJECTS/assets/valhalla-02-bts.jpg',
      'Website/PROJECTS/assets/valhalla-03-bts.jpg',
      'Website/PROJECTS/assets/valhalla-04-bts.jpg',
    ],
    credits: [
      { role: 'Photography',   name: 'maxeno' },
      { role: 'Creative Lead', name: 'lennyleisi' },
    ],
  },

  {
    id:       4,
    category: 'Spec Commercial',
    title:    'Projekt Vier',
    date:     '2025-03-08',
    gear:     'Sony FX3, Sigma 24mm Art',
    longDesc: 'Ausführliche Beschreibung die auf der Detailseite erscheint.',
    video:    'DEINE_YOUTUBE_ID',
    cover:    'Website/PROJECTS/assets/projekt-vier-00-cover.jpg',
    bts: [
      'Website/PROJECTS/assets/projekt-vier-01-bts.jpg',
      'Website/PROJECTS/assets/projekt-vier-02-bts.jpg',
      'Website/PROJECTS/assets/projekt-vier-03-bts.jpg',
      'Website/PROJECTS/assets/projekt-vier-04-bts.jpg',
    ],
    credits: [
      { role: 'Director',      name: 'maxeno' },
      { role: 'Creative Lead', name: 'lennyleisi' },
    ],
  },

  {
    id:       5,
    category: 'Short Film',
    title:    'Projekt Fünf',
    date:     '2024-11-30',
    gear:     'Sony FX3, Sigma 35mm Art',
    longDesc: 'Ausführliche Beschreibung die auf der Detailseite erscheint.',
    video:    'DEINE_YOUTUBE_ID',
    cover:    'Website/PROJECTS/assets/projekt-fuenf-00-cover.jpg',
    bts: [
      'Website/PROJECTS/assets/projekt-fuenf-01-bts.jpg',
      'Website/PROJECTS/assets/projekt-fuenf-02-bts.jpg',
      'Website/PROJECTS/assets/projekt-fuenf-03-bts.jpg',
      'Website/PROJECTS/assets/projekt-fuenf-04-bts.jpg',
    ],
    credits: [
      { role: 'Director',      name: 'maxeno' },
      { role: 'Creative Lead', name: 'lennyleisi' },
    ],
  },

  {
    id:       6,
    category: 'Photography',
    title:    'Projekt Sechs',
    date:     '2024-08-12',
    gear:     'Sony A7 IV, 35mm f/1.8',
    longDesc: 'Ausführliche Beschreibung die auf der Detailseite erscheint.',
    video:    'DEINE_YOUTUBE_ID',
    cover:    'Website/PROJECTS/assets/projekt-sechs-00-cover.jpg',
    bts: [
      'Website/PROJECTS/assets/projekt-sechs-01-bts.jpg',
      'Website/PROJECTS/assets/projekt-sechs-02-bts.jpg',
      'Website/PROJECTS/assets/projekt-sechs-03-bts.jpg',
      'Website/PROJECTS/assets/projekt-sechs-04-bts.jpg',
    ],
    credits: [
      { role: 'Director',      name: 'maxeno' },
      { role: 'Creative Lead', name: 'lennyleisi' },
    ],
  },

];
