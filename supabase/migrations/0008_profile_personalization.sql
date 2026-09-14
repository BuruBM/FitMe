-- Not everyone using the app is her: cycle tracking, pet care, osteopenia
-- risk and PCOS were all hardcoded on. Make them opt-in per profile instead,
-- with new signups defaulting to off and her own (already onboarded) profile
-- keeping cycle/pet tracking on.
alter table public.profiles
  add column if not exists tracks_cycle boolean not null default false,
  add column if not exists tracks_pets boolean not null default false;

alter table public.profiles alter column bloating_prone set default false;
alter table public.profiles alter column osteopenia_risk set default false;
alter table public.profiles alter column pcos set default false;

update public.profiles set tracks_cycle = true, tracks_pets = true where onboarded = true;
