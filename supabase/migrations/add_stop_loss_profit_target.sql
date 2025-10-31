-- Migration: Add stop_loss and profit_target columns to stocks table
-- Date: 2025-10-29
-- Description: Adds critical trading fields (stop loss and profit target) to stock analysis

-- Add columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stocks' AND column_name = 'stop_loss'
  ) THEN
    ALTER TABLE stocks ADD COLUMN stop_loss DECIMAL(10, 2);
    RAISE NOTICE 'Added column stop_loss to stocks table';
  ELSE
    RAISE NOTICE 'Column stop_loss already exists';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stocks' AND column_name = 'profit_target'
  ) THEN
    ALTER TABLE stocks ADD COLUMN profit_target DECIMAL(10, 2);
    RAISE NOTICE 'Added column profit_target to stocks table';
  ELSE
    RAISE NOTICE 'Column profit_target already exists';
  END IF;
END $$;

-- Add column comments for documentation
COMMENT ON COLUMN stocks.stop_loss IS 'Price level where trader should exit to limit losses. Typically 5-10% below entry price.';
COMMENT ON COLUMN stocks.profit_target IS 'Price level where trader should take profits. Calculated using 2:1 reward-to-risk ratio.';

-- Verify the changes
DO $$
DECLARE
  stop_loss_exists BOOLEAN;
  profit_target_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stocks' AND column_name = 'stop_loss'
  ) INTO stop_loss_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stocks' AND column_name = 'profit_target'
  ) INTO profit_target_exists;

  IF stop_loss_exists AND profit_target_exists THEN
    RAISE NOTICE 'Migration completed successfully. Both columns are present.';
  ELSE
    RAISE EXCEPTION 'Migration verification failed. Columns may not have been added correctly.';
  END IF;
END $$;
