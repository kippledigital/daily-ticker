-- Add free and premium brief content columns
-- Migration: 2025-11-04 Store both free and premium email versions

-- Rename existing columns for clarity (these were premium versions)
ALTER TABLE briefs
RENAME COLUMN subject TO subject_premium;

ALTER TABLE briefs
RENAME COLUMN html_content TO html_content_premium;

-- Add new columns for free tier
ALTER TABLE briefs
ADD COLUMN subject_free TEXT,
ADD COLUMN html_content_free TEXT;

-- Update existing briefs to use premium content as both (backwards compatibility)
UPDATE briefs
SET
  subject_free = subject_premium,
  html_content_free = html_content_premium
WHERE subject_free IS NULL OR html_content_free IS NULL;

-- Make free columns NOT NULL after backfilling
ALTER TABLE briefs
ALTER COLUMN subject_free SET NOT NULL,
ALTER COLUMN html_content_free SET NOT NULL;

COMMENT ON COLUMN briefs.subject_free IS 'Email subject for free tier subscribers';
COMMENT ON COLUMN briefs.subject_premium IS 'Email subject for premium tier subscribers';
COMMENT ON COLUMN briefs.html_content_free IS 'Email HTML content for free tier (no stop-loss, targets, confidence, allocation)';
COMMENT ON COLUMN briefs.html_content_premium IS 'Email HTML content for premium tier (full analysis with all features)';
