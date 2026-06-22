-- ============================================================
-- angelslove — Supabase Datenbank-Schema
-- ============================================================
-- Anleitung:
-- 1. Gehe in deinem Supabase-Projekt auf "SQL Editor" (linkes Menü)
-- 2. Klicke "New query"
-- 3. Kopiere dieses GESAMTE Skript hinein und klicke "Run"
-- 4. Erstelle danach noch den Storage-Bucket "project-images"
--    unter "Storage" → "New bucket" → Name: project-images
--    → Häkchen bei "Public bucket" setzen → "Create bucket"
-- ============================================================

-- ---- Projekte ----------------------------------------------
create table if not exists projects (
  id          bigint generated always as identity primary key,
  type        text not null default 'video' check (type in ('video','photo','design')),
  category    text not null default '',
  title       text not null default '',
  date        date,
  gear        text default '',
  long_desc   text default '',
  video       text default '',
  cover       text default '',
  bts         jsonb default '[]'::jsonb,
  credits     jsonb default '[]'::jsonb,
  published   boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table projects enable row level security;

drop policy if exists "Public read published projects" on projects;
create policy "Public read published projects"
  on projects for select
  using (published = true);

drop policy if exists "Authenticated full access projects" on projects;
create policy "Authenticated full access projects"
  on projects for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---- Besucher- & Nutzungsstatistik ---------------------------
create table if not exists analytics_events (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  event_type    text not null,           -- 'pageview' | 'dwell' | 'click'
  page          text,                     -- z.B. 'home', 'projects', 'project:Hope Dies Last'
  session_id    text,                     -- zufällige ID pro Besuch (kein Personenbezug)
  referrer      text,                     -- Herkunft (Domain) oder 'direct'
  device_type   text,                     -- 'mobile' | 'tablet' | 'desktop'
  dwell_seconds numeric,                  -- nur bei event_type = 'dwell'
  target        text                      -- nur bei event_type = 'click'
);

alter table analytics_events enable row level security;

drop policy if exists "Anyone can insert events" on analytics_events;
create policy "Anyone can insert events"
  on analytics_events for insert
  with check (true);

drop policy if exists "Authenticated can read events" on analytics_events;
create policy "Authenticated can read events"
  on analytics_events for select
  using (auth.role() = 'authenticated');

-- ---- Kontaktanfragen (Contact-Formular) ----------------------
create table if not exists inquiries (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null default '',
  email       text not null default '',
  subject     text not null default '',
  message     text not null default '',
  is_read     boolean not null default false
);

alter table inquiries enable row level security;

drop policy if exists "Anyone can submit inquiries" on inquiries;
create policy "Anyone can submit inquiries"
  on inquiries for insert
  with check (true);

drop policy if exists "Authenticated can manage inquiries" on inquiries;
create policy "Authenticated can manage inquiries"
  on inquiries for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---- Storage: Zugriff auf Bucket "project-images" ------------
-- (Bucket selbst muss vorher manuell im Dashboard erstellt werden,
--  siehe Anleitung oben — dieses Skript setzt nur die Zugriffsregeln)

drop policy if exists "Public read project images" on storage.objects;
create policy "Public read project images"
  on storage.objects for select
  using (bucket_id = 'project-images');

drop policy if exists "Authenticated upload project images" on storage.objects;
create policy "Authenticated upload project images"
  on storage.objects for insert
  with check (bucket_id = 'project-images' and auth.role() = 'authenticated');

drop policy if exists "Authenticated update project images" on storage.objects;
create policy "Authenticated update project images"
  on storage.objects for update
  using (bucket_id = 'project-images' and auth.role() = 'authenticated');

drop policy if exists "Authenticated delete project images" on storage.objects;
create policy "Authenticated delete project images"
  on storage.objects for delete
  using (bucket_id = 'project-images' and auth.role() = 'authenticated');
