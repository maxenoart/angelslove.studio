-- ============================================================
-- angelslove — Migration: Galerie-Feld für Fotografie/Design-Projekte
-- ============================================================
-- Diese Datei einmalig im Supabase-Dashboard ausführen:
-- Supabase-Projekt → SQL Editor → "New query" → einfügen → Run.
--
-- Fügt eine neue Spalte "gallery" zur projects-Tabelle hinzu.
-- Dort werden die Bild-URLs der neuen, beliebig langen Galerie für
-- Fotografie- und Design-Projekte gespeichert (analog zu "bts", aber
-- ohne 4er-Limit). Bestehende Projekte erhalten automatisch ein
-- leeres Array als Standardwert — nichts Bestehendes wird verändert.
-- ============================================================

alter table public.projects
  add column if not exists gallery jsonb not null default '[]'::jsonb;
