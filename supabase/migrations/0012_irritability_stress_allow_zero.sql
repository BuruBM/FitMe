-- Irritabilidad y estrés are things she sometimes genuinely doesn't have at
-- all, unlike ánimo/energía/sensibilidad which always have some value — so
-- their picker (and the underlying column) should allow 0, not force a
-- minimum of 1.
alter table public.symptom_logs drop constraint if exists symptom_logs_irritability_check;
alter table public.symptom_logs add constraint symptom_logs_irritability_check check (irritability between 0 and 5);

alter table public.symptom_logs drop constraint if exists symptom_logs_stress_level_check;
alter table public.symptom_logs add constraint symptom_logs_stress_level_check check (stress_level between 0 and 5);
