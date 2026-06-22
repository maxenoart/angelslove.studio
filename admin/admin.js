/* ============================================================
   angelslove — Admin-Dashboard
   ============================================================ */

const sb = window.supabaseClient;

const loginScreen = document.getElementById('login-screen');
const dashboard   = document.getElementById('dashboard');
const loginForm   = document.getElementById('login-form');
const loginError  = document.getElementById('login-error');
const logoutBtn   = document.getElementById('logout-btn');

let statsLoaded = false;
let inquiriesLoaded = false;

// ---- Auth ----------------------------------------------------
function showDashboard() {
  loginScreen.style.display = 'none';
  dashboard.classList.add('is-active');
  loadProjects();
  refreshInquiriesBadge();
}
function showLogin() {
  loginScreen.style.display = 'flex';
  dashboard.classList.remove('is-active');
  statsLoaded = false;
  inquiriesLoaded = false;
}

async function checkSession() {
  if (!sb) { console.error('Supabase nicht verbunden'); return; }
  const { data } = await sb.auth.getSession();
  if (data && data.session) showDashboard();
  else showLogin();
}
checkSession();

sb && sb.auth.onAuthStateChange((_event, session) => {
  if (session) showDashboard();
  else showLogin();
});

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  loginError.style.display = 'none';
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    loginError.style.display = 'block';
  }
});

logoutBtn.addEventListener('click', async () => {
  await sb.auth.signOut();
});

// ---- Sidebar nav ----------------------------------------------
document.querySelectorAll('.sidebar__nav button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sidebar__nav button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('is-active'));
    document.getElementById('view-' + btn.dataset.view).classList.add('is-active');
    if (btn.dataset.view === 'stats' && !statsLoaded) {
      statsLoaded = true;
      loadStats();
    }
    if (btn.dataset.view === 'inquiries' && !inquiriesLoaded) {
      inquiriesLoaded = true;
      loadInquiries();
    }
  });
});

// ---- Projekte: Liste -------------------------------------------
const projectList = document.getElementById('project-list');

async function loadProjects() {
  projectList.innerHTML = '<p class="loading-note">Lade Projekte …</p>';
  const { data, error } = await sb.from('projects').select('*').order('created_at', { ascending: false });
  if (error) {
    projectList.innerHTML = `<p class="loading-note">Fehler beim Laden: ${error.message}</p>`;
    return;
  }
  if (!data.length) {
    projectList.innerHTML = '<div class="empty-state">Noch keine Projekte. Klicke auf „+ Neues Projekt".</div>';
    return;
  }

  projectList.innerHTML = data.map(p => `
    <div class="project-row" data-id="${p.id}">
      <div class="project-row__thumb" style="${p.cover ? `background-image:url('${p.cover}')` : ''}"></div>
      <div class="project-row__info">
        <div class="project-row__title">${escapeHtml(p.title || 'Ohne Titel')}</div>
        <div class="project-row__meta">${escapeHtml(p.category || '')} · ${p.date || '—'}</div>
      </div>
      <span class="project-row__badge ${p.published ? 'project-row__badge--published' : 'project-row__badge--draft'}">
        ${p.published ? 'Veröffentlicht' : 'Entwurf'}
      </span>
      <div class="project-row__actions">
        <button class="btn btn--ghost btn--small" data-action="toggle">${p.published ? 'Zurückziehen' : 'Veröffentlichen'}</button>
        <button class="btn btn--ghost btn--small" data-action="edit">Bearbeiten</button>
        <button class="btn btn--danger btn--small" data-action="delete">Löschen</button>
      </div>
    </div>
  `).join('');

  projectList.querySelectorAll('.project-row').forEach(row => {
    const id = Number(row.dataset.id);
    const project = data.find(p => p.id === id);
    row.querySelector('[data-action="edit"]').addEventListener('click', () => openModal(project));
    row.querySelector('[data-action="toggle"]').addEventListener('click', async () => {
      await sb.from('projects').update({ published: !project.published }).eq('id', id);
      loadProjects();
    });
    row.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      if (!confirm(`„${project.title}" wirklich löschen?`)) return;
      await sb.from('projects').delete().eq('id', id);
      loadProjects();
    });
  });
}

// ---- Anfragen (Kontaktformular) --------------------------------
const inquiryList = document.getElementById('inquiry-list');
const inquiriesBadge = document.getElementById('inquiries-badge');

async function refreshInquiriesBadge() {
  if (!sb) return;
  const { count } = await sb.from('inquiries').select('id', { count: 'exact', head: true }).eq('is_read', false);
  if (count) {
    inquiriesBadge.textContent = count;
    inquiriesBadge.style.display = 'inline-block';
  } else {
    inquiriesBadge.style.display = 'none';
  }
}

async function loadInquiries() {
  inquiryList.innerHTML = '<p class="loading-note">Lade Anfragen …</p>';
  const { data, error } = await sb.from('inquiries').select('*').order('created_at', { ascending: false });
  if (error) {
    inquiryList.innerHTML = `<p class="loading-note">Fehler beim Laden: ${error.message}</p>`;
    return;
  }
  if (!data.length) {
    inquiryList.innerHTML = '<div class="empty-state">Noch keine Anfragen über das Kontaktformular.</div>';
    refreshInquiriesBadge();
    return;
  }

  inquiryList.innerHTML = data.map(i => `
    <div class="inquiry-row ${i.is_read ? '' : 'inquiry-row--unread'}" data-id="${i.id}">
      <div class="inquiry-row__top">
        <div>
          <div class="inquiry-row__who">${escapeHtml(i.name || 'Unbekannt')} · <a href="mailto:${escapeHtml(i.email || '')}">${escapeHtml(i.email || '')}</a></div>
          <div class="inquiry-row__meta">${i.created_at ? new Date(i.created_at).toLocaleString('de-CH') : ''}</div>
        </div>
        ${i.is_read ? '' : '<span class="inquiry-row__badge">Neu</span>'}
      </div>
      <div class="inquiry-row__subject">${escapeHtml(i.subject || '(kein Betreff)')}</div>
      <div class="inquiry-row__message">${escapeHtml(i.message || '')}</div>
      <div class="inquiry-row__actions">
        <button class="btn btn--ghost btn--small" data-action="toggle-read">${i.is_read ? 'Als ungelesen markieren' : 'Als gelesen markieren'}</button>
        <button class="btn btn--danger btn--small" data-action="delete">Löschen</button>
      </div>
    </div>
  `).join('');

  inquiryList.querySelectorAll('.inquiry-row').forEach(row => {
    const id = Number(row.dataset.id);
    const inquiry = data.find(i => i.id === id);
    row.querySelector('[data-action="toggle-read"]').addEventListener('click', async () => {
      await sb.from('inquiries').update({ is_read: !inquiry.is_read }).eq('id', id);
      loadInquiries();
      refreshInquiriesBadge();
    });
    row.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      if (!confirm('Diese Anfrage wirklich löschen?')) return;
      await sb.from('inquiries').delete().eq('id', id);
      loadInquiries();
      refreshInquiriesBadge();
    });
  });

  refreshInquiriesBadge();
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---- Projekt-Formular (Modal) -----------------------------------
const modalBackdrop = document.getElementById('modal-backdrop');
const projectForm   = document.getElementById('project-form');
const creditsRows    = document.getElementById('credits-rows');

document.getElementById('new-project-btn').addEventListener('click', () => openModal(null));
document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);

function openModal(project) {
  document.getElementById('modal-title').textContent = project ? 'Projekt bearbeiten' : 'Neues Projekt';
  document.getElementById('p-id').value       = project ? project.id : '';
  document.getElementById('p-title').value    = project ? project.title || '' : '';
  document.getElementById('p-type').value     = project ? project.type || 'video' : 'video';
  document.getElementById('p-category').value = project ? project.category || '' : '';
  document.getElementById('p-date').value     = project ? project.date || '' : '';
  document.getElementById('p-gear').value      = project ? project.gear || '' : '';
  document.getElementById('p-desc').value      = project ? project.long_desc || '' : '';
  document.getElementById('p-video').value     = project ? project.video || '' : '';
  document.getElementById('p-cover-url').value = project ? project.cover || '' : '';
  document.getElementById('p-bts-urls').value  = project && project.bts ? JSON.stringify(project.bts) : '[]';
  document.getElementById('p-published').checked = project ? !!project.published : false;
  document.getElementById('p-cover-file').value = '';
  document.getElementById('p-bts-files').value  = '';

  renderCoverPreview();
  renderBtsPreview();

  creditsRows.innerHTML = '';
  const credits = project && project.credits && project.credits.length ? project.credits : [{ role: '', name: '' }];
  credits.forEach(c => addCreditRow(c.role, c.name));

  modalBackdrop.classList.add('is-active');
}
function closeModal() { modalBackdrop.classList.remove('is-active'); }

function addCreditRow(role = '', name = '') {
  const row = document.createElement('div');
  row.className = 'credits-row';
  row.innerHTML = `
    <input type="text" placeholder="Rolle (z.B. Director)" class="credit-role" value="${escapeHtml(role)}">
    <input type="text" placeholder="Name" class="credit-name" value="${escapeHtml(name)}">
    <button type="button" class="btn btn--ghost btn--small remove-credit">×</button>
  `;
  row.querySelector('.remove-credit').addEventListener('click', () => row.remove());
  creditsRows.appendChild(row);
}
document.getElementById('add-credit-btn').addEventListener('click', () => addCreditRow());

// ---- Bild-Uploads -------------------------------------------------
function renderCoverPreview() {
  const url = document.getElementById('p-cover-url').value;
  const box = document.getElementById('p-cover-preview');
  box.innerHTML = url ? `<img src="${url}">` : '';
}
function renderBtsPreview() {
  const urls = JSON.parse(document.getElementById('p-bts-urls').value || '[]');
  const box = document.getElementById('p-bts-preview');
  box.innerHTML = urls.map(u => `<img src="${u}">`).join('');
}

async function uploadImage(file) {
  const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
  const { error } = await sb.storage.from('project-images').upload(path, file);
  if (error) { alert('Upload fehlgeschlagen: ' + error.message); return null; }
  const { data } = sb.storage.from('project-images').getPublicUrl(path);
  return data.publicUrl;
}

document.getElementById('p-cover-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  const url = await uploadImage(file);
  if (url) { document.getElementById('p-cover-url').value = url; renderCoverPreview(); }
});

document.getElementById('p-bts-files').addEventListener('change', async e => {
  const files = Array.from(e.target.files).slice(0, 4);
  const urls = JSON.parse(document.getElementById('p-bts-urls').value || '[]');
  for (const file of files) {
    const url = await uploadImage(file);
    if (url) urls.push(url);
  }
  document.getElementById('p-bts-urls').value = JSON.stringify(urls.slice(0, 4));
  renderBtsPreview();
});

// ---- Speichern -----------------------------------------------------
projectForm.addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('p-id').value;

  const credits = Array.from(creditsRows.querySelectorAll('.credits-row')).map(row => ({
    role: row.querySelector('.credit-role').value.trim(),
    name: row.querySelector('.credit-name').value.trim(),
  })).filter(c => c.role || c.name);

  const payload = {
    title:     document.getElementById('p-title').value.trim(),
    type:      document.getElementById('p-type').value,
    category:  document.getElementById('p-category').value.trim(),
    date:      document.getElementById('p-date').value || null,
    gear:      document.getElementById('p-gear').value.trim(),
    long_desc: document.getElementById('p-desc').value.trim(),
    video:     document.getElementById('p-video').value.trim(),
    cover:     document.getElementById('p-cover-url').value.trim(),
    bts:       JSON.parse(document.getElementById('p-bts-urls').value || '[]'),
    credits,
    published: document.getElementById('p-published').checked,
  };

  const saveBtn = document.getElementById('modal-save-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Speichert …';

  const { error } = id
    ? await sb.from('projects').update(payload).eq('id', id)
    : await sb.from('projects').insert(payload);

  saveBtn.disabled = false;
  saveBtn.textContent = 'Speichern';

  if (error) { alert('Fehler beim Speichern: ' + error.message); return; }

  closeModal();
  loadProjects();
});

// ---- Statistik ------------------------------------------------------
async function loadStats() {
  const { data: events, error } = await sb
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10000);

  if (error || !events) {
    document.getElementById('kpi-visitors').textContent = '—';
    return;
  }

  const pageviews = events.filter(e => e.event_type === 'pageview');
  const dwells    = events.filter(e => e.event_type === 'dwell');
  const clicks    = events.filter(e => e.event_type === 'click');
  const sessions  = new Set(events.map(e => e.session_id)).size;

  document.getElementById('kpi-visitors').textContent  = sessions;
  document.getElementById('kpi-pageviews').textContent = pageviews.length;
  document.getElementById('kpi-clicks').textContent    = clicks.length;

  const avgDwell = dwells.length
    ? Math.round(dwells.reduce((sum, e) => sum + Number(e.dwell_seconds || 0), 0) / dwells.length)
    : 0;
  document.getElementById('kpi-dwell').textContent = avgDwell ? `${avgDwell}s` : '—';

  renderPageviewsChart(pageviews);
  renderDeviceChart(pageviews);
  renderTopProjectsChart(pageviews);
  renderReferrerTable(pageviews);
  renderClicksTable(clicks);
}

let chartPageviews, chartDevices, chartTopProjects;

function renderPageviewsChart(pageviews) {
  const days = [];
  const counts = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push(key.slice(5));
    counts.push(pageviews.filter(e => (e.created_at || '').slice(0, 10) === key).length);
  }
  const ctx = document.getElementById('chart-pageviews');
  if (chartPageviews) chartPageviews.destroy();
  chartPageviews = new Chart(ctx, {
    type: 'line',
    data: { labels: days, datasets: [{ data: counts, borderColor: '#e2073b', backgroundColor: 'rgba(226,7,59,0.08)', fill: true, tension: 0.3, pointRadius: 0 }] },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
  });
}

function renderDeviceChart(pageviews) {
  const counts = { mobile: 0, tablet: 0, desktop: 0 };
  pageviews.forEach(e => { if (counts[e.device_type] !== undefined) counts[e.device_type]++; });
  const ctx = document.getElementById('chart-devices');
  if (chartDevices) chartDevices.destroy();
  chartDevices = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Mobile', 'Tablet', 'Desktop'],
      datasets: [{ data: [counts.mobile, counts.tablet, counts.desktop], backgroundColor: ['#e2073b', '#0e0e0e', '#a0a0a6'] }],
    },
    options: { plugins: { legend: { position: 'bottom' } } },
  });
}

function renderTopProjectsChart(pageviews) {
  const counts = {};
  pageviews.forEach(e => {
    if (e.page && e.page.startsWith('project:')) {
      const title = e.page.slice(8);
      counts[title] = (counts[title] || 0) + 1;
    }
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const ctx = document.getElementById('chart-top-projects');
  if (chartTopProjects) chartTopProjects.destroy();
  chartTopProjects = new Chart(ctx, {
    type: 'bar',
    data: { labels: sorted.map(s => s[0]), datasets: [{ data: sorted.map(s => s[1]), backgroundColor: '#e2073b' }] },
    options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } },
  });
}

function renderReferrerTable(pageviews) {
  const counts = {};
  pageviews.forEach(e => { const r = e.referrer || 'direct'; counts[r] = (counts[r] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const tbody = document.querySelector('#table-referrers tbody');
  tbody.innerHTML = sorted.map(([ref, count]) => `<tr><td>${escapeHtml(ref)}</td><td>${count}</td></tr>`).join('') || '<tr><td>Keine Daten</td></tr>';
}

function renderClicksTable(clicks) {
  const counts = {};
  clicks.forEach(e => {
    const key = `${e.target || '—'}|${e.page || '—'}`;
    counts[key] = (counts[key] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const tbody = document.querySelector('#table-clicks tbody');
  tbody.innerHTML = sorted.map(([key, count]) => {
    const [target, page] = key.split('|');
    return `<tr><td>${escapeHtml(target)}</td><td>${escapeHtml(page)}</td><td>${count}</td></tr>`;
  }).join('') || '<tr><td colspan="3">Keine Daten</td></tr>';
}
