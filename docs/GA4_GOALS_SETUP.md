# Google Analytics 4 Goals Setup Guide

**Last Updated**: November 2025

This guide walks you through setting up conversion goals in Google Analytics 4 for Daily Ticker.

---

## 📊 Overview

Your site already tracks the following events automatically:
- `newsletter_signup` - Newsletter subscriptions
- `begin_checkout` - Premium checkout starts
- `purchase` - Premium checkout completions
- `roi_calculator_open` - ROI calculator engagement
- `performance_dashboard_view` - Dashboard views

This guide shows you how to convert these events into **conversion goals** in GA4.

---

## 🎯 Step-by-Step Setup

### Step 1: Access Google Analytics 4

1. Go to [Google Analytics](https://analytics.google.com)
2. Select your Daily Ticker property
3. Click **Admin** (gear icon) in the bottom left

### Step 2: Navigate to Conversions

1. In the **Property** column, click **Events**
2. You should see your custom events listed
3. Click **Mark as conversion** for each event you want to track

---

## ✅ Recommended Conversions to Mark

### 1. Newsletter Signup (High Priority)

**Event Name**: `newsletter_signup`

**Why**: This is your primary lead generation goal.

**Steps**:
1. Go to **Admin** → **Events**
2. Find `newsletter_signup` in the list
3. Toggle **Mark as conversion** to ON

**Expected Value**: Track this as your main conversion metric

---

### 2. Premium Checkout Start (Medium Priority)

**Event Name**: `begin_checkout`

**Why**: Tracks users who show purchase intent.

**Steps**:
1. Find `begin_checkout` in the Events list
2. Toggle **Mark as conversion** to ON

**Use Case**: Measure checkout funnel drop-off

---

### 3. Premium Purchase (High Priority)

**Event Name**: `purchase`

**Why**: This is your revenue conversion goal.

**Steps**:
1. Find `purchase` in the Events list
2. Toggle **Mark as conversion** to ON

**Expected Value**: This is your primary revenue goal

---

### 4. ROI Calculator Open (Low Priority)

**Event Name**: `roi_calculator_open`

**Why**: Measures engagement with value proposition.

**Steps**:
1. Find `roi_calculator_open` in the Events list
2. Toggle **Mark as conversion** to ON (optional)

**Note**: This is more of an engagement metric than a true conversion

---

### 5. Performance Dashboard View (Low Priority)

**Event Name**: `performance_dashboard_view`

**Why**: Measures engagement with proof/social proof.

**Steps**:
1. Find `performance_dashboard_view` in the Events list
2. Toggle **Mark as conversion** to ON (optional)

**Note**: Engagement metric, not a true conversion

---

## 📈 Setting Up Conversion Funnels

### Funnel 1: Newsletter Signup Funnel

**Goal**: Track the path from homepage to newsletter signup

**Steps**:
1. Go to **Explore** → **Funnel exploration**
2. Create a new funnel:
   - **Step 1**: Page view (`page_view`) - Homepage
   - **Step 2**: Scroll depth (`scroll`) - 50% (optional)
   - **Step 3**: Newsletter signup (`newsletter_signup`)

**Use Case**: See where users drop off before signing up

---

### Funnel 2: Premium Purchase Funnel

**Goal**: Track the path from homepage to purchase

**Steps**:
1. Go to **Explore** → **Funnel exploration**
2. Create a new funnel:
   - **Step 1**: Page view (`page_view`) - Homepage
   - **Step 2**: Scroll depth (`scroll`) - 75% (optional)
   - **Step 3**: Checkout start (`begin_checkout`)
   - **Step 4**: Purchase (`purchase`)

**Use Case**: Identify checkout funnel drop-off points

---

## 🔍 Viewing Your Conversions

### Real-Time Conversions

1. Go to **Reports** → **Realtime**
2. Scroll to **Conversions by Event name**
3. See conversions happening in real-time

### Historical Conversions

1. Go to **Reports** → **Engagement** → **Conversions**
2. View conversion trends over time
3. Compare different conversion events

---

## 📊 Key Metrics to Monitor

### Newsletter Signup Metrics

- **Conversion Rate**: `newsletter_signup` / `page_view`
- **Goal**: Track weekly/monthly trends
- **Benchmark**: 2-5% is typical for newsletter signups

### Premium Purchase Metrics

- **Conversion Rate**: `purchase` / `begin_checkout`
- **Goal**: Track checkout completion rate
- **Benchmark**: 50-70% is typical for checkout completion

### Funnel Drop-Off

- **Homepage → Signup**: Track drop-off rate
- **Homepage → Checkout**: Track drop-off rate
- **Checkout → Purchase**: Track drop-off rate

---

## 🎯 Creating Custom Reports

### Conversion Report

1. Go to **Explore** → **Free form**
2. Add dimensions:
   - Event name
   - Date
   - Page title
3. Add metrics:
   - Event count
   - Conversions
   - Conversion rate
4. Save as "Daily Ticker Conversions"

### Revenue Report

1. Go to **Explore** → **Free form**
2. Add dimensions:
   - Event name (`purchase`)
   - Date
3. Add metrics:
   - Event count
   - Total revenue (from `purchase` event value)
4. Save as "Daily Ticker Revenue"

---

## 🔔 Setting Up Alerts

### Conversion Drop Alert

1. Go to **Admin** → **Custom definitions** → **Custom alerts**
2. Create alert:
   - **Alert name**: "Conversion Drop"
   - **Metric**: `newsletter_signup` conversions
   - **Condition**: Decrease by 20% compared to previous period
   - **Frequency**: Daily

### Revenue Alert

1. Create alert:
   - **Alert name**: "Revenue Milestone"
   - **Metric**: `purchase` event value
   - **Condition**: Increase by 50% compared to previous period
   - **Frequency**: Weekly

---

## 📝 Event Parameters Reference

### newsletter_signup Event

```javascript
{
  event_category: 'engagement',
  event_label: 'Newsletter Signup from hero_form',
  value: 1,
  location: 'hero_form' | 'footer_form'
}
```

### begin_checkout Event

```javascript
{
  currency: 'USD',
  value: 10 | 79 | 96, // Price based on plan
  items: [{
    item_id: 'daily_ticker_pro_monthly',
    item_name: 'Daily Ticker Pro (monthly)',
    price: 10,
    quantity: 1
  }],
  price_type: 'monthly' | 'standard' | 'earlyBird'
}
```

### purchase Event

```javascript
{
  transaction_id: 'session_id_from_stripe',
  currency: 'USD',
  value: 10 | 79 | 96,
  items: [{
    item_id: 'daily_ticker_pro_monthly',
    item_name: 'Daily Ticker Pro (monthly)',
    price: 10,
    quantity: 1
  }],
  price_type: 'monthly' | 'standard' | 'earlyBird'
}
```

---

## ✅ Verification Checklist

After setting up conversions, verify:

- [ ] `newsletter_signup` is marked as conversion
- [ ] `purchase` is marked as conversion
- [ ] `begin_checkout` is marked as conversion (optional)
- [ ] Conversions appear in **Reports** → **Engagement** → **Conversions**
- [ ] Real-time conversions are working (test by signing up)
- [ ] Funnel reports are set up
- [ ] Alerts are configured (optional)

---

## 🐛 Troubleshooting

### Conversions Not Showing Up

1. **Check Event Names**: Ensure event names match exactly (case-sensitive)
2. **Wait 24-48 Hours**: GA4 can take time to process conversions
3. **Check Filters**: Ensure no filters are excluding your events
4. **Test in Real-Time**: Use **Reports** → **Realtime** to verify events fire

### Events Not Firing

1. **Check Browser Console**: Look for errors in DevTools
2. **Verify GA4 ID**: Ensure `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
3. **Check Ad Blockers**: Some ad blockers prevent GA4 from loading
4. **Verify Network Tab**: Check if requests to `google-analytics.com` are being made

---

## 📚 Additional Resources

- [GA4 Conversion Events Guide](https://support.google.com/analytics/answer/9267568)
- [GA4 Funnel Exploration](https://support.google.com/analytics/answer/9327974)
- [GA4 Custom Alerts](https://support.google.com/analytics/answer/1033013)

---

## 🎯 Next Steps

After setting up conversions:

1. **Monitor Weekly**: Check conversion rates every week
2. **A/B Test**: Use conversion data to inform A/B tests
3. **Optimize Funnels**: Use funnel data to identify drop-off points
4. **Set Benchmarks**: Establish baseline conversion rates
5. **Track Trends**: Monitor conversion trends over time

---

**Last Updated**: November 2025

