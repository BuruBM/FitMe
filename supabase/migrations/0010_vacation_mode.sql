-- A date range for "I'm away right now" (as opposed to trip_date, which is
-- just a forward countdown to a future trip). While today falls inside it,
-- the wellness score stops scoring an unlogged workout as a 0 — it's simply
-- left out of the average, same as any other day with nothing logged.
alter table public.profiles
  add column if not exists vacation_since date,
  add column if not exists vacation_until date;
