-- Remove any existing CHECK constraint on sector column
ALTER TABLE stocks DROP CONSTRAINT IF EXISTS stocks_sector_check;
ALTER TABLE stocks DROP CONSTRAINT IF EXISTS check_sector_values;
ALTER TABLE stocks DROP CONSTRAINT IF EXISTS valid_sector;

-- Ensure sector column allows any text value
-- No new constraint needed - AI will handle validation
