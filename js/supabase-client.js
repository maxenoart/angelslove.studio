/* ============================================================
   angelslove — Supabase-Verbindung
   ============================================================
   Diese Werte sind unkritisch (kein Passwort) und dürfen öffentlich
   im Code stehen — der Zugriff auf Daten wird serverseitig durch
   Supabase Row Level Security geregelt (siehe notes/supabase-schema.sql).
   ============================================================ */

const SUPABASE_URL = 'https://yulamqlcdxtwgvkrsxbd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_cRWlJc8Yu3rlC7DxBLSQDA_SgYPxZjH';

window.supabaseClient = (typeof supabase !== 'undefined')
  ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;
