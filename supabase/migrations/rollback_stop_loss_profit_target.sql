-- Rollback Migration: Remove stop_loss and profit_target columns from stocks table
-- Date: 2025-10-29
-- Description: Safely removes stop_loss and profit_target columns if needed
-- WARNING: This will delete all stop_loss and profit_target data

-- Drop columns if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stocks' AND column_name = 'stop_loss'
  ) THEN
    ALTER TABLE stocks DROP COLUMN stop_loss;
    RAISE NOTICE 'Dropped column stop_loss from stocks table';
  ELSE
    RAISE NOTICE 'Column stop_loss does not exist (already removed or never added)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stocks' AND column_name = 'profit_target'
  ) THEN
    ALTER TABLE stocks DROP COLUMN profit_target;
    RAISE NOTICE 'Dropped column profit_target from stocks table';
  ELSE
    RAISE NOTICE 'Column profit_target does not exist (already removed or never added)';
  END IF;
END $$;

-- Verify the rollback
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

  IF NOT stop_loss_exists AND NOT profit_target_exists THEN
    RAISE NOTICE 'Rollback completed successfully. Both columns have been removed.';
  ELSE
    RAISE EXCEPTION 'Rollback verification failed. Some columns may still exist.';
  END IF;
END $$;
