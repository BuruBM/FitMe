alter table public.body_measurements
  add column if not exists abdomen_cm numeric;
