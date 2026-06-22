/* ============================================================
   angelslove — Eigenes Besucher-Tracking (datensparsam)
   ============================================================
   Schreibt Seitenaufrufe, Verweildauer, Gerätetyp, Herkunft und
   Klicks direkt in die Supabase-Tabelle "analytics_events".
   Es werden KEINE Namen, IP-Adressen oder Cookies von Drittanbietern
   verwendet — nur eine zufällige, anonyme Sitzungs-ID pro Besuch
   (gespeichert in sessionStorage, verschwindet beim Schliessen des Tabs).
   ============================================================ */

(function () {
  if (!window.supabaseClient) return;

  // ---- Anonyme Sitzungs-ID --------------------------------
  function getSessionId() {
    let id = sessionStorage.getItem('al_sid');
    if (!id) {
      id = 'sid_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('al_sid', id);
    }
    return id;
  }
  const sessionId = getSessionId();

  // ---- Gerätetyp -------------------------------------------
  function getDeviceType() {
    const w = window.innerWidth;
    if (w < 700) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
  }

  // ---- Herkunft ----------------------------------------------
  function getReferrer() {
    if (!document.referrer) return 'direct';
    try {
      const host = new URL(document.referrer).hostname;
      return host.includes(location.hostname) ? 'direct' : host;
    } catch (e) {
      return 'direct';
    }
  }

  function track(row) {
    try {
      window.supabaseClient.from('analytics_events').insert({
        session_id: sessionId,
        device_type: getDeviceType(),
        referrer: getReferrer(),
        ...row,
      }).then(() => {}, () => {});
    } catch (e) { /* nie blockierend */ }
  }

  // ---- Pageviews + Verweildauer pro "Seite" -----------------
  // currentPage / openProject() aus main.js bestimmen die aktuell
  // sichtbare Sektion — wir lesen das über den Hash + den Titel
  // des gerade geöffneten Projekts aus.
  let activePage = null;
  let pageStart = null;

  function flushDwell() {
    if (!activePage || !pageStart) return;
    const seconds = Math.round((Date.now() - pageStart) / 1000);
    if (seconds > 0 && seconds < 3600) {
      track({ event_type: 'dwell', page: activePage, dwell_seconds: seconds });
    }
  }

  function currentPageLabel() {
    const hash = location.hash.replace('#', '') || 'home';
    if (hash === 'project-detail') {
      const titleEl = document.getElementById('detail-title');
      const t = titleEl && titleEl.textContent && titleEl.textContent !== '—' ? titleEl.textContent : '';
      return t ? `project:${t}` : 'project-detail';
    }
    return hash;
  }

  function onPageChange() {
    flushDwell();
    activePage = currentPageLabel();
    pageStart = Date.now();
    track({ event_type: 'pageview', page: activePage });
  }

  window.addEventListener('hashchange', () => setTimeout(onPageChange, 50));
  window.addEventListener('beforeunload', flushDwell);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushDwell();
    else { pageStart = Date.now(); }
  });

  // Erste Seite nach vollständigem Laden erfassen
  window.addEventListener('load', () => setTimeout(onPageChange, 300));

  // ---- Klickverhalten ----------------------------------------
  // Erfasst Klicks auf Buttons, Navigationslinks und Projekt-Karten —
  // jeweils nur ein kurzes Label, kein personenbezogener Inhalt.
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-page], .btn, .project-card, .cs__item--clickable, .page-next');
    if (!el) return;
    let label = el.dataset.page || el.textContent.trim().slice(0, 40) || el.className.split(' ')[0];
    track({ event_type: 'click', page: currentPageLabel(), target: label });
  });
})();
