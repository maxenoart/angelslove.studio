/* ============================================================
   angelslove — main.js  (task #2 state)
   ============================================================ */

const nav        = document.getElementById('main-nav');
const pages      = document.querySelectorAll('.page');
const toggle     = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

let currentPage = 'home';

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
  'home':           'flex',
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
function showPage(id, pushState = true) {

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

    const target = document.getElementById(id);
    const behavior = pushState ? 'smooth' : 'instant';
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior });
    } else if (target) {
      target.scrollIntoView({ behavior, block: 'start' });
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
  document.querySelector('.nav__logo').style.filter = (id === 'book' || id === 'projects' || id === 'project-detail') ? 'invert(1)' : '';

  // Status bar tint follows page background (white / red / dark)
  const themeMeta = document.getElementById('theme-color-meta');
  if (themeMeta) {
    themeMeta.setAttribute('content', id === 'book' ? '#e2073b' : ((id === 'projects' || id === 'project-detail') ? '#0e0e0e' : '#ffffff'));
  }

  document.querySelectorAll('[data-page]').forEach(l => {
    l.classList.toggle('active', l.dataset.page === id);
  });

  window.scrollTo({ top: 0, behavior: 'instant' });

  if (pushState) {
    history.pushState({ page: id }, '', '#' + id);
  }

  setTimeout(() => triggerReveals(), 100);
}

// ---- One-pager scroll tracking (Home ↔ Creative Space) -----
// While the flow is active, figure out which section is actually in
// view as the user scrolls, and keep nav/theme/active-link/history in
// sync — without forcing any hard jump.
(function () {
  let ticking = false;

  function onFlowScroll() {
    ticking = false;
    if (!isFlowId(currentPage)) return;

    const csEl = document.getElementById('creative-space');
    if (!csEl) return;

    const threshold = csEl.offsetTop - window.innerHeight * 0.4;
    const newId = window.scrollY >= threshold ? 'creative-space' : 'home';

    if (newId !== currentPage) {
      currentPage = newId;
      updateChromeForFlowSection(newId);
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

  const HERO_SELECTORS = {
    about:    '#about .about__hero',
    projects: '#projects .projects__hero',
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

// ---- Click handler (nav links + any [data-page]) ----------
document.querySelectorAll('[data-page]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const page = link.dataset.page;
    if (page) {
      showPage(page);
      mobileMenu.classList.remove('open');
    }
  });
});

// ---- Hamburger --------------------------------------------
toggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
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
// clickable through to its project. A couple of curated story/text
// blocks (from creative-space-data.js, if present) get sprinkled in too.
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CS_CARD_LIMIT = 14; // keep the grid to a fixed, manageable size

function buildCreativeSpace() {
  const grid = document.getElementById('cs-grid');
  if (!grid) return;

  const RATIOS = ['4/3', '3/4', '1/1', '16/9'];

  // Media: every project's cover + behind-the-scenes shots, clickable.
  const mediaItems = [];
  if (typeof PROJECTS !== 'undefined') {
    PROJECTS.forEach(p => {
      if (p.cover) {
        mediaItems.push({ type: 'project', src: p.cover, caption: p.title, projectId: p.id });
      }
      (p.bts || []).forEach(src => {
        mediaItems.push({ type: 'project', src, caption: `BTS — ${p.title}`, projectId: p.id });
      });
    });
  }

  // Editorial text blocks, if defined in creative-space-data.js — cap to 2
  // so the grid stays mostly imagery. The first one gets a red accent
  // background so a few boxes break up the imagery with color.
  const allTextItems = (typeof CREATIVE_SPACE_ITEMS !== 'undefined')
    ? CREATIVE_SPACE_ITEMS.filter(i => i.type === 'text')
    : [];
  const textItems = shuffle(allTextItems)
    .slice(0, Math.min(2, allTextItems.length))
    .map((t, idx) => ({ ...t, accentBox: idx === 0 }));

  // Shuffle the media, cap the total card count, then drop the text
  // blocks in at random spots — different selection/layout every load.
  const items = shuffle(mediaItems).slice(0, Math.max(0, CS_CARD_LIMIT - textItems.length));
  textItems.forEach(t => {
    items.splice(Math.floor(Math.random() * (items.length + 1)), 0, t);
  });

  grid.innerHTML = items.map((item, i) => {
    const delay = `${(i % 6) * 0.06}s`;

    if (item.type === 'text') {
      const heading = item.heading.replace(/\n/g, '<br>');
      const accentClass = item.accentBox ? ' cs__item--text-accent' : '';
      return `
        <div class="cs__item cs__item--text${accentClass}" style="transition-delay:${delay}">
          <h3>${heading}</h3>
        </div>`;
    }

    const aspectRatio = RATIOS[i % RATIOS.length];
    return `
      <div class="cs__item cs__item--clickable" style="transition-delay:${delay}"
           onclick="openProject(${item.projectId})" role="button" tabindex="0">
        <img src="${item.src}" alt="${item.caption}" style="aspect-ratio:${aspectRatio};width:100%;object-fit:cover;display:block;">
        <span class="cs__item-caption">${item.caption}</span>
      </div>`;
  }).join('');
}

// ---- Date formatter ---------------------------------------
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ---- Build project cards (sorted newest first) ------------
let currentProjectFilter = 'all';

// Klartext-Label je Projekt-Typ — macht auf der Karte sofort sichtbar,
// ob es sich um ein Video-, Fotografie- oder Design-Projekt handelt.
const PROJECT_TYPE_LABELS = { video: 'Video', photo: 'Fotografie', design: 'Design' };

function buildProjectCards() {
  const grid = document.getElementById('projects-grid');
  if (!grid || typeof PROJECTS === 'undefined') return;

  const sorted = [...PROJECTS]
    .filter(p => currentProjectFilter === 'all' || p.type === currentProjectFilter)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  grid.innerHTML = sorted.map(p => {
    const coverStyle = p.cover
      ? `style="background-image:url('${p.cover}');background-size:cover;background-position:center"`
      : '';
    const typeLabel = PROJECT_TYPE_LABELS[p.type] || '';
    return `
      <article class="project-card" onclick="openProject(${p.id})" role="button" tabindex="0">
        <div class="project-card__thumb" ${coverStyle}>
          ${typeLabel ? `<span class="project-card__type project-card__type--${p.type}">${typeLabel}</span>` : ''}
        </div>
        <div class="project-card__info">
          <span class="project-card__category">${p.category}</span>
          <h3 class="project-card__title">${p.title}</h3>
        </div>
      </article>`;
  }).join('');

  triggerReveals();
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

  document.getElementById('projects-hero-img').src = pick.cover || '';
  document.getElementById('projects-hero-img').alt = '';
}

// ---- Project filter buttons --------------------------------
window.filterProjects = function(type) {
  currentProjectFilter = type;
  document.querySelectorAll('.projects__filter').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === type);
  });
  buildProjectCards();
};

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
  document.getElementById('detail-title').textContent    = p.title    || '—';

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
    document.getElementById('detail-banner-title').textContent    = p.title    || '—';
    document.getElementById('detail-banner-desc').textContent     = p.longDesc || p.shortDesc || '';
    // Gleicher Text auch unter den Bildern — auf dem Handy wird per CSS
    // diese Version gezeigt statt der im Banner-Overlay (siehe styles.css).
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

    const iframe = document.getElementById('detail-video');
    const videoId = extractYouTubeId(p.video);
    videoWrap.style.display = '';
    if (videoId && videoId !== 'DEINE_YOUTUBE_ID') {
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
      videoWrap.style.background = '';
    } else {
      iframe.src = '';
      videoWrap.style.background = 'var(--black)';
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

  showPage('project-detail');
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
const contactForm = document.getElementById('contact-form');
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
          showSuccess();
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
      showSuccess();
    }
  });

  function showSuccess() {
    contactForm.style.display = 'none';
    document.getElementById('form-success').style.display = 'block';
  }
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
  const hash = location.hash.replace('#', '');
  showPage(hash || 'home', false);
})();
