-- ========================================
-- COMBINED MIGRATION: Free vs Premium Tiers
-- Run this entire file in Supabase SQL Editor
-- ========================================

-- PART 1: Add tier and Stripe fields to subscribers table
-- ========================================

-- Add tier column (free or premium)
ALTER TABLE subscribers
ADD COLUMN tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium'));

-- Add Stripe customer and subscription tracking
ALTER TABLE subscribers
ADD COLUMN stripe_customer_id TEXT UNIQUE,
ADD COLUMN stripe_subscription_id TEXT UNIQUE,
ADD COLUMN subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
ADD COLUMN current_period_start TIMESTAMPTZ,
ADD COLUMN current_period_end TIMESTAMPTZ,
ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscribers_tier ON subscribers(tier);
CREATE INDEX IF NOT EXISTS idx_subscribers_stripe_customer_id ON subscribers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscription_status ON subscribers(subscription_status);
CREATE INDEX IF NOT EXISTS idx_subscribers_current_period_end ON subscribers(current_period_end);

-- Update subscriber_stats view to include tier breakdown
DROP VIEW IF EXISTS subscriber_stats;
CREATE OR REPLACE VIEW subscriber_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'active' AND tier = 'free') as active_free_subscribers,
  COUNT(*) FILTER (WHERE status = 'active' AND tier = 'premium') as active_premium_subscribers,
  COUNT(*) FILTER (WHERE status = 'active') as active_subscribers,
  COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed,
  COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
  COUNT(*) as total_subscribers,
  ROUND(AVG(emails_opened::DECIMAL / NULLIF(emails_sent, 0) * 100), 2) as avg_open_rate,
  ROUND(AVG(emails_clicked::DECIMAL / NULLIF(emails_sent, 0) * 100), 2) as avg_click_rate,
  -- Revenue metrics (assuming $96/year for premium)
  COUNT(*) FILTER (WHERE tier = 'premium' AND subscription_status = 'active') as paying_customers,
  COUNT(*) FILTER (WHERE tier = 'premium' AND subscription_status = 'active') * 96 as annual_recurring_revenue
FROM subscribers;

-- Create helpful view for premium subscribers
CREATE OR REPLACE VIEW premium_subscribers AS
SELECT
  email,
  status,
  tier,
  subscribed_at,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  CASE
    WHEN current_period_end < NOW() THEN 'expired'
    WHEN cancel_at_period_end THEN 'canceling'
    WHEN subscription_status = 'active' THEN 'active'
    ELSE subscription_status
  END as computed_status
FROM subscribers
WHERE tier = 'premium'
ORDER BY created_at DESC;

COMMENT ON COLUMN subscribers.tier IS 'Subscription tier: free or premium';
COMMENT ON COLUMN subscribers.stripe_customer_id IS 'Stripe customer ID for payment tracking';
COMMENT ON COLUMN subscribers.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN subscribers.subscription_status IS 'Current Stripe subscription status';
COMMENT ON COLUMN subscribers.current_period_end IS 'When current subscription period ends';
COMMENT ON COLUMN subscribers.cancel_at_period_end IS 'Whether subscription will cancel at period end';
COMMENT ON VIEW premium_subscribers IS 'Active premium subscribers with subscription details';

-- PART 2: Add free and premium brief content columns
-- ========================================

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

-- ========================================
-- MIGRATION COMPLETE!
-- ========================================

-- Verification queries (run these to confirm success):

-- 1. Check subscribers table has new columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'subscribers'
AND column_name IN ('tier', 'stripe_customer_id', 'stripe_subscription_id', 'subscription_status')
ORDER BY column_name;

-- 2. Check briefs table has new columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'briefs'
AND column_name IN ('subject_free', 'subject_premium', 'html_content_free', 'html_content_premium')
ORDER BY column_name;

-- 3. Check all existing subscribers defaulted to 'free' tier
SELECT tier, COUNT(*) as count
FROM subscribers
GROUP BY tier;

-- 4. Check existing briefs have both versions
SELECT
  date,
  subject_premium IS NOT NULL as has_premium_subject,
  subject_free IS NOT NULL as has_free_subject,
  html_content_premium IS NOT NULL as has_premium_html,
  html_content_free IS NOT NULL as has_free_html
FROM briefs
ORDER BY date DESC
LIMIT 5;

-- 5. View subscriber stats
SELECT * FROM subscriber_stats;
