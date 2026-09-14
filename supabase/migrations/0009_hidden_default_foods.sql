-- Lets a profile hide one of the app's curated "favorite" foods (the
-- hardcoded soy/egg/protein-powder shortcuts) from their own Favoritos tab
-- without affecting anyone else's — separate from custom_foods, which is
-- for foods she added herself.
create table if not exists public.hidden_default_foods (
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id text not null,
  created_at timestamptz default now(),
  primary key (user_id, food_id)
);
alter table public.hidden_default_foods enable row level security;
create policy "hidden_default_foods: own rows" on public.hidden_default_foods
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
