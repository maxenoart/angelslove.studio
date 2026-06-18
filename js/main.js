/* ============================================================
   angelslove — main.js  (task #2 state)
   ============================================================ */

const nav        = document.getElementById('main-nav');
const pages      = document.querySelectorAll('.page');
const toggle     = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

let currentPage = 'home';

// Each page id maps to its natural CSS display value
const PAGE_DISPLAY = {
  'home':           'flex',
  'creative-space': 'block',
  'projects':       'block',
  'project-detail': 'block',
  'about':          'block',
  'book':           'block',
};

// ---- Nav helpers ------------------------------------------
function setNavDark() {
  nav.classList.remove('nav--scrolled');
  nav.classList.add('nav--dark');
}

function setNavScrolled() {
  nav.classList.remove('nav--dark');
  nav.classList.add('nav--scrolled');
}

// ---- Page routing -----------------------------------------
function showPage(id, pushState = true) {
  // Hide all pages
  pages.forEach(p => {
    p.style.display = 'none';
    p.classList.remove('visible');
  });

  const target = document.getElementById(id);
  if (!target) return;

  target.style.display = PAGE_DISPLAY[id] || 'block';

  // Fade in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.classList.add('visible');
    });
  });

  currentPage = id;

  // Nav state
  if (id === 'home') {
    setNavDark();
    document.body.classList.add('is-home');
  } else {
    setNavScrolled();
    document.body.classList.remove('is-home');
  }

  // Book Us: red background throughout — nav matches
  document.body.classList.toggle('is-book', id === 'book');
  document.querySelector('.nav__logo').style.filter = (id === 'book') ? 'invert(1)' : '';

  // Active link
  document.querySelectorAll('[data-page]').forEach(l => {
    l.classList.toggle('active', l.dataset.page === id);
  });

  window.scrollTo({ top: 0, behavior: 'instant' });

  if (pushState) {
    history.pushState({ page: id }, '', '#' + id);
  }

  setTimeout(() => triggerReveals(), 100);
}

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

// ---- Scroll: home nav only --------------------------------
window.addEventListener('scroll', () => {
  if (currentPage === 'home') {
    if (window.scrollY > 20) {
      setNavScrolled();
    } else {
      setNavDark();
    }
  }
}, { passive: true });

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
    '.page.visible .reveal, .page.visible .cs__item, .page.visible .project-card, .page.visible .about__member'
  );
  els.forEach(el => {
    if (!el.classList.contains('revealed')) {
      revealObserver.observe(el);
    }
  });
}

// ---- Build Creative Space grid from data ------------------
function buildCreativeSpace() {
  const grid = document.getElementById('cs-grid');
  if (!grid || typeof CREATIVE_SPACE_ITEMS === 'undefined') return;

  grid.innerHTML = CREATIVE_SPACE_ITEMS.map(item => {
    if (item.type === 'text') {
      const heading = item.heading.replace(/\n/g, '<br>');
      return `
        <div class="cs__item cs__item--text" style="transition-delay:${item.delay}">
          <h3>${heading}</h3>
          <p>${item.text}</p>
        </div>`;
    }

    const accentClass = item.accent ? ' cs__item--accent' : '';
    const hasImage = item.src;
    const inner = hasImage
      ? `<img src="${item.src}" alt="${item.caption}" style="aspect-ratio:${item.aspectRatio};width:100%;object-fit:cover;display:block;">`
      : `<div class="cs__placeholder" style="aspect-ratio:${item.aspectRatio}"></div>`;

    return `
      <div class="cs__item${accentClass}" style="transition-delay:${item.delay}">
        ${inner}
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
function buildProjectCards() {
  const grid = document.getElementById('projects-grid');
  if (!grid || typeof PROJECTS === 'undefined') return;

  const sorted = [...PROJECTS].sort((a, b) =>
    (b.date || '').localeCompare(a.date || '')
  );

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
}

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
