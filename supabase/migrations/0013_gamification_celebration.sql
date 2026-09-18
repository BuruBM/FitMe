-- Tracks the last level she was actually shown a celebration for, so the
-- app can detect "you just leveled up" once per level instead of every
-- page load (the level itself is recomputed live from xp, not stored as
-- the source of truth).
alter table public.gamification_state
  add column if not exists last_celebrated_level int not null default 1;
