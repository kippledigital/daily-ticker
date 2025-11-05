-- Add tier and Stripe fields to subscribers table for free vs premium
-- Migration: 2025-11-04 Add tier and Stripe integration

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
