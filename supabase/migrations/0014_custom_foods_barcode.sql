-- Lets a manually-entered favorite be linked to the barcode that was
-- scanned for it, so scanning the same package again finds it instantly
-- instead of asking her to type the same nutrition info again.
alter table custom_foods
  add column barcode text;

create index if not exists custom_foods_barcode_idx on custom_foods (user_id, barcode) where barcode is not null;
