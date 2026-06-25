/* ============================================================
   angelslove — Projekte aus Supabase laden (öffentliche Seite)
   ============================================================
   Lädt alle veröffentlichten Projekte aus der Supabase-Datenbank
   und ersetzt das lokale PROJECTS-Array damit. Schlägt die
   Verbindung fehl (z.B. offline), bleibt einfach die lokale
   Demo-Liste aus Website/PROJECTS/projects-data.js bestehen —
   die Seite funktioniert also immer.
   ============================================================ */

(async function () {
  if (!window.supabaseClient) return;

  try {
    const { data, error } = await window.supabaseClient
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('date', { ascending: false });

    if (error || !data || !data.length) return;

    window.PROJECTS = data.map(row => ({
      id:       row.id,
      type:     row.type,
      category: row.category,
      title:    row.title,
      titleFont: row.title_font || '',
      date:     row.date,
      gear:     row.gear,
      longDesc: row.long_desc,
      video:    row.video,
      cover:    row.cover,
      bts:      row.bts || [],
      gallery:  row.gallery || [],
      credits:  row.credits || [],
    }));

    if (typeof window.buildCreativeSpace === 'function') window.buildCreativeSpace();
    if (typeof window.buildProjectCards   === 'function') window.buildProjectCards();
    if (typeof window.buildProjectsHero   === 'function') window.buildProjectsHero();
  } catch (e) {
    // Verbindung fehlgeschlagen — lokale Fallback-Daten bleiben aktiv.
  }
})();
