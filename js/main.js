/* ============================================================
   angelslove — main.js
   ============================================================ */

const nav        = document.getElementById('main-nav');
const pages      = document.querySelectorAll('.page');
const toggle     = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

let currentPage = 'home';
// Welche Seite war zuletzt aktiv, bevor man auf Kontakt gegangen ist —
// für den "Zurück"-Button in der Erfolgsmeldung des Kontaktformulars.
let pageBeforeContact = 'home';

// ---- Home video: force-start playback ----------------------
// iOS sometimes ignores the autoplay attribute on the very first load
// (especially while the element was still display:none) and shows a
// native play button instead. We re-trigger play() every time the
// Home page becomes the active page, with a couple of delayed retries
// to catch the moment right after layout/display actually happens.
const homeVideo = document.getElementById('home-video');
function tryPlayHomeVideo() {
  if (!homeVideo) return;
  homeVideo.muted = true;
  homeVideo.autoplay = true;
  const p = homeVideo.play();
  if (p && typeof p.catch === 'function') p.catch(() => { /* will retry */ });
}

// Each page id maps to its natural CSS display value
const PAGE_DISPLAY = {
  'home':           'block',
  'creative-space': 'block',
  'projects':       'block',
  'project-detail': 'block',
  'about':          'block',
  'book':           'block',
  'impressum':      'block',
};

// Home + Creative Space behave as one continuous, softly-scrolling
// "one-pager" — both stay mounted together and the user simply scrolls
// from one into the other. All other routes keep the classic
// page-switch behaviour (only one visible at a time).
const FLOW_IDS = ['home', 'creative-space'];
function isFlowId(id) { return FLOW_IDS.includes(id); }

// ---- Nav helpers ------------------------------------------
function setNavDark() {
  nav.classList.remove('nav--scrolled');
  nav.classList.add('nav--dark');
}

function setNavScrolled() {
  nav.classList.remove('nav--dark');
  nav.classList.add('nav--scrolled');
}

// Updates nav state / status-bar tint / active link / body classes for
// whichever section (home or creative-space) is currently in view
// while inside the one-pager flow.
function updateChromeForFlowSection(id) {
  if (id === 'home') {
    setNavDark();
    document.body.classList.add('is-home');
    document.documentElement.classList.add('is-home');
  } else {
    setNavScrolled();
    document.body.classList.remove('is-home');
    document.documentElement.classList.remove('is-home');
  }

  // Im Home/Creative-Space-Flow: das grosse Hero-Logo dockt in die Nav-Logo-
  // Position (siehe css body.home-flow-active + syncHomeHeroChrome unten).
  document.body.classList.add('home-flow-active');

  document.body.classList.remove('is-book');
  document.body.classList.remove('is-projects');
  document.querySelector('.nav__logo').style.filter = '';

  const themeMeta = document.getElementById('theme-color-meta');
  if (themeMeta) {
    themeMeta.setAttribute('content', id === 'home' ? '#0e0e0e' : '#ffffff');
  }

  document.querySelectorAll('[data-page]').forEach(l => {
    l.classList.toggle('active', l.dataset.page === id);
  });
}

// ---- Page routing -----------------------------------------
// Verlässt man ein Video-Projekt, läuft der YouTube-Ton sonst im
// versteckten iFrame einfach weiter bzw. hört abrupt auf — hier wird er
// (sofern möglich, via YouTube-postMessage-API) kurz sanft ausgefadet,
// danach hart gestoppt. Klappt der Fade aus irgendeinem Grund nicht
// (z.B. iFrame noch nicht bereit), geht der Ton sofort weg.
function fadeOutAndStopVideo() {
  // Echte Videodatei (falls aktiv) stoppen.
  const fileVid = document.getElementById('detail-video-file');
  if (fileVid) { try { fileVid.pause(); } catch (e) {} }

  const iframe = document.getElementById('detail-video');
  if (!iframe || !iframe.src) return;

  const win = iframe.contentWindow;
  if (!win) { iframe.src = ''; return; }

  const post = (func, args = []) => {
    try {
      win.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
    } catch (e) { /* iFrame evtl. nicht erreichbar — Sicherheitsnetz unten greift */ }
  };

  const steps = 6;
  const stepDuration = 90;
  let i = steps;
  const fadeTimer = setInterval(() => {
    i--;
    post('setVolume', [Math.round((i / steps) * 100)]);
    if (i <= 0) {
      clearInterval(fadeTimer);
      post('pauseVideo');
      iframe.src = '';
    }
  }, stepDuration);

  // Sicherheitsnetz: falls der Fade nicht ankommt, Ton nach kurzer Zeit
  // trotzdem hart abschalten statt weiterlaufen zu lassen.
  setTimeout(() => { iframe.src = ''; }, steps * stepDuration + 400);
}

function showPage(id, pushState = true) {

  if (currentPage === 'project-detail' && id !== 'project-detail') {
    fadeOutAndStopVideo();
  }

  // Merkt sich, von welcher Seite aus man zu Kontakt navigiert hat —
  // damit der "Zurück"-Button in der Erfolgsmeldung weiss, wohin.
  if (id === 'book' && currentPage !== 'book') {
    pageBeforeContact = currentPage;
  }

  // Kontaktformular soll bei jedem (erneuten) Aufruf wieder frisch sein.
  if (id === 'book' && typeof resetContactForm === 'function') {
    resetContactForm();
  }

  if (isFlowId(id)) {
    // Mount both flow sections together, hide everything else.
    pages.forEach(p => {
      if (isFlowId(p.id)) {
        p.style.display = PAGE_DISPLAY[p.id] || 'block';
        p.classList.add('visible');
      } else {
        p.style.display = 'none';
        p.classList.remove('visible');
      }
    });

    currentPage = id;
    updateChromeForFlowSection(id);
    syncHomeHeroChrome();

    const target = document.getElementById(id);
    // Mit Lenis muss über lenis.scrollTo gescrollt werden — window.scrollTo
    // wird sonst vom Smooth-Scroll ignoriert (z.B. Klick aufs Logo im
    // Creative Space → zurück nach oben).
    if (window.__lenis) {
      if (id === 'home') window.__lenis.scrollTo(0);
      else if (target) window.__lenis.scrollTo(target);
    } else {
      const behavior = pushState ? 'smooth' : 'instant';
      if (id === 'home') window.scrollTo({ top: 0, behavior });
      else if (target) target.scrollIntoView({ behavior, block: 'start' });
    }

    // Home's video lives in the always-mounted #home section — keep the
    // existing autoplay retry safety net whenever we (re-)enter the flow.
    tryPlayHomeVideo();
    setTimeout(tryPlayHomeVideo, 60);
    setTimeout(tryPlayHomeVideo, 300);
    setTimeout(tryPlayHomeVideo, 900);

    if (pushState) {
      history.pushState({ page: id }, '', '#' + id);
    }

    // Creative-Space-Feld neu positionieren, sobald es sichtbar ist — falls
    // es zuvor unsichtbar (Breite 0) aufgebaut wurde, säße sonst alles auf
    // Position 0. requestAnimationFrame: erst messen, wenn das Layout steht.
    requestAnimationFrame(() => csRelayout());

    setTimeout(() => triggerReveals(), 100);
    return;
  }

  // ---- Classic exclusive page switch (Projects / Project Detail / About / Kontakt) ----
  pages.forEach(p => {
    p.style.display = 'none';
    p.classList.remove('visible');
  });

  const target = document.getElementById(id);
  if (!target) return;

  target.style.display = PAGE_DISPLAY[id] || 'block';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.classList.add('visible');
    });
  });

  currentPage = id;
  // Verlässt den Home/Creative-Space-Flow — das normale Nav-Logo wird wieder
  // sichtbar (das Hero-Chrome ist ausserhalb des Flows unsichtbar).
  document.body.classList.remove('home-flow-active');
  syncHomeHeroChrome();

  // Projects: neues zufälliges Banner bei jedem Aufruf des Tabs, nicht
  // nur beim ersten Laden der Seite — sorgt für Abwechslung.
  if (id === 'projects') buildProjectsHero();

  // About Us & Projects open on a full-screen photo (like Home's video)
  // — start with the transparent/dark nav and let the scroll listener
  // below switch it to the white "scrolled" nav once past the hero.
  if (id === 'about' || id === 'projects' || id === 'project-detail') {
    setNavDark();
  } else {
    setNavScrolled();
  }
  document.body.classList.remove('is-home');
  document.documentElement.classList.remove('is-home');

  // Kontakt Us: red background throughout — nav matches
  document.body.classList.toggle('is-book', id === 'book');
  // Projects + Projekt-Detail: dark background test — nav matches
  document.body.classList.toggle('is-projects', id === 'projects' || id === 'project-detail');
  // Logo-Video ist weiss: auf den dunklen/roten Seiten (Book, Projects,
  // Projekt-Detail) soll es weiss bleiben (filter:none), auf hellen Seiten
  // entscheidet das CSS (nav--scrolled → invert(1) = schwarz auf weiss).
  document.querySelector('.nav__logo').style.filter = (id === 'book' || id === 'projects' || id === 'project-detail') ? 'none' : '';

  // Status bar tint follows page background (white / red / dark)
  const themeMeta = document.getElementById('theme-color-meta');
  if (themeMeta) {
    themeMeta.setAttribute('content', id === 'book' ? '#e2073b' : ((id === 'projects' || id === 'project-detail') ? '#0e0e0e' : '#ffffff'));
  }

  document.querySelectorAll('[data-page]').forEach(l => {
    l.classList.toggle('active', l.dataset.page === id);
  });

  // Klassischer Seitenwechsel: sofort nach oben (Lenis-fähig).
  if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
  else window.scrollTo({ top: 0, behavior: 'instant' });

  if (pushState) {
    history.pushState({ page: id }, '', '#' + id);
  }

  setTimeout(() => triggerReveals(), 100);
}

// ---- Home Hero: Logo-Docking beim Scrollen ------------------
// Ganz oben steht das grosse Logo mittig-links neben einem Serif-Satz. Beim
// Scrollen wandert das Logo (per transform) smooth in die Nav-Logo-Position
// oben links und wird auf Nav-Grösse skaliert — es wird so zum Home-Button.
// Der Serif-Satz blendet dabei aus. Das Video im Hero scrollt normal weg.
const DOCK_DISTANCE = 420; // px Scrollstrecke, über die das Logo in den Header dockt

const heroChromeEl   = document.getElementById('home-hero-chrome');
const heroLogoLinkEl = document.getElementById('home-hero-logo-link'); // wird per transform gedockt
const heroLogoEl     = document.getElementById('home-hero-logo');
const heroTextEl     = document.getElementById('home-hero-text');
const navLogoEl      = document.getElementById('nav-logo');

// Basiswerte, einmal gemessen (nicht pro Frame): ungetransformte Position des
// grossen Hero-Logos und Zielposition (Nav-Logo). Ändern sich nur bei Resize.
let heroLogoBase  = null; // { left, centerY, size }
let navLogoTarget = null; // { left, centerY, size }

function measureHeroDock() {
  if (!heroLogoLinkEl || !navLogoEl) return;
  const prev = heroLogoLinkEl.style.transform;
  heroLogoLinkEl.style.transform = 'none';
  const lr = heroLogoLinkEl.getBoundingClientRect();
  heroLogoLinkEl.style.transform = prev;
  const nr = navLogoEl.getBoundingClientRect();
  if (!lr.height || !nr.height) return; // noch nicht gelayoutet — später erneut
  heroLogoBase  = { left: lr.left, centerY: lr.top + lr.height / 2, size: lr.height };
  navLogoTarget = { left: nr.left, centerY: nr.top + nr.height / 2, size: nr.height };
}

// Beim Scrollen dockt das grosse Logo smooth von der Mitte in die Nav-Logo-
// Position (Home-Button); der Serif-Satz blendet in der ersten Hälfte aus.
function syncHomeHeroChrome() {
  if (!heroChromeEl || !heroLogoLinkEl) return;
  if (!isFlowId(currentPage)) return;
  if (!heroLogoBase) measureHeroDock();
  if (!heroLogoBase || !navLogoTarget) return;

  const t = Math.min(Math.max(window.scrollY, 0), DOCK_DISTANCE) / DOCK_DISTANCE;
  const scale = 1 - (1 - navLogoTarget.size / heroLogoBase.size) * t;
  const dx = (navLogoTarget.left    - heroLogoBase.left)    * t;
  const dy = (navLogoTarget.centerY - heroLogoBase.centerY) * t;
  heroLogoLinkEl.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${scale.toFixed(3)})`;

  // Text wandert synchron mit dem Logo nach oben (gleiche Vertikale) UND
  // blendet dabei aus — beides gleichzeitig.
  if (heroTextEl) {
    const fade = 1 - Math.min(t / 0.7, 1);
    heroTextEl.style.transform = `translateY(${dy.toFixed(1)}px)`;
    heroTextEl.style.opacity = fade.toFixed(2);
    heroTextEl.style.pointerEvents = fade < 0.05 ? 'none' : 'auto';
  }
}

(function () {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => { ticking = false; syncHomeHeroChrome(); });
    }
  }, { passive: true });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      heroLogoBase = null; navLogoTarget = null; // Breakpoint kann sich geändert haben → neu messen
      syncHomeHeroChrome();
    }, 120);
  });

  syncHomeHeroChrome();
  // Logo evtl. beim ersten Sync noch nicht vermessbar — nach dem Laden neu.
  // 'load' für das <img>-Fallback, 'loadeddata' für das <video> (feuert kein load).
  if (heroLogoEl) {
    const remeasure = () => {
      heroLogoBase = null; navLogoTarget = null;
      syncHomeHeroChrome();
    };
    heroLogoEl.addEventListener('load', remeasure);
    heroLogoEl.addEventListener('loadeddata', remeasure);
  }
})();

// ---- One-pager scroll tracking (Home ↔ Creative Space) -----
// While the flow is active, figure out which section is actually in
// view as the user scrolls, and keep nav/theme/active-link/history in
// sync — without forcing any hard jump.
(function () {
  let ticking = false;

  function onFlowScroll() {
    ticking = false;
    if (!isFlowId(currentPage)) return;

    syncHomeHeroChrome();

    const csEl = document.getElementById('creative-space');
    if (!csEl) return;

    const threshold = csEl.offsetTop - window.innerHeight * 0.4;
    const newId = window.scrollY >= threshold ? 'creative-space' : 'home';

    if (newId !== currentPage) {
      currentPage = newId;
      updateChromeForFlowSection(newId);
      syncHomeHeroChrome();
      history.replaceState({ page: newId }, '', '#' + newId);
      setTimeout(() => triggerReveals(), 50);
    }
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onFlowScroll);
    }
  }, { passive: true });
})();

// ---- About Us & Projects: nav switches from transparent (over the
// hero photo) to white once the user scrolls past it — same idea as
// the Home video. ----
(function () {
  let ticking = false;
  let wasOverHero = true;

  // Nur About wechselt beim Scrollen auf hellen Hintergrund (dunkler Text).
  // Projects ist durchgehend dunkel → Nav bleibt immer weiss (nav--dark),
  // NICHT auf scrolled umschalten, sonst wäre der Text dunkel auf dunkel.
  const HERO_SELECTORS = {
    about: '#about .about__hero',
  };

  function onAboutScroll() {
    ticking = false;
    const selector = HERO_SELECTORS[currentPage];
    if (!selector) return;

    const heroEl = document.querySelector(selector);
    if (!heroEl) return;

    const overHero = window.scrollY < heroEl.offsetHeight - 80;
    if (overHero !== wasOverHero) {
      wasOverHero = overHero;
      if (overHero) setNavDark(); else setNavScrolled();
    }
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onAboutScroll);
    }
  }, { passive: true });
})();

// ---- Projects: Hero-Banner bleibt beim Scrollen statisch stehen (kein
// Parallax) und blendet stattdessen langsam zu Schwarz aus, je weiter man
// runterscrollt — fertig ausgeblendet nach ca. 90% der Bildschirmhöhe. ----
(function () {
  let ticking = false;

  function onProjectsHeroScroll() {
    ticking = false;
    if (currentPage !== 'projects') return;

    const hero = document.getElementById('projects-hero');
    if (!hero) return;

    const fadeDistance = window.innerHeight * 0.9;
    const progress = Math.min(Math.max(window.scrollY / fadeDistance, 0), 1);
    // Banner dunkelt beim Scrollen einfach ab (Opacity) — kein Blur mehr
    // (war performancekritisch, besonders mit Video).
    hero.style.opacity = String(1 - progress);
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onProjectsHeroScroll);
    }
  }, { passive: true });
})();

// ---- Click handler (nav links + any [data-page]) ----------
document.querySelectorAll('[data-page]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const page = link.dataset.page;
    if (page) {
      showPage(page);
      closeMobileMenu();
    }
  });
});

// ---- Hamburger ---------------------------------------------
// Verwandelt sich beim Öffnen in ein X und löst den Kreis-Reveal des
// Mobile-Menüs aus (siehe css/styles.css ".nav__mobile").
function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  toggle.classList.remove('is-open');
  document.body.classList.remove('menu-open');
}

toggle.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  toggle.classList.toggle('is-open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
});

// ---- Home video: extra safety nets on top of the showPage() retries ----
if (homeVideo) {
  homeVideo.addEventListener('loadedmetadata', tryPlayHomeVideo);
  homeVideo.addEventListener('canplay', tryPlayHomeVideo);
  window.addEventListener('load', tryPlayHomeVideo);

  // Retry whenever the tab/app becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && isFlowId(currentPage)) tryPlayHomeVideo();
  });
  window.addEventListener('pageshow', () => {
    if (isFlowId(currentPage)) tryPlayHomeVideo();
  });

  // Last-resort fallback: first tap anywhere also nudges playback
  ['touchstart', 'click'].forEach(evt => {
    window.addEventListener(evt, () => {
      if (homeVideo.paused) tryPlayHomeVideo();
    }, { once: true, passive: true });
  });
}

// ---- Scroll reveal ----------------------------------------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('revealed');
      }, i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

function triggerReveals() {
  const els = document.querySelectorAll(
    '.page.visible .reveal, .page.visible .cs__item, .page.visible .project-card'
  );
  els.forEach(el => {
    if (!el.classList.contains('revealed')) {
      revealObserver.observe(el);
    }
  });
}

// ---- Build Creative Space grid: random project covers + BTS shots ----
// Pulls every project's cover image and behind-the-scenes shots, shuffles
// them into a fresh random order on each page load, and makes each one
// clickable through to its project. Wird seitenweise per "Mehr laden"
// nachgeladen (siehe loadMoreCreativeSpace).
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CS_PAGE_SIZE = 36;   // wie viele Karten pro „Mehr laden“-Klick dazukommen (inkl. erstem automatischem Laden)
const CS_CARD_LIMIT = 90;  // harte Obergrenze, falls extrem viele Projekte/BTS-Bilder existieren

let csAllItems = [];        // vollständige, gemischte Liste (Medien)
let csShown = 0;            // wie viele Karten aktuell im Feld stehen
let csFieldEl = null;       // der Feld-Container (#cs-grid)
let csCurrentColumnCount = 0; // Raster-Grundlage für die Zufallspositionierung
let csItemEls = [];         // { el, drift, yVh } — für den Parallax-Scroll-Handler

// Wie viele Raster-"Spalten" je nach Bildschirmbreite — dient nur als
// Grundlage für die Zufallspositionierung (nicht als echtes CSS-Grid).
// Bewusst wenige Spalten (3 auf Desktop statt vormals 4) — das Mockup zeigt
// grosse, klar getrennte Bilder mit viel Luft, kein dichtes Raster.
function csColumnCount() {
  const w = window.innerWidth;
  if (w <= 900) return 2;   // Handy + Tablet: 2 Bilder nebeneinander
  return 3;
}

// Handy-Erkennung fürs Creative-Space-Layout (engere Abstände, ruhigere
// Parallax, weniger Bilder auf einmal).
function csIsMobile() { return window.innerWidth <= 600; }

const CS_ROW_VH = 30;   // vh pro Raster-Zeile — gibt den vertikalen Grundabstand vor
const CS_GUTTER = 0.16; // fester Mindestabstand zwischen Spalten/Zeilen, als Anteil der Zellbreite

// Kleiner, deterministischer Pseudo-Zufallsgenerator (mulberry32), pro Item
// per Index geseedet — Position/Grösse/Geschwindigkeit bleiben so bei jedem
// Aufbau (z.B. nach einem Resize) gleich, statt bei jedem Rebuild zu hüpfen.
function csSeededRandom(seed) {
  let t = seed += 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// Baut die komplette Item-Liste einmal auf (Aufruf bei Seitenaufbau).
// Nur noch Bilder — keine Textblöcke, keine Legenden: kompakter, grosser
// Bild-an-Bild-Eindruck.
function buildCreativeSpaceItems() {
  // Media: every project's cover + behind-the-scenes shots, clickable.
  const mediaItems = [];
  if (typeof PROJECTS !== 'undefined') {
    PROJECTS.forEach(p => {
      if (p.cover) {
        mediaItems.push({ type: 'project', src: p.cover, caption: p.title, projectId: p.id, videoFile: p.videoFile || '' });
      }
      (p.bts || []).forEach(src => {
        mediaItems.push({ type: 'project', src, caption: `BTS — ${p.title}`, projectId: p.id, videoFile: p.videoFile || '' });
      });
    });
  }

  return shuffle(mediaItems).slice(0, CS_CARD_LIMIT);
}

const CS_RATIOS = ['4/3', '3/4', '1/1', '16/9'];
// Drei Grössen-Varianten, als Anteil der NUTZBAREN Zellbreite (also nach
// Abzug des Gutters) — dadurch ist ein Bild rein rechnerisch nie breiter
// als seine Zelle und kann nicht in die Nachbarzelle hineinragen/
// überlappen (das war der Grund für die zu eng aneinander klebenden
// Bilder zuvor). Kleinere Bilder wirken wie im Vordergrund (schnellere
// Parallax-Geschwindigkeit), grössere wie weiter hinten (langsamer).
// Extreme Grössenspreizung für den Wow-/Tiefen-Effekt: kleine Bilder wirken
// weit weg, grosse ganz nah. Erlaubt, weil die Überlappung NICHT von der
// Bildgrösse kommt (die Höhe wird beim Stapeln real berücksichtigt), sondern
// nur von unterschiedlichen Parallax-Geschwindigkeiten — und die ist jetzt
// pro Spalte konstant (siehe csSpeedForColumn).
const CS_SIZES = [
  { key: 'sm', frac: 0.48 },
  { key: 'md', frac: 0.74 },
  { key: 'lg', frac: 1.0 },
];
// Handy: höhere Mindestgrösse, damit auch die kleinsten Bilder noch gut
// erkennbar sind (bei 2 Spalten sind sie ohnehin schon schmaler).
const CS_SIZES_MOBILE = [
  { key: 'sm', frac: 0.78 },
  { key: 'md', frac: 0.90 },
  { key: 'lg', frac: 1.0 },
];

// Parallax-DRIFT pro BILD (px). An die Bildgrösse gekoppelt: grosse Bilder
// wirken nah → bewegen sich stark, kleine wirken fern → kaum. Dadurch
// verändern sich die Abstände INNERHALB einer Spalte beim Scrollen sichtbar
// (nicht mehr "ganze Spalte gleich schnell"). Vorzeichen pro Spalte konstant,
// damit sich Bilder einer Spalte nie überholen/überlappen; benachbarte
// Spalten laufen gegenläufig. Bounded → smooth.
function csDriftForItem(index, col, sizeKey) {
  const sign = (col % 2 === 0) ? -1 : 1;
  const base = sizeKey === 'lg' ? 320 : sizeKey === 'md' ? 190 : 70;
  const scale = csIsMobile() ? 0.45 : 1;   // Handy: ruhigere Parallax → engeres Stapeln möglich
  return sign * (base + csSeededRandom(index * 7 + 9) * 60) * scale;
}

// Pro Spalte gemerkte, bereits belegte Höhe (in vh) — echtes Masonry-
// Stacking statt fixer Zeilenhöhe. Eine feste Zeilenhöhe reichte bei
// Hochformat-Bildern (z.B. Ratio 3/4) nicht aus: deren tatsächliche Höhe
// konnte die Zeilenhöhe deutlich übersteigen und ins nächste Bild
// hineinragen — genau der Grund für die zu eng/überlappend wirkenden
// Bilder. Jetzt wird die reale Bildhöhe berechnet und an die laufende
// Spaltenhöhe angehängt, sodass Überlappung rechnerisch ausgeschlossen ist.
let csColHeights = [];

function csResetColumns(cols) {
  csColHeights = new Array(cols).fill(0);
}

function csRatioValue(ratioStr) {
  const [w, h] = ratioStr.split('/').map(Number);
  return w / h;
}

// Position/Grösse/Geschwindigkeit für ein Item: das Feld ist gedanklich in
// Spalten unterteilt, inkl. festem Gutter zwischen den Spalten. Jedes Item
// bekommt seine Spalte per Index, wird darin horizontal zufällig (pro Index
// fest geseedet) verschoben/skaliert, vertikal aber lückenlos auf das
// vorherige Bild derselben Spalte gestapelt (+ fester Mindestabstand) —
// verteilt die Bilder organisch über die Fläche, ohne dass sie sich je
// überlappen können.
function csLayoutFor(index, cols) {
  if (csColHeights.length !== cols) csResetColumns(cols);

  const col = index % cols;
  const cellW = 100 / cols;
  // Handy: engerer horizontaler Abstand, damit die 2 Spalten näher beieinander
  // stehen (vertikaler Abstand bleibt, um Überlappung beim Scrollen zu vermeiden).
  const gutterFactor = csIsMobile() ? 0.09 : CS_GUTTER;
  const gutter = cellW * gutterFactor;
  const usableW = cellW - gutter;
  const rnd1 = csSeededRandom(index * 7 + 1);
  const rnd3 = csSeededRandom(index * 7 + 3);
  const rnd4 = csSeededRandom(index * 7 + 4);

  const sizes = csIsMobile() ? CS_SIZES_MOBILE : CS_SIZES;
  const size = sizes[Math.floor(rnd3 * sizes.length)];
  const widthPct = size.frac * usableW;

  const maxJitter = Math.max(usableW - widthPct, 0);
  const xPct = col * cellW + gutter / 2 + maxJitter * rnd1;
  const ratio = CS_RATIOS[Math.floor(rnd4 * CS_RATIOS.length)];

  // Tatsächliche Bildhöhe in vh ermitteln (Breite ist in % der Feldbreite,
  // Höhe ergibt sich aus dem Seitenverhältnis) — Grundlage für lückenloses,
  // überlappungsfreies Stapeln pro Spalte.
  // Fallback auf window.innerWidth, falls das Feld beim Bauen unsichtbar ist
  // (display:none → offsetWidth 0). Sonst würden alle Höhen 0 und die Bilder
  // stapelten sich auf Position 0. Das echte Layout wird beim Sichtbarwerden
  // ohnehin per csRelayout() korrigiert.
  const containerWidthPx = (csFieldEl && csFieldEl.offsetWidth) || window.innerWidth;
  const itemWidthPx = (widthPct / 100) * containerWidthPx;
  const itemHeightPx = itemWidthPx / csRatioValue(ratio);
  const itemHeightVh = (itemHeightPx / window.innerHeight) * 100;
  // Grösserer vertikaler Puffer, damit die grössenabhängigen Drift-Stärken
  // (bis ~155px Relativbewegung zwischen benachbarten Bildern einer Spalte)
  // nie zu einer Überlappung führen.
  const vGutterVh = CS_ROW_VH * CS_GUTTER * 3.4;

  const yPct = csColHeights[col];
  csColHeights[col] = yPct + itemHeightVh + vGutterVh;

  return {
    xPct, yPct, widthPct, ratio,
    drift: csDriftForItem(index, col, size.key),
  };
}

function renderCsCard(item, i, layout) {
  const delay = `${(i % 8) * 0.05}s`;
  const hasVid = !!item.videoFile;
  const vidEl = hasVid
    ? `<video class="cs__video" muted loop playsinline preload="none" src="${item.videoFile}"></video>`
    : '';
  return `
    <div class="cs__item cs__item--clickable${hasVid ? ' cs__item--has-video' : ''}" data-cs-drift="${layout.drift}" data-cs-y="${layout.yPct}"
         style="--cs-w:${layout.widthPct}%; --cs-x:${layout.xPct}%; --cs-y:${layout.yPct}vh; transition-delay:${delay}"
         onclick="openProject(${item.projectId})" role="button" tabindex="0">
      <span class="cs__item-inner">
        <span class="cs__img-wrap" style="aspect-ratio:${layout.ratio}">
          <img src="${item.src}" alt="${item.caption}" loading="lazy"
               style="aspect-ratio:${layout.ratio};width:100%;object-fit:cover;display:block;"
               onload="this.closest('.cs__img-wrap').classList.add('is-loaded')"
               onerror="this.closest('.cs__img-wrap').classList.add('is-loaded')">
          ${vidEl}
        </span>
        <span class="cs__item-caption">${item.caption}</span>
      </span>
    </div>`;
}

function renderCsLoadMoreState() {
  const wrap = document.getElementById('cs-load-more-wrap');
  if (!wrap) return;
  wrap.style.display = csShown < csAllItems.length ? 'flex' : 'none';
}

// Setzt die Feld-Höhe anhand der Anzahl belegter Raster-Zeilen + Reserve für
// Jitter/grössere Bilder — sorgt dafür, dass beim letzten Bild noch genug
// Scroll-Raum für dessen Parallax-Bewegung bleibt.
function csUpdateFieldHeight() {
  if (!csFieldEl) return;
  const maxColHeight = csColHeights.length ? Math.max(...csColHeights) : 0;
  csFieldEl.style.height = `calc(${maxColHeight}vh + ${CS_ROW_VH}vh)`;
}

// Positioniert die bereits vorhandenen Bilder neu — OHNE Neu-Rendern (kein
// Bild-Reload, kein Neu-Mischen). Nötig, wenn das Feld zuvor unsichtbar
// (Breite 0) aufgebaut wurde und erst beim Öffnen des Creative Space sichtbar
// wird. Grösse/Ratio/Drift sind pro Index deterministisch → identisch wie
// beim Bauen; nur die vertikalen Positionen werden mit der echten Breite
// korrekt neu berechnet.
function csRelayout() {
  if (!csFieldEl || !csFieldEl.offsetWidth) return;
  const items = Array.from(csFieldEl.querySelectorAll('.cs__item'));
  if (!items.length) return;
  csCurrentColumnCount = csColumnCount();
  csResetColumns(csCurrentColumnCount);
  items.forEach((el, idx) => {
    const layout = csLayoutFor(idx, csCurrentColumnCount);
    el.style.setProperty('--cs-w', layout.widthPct + '%');
    el.style.setProperty('--cs-x', layout.xPct + '%');
    el.style.setProperty('--cs-y', layout.yPct + 'vh');
    el.dataset.csDrift = layout.drift;
    el.dataset.csY = layout.yPct;
  });
  csUpdateFieldHeight();
  csRefreshItemEls();
  onCsFieldScroll();
}

// Liest alle aktuell im Feld stehenden Items neu ein — wird nach jedem
// Aufbau/Nachladen aufgerufen, damit der Parallax-Scroll-Handler immer mit
// der aktuellen Liste arbeitet.
function csRefreshItemEls() {
  if (!csFieldEl) return;
  csItemEls = Array.from(csFieldEl.querySelectorAll('.cs__item')).map(el => ({
    el,
    drift: parseFloat(el.dataset.csDrift) || 0,
    yVh: parseFloat(el.dataset.csY) || 0,
  }));
}

// Hängt den nächsten Batch an Karten ans Feld an (fortlaufender Gesamt-Index
// → eigene Zelle/Position, siehe csLayoutFor). Bereits gezeigte Karten
// behalten dabei immer ihre Position.
function loadMoreCreativeSpace() {
  if (!csFieldEl) return;

  // Handy: kleinere Batch (weniger Bilder auf einmal) — der Rest kommt per
  // „Mehr laden“.
  const pageSize = csIsMobile() ? 12 : CS_PAGE_SIZE;
  const next = csAllItems.slice(csShown, csShown + pageSize);
  next.forEach((item, idx) => {
    const globalIndex = csShown + idx;
    const layout = csLayoutFor(globalIndex, csCurrentColumnCount);
    csFieldEl.insertAdjacentHTML('beforeend', renderCsCard(item, globalIndex, layout));
  });
  csShown += next.length;
  csUpdateFieldHeight();
  csRefreshItemEls();
  bindHoverVideos(csFieldEl);

  renderCsLoadMoreState();
  triggerReveals();
  onCsFieldScroll(); // sofort einmal positionieren, nicht erst beim nächsten Scroll
}

function buildCreativeSpace() {
  csFieldEl = document.getElementById('cs-grid');
  if (!csFieldEl) return;

  csAllItems = buildCreativeSpaceItems();
  csShown = 0;
  csCurrentColumnCount = csColumnCount();
  csResetColumns(csCurrentColumnCount);
  csFieldEl.innerHTML = '';

  loadMoreCreativeSpace();

  const btn = document.getElementById('cs-load-more-btn');
  if (btn && !btn.dataset.bound) {
    btn.addEventListener('click', loadMoreCreativeSpace);
    btn.dataset.bound = '1';
  }

  // Bei Breakpoint-Wechsel (Fenster-Resize) ändert sich die Raster-
  // Spaltenzahl — alle bisher gezeigten Karten bleiben erhalten, nur ihre
  // Position/Grösse wird neu berechnet (komplett neu aufgebaut, da sich die
  // Zellaufteilung ändert).
  if (!window.__csResizeBound) {
    window.__csResizeBound = true;
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!document.getElementById('cs-grid')) return;
        if (csColumnCount() !== csCurrentColumnCount && csAllItems.length) {
          const shownCount = csShown;
          csCurrentColumnCount = csColumnCount();
          csResetColumns(csCurrentColumnCount);
          csFieldEl.innerHTML = '';
          csShown = 0;
          const toRestore = csAllItems.slice(0, shownCount);
          toRestore.forEach((item, idx) => {
            const layout = csLayoutFor(idx, csCurrentColumnCount);
            csFieldEl.insertAdjacentHTML('beforeend', renderCsCard(item, idx, layout));
          });
          csShown = shownCount;
          csUpdateFieldHeight();
          csRefreshItemEls();
          renderCsLoadMoreState();
          triggerReveals();
          onCsFieldScroll();
        }
      }, 200);
    });
  }
}

// ---- Creative-Space-Parallax ----
// Jedes Bild verschiebt sich beim Scrollen um p * drift px (drift kommt aus
// csDriftForItem, gekoppelt an die Bildgrösse). p ist der auf [-0.5..0.5]
// zentrierte Fortschritt durchs Feld: in der Feldmitte stehen alle Bilder an
// ihrer Grundposition, zu den Enden driften sie auseinander. Weil der Drift
// pro Spalte dasselbe Vorzeichen hat, überholen sich Bilder einer Spalte nie.
function onCsFieldScroll() {
  if (!csFieldEl || !csItemEls.length) return;
  const fieldTop = csFieldEl.getBoundingClientRect().top + window.scrollY;
  const fieldH = csFieldEl.offsetHeight || 1;
  // Fortschritt durch das Feld: 0 = Feld gerade oben im Blick, 1 = unten
  // durch. Auf [-0.5..0.5] zentriert, damit die Spalten in der Feldmitte
  // "ausgerichtet" sind und zu beiden Enden gegenläufig auseinanderdriften.
  const raw = (window.scrollY + window.innerHeight * 0.5 - fieldTop) / fieldH;
  const p = Math.max(0, Math.min(1, raw)) - 0.5;

  // PERFORMANCE: Nur Bilder animieren, die (grob) im/nahe am Sichtbereich sind.
  // Früher wurde bei JEDEM Scroll-Frame auf ALLE geladenen Bilder geschrieben —
  // mit "Mehr laden" bis zu 90 Stück, jedes eine eigene GPU-Ebene. Das war der
  // Grund, warum es mit der Zeit (mehr Bilder) immer laggyer wurde. Jetzt bleibt
  // die Arbeit pro Frame konstant, egal wie viele Bilder insgesamt geladen sind.
  const vh = window.innerHeight;
  const scrollY = window.scrollY;
  const topLimit = -1.5 * vh;
  const botLimit = 1.8 * vh;

  csItemEls.forEach(item => {
    // Ungefähre Bildschirm-Y-Position aus der vorab gespeicherten Grundhöhe
    // (kein teures Layout-Reading pro Bild).
    const screenY = fieldTop + (item.yVh / 100) * vh - scrollY;
    if (screenY < topLimit || screenY > botLimit) {
      // Weit ausserhalb → Transform entfernen (auch die GPU-Ebene wird frei).
      if (!item.__off) { item.__off = true; item.el.style.transform = ''; }
      return;
    }
    item.__off = false;
    item.el.style.transform = `translate3d(0, ${(p * item.drift).toFixed(1)}px, 0)`;
  });
}

(function () {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => { ticking = false; onCsFieldScroll(); });
    }
  }, { passive: true });
})();

// ---- Home-Intro: kleines 2×2-Bilder-Raster neben "Hey, wir sind
// angelslove" — rein dekorativ, holt sich 4 zufällige Cover/BTS-Bilder. ----
function buildHomeIntroThumbs() {
  const wrap = document.getElementById('home-intro-thumbs');
  if (!wrap || typeof PROJECTS === 'undefined') return;

  const pool = [];
  PROJECTS.forEach(p => {
    if (p.cover) pool.push(p.cover);
    (p.bts || []).forEach(src => pool.push(src));
  });
  if (!pool.length) { wrap.innerHTML = ''; return; }

  wrap.innerHTML = shuffle(pool).slice(0, 4)
    .map(src => `<img src="${src}" alt="" loading="lazy">`).join('');
}

// ---- Date formatter ---------------------------------------
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ---- Build project cards (sorted newest first) ------------
let currentProjectFilter = 'all';
let currentProjectSearch = '';

// Klartext-Label je Projekt-Typ — macht auf der Karte sofort sichtbar,
// ob es sich um ein Video-, Fotografie- oder Design-Projekt handelt.
const PROJECT_TYPE_LABELS = { video: 'Video', photo: 'Fotografie', design: 'Design' };

// Titel-Schriftart: im Backend pro Projekt wählbar (Feld "Titel-Schriftart").
// Die eigentliche Liste/Zuordnung kommt aus js/title-fonts.js (window.TITLE_FONT_MAP),
// damit Backend-Auswahl und öffentliche Seite immer dieselben Schriftarten kennen.
// Leer/unbekannt => Standard Messina Sans (keine Inline-Schrift nötig).

// Liefert ein fertiges style-Attribut (oder '') für eine optionale,
// pro Projekt gewählte Titel-Schriftart.
function titleFontStyle(titleFont) {
  const fam = (window.TITLE_FONT_MAP || {})[titleFont];
  return fam ? ` style="font-family:${fam}"` : '';
}

// Wiederverwendbares Card-Markup (Projects-Grid UND Related-Vorschläge auf
// der Detailseite nutzen dasselbe — eine Quelle, konsistente Optik).
function projectCardHTML(p) {
  const coverStyle = p.cover
    ? `style="background-image:url('${p.cover}');background-size:cover;background-position:center"`
    : '';
  // Kategorie + Typ, getrennt durch " · " (z.B. "Musikvideo · Video").
  const typeShort = { video: 'Video', photo: 'Foto', design: 'Design' }[p.type] || '';
  const catLine = [p.category, typeShort].filter(Boolean).join(' · ');
  const titleFont = titleFontStyle(p.titleFont);
  // Hover-Video-Preview, wenn eine Videodatei hinterlegt ist.
  const hasVid = !!p.videoFile;
  const vidEl = hasVid
    ? `<video class="project-card__video" muted loop playsinline preload="none" src="${p.videoFile}"></video>`
    : '';
  return `
      <article class="project-card${hasVid ? ' project-card--has-video' : ''}" onclick="openProject(${p.id})" role="button" tabindex="0">
        <div class="project-card__thumb" ${coverStyle}>${vidEl}</div>
        <div class="project-card__info">
          <span class="project-card__category">${catLine}</span>
          <h3 class="project-card__title" data-title-font="${p.titleFont || ''}"${titleFont}>${p.title}</h3>
        </div>
      </article>`;
}

function buildProjectCards() {
  const grid = document.getElementById('projects-grid');
  if (!grid || typeof PROJECTS === 'undefined') return;

  // Bei aktiver Suche die Titel dauerhaft anzeigen (nicht nur beim Hover),
  // sonst weiss man nicht, welche Projekte der Suche entsprechen.
  grid.classList.toggle('is-searching', !!currentProjectSearch);

  const sorted = [...PROJECTS]
    .filter(p => currentProjectFilter === 'all' || p.type === currentProjectFilter)
    .filter(p => !currentProjectSearch
      || (p.title || '').toLowerCase().includes(currentProjectSearch)
      || (p.category || '').toLowerCase().includes(currentProjectSearch))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  if (!sorted.length) {
    grid.innerHTML = '<p class="projects__empty">Keine Projekte gefunden.</p>';
    return;
  }

  grid.innerHTML = sorted.map(projectCardHTML).join('');
  triggerReveals();
  bindGlitch(grid);
  bindHoverVideos(grid);
}

// Nach dem Öffnen eines Projekts 2–3 weitere vorschlagen (gleicher Typ zuerst,
// dann der Rest) — führt die Journey weiter, erhöht die Verweildauer.
function renderRelatedProjects(current) {
  const wrap = document.getElementById('detail-related');
  const grid = document.getElementById('detail-related-grid');
  if (!wrap || !grid || typeof PROJECTS === 'undefined') return;

  const pool = PROJECTS.filter(x => x.id !== current.id && x.published !== false);
  const sameType = pool.filter(x => x.type === current.type);
  const rest     = pool.filter(x => x.type !== current.type);
  const candidates = [...sameType, ...rest];

  if (!candidates.length) { wrap.style.display = 'none'; return; }

  // So viele Spalten wie in EINE Reihe passen (Card-Zielbreite ~360px, wie
  // im Projects-Grid), dann genau so viele Projekte zeigen — die Reihe ist
  // gefüllt, die Cards behalten normale Grösse statt riesig zu werden.
  const cols = Math.max(1, Math.min(candidates.length,
    Math.floor((Math.min(window.innerWidth, 2200) - 2 * 80) / 360) || 1));
  const ordered = candidates.slice(0, cols);

  wrap.style.display = '';
  grid.style.gridTemplateColumns = `repeat(${ordered.length}, 1fr)`;
  grid.innerHTML = ordered.map(projectCardHTML).join('');
  bindGlitch(grid);
  bindHoverVideos(grid);
}

// ---- Projects hero — shows a random project cover each time the
// page loads, purely decorative (non-interactive, no title revealed) ----
function buildProjectsHero() {
  const hero = document.getElementById('projects-hero');
  if (!hero || typeof PROJECTS === 'undefined' || !PROJECTS.length) return;

  const withCover = PROJECTS.filter(p => p.cover);
  const pick = withCover.length
    ? withCover[Math.floor(Math.random() * withCover.length)]
    : PROJECTS[0];
  if (!pick) return;

  const img = document.getElementById('projects-hero-img');
  const vid = document.getElementById('projects-hero-video');

  if (pick.videoFile && vid) {
    // Hat das Projekt eine Videodatei, läuft sie als stummer Loop im Banner;
    // das Cover dient als Poster/Fallback, bis das Video bereit ist.
    vid.src = pick.videoFile;
    if (pick.cover) vid.poster = pick.cover;
    vid.style.display = '';
    if (img) { img.style.display = 'none'; img.src = ''; }
    const play = vid.play();
    if (play && play.catch) play.catch(() => {});
  } else {
    if (vid) { try { vid.pause(); } catch (e) {} vid.removeAttribute('src'); vid.style.display = 'none'; }
    if (img) { img.style.display = ''; img.src = pick.cover || ''; img.alt = ''; }
  }

  // Hero ist fixiert (bewegt sich nicht beim Scrollen) und blendet beim
  // Scrollen langsam zu schwarz aus — bei jedem (Wieder-)Aufruf des Tabs
  // wieder auf voll sichtbar zurücksetzen (siehe onProjectsHeroScroll unten).
  hero.style.opacity = '1';
}

// ---- Project filter buttons --------------------------------
window.filterProjects = function(type) {
  currentProjectFilter = type;
  document.querySelectorAll('.projects__filter').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === type);
  });
  const mobileSelect = document.getElementById('projects-filter-select');
  if (mobileSelect) mobileSelect.value = type;
  buildProjectCards();
};

// ---- Handy: Filter-Dropdown statt einzelner Buttons ---------
(function () {
  const select = document.getElementById('projects-filter-select');
  if (!select) return;
  select.addEventListener('change', () => filterProjects(select.value));
})();

// ---- Projekt-Suche — Lupen-Button klappt zu Suchfeld auf ----------
(function () {
  const wrap   = document.getElementById('projects-search');
  const toggle = document.getElementById('projects-search-toggle');
  const input  = document.getElementById('projects-search-input');
  if (!wrap || !toggle || !input) return;

  // Lupe öffnet das Suchfeld; ist es offen, zeigt der Button stattdessen
  // ein Kreuz (siehe CSS) und schliesst + leert das Feld beim Klick.
  toggle.addEventListener('click', () => {
    if (wrap.classList.contains('is-open')) {
      input.value = '';
      currentProjectSearch = '';
      buildProjectCards();
      wrap.classList.remove('is-open');
      input.blur();
      return;
    }
    wrap.classList.add('is-open');
    input.focus();
  });

  input.addEventListener('input', () => {
    currentProjectSearch = input.value.trim().toLowerCase();
    buildProjectCards();
  });

  input.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    input.value = '';
    currentProjectSearch = '';
    buildProjectCards();
    wrap.classList.remove('is-open');
    input.blur();
  });

  // Schliesst das Suchfeld wieder, wenn man daneben klickt und es leer ist.
  document.addEventListener('click', e => {
    if (wrap.contains(e.target)) return;
    if (!input.value) wrap.classList.remove('is-open');
  });
})();

// ---- Titel-Umschalter neben der Suche: blendet die Projekt-Titel
// dauerhaft ein/aus (unabhängig vom Hover). Die Klasse bleibt am Grid,
// auch wenn das Grid bei Filter/Suche neu befüllt wird. ----
(function () {
  const btn  = document.getElementById('projects-titles-toggle');
  const grid = document.getElementById('projects-grid');
  if (!btn || !grid) return;
  btn.addEventListener('click', () => {
    const on = grid.classList.toggle('show-titles');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('title', on ? 'Titel ausblenden' : 'Titel anzeigen');
  });
})();

// Holt die reine YouTube-Video-ID egal ob eine ganze URL
// (youtu.be/..., youtube.com/watch?v=..., .../embed/...) oder
// bereits nur die ID eingegeben wurde.
function extractYouTubeId(input) {
  if (!input) return '';
  const str = input.trim();
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/,
    /[?&]v=([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/,
  ];
  for (const re of patterns) {
    const m = str.match(re);
    if (m) return m[1];
  }
  // Schon eine reine ID (kein "/" oder "." enthalten)
  if (/^[a-zA-Z0-9_-]{6,}$/.test(str)) return str;
  return '';
}

// ---- Project detail ---------------------------------------
window.openProject = function(id) {
  if (typeof PROJECTS === 'undefined') return;
  const p = PROJECTS.find(p => p.id === id);
  if (!p) return;

  const videoWrap   = document.getElementById('detail-video-wrap');
  const bannerWrap  = document.getElementById('detail-banner-wrap');
  const headerWrap  = document.getElementById('detail-header-wrap');
  const bodyWrap    = document.getElementById('detail-body');
  const btsWrap     = document.getElementById('detail-bts-wrap');
  const galleryWrap = document.getElementById('detail-gallery');
  const galleryMetaWrap = document.getElementById('detail-gallery-meta-wrap');
  const creditsWrap = document.getElementById('detail-credits-wrap');

  // Header — gleich für alle Projekt-Typen (bei Fotografie/Design steckt
  // der Titel zusätzlich im Banner-Overlay, der Header selbst bleibt
  // dort aber ausgeblendet)
  document.getElementById('detail-category').textContent = p.category || '—';
  const detailTitleEl = document.getElementById('detail-title');
  detailTitleEl.textContent = p.title || '—';
  detailTitleEl.style.fontFamily = (window.TITLE_FONT_MAP || {})[p.titleFont] || '';
  detailTitleEl.dataset.titleFont = p.titleFont || '';

  const isGalleryType = p.type === 'photo' || p.type === 'design';
  document.getElementById('project-detail').classList.toggle('project-detail--gallery', isGalleryType);

  if (isGalleryType) {
    // ---- Fotografie / Design: Banner-Hero (Titel+Desc-Overlay) + Galerie ----
    videoWrap.style.display   = 'none';
    headerWrap.style.display  = 'none';
    bodyWrap.style.display    = 'none';
    btsWrap.style.display     = 'none';
    creditsWrap.style.display = 'none';

    bannerWrap.style.display = '';
    document.getElementById('detail-banner').src = p.cover || '';
    document.getElementById('detail-banner-category').textContent = p.category || '—';
    const detailBannerTitleEl = document.getElementById('detail-banner-title');
    detailBannerTitleEl.textContent = p.title || '—';
    detailBannerTitleEl.style.fontFamily = (window.TITLE_FONT_MAP || {})[p.titleFont] || '';
    detailBannerTitleEl.dataset.titleFont = p.titleFont || '';
    // Beschreibung steht unten unter der Galerie, kurz über Datum/Gear.
    document.getElementById('detail-gallery-desc').textContent    = p.longDesc || p.shortDesc || '';

    const gearLabel = p.type === 'design' ? 'Programm' : 'Gear';
    const creditsHtml = (p.credits && p.credits.length)
      ? p.credits.map(c =>
          `<div>
             <p class="detail__credit-role">${c.role}</p>
             <p class="detail__credit-name">${c.name}</p>
           </div>`
        ).join('')
      : '';

    const galleryImages = (p.gallery && p.gallery.length) ? p.gallery : [];
    window.__galleryImages = galleryImages;

    galleryWrap.innerHTML = galleryImages.map((src, i) =>
      `<div class="detail__gallery-item">
         <img src="${src}" alt="" loading="lazy" onclick="openLightbox(window.__galleryImages, ${i})">
       </div>`
    ).join('');
    galleryWrap.style.display = '';
    // Fotografie: Bilder unbeschnitten in ihrem eigenen Seitenverhältnis
    // zeigen (Masonry-Spalten, gleich breit, beliebige Höhe). Design
    // behält das gleichmässige Crop-Raster.
    galleryWrap.classList.toggle('detail__gallery--masonry', p.type === 'photo');

    // Restliche Infos (Datum, Gear/Programm, Credits) ganz unten unter
    // allen Bildern — die Beschreibung steckt bereits oben im Banner.
    document.getElementById('detail-gallery-meta-list').innerHTML = `
      <div class="detail__meta-item">
        <p class="detail__meta-label">Datum</p>
        <p class="detail__meta-value">${formatDate(p.date)}</p>
      </div>
      <div class="detail__meta-item">
        <p class="detail__meta-label">${gearLabel}</p>
        <p class="detail__meta-value">${p.gear || '—'}</p>
      </div>`;
    document.getElementById('detail-gallery-credits').innerHTML = creditsHtml;
    galleryMetaWrap.style.display = '';

  } else {
    // ---- Video (Standard) ----
    bannerWrap.style.display      = 'none';
    galleryWrap.style.display     = 'none';
    galleryMetaWrap.style.display = 'none';

    headerWrap.style.display  = '';
    bodyWrap.style.display    = '';
    btsWrap.style.display     = '';
    creditsWrap.style.display = '';

    const iframe  = document.getElementById('detail-video');
    const fileVid = document.getElementById('detail-video-file');
    videoWrap.style.display = '';

    if (p.videoFile) {
      // Bevorzugt: echte Videodatei (HTML5-Player) statt YouTube-Embed.
      iframe.src = '';
      iframe.style.display = 'none';
      fileVid.src = p.videoFile;
      fileVid.style.display = '';
      videoWrap.style.background = '';
    } else {
      // Keine Datei → YouTube-Fallback.
      try { fileVid.pause(); } catch (e) {}
      fileVid.removeAttribute('src');
      fileVid.style.display = 'none';
      iframe.style.display = '';
      const videoId = extractYouTubeId(p.video);
      if (videoId && videoId !== 'DEINE_YOUTUBE_ID') {
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1`;
        videoWrap.style.background = '';
      } else {
        iframe.src = '';
        videoWrap.style.background = 'var(--black)';
      }
    }

    document.getElementById('detail-desc').textContent          = p.longDesc || p.shortDesc || '—';
    document.getElementById('detail-meta-category').textContent = p.category || '—';
    document.getElementById('detail-meta-date').textContent     = formatDate(p.date);
    document.getElementById('detail-meta-gear').textContent     = p.gear     || '—';

    const btsGrid = document.getElementById('detail-bts');
    if (p.bts && p.bts.length) {
      const btsImages = p.bts.slice(0, 4);
      window.__btsImages = btsImages;
      btsGrid.innerHTML = btsImages.map((src, i) =>
        `<div class="detail__bts-item">
           <img src="${src}" alt="Behind the Scenes" loading="lazy" onclick="openLightbox(window.__btsImages, ${i})">
         </div>`
      ).join('');
    } else {
      btsGrid.innerHTML = Array(4).fill(
        `<div class="detail__bts-item"></div>`
      ).join('');
    }

    const creditsList = document.getElementById('detail-credits');
    if (p.credits && p.credits.length) {
      creditsList.innerHTML = p.credits.map(c =>
        `<div>
           <p class="detail__credit-role">${c.role}</p>
           <p class="detail__credit-name">${c.name}</p>
         </div>`
      ).join('');
    } else {
      creditsList.innerHTML = '';
    }
  }

  renderRelatedProjects(p);
  showPage('project-detail'); // kümmert sich um Scroll-to-top + Reveals
};

window.backToProjects = function() {
  showPage('projects');
};

// ---- Lightbox: Vollbild-Ansicht für Galerie- & BTS-Bilder --
// Wird sowohl von der Fotografie/Design-Galerie als auch von den
// Behind-the-Scenes-Bildern bei Video-Projekten verwendet.
let lightboxImages = [];
let lightboxIndex  = 0;

window.openLightbox = function(images, index) {
  if (!images || !images.length) return;
  lightboxImages = images;
  lightboxIndex   = index;
  renderLightbox();
  const lb = document.getElementById('lightbox');
  if (lb) lb.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closeLightbox = function() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.style.display = 'none';
  document.body.style.overflow = '';
};

window.lightboxNav = function(dir) {
  if (!lightboxImages.length) return;
  lightboxIndex = (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
  renderLightbox();
};

function renderLightbox() {
  const img = document.getElementById('lightbox-img');
  if (img) img.src = lightboxImages[lightboxIndex] || '';
}

(function initLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  lb.addEventListener('click', e => {
    if (e.target.id === 'lightbox') closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (lb.style.display !== 'flex') return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  lightboxNav(-1);
    if (e.key === 'ArrowRight') lightboxNav(1);
  });

  // Swipe-Navigation auf Touch-Geräten
  let touchStartX = null;
  lb.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
  lb.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) lightboxNav(dx > 0 ? -1 : 1);
    touchStartX = null;
  });
})();

// ---- Contact form -----------------------------------------
const contactForm    = document.getElementById('contact-form');
const successOverlay = document.getElementById('success-overlay');

// Setzt das Kontaktformular + die Erfolgsmeldung wieder in den
// Ausgangszustand zurück — wird bei jedem (erneuten) Aufruf der
// Kontaktseite über showPage() ausgelöst, damit man jederzeit eine
// neue Anfrage senden kann.
function resetContactForm() {
  if (successOverlay) successOverlay.classList.remove('is-open');
  if (!contactForm) return;
  contactForm.reset();
  contactForm.style.display = '';
  contactForm.querySelectorAll('.form-field').forEach(f => f.classList.remove('has-error'));
  const btn = contactForm.querySelector('button[type="submit"]');
  if (btn) { btn.textContent = 'ABSENDEN'; btn.disabled = false; }
}

// Öffnet die Erfolgsmeldung als Kreis, der sich vom Absenden-Button aus
// über die ganze Seite ausbreitet (invertierte Farben: weiss/rot).
function openSuccessOverlay() {
  if (!successOverlay) return;

  // Eingegebene E-Mail in den Erfolgstext einsetzen, damit der Nutzer sieht,
  // dass sie korrekt angekommen ist (Tippfehler-Sicherheit).
  const emailEl = document.getElementById('f-email');
  const emailSpan = document.getElementById('success-overlay-email');
  if (emailSpan) emailSpan.textContent = emailEl ? emailEl.value.trim() : '';

  const btn = contactForm.querySelector('button[type="submit"]');
  const rect = btn ? btn.getBoundingClientRect() : null;
  const ox = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const oy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
  successOverlay.style.setProperty('--ox', ox + 'px');
  successOverlay.style.setProperty('--oy', oy + 'px');
  // Im nächsten Frame öffnen, damit der Browser die Startposition des
  // Kreises (0%) erst sauber rendert, bevor er auf 150% expandiert.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => successOverlay.classList.add('is-open'));
  });
}

if (successOverlay) {
  const homeBtn = document.getElementById('success-home-btn');
  const backBtn = document.getElementById('success-back-btn');
  if (homeBtn) homeBtn.addEventListener('click', () => {
    successOverlay.classList.remove('is-open');
    showPage('home');
  });
  if (backBtn) backBtn.addEventListener('click', () => {
    successOverlay.classList.remove('is-open');
    showPage(pageBeforeContact);
  });
}

if (contactForm) {
  const fields = {
    name:    { el: document.getElementById('f-name'),    validate: v => v.trim().length > 0 },
    email:   { el: document.getElementById('f-email'),   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    subject: { el: document.getElementById('f-subject'), validate: v => v.trim().length > 0 },
    msg:     { el: document.getElementById('f-msg'),     validate: v => v.trim().length > 0 },
  };

  // Live: remove error once user starts typing
  Object.values(fields).forEach(({ el }) => {
    el.addEventListener('input', () => {
      el.closest('.form-field').classList.remove('has-error');
    });
  });

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    // Honeypot: für Menschen unsichtbares Feld. Bots, die Formulare
    // automatisch ausfüllen, tragen hier meist etwas ein — ist es befüllt,
    // wird der Submit ohne Fehlermeldung verworfen (kein Hinweis an den Bot,
    // dass etwas geprüft wurde).
    const honeypot = document.getElementById('f-website');
    if (honeypot && honeypot.value.trim() !== '') return;

    // Validate
    let valid = true;
    Object.values(fields).forEach(({ el, validate }) => {
      const field = el.closest('.form-field');
      if (!validate(el.value)) {
        field.classList.add('has-error');
        valid = false;
      } else {
        field.classList.remove('has-error');
      }
    });

    if (!valid) return;

    // Anfrage zusätzlich im Admin-Bereich speichern (Supabase)
    if (window.supabaseClient) {
      try {
        window.supabaseClient.from('inquiries').insert({
          name:    fields.name.el.value.trim(),
          email:   fields.email.el.value.trim(),
          subject: fields.subject.el.value.trim(),
          message: fields.msg.el.value.trim(),
        }).then(() => {}, () => {});
      } catch (e) { /* nicht kritisch fürs Formular */ }
    }

    // Submit to Formspree (or show success if no ID set yet)
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = '...';
    btn.disabled = true;

    const action = contactForm.action;
    const isFormspree = action && action.includes('formspree.io') && !action.includes('DEINE_FORMSPREE_ID');

    if (isFormspree) {
      try {
        const res = await fetch(action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          openSuccessOverlay();
        } else {
          btn.textContent = 'ABSENDEN';
          btn.disabled = false;
          alert('Fehler beim Senden. Bitte versuche es erneut.');
        }
      } catch {
        btn.textContent = 'ABSENDEN';
        btn.disabled = false;
        alert('Fehler beim Senden. Bitte versuche es erneut.');
      }
    } else {
      // No Formspree ID yet — show success for preview
      openSuccessOverlay();
    }
  });
}

// ---- Browser back/forward ---------------------------------
window.addEventListener('popstate', e => {
  const page = (e.state && e.state.page) || 'home';
  showPage(page, false);
});

// ---- Init -------------------------------------------------
(function init() {
  pages.forEach(p => { p.style.display = 'none'; });
  buildCreativeSpace();
  buildProjectCards();
  buildProjectsHero();
  buildHomeIntroThumbs();
  const hash = location.hash.replace('#', '');
  showPage(hash || 'home', false);
})();


// ---- Font-Glitch (tyma-artig) -----------------------------------------
// Kurzer Scramble-Effekt beim Hover: jeder Buchstabe flackert erst durch
// zufällige Zeichen und "rastet" dann von links nach rechts ein. Bewusst
// nur auf den technischen Caps-Elementen (Nav, Buttons, Filter, Projekt-
// Kategorien) — als Kontrast zur ruhigen Cormorant-Serif. ~230ms, dezent.
const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*/';
function glitchText(el) {
  if (!el || el.__glitching) return;
  const text = el.dataset.glitchText || el.textContent;
  el.dataset.glitchText = text;
  const len = text.length;
  if (!len) return;
  el.__glitching = true;
  let frame = 0;
  const total = 14;
  const run = () => {
    let out = '';
    for (let i = 0; i < len; i++) {
      const c = text[i];
      if (c === ' ') { out += ' '; continue; }
      const revealAt = (i / len) * (total - 4) + 2;
      out += frame >= revealAt ? c : GLITCH_CHARS[(Math.random() * GLITCH_CHARS.length) | 0];
    }
    el.textContent = out;
    frame++;
    if (frame <= total) {
      el.__raf = requestAnimationFrame(run);
    } else {
      el.textContent = text;
      el.__glitching = false;
    }
  };
  run();
}

function bindGlitch(root = document) {
  // Glitch-Effekt entfernt (auf Wunsch) — bewusst kein Verhalten mehr.
}

// Hover-Video-Preview (Projekt-Cards + Creative-Space-Items): startet das
// Video beim Betreten, pausiert und spult beim Verlassen zurück. preload="none"
// → das Video wird erst beim ersten Hover geladen, nicht alle auf einmal.
function bindHoverVideos(root = document) {
  root.querySelectorAll('.project-card--has-video, .cs__item--has-video').forEach(el => {
    if (el.__hvBound) return;
    el.__hvBound = true;
    const vid = el.querySelector('video');
    if (!vid) return;
    el.addEventListener('mouseenter', () => {
      const pr = vid.play();
      if (pr && pr.catch) pr.catch(() => {});
    });
    el.addEventListener('mouseleave', () => {
      try { vid.pause(); vid.currentTime = 0; } catch (e) {}
    });
  });
}

document.addEventListener('DOMContentLoaded', () => bindGlitch());
bindGlitch();

// ---- Smooth Scroll (Lenis) — immer aktiv ------------------------------
// Lenis glättet das Scrollen mit sanfter Trägheit; unsere Scroll-Listener
// (Parallax, Header, Hero-Blur) hören weiterhin auf window 'scroll' und
// laufen dadurch automatisch flüssig mit. (Keine Trackpad-Erkennung mehr.)
(function () {
  if (typeof Lenis === 'undefined') return; // CDN nicht geladen → normales Scrollen
  const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
  function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  window.__lenis = lenis;
})();

// ---- Header-Kontrast über dem Video (luminanzbasiert, rein S/W) --------
// Das Home-Video hat helle UND dunkle Frames. Damit Nav-Tabs und Hero-Logo/
// -Text überall lesbar bleiben (ohne bunte Blend-Artefakte), messen wir die
// tatsächliche Helligkeit des Videos hinter den Elementen und schalten hart
// auf schwarz (über hell) oder weiss (über dunkel).
(function () {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const navEl = document.getElementById('main-nav');
  const navLinksEl = document.querySelector('.nav__links');
  // Text wird NUR auf praktisch reinweissem Grund schwarz (z.B. weisser
  // Creative Space); über dem Video bleibt er sonst immer weiss.
  const LIGHT = 0.95;

  // Helligkeit (0..1) des Video-Frames am Bildschirmpunkt (x,y), korrekt für
  // object-fit: cover. null, wenn dort gerade kein Video liegt (z.B. weil man
  // in den Creative Space gescrollt hat).
  function videoLumAt(x, y) {
    const v = homeVideo;
    if (!v || v.readyState < 2) return null;
    const r = v.getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) return null;
    const vw = v.videoWidth, vh = v.videoHeight;
    if (!vw || !vh) return null;
    const scale = Math.max(r.width / vw, r.height / vh);
    const dw = r.width / scale, dh = r.height / scale;
    const sx0 = (vw - dw) / 2, sy0 = (vh - dh) / 2;
    const px = (x - r.left) / r.width, py = (y - r.top) / r.height;
    const p = 24;
    const sx = Math.max(0, Math.min(vw - p, sx0 + px * dw - p / 2));
    const sy = Math.max(0, Math.min(vh - p, sy0 + py * dh - p / 2));
    try {
      canvas.width = p; canvas.height = p;
      ctx.drawImage(v, sx, sy, p, p, 0, 0, p, p);
      const d = ctx.getImageData(0, 0, p, p).data;
      let s = 0;
      for (let i = 0; i < d.length; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      return s / (d.length / 4) / 255;
    } catch (e) { return null; }
  }

  // true = Hintergrund hinter dem Rechteck ist hell → dunkler Text. Kein Video
  // dahinter (null) gilt als hell (weisser Creative Space).
  function isLightBehind(rect, xs) {
    const cy = rect.top + rect.height / 2;
    let sum = 0, n = 0;
    for (const fx of xs) { const l = videoLumAt(rect.left + rect.width * fx, cy); sum += (l === null ? 1 : l); n++; }
    return n ? (sum / n) > LIGHT : false;
  }

  function update() {
    if (!isFlowId(currentPage)) return;
    if (navEl && navLinksEl) {
      const r = navLinksEl.getBoundingClientRect();
      if (r.width) navEl.classList.toggle('is-lum-light', isLightBehind(r, [0.2, 0.5, 0.8]));
    }
    if (heroChromeEl && heroLogoLinkEl && getComputedStyle(heroChromeEl).visibility !== 'hidden') {
      const r = heroLogoLinkEl.getBoundingClientRect(); // folgt dem Logo auch beim Docking
      if (r.width) heroChromeEl.classList.toggle('is-lum-light', isLightBehind(r, [0.5]));
    }
  }

  // Bewusst NICHT bei jedem Scroll-Frame messen — das teure Canvas-Auslesen
  // des Videos (drawImage + getImageData) pro Frame war die Ursache für das
  // stockige Scrollen, solange das Video sichtbar war. Ein festes Intervall
  // fängt sowohl die wechselnden Video-Frames als auch die Scroll-Position
  // (Nav ist fixed, Video scrollt dahinter) rechtzeitig ab.
  window.addEventListener('resize', update);
  setInterval(update, 180);
  update();
})();
