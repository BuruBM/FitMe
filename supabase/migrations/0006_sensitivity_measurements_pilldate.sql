-- Sensitivity as its own concrete feeling (same treatment as irritability),
-- when the current pill regimen started (so mood insights can account for
-- the ~3-month adjustment window instead of going silent), and body
-- measurements beyond the scale.

alter table public.symptom_logs
  add column if not exists sensitivity_level int check (sensitivity_level between 1 and 5);

alter table public.profiles
  add column if not exists pill_started_on date;

create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  waist_cm numeric,
  hip_cm numeric,
  unique (user_id, log_date)
);
alter table public.body_measurements enable row level security;
create policy "body_measurements: own rows" on public.body_measurements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
