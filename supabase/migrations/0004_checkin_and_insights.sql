-- Richer daily check-in (screen time, social contact, movement, sleep
-- awakenings, a free-text note with its own mood-impact rating) so mood can
-- be cross-referenced against everything else being tracked.

alter table public.symptom_logs
  add column if not exists social_media_minutes int,
  add column if not exists social_contact int check (social_contact between 0 and 5),
  add column if not exists movement_level int check (movement_level between 1 and 5),
  add column if not exists notes_valence int check (notes_valence between -2 and 2);

alter table public.sleep_logs
  add column if not exists wake_ups int default 0;
