-- Lets her mute Milo & Zoe's daily checklist while traveling (someone else
-- is covering it, or they're boarded) so those days don't drag down streaks
-- or badge progress.

alter table public.profiles
  add column if not exists pet_care_paused_until date;
