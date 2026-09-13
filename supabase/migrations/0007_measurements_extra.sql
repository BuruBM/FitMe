alter table body_measurements
  add column if not exists thigh_cm numeric,
  add column if not exists arm_cm numeric;
