-- FitMe schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

create extension if not exists "pgcrypto";

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  sex text default 'female',
  birth_date date,
  height_cm numeric,
  weight_kg numeric,
  activity_level text default 'light' check (activity_level in ('sedentary','light','moderate','active')),
  goal text default 'lose_weight' check (goal in ('lose_weight','maintain','energy')),
  wake_time time default '06:00',
  bloating_prone boolean default true,
  osteopenia_risk boolean default true,
  vegetarian boolean default true,
  trip_date date,
  calorie_target int,
  protein_target_g int,
  carb_target_g int,
  fat_target_g int,
  fiber_target_g int,
  calcium_target_mg int,
  sodium_limit_mg int,
  water_target_ml int default 2000,
  sleep_target_hours numeric default 7.5,
  onboarded boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "profiles: own row" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- ---------- custom / favorite foods ----------
create table if not exists public.custom_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  default_unit text default 'porción',
  default_quantity numeric default 1,
  calories numeric not null default 0,
  protein_g numeric default 0,
  carbs_g numeric default 0,
  fat_g numeric default 0,
  fiber_g numeric default 0,
  sodium_mg numeric default 0,
  calcium_mg numeric default 0,
  is_favorite boolean default true,
  created_at timestamptz default now()
);
alter table public.custom_foods enable row level security;
create policy "custom_foods: own rows" on public.custom_foods
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- food logs ----------
create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  log_date date not null default current_date,
  meal_type text not null default 'snack' check (meal_type in ('desayuno','almuerzo','merienda','cena','snack')),
  name text not null,
  quantity numeric default 1,
  unit text default 'porción',
  calories numeric not null default 0,
  protein_g numeric default 0,
  carbs_g numeric default 0,
  fat_g numeric default 0,
  fiber_g numeric default 0,
  sodium_mg numeric default 0,
  calcium_mg numeric default 0,
  source text default 'manual' check (source in ('local_db','open_food_facts','manual','text_estimate','favorite')),
  notes text
);
alter table public.food_logs enable row level security;
create policy "food_logs: own rows" on public.food_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists food_logs_user_date_idx on public.food_logs(user_id, log_date);

-- ---------- water ----------
create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  log_date date not null default current_date,
  amount_ml int not null
);
alter table public.water_logs enable row level security;
create policy "water_logs: own rows" on public.water_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists water_logs_user_date_idx on public.water_logs(user_id, log_date);

-- ---------- sleep ----------
create table if not exists public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  hours numeric not null,
  quality int check (quality between 1 and 5),
  notes text,
  unique(user_id, log_date)
);
alter table public.sleep_logs enable row level security;
create policy "sleep_logs: own rows" on public.sleep_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- weight ----------
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  weight_kg numeric not null,
  unique(user_id, log_date)
);
alter table public.weight_logs enable row level security;
create policy "weight_logs: own rows" on public.weight_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- symptoms (bloating / energy / mood) ----------
create table if not exists public.symptom_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  bloating int check (bloating between 0 and 3),
  energy int check (energy between 1 and 5),
  mood int check (mood between 1 and 5),
  notes text,
  unique(user_id, log_date)
);
alter table public.symptom_logs enable row level security;
create policy "symptom_logs: own rows" on public.symptom_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- workout logs (library itself is static app data) ----------
create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_at timestamptz not null default now(),
  log_date date not null default current_date,
  workout_id text not null,
  workout_name text not null,
  duration_min int,
  intensity text check (intensity in ('bajo','medio','alto'))
);
alter table public.workout_logs enable row level security;
create policy "workout_logs: own rows" on public.workout_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists workout_logs_user_date_idx on public.workout_logs(user_id, log_date);

-- ---------- gamification ----------
create table if not exists public.gamification_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp int not null default 0,
  level int not null default 1,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_activity_date date,
  badges text[] not null default '{}',
  updated_at timestamptz default now()
);
alter table public.gamification_state enable row level security;
create policy "gamification_state: own row" on public.gamification_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- auto-create profile + gamification row on signup ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  insert into public.gamification_state (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
