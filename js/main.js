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

  setNavScrolled();
  document.body.classList.remove('is-home');
  document.documentElement.classList.remove('is-home');

  // Kontakt Us: red background throughout — nav matches
  document.body.classList.toggle('is-book', id === 'book');
  document.querySelector('.nav__logo').style.filter = (id === 'book') ? 'invert(1)' : '';

  // Status bar tint follows page background (white / red)
  const themeMeta = document.getElementById('theme-color-meta');
  if (themeMeta) {
    themeMeta.setAttribute('content', id === 'book' ? '#e2073b' : '#ffffff');
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
    return `
      <article class="project-card" onclick="openProject(${p.id})" role="button" tabindex="0">
        <div class="project-card__thumb" ${coverStyle}></div>
        <div class="project-card__info">
          <span class="project-card__category">${p.category}</span>
          <h3 class="project-card__title">${p.title}</h3>
        </div>
      </article>`;
  }).join('');

  triggerReveals();
}

// ---- Project filter buttons --------------------------------
window.filterProjects = function(type) {
  currentProjectFilter = type;
  document.querySelectorAll('.projects__filter').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === type);
  });
  buildProjectCards();
};

// ---- Project detail ---------------------------------------
window.openProject = function(id) {
  if (typeof PROJECTS === 'undefined') return;
  const p = PROJECTS.find(p => p.id === id);
  if (!p) return;

  // YouTube video
  const iframe = document.getElementById('detail-video');
  if (p.video && p.video !== 'DEINE_YOUTUBE_ID') {
    iframe.src = `https://www.youtube.com/embed/${p.video}?autoplay=0&rel=0&modestbranding=1`;
    document.getElementById('detail-video-wrap').style.display = '';
  } else {
    iframe.src = '';
    document.getElementById('detail-video-wrap').style.background = 'var(--black)';
  }

  // Header
  document.getElementById('detail-category').textContent      = p.category  || '—';
  document.getElementById('detail-title').textContent         = p.title     || '—';
  document.getElementById('detail-desc').textContent          = p.longDesc  || p.shortDesc || '—';

  // Meta
  document.getElementById('detail-meta-category').textContent = p.category  || '—';
  document.getElementById('detail-meta-date').textContent     = formatDate(p.date);
  document.getElementById('detail-meta-gear').textContent     = p.gear      || '—';

  // BTS — 4 images
  const btsGrid = document.getElementById('detail-bts');
  if (p.bts && p.bts.length) {
    btsGrid.innerHTML = p.bts.slice(0, 4).map(src =>
      `<div class="detail__bts-item">
         <img src="${src}" alt="Behind the Scenes" loading="lazy">
       </div>`
    ).join('');
  } else {
    btsGrid.innerHTML = Array(4).fill(
      `<div class="detail__bts-item"></div>`
    ).join('');
  }

  // Credits
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

  showPage('project-detail');
};

window.backToProjects = function() {
  showPage('projects');
};

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
  const hash = location.hash.replace('#', '');
  showPage(hash || 'home', false);
})();
