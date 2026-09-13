-- Weather (for mood correlation), bedtime tracking, and cat care (Milo & Zoe).
-- Additive to 0001 and 0002 — run after them.

alter table public.profiles
  add column if not exists city text,
  add column if not exists latitude numeric,
  add column if not exists longitude numeric;

alter table public.symptom_logs
  add column if not exists cloud_cover_pct numeric,
  add column if not exists weather_condition text;

alter table public.sleep_logs
  add column if not exists bedtime time;

-- ---------- cat care (Milo & Zoe) ----------
create table if not exists public.pet_care_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  milo_medication boolean not null default false,
  milo_supplement boolean not null default false,
  zoe_medication boolean not null default false,
  zoe_supplement boolean not null default false,
  unique (user_id, log_date)
);
alter table public.pet_care_logs enable row level security;
create policy "pet_care_logs: own rows" on public.pet_care_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
