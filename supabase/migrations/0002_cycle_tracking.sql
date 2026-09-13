-- Cycle tracking (period logs + birth control adherence) and richer daily
-- symptom logging (irritability, alcohol, tobacco). Additive to 0001_init.sql —
-- run this after it on an existing project, or run both in order on a fresh one.

alter table public.profiles
  add column if not exists avg_cycle_length int default 28,
  add column if not exists on_birth_control boolean default false,
  add column if not exists pcos boolean default true;

alter table public.symptom_logs
  add column if not exists irritability int check (irritability between 1 and 5),
  add column if not exists alcohol_units numeric default 0,
  add column if not exists tobacco_used boolean default false;

-- ---------- period / cycle logs ----------
create table if not exists public.cycle_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start_date date not null,
  notes text,
  created_at timestamptz default now(),
  unique (user_id, period_start_date)
);
alter table public.cycle_logs enable row level security;
create policy "cycle_logs: own rows" on public.cycle_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists cycle_logs_user_date_idx on public.cycle_logs(user_id, period_start_date);

-- ---------- birth control pill adherence ----------
create table if not exists public.pill_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  taken boolean not null default true,
  unique (user_id, log_date)
);
alter table public.pill_logs enable row level security;
create policy "pill_logs: own rows" on public.pill_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
