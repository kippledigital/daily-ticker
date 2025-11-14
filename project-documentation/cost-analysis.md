# DailyTicker Cost Analysis & Business Economics
**Last Updated:** November 11, 2025

## Executive Summary

DailyTicker operates with an **EXTREMELY lean cost structure** that scales efficiently. The core daily automation costs approximately **$2.86-3.50 per day** to run, regardless of subscriber count. This creates exceptional unit economics where each new subscriber significantly improves profitability.

### Key Findings:
- **Fixed Daily Cost:** ~$2.86-3.50/day ($63-78/month) for core automation
- **Variable Cost per User:** ~$0.012-0.016 per user per month (1.2-1.6 cents)
- **Break-Even Point:** ~1-3 paid subscribers ($96-288/year)
- **Gross Margin at Scale:** 96%+ at 100+ subscribers
- **Current Pricing:** $96/year ($8/month) or $10/month

### Current Status:
- **Infrastructure:** Vercel Hobby (Free) + Supabase Free + API Free Tiers
- **Monthly Cost:** $1/month (domain only!)
- **Note:** Vercel Hobby is for non-commercial use - need to upgrade to Pro ($20/month) for commercial compliance

---

## Detailed Cost Breakdown

### 1. Core Infrastructure Costs (Fixed Monthly)

#### **Vercel Hosting**
**Current Status:** Hobby (Free) Plan - **IMPORTANT: Terms Violation**

- **Hobby (Free) Tier Limits:**
  - 100 GB bandwidth/month
  - 100,000 function invocations/month
  - 100 GB-hours serverless execution/month
  - 1,000 build minutes/month
  - **RESTRICTION: Non-commercial use only**

- **Your Current Usage:**
  - ~5-10 minutes active CPU time per day
  - ~22 days/month (weekdays only for briefs)
  - ~100-200 function invocations/day (cron + API calls)
  - **Monthly Total:** ~2-4 GB-hours used, ~4,400 invocations
  - **Within Limits:** ✅ Yes, well under free tier limits

- **Commercial Compliance Issue:**
  - ⚠️ **You're running a paid subscription business on Hobby tier**
  - Vercel Hobby terms: "Non-commercial, personal use only"
  - **Recommendation:** Upgrade to Pro ($20/month) for compliance

- **Pro Plan ($20/month):**
  - 40 GB-hours/month (then $5/GB-hour)
  - 1M function invocations/month
  - 1 TB bandwidth/month
  - Commercial use allowed
  - Priority support

- **Current Cost:** $0/month (free tier, but non-compliant)
- **Compliant Cost:** $20/month (Pro tier required for commercial use)

#### **Supabase Database**
- **Current Tier:** Free tier (sufficient for current scale)
  - 500 MB database (currently minimal usage)
  - 5 GB bandwidth/month
  - 50,000 MAUs

- **When to Upgrade to Pro ($25/month):**
  - At ~300+ subscribers (database size)
  - At ~40,000+ MAUs
  - When advanced analytics needed

- **Current Cost:** $0/month
- **Expected Cost at 500+ subscribers:** $25/month

#### **Domain & Misc**
- **Custom Domain:** ~$12/year ($1/month)
- **Monitoring/Analytics:** $0 (using free tiers)

**Total Fixed Infrastructure:** $1-46/month depending on scale & compliance
- **Current (Non-Compliant):** $1/month (domain only!)
- **Compliant (Pro Required):** $21/month
- **At 200 subscribers (Compliant):** $41/month
- **At 500+ subscribers (Compliant):** $46/month

---

### 2. Daily Automation API Costs (Variable)

Each daily brief generation involves:

#### **OpenAI GPT-4 Turbo (Stock Analysis)**
- **Usage per Brief:**
  - 3 stocks analyzed per day
  - ~2,000 input tokens per stock (financial data + prompt)
  - ~800 output tokens per stock (analysis JSON)
  - **Total:** 6,000 input + 2,400 output tokens per day

- **Cost Calculation:**
  - Input: 6,000 tokens × $0.01/1K = $0.06
  - Output: 2,400 tokens × $0.03/1K = $0.072
  - **Daily Cost:** $0.13/day
  - **Monthly Cost:** ~$2.86/month (22 weekdays)

- **Optimization Opportunity:**
  - Switch to GPT-4o: Save 75% ($0.72/month instead of $2.86)
  - Current monthly savings opportunity: ~$2.14

#### **Polygon.io (Stock Market Data)**
- **Current Tier:** Free tier
  - 5 API calls/minute limit
  - 2 years historical data
  - 15-minute delayed data

- **Usage per Brief:**
  - ~10-15 API calls for stock discovery
  - ~3 calls for stock quotes
  - ~5 calls for market indices
  - **Total:** ~20 calls/day (within free tier limits)

- **Cost:** $0/month (free tier)

- **When to Upgrade ($29-49/month):**
  - Need real-time data (currently using 15-min delayed)
  - Need more than 5 calls/minute
  - Want to increase brief frequency

- **Current Cost:** $0/month

#### **Alpha Vantage (Financial Data - Disabled/Minimal)**
- **Current Usage:** Minimal (mostly using Polygon)
- **Free Tier:** 25 calls/day, 500 calls/month
- **Cost:** $0/month

#### **Finnhub (Social Sentiment - Optional)**
- **Current Usage:** Social sentiment for stock discovery
- **Free Tier:** 60 calls/minute
- **Usage:** ~15 calls/day
- **Cost:** $0/month

**Total Daily Automation API Cost:** $0.13/day (~$2.86/month)

---

### 3. Email Delivery Costs (Per-Subscriber Variable)

#### **Resend Email API**
- **Current Tier:** Free tier
  - 3,000 emails/month
  - 100 emails/day limit

- **Usage Pattern:**
  - 2 emails per subscriber per day (free + premium versions sent separately)
  - Actually: 1 email per subscriber per day (segmented by tier)
  - 22 weekdays/month
  - **Per Subscriber:** 22 emails/month

- **Cost Tiers:**
  - Free: Up to 136 subscribers (3,000 emails ÷ 22 days)
  - Pro ($20/month): Up to 2,272 subscribers (50,000 emails ÷ 22 days)
  - Scale ($90/month): 100,000+ subscribers

- **Cost per Email:**
  - Free tier: $0
  - Pro tier: $0.0004/email ($0.40 per 1,000)
  - Scale tier: $0.00065/email at 1M volume

- **Per-Subscriber Monthly Cost:**
  - Free tier: $0
  - Pro tier: 22 emails × $0.0004 = $0.0088/month ($0.11/year)
  - Scale tier: 22 emails × $0.00065 = $0.0143/month ($0.17/year)

**Current Email Cost:** $0/month (within free tier)
**At 200 subscribers:** $20/month (Pro tier)
**At 500 subscribers:** $20/month (Pro tier, still within 50K limit)

---

### 4. Payment Processing Costs (Revenue-Based)

#### **Stripe Fees**
- **Standard Rate:** 2.9% + $0.30 per transaction
- **Subscription Billing:** Additional 0.5% (Starter) or 0.8% (Scale)

- **Cost per Subscription:**
  - Annual Plan ($96/year):
    - Processing: $96 × 0.029 + $0.30 = $3.084
    - Billing: $96 × 0.005 = $0.48
    - **Total:** $3.56 per annual subscriber (3.7% effective rate)

  - Monthly Plan ($10/month):
    - Processing per charge: $10 × 0.029 + $0.30 = $0.59
    - Billing: $10 × 0.005 = $0.05
    - **Per Charge:** $0.64
    - **Annual Total:** $7.68 per monthly subscriber (6.4% effective rate)

- **Note:** Annual plan has 53% lower payment processing costs

**Payment Processing Cost:** 3.7-6.4% of revenue

---

## Total Cost Summary

### Monthly Fixed Costs
| Category | Current (Non-Compliant) | Compliant | At 200 Subs | At 500 Subs |
|----------|-------------------------|-----------|-------------|-------------|
| Vercel | $0 ⚠️ | $20 | $20 | $20 |
| Supabase | $0 | $0 | $0 | $25 |
| Domain | $1 | $1 | $1 | $1 |
| AI Analysis (GPT-4 Turbo) | $2.86 | $2.86 | $2.86 | $2.86 |
| Market Data APIs | $0 | $0 | $0 | $0* |
| Email (Resend) | $0 | $0 | $20 | $20 |
| **TOTAL FIXED** | **$3.86** ⚠️ | **$23.86** | **$43.86** | **$68.86** |

⚠️ **Current setup violates Vercel Hobby terms (commercial use)**
*May upgrade to Polygon Pro ($29-49/month) for real-time data at scale

### Per-Subscriber Variable Costs (Monthly)
| Category | Cost |
|----------|------|
| Email Delivery | $0.0088 |
| Database Storage | ~$0.001 |
| Bandwidth | ~$0.002 |
| **TOTAL PER USER** | **~$0.012/month** |

### Payment Processing (% of Revenue)
| Plan Type | Effective Rate |
|-----------|----------------|
| Annual ($96/year) | 3.7% |
| Monthly ($10/month) | 6.4% |

---

## Unit Economics & Break-Even Analysis

### Revenue per Subscriber
- **Annual Plan:** $96/year = $8/month
- **Monthly Plan:** $10/month = $120/year

### Cost per Subscriber (Annual Plan - Compliant Setup)
| Subs | Fixed Cost/Sub | Variable Cost/Sub | Payment Processing | Total Cost/Sub | Gross Margin |
|------|----------------|-------------------|-------------------|----------------|--------------|
| 1 | $286.32 | $0.14 | $3.56 | $290.02/year | **-202%** |
| 3 | $95.44 | $0.14 | $3.56 | $99.14/year | **-3%** (break-even) |
| 10 | $28.63 | $0.14 | $3.56 | $32.33/year | **66%** |
| 50 | $5.73 | $0.14 | $3.56 | $9.43/year | **90%** |
| 100 | $2.86 | $0.14 | $3.56 | $6.56/year | **93%** |
| 200 | $2.63 | $0.14 | $3.56 | $6.33/year | **93%** |
| 500 | $1.65 | $0.14 | $3.56 | $5.35/year | **94%** |
| 1,000 | $0.83 | $0.14 | $3.56 | $4.53/year | **95%** |

### Cost per Subscriber (Current Non-Compliant Setup)
| Subs | Fixed Cost/Sub | Variable Cost/Sub | Payment Processing | Total Cost/Sub | Gross Margin |
|------|----------------|-------------------|-------------------|----------------|--------------|
| 1 | $46.32 | $0.14 | $3.56 | $50.02/year | **48%** (profitable!) |
| 3 | $15.44 | $0.14 | $3.56 | $19.14/year | **80%** |
| 10 | $4.63 | $0.14 | $3.56 | $8.33/year | **91%** |
| 50+ | <$1 | $0.14 | $3.56 | ~$5/year | **95%** |

### Break-Even Points
- **Current (Non-Compliant):** 1 subscriber = profitable! ($96 revenue > $50 costs)
- **Compliant Setup:** 3-4 annual subscribers ($288-384/year revenue > $286/year costs)
- **Sustainable Business:** 20-30 subscribers (~$2,000/year revenue)
- **Profitable Scale:** 100+ subscribers (93%+ gross margin)

---

## Revenue Scenarios & Profitability

### Conservative (100 Subscribers - 70% Annual, 30% Monthly)
- **Annual Revenue:**
  - 70 annual subs × $96 = $6,720
  - 30 monthly subs × $120 = $3,600
  - **Total:** $10,320/year

- **Costs:**
  - Fixed: $43.86/month × 12 = $526/year
  - Variable: 100 × $0.12 × 12 = $144/year
  - Payment Processing: (70 × $3.56) + (30 × $7.68) = $479/year
  - **Total:** $1,149/year

- **Net Profit:** $9,171/year (89% margin)

### Moderate (500 Subscribers - 70% Annual, 30% Monthly)
- **Annual Revenue:**
  - 350 annual subs × $96 = $33,600
  - 150 monthly subs × $120 = $18,000
  - **Total:** $51,600/year

- **Costs:**
  - Fixed: $68.86/month × 12 = $826/year
  - Variable: 500 × $0.12 × 12 = $720/year
  - Payment Processing: (350 × $3.56) + (150 × $7.68) = $2,398/year
  - **Total:** $3,944/year

- **Net Profit:** $47,656/year (92% margin)

### Optimistic (2,000 Subscribers - 80% Annual, 20% Monthly)
- **Annual Revenue:**
  - 1,600 annual subs × $96 = $153,600
  - 400 monthly subs × $120 = $48,000
  - **Total:** $201,600/year

- **Costs:**
  - Fixed: $120/month × 12 = $1,440/year (upgraded APIs)
  - Variable: 2,000 × $0.12 × 12 = $2,880/year
  - Payment Processing: (1,600 × $3.56) + (400 × $7.68) = $8,768/year
  - Email (Scale tier): $90/month × 12 = $1,080/year
  - **Total:** $14,168/year

- **Net Profit:** $187,432/year (93% margin)

---

## Vercel Compliance & Risk Assessment

### Current Situation
You're running a **commercial subscription business** on Vercel's **Hobby (Free) tier**, which explicitly states it's for "non-commercial, personal use only."

### Risk Analysis
**Likelihood of Enforcement:** Low to Medium
- Vercel tends to focus on bandwidth/resource abusers
- Your usage is minimal (~2-4 GB-hours/month, well under limits)
- Many small startups start on Hobby tier before upgrading

**Potential Consequences:**
1. **Account suspension** (most likely warning first)
2. **Forced upgrade** to Pro plan
3. **Back-billing** for commercial usage (rare)
4. **Service interruption** during migration

**Recommendation:**
- **Immediate:** Monitor closely, prepare for Pro upgrade
- **At first paid subscriber:** Upgrade to Pro ($20/month) for compliance
- **At 3+ subscribers:** Definitely upgrade (you're profitable enough to cover it)
- **Alternative:** Consider Netlify, Railway, or self-hosted if budget is super tight

### The Honest Truth
You're technically in violation, but:
1. Your resource usage is well under limits (not abusive)
2. You're likely to upgrade naturally as you grow
3. Many successful startups started this way
4. **But** - you should plan to upgrade soon for peace of mind

**My advice:** If you get your first paying subscriber, upgrade immediately. The $20/month is worth the compliance and peace of mind.

---

## Key Business Insights

### Strengths
1. **Exceptional Unit Economics:** 95%+ gross margins at scale
2. **Low Fixed Costs:** Can profitably serve 10 subscribers
3. **Minimal Variable Costs:** Only ~$0.012/user/month
4. **High Scalability:** Infrastructure can handle 1,000+ subscribers with minimal cost increase
5. **AI Cost Efficiency:** Core automation costs <$3/day regardless of subscriber count

### Opportunities
1. **Switch to GPT-4o:** Save 75% on AI costs (~$2.14/month savings)
2. **Encourage Annual Plans:** 42% lower payment processing fees vs monthly
3. **Free Tier Marketing:** Can support 136 free subscribers with current infrastructure
4. **Price Increase Headroom:** Could increase to $12-15/month with strong value prop
5. **Add-On Revenue:** Premium features (real-time alerts, portfolio tracking) at minimal cost

### Constraints & Scaling Thresholds
1. **Email (Resend):**
   - Free tier cap: 136 subscribers
   - Pro tier cap: 2,272 subscribers
   - Upgrade cost: $20/month at 137 subscribers

2. **Database (Supabase):**
   - Free tier cap: ~300-400 subscribers
   - Upgrade cost: $25/month at 400+ subscribers

3. **Compute (Vercel):**
   - Sufficient for 1,000+ subscribers
   - May need Pro team plan ($50/month) at 5,000+ subscribers

4. **Market Data:**
   - Polygon free tier works but 15-min delayed
   - Consider upgrade to Pro ($29-49/month) for real-time data
   - Quality/perception improvement vs cost trade-off

### Risk Factors
1. **OpenAI Price Changes:** Core dependency, but GPT-4o offers cheaper alternative
2. **Email Deliverability:** Resend is reliable but monitor spam rates
3. **API Rate Limits:** Free tier APIs limit growth potential
4. **Churn Management:** Need 10+ subscribers to break even, <50% churn critical
5. **Market Data Quality:** Free tier = delayed data, affects value perception

---

## Cost Optimization Recommendations

### Immediate (0-30 days)
1. **Switch to GPT-4o API:** Save $2.14/month (75% reduction in AI costs)
2. **Monitor Free Tier Usage:** Set alerts at 80% of email/database limits
3. **Implement Caching:** Cache market data for 60 seconds (reduce API calls)

### Short-term (1-3 months)
1. **Optimize Prompts:** Reduce token usage by 20-30%
2. **A/B Test Pricing:** Test $10-12/month to improve LTV
3. **Promote Annual Plans:** Target 80%+ annual conversion (lower processing fees)
4. **Add Free Tier:** Convert free users to paid at 5-10% (within current infrastructure)

### Medium-term (3-6 months)
1. **Upgrade to Polygon Pro ($49/month):** Real-time data when at 50+ paid subscribers
2. **Add Premium Features:** Portfolio tracking, real-time alerts (minimal added cost)
3. **Implement Referral Program:** Viral growth with $10-20 credit (pays for itself)

### Long-term (6-12 months)
1. **Build Data Infrastructure:** Reduce API dependencies, cache more aggressively
2. **Add Sponsored Content:** Revenue diversification (newsletters, market insights)
3. **B2B Offering:** $500-1,000/month for teams (same infrastructure)
4. **API for Developers:** Monetize your stock analysis pipeline

---

## Competitive Benchmarking

### Similar Services & Pricing
- **Motley Fool Stock Advisor:** $99/year (similar value prop)
- **Seeking Alpha Premium:** $239/year (much more features)
- **Morning Brew Premium:** $0 (free, ad-supported)
- **Finviz Elite:** $39.50/month (charting focus)

### DailyTicker Positioning
- **Price:** $96/year (competitive)
- **Value:** AI-curated daily picks (unique)
- **Cost to Deliver:** ~$5/subscriber/year (exceptional margin)
- **Differentiation:** Beginner-friendly, Scout persona, actionable insights

**Verdict:** Pricing is competitive, margins are exceptional, value proposition is strong for beginners.

---

## Business Model Viability Assessment

### Minimum Viable Scale: 20-30 Subscribers
- **Monthly Revenue:** $160-240/month
- **Monthly Costs:** $24-44/month
- **Net Income:** $136-196/month
- **Annual Profit:** $1,632-2,352/year
- **Status:** Side project income

### Comfortable Scale: 100 Subscribers
- **Monthly Revenue:** $800/month
- **Monthly Costs:** $96/month
- **Net Income:** $704/month
- **Annual Profit:** $8,448/year
- **Status:** Part-time income

### Full-Time Potential: 500 Subscribers
- **Monthly Revenue:** $4,300/month
- **Monthly Costs:** $329/month
- **Net Income:** $3,971/month
- **Annual Profit:** $47,652/year
- **Status:** Entry-level full-time income

### Scale Target: 2,000 Subscribers
- **Monthly Revenue:** $16,800/month
- **Monthly Costs:** $1,181/month
- **Net Income:** $15,619/month
- **Annual Profit:** $187,428/year
- **Status:** Solid full-time business

---

## Conclusion

**DailyTicker has EXCEPTIONAL business economics:**

### The Numbers Tell the Story

**Current Reality (Non-Compliant Setup):**
- Monthly cost: $3.86 ($1 domain + $2.86 AI)
- Break-even: 1 subscriber
- You're profitable from subscriber #1

**Compliant Reality (Pro Plan):**
- Monthly cost: $23.86 ($20 Vercel + $1 domain + $2.86 AI)
- Break-even: 3-4 subscribers
- Profitable from subscriber #4 onwards

**At Scale (100+ Subscribers):**
1. **Ultra-Low Variable Costs:** $0.012/user/month means every new subscriber = almost pure profit
2. **Fixed Costs:** $24-70/month is negligible at 100+ subscribers
3. **High Gross Margins:** 93-95% at scale means massive profit potential
4. **Proven Automation:** Entire daily workflow costs $2.86/day regardless of subscriber count
5. **Scalable Infrastructure:** Can handle 1,000+ subscribers with <$150/month in costs

### The Real Challenge Isn't Cost — It's Growth

**Cost to serve per subscriber:**
- At 10 subscribers: $32.33/year (66% margin)
- At 100 subscribers: $6.56/year (93% margin)
- At 1,000 subscribers: $4.53/year (95% margin)

**Key Insight:** With $96/year pricing and $5-6/year variable costs at scale, you keep $90-91/year per subscriber after all costs. This is a **95% margin business**.

### What This Means For You

1. **You have an operational business RIGHT NOW** - even at 1 subscriber you're making money (if you ignore compliance)
2. **Upgrade to Pro at 3-4 paying subscribers** - you'll be profitable and compliant
3. **Every subscriber beyond #10 is 90%+ pure profit**
4. **Your CAC can be $50-80 and you're still profitable in year 1**

### Next Steps

**Don't focus on cost optimization - focus on:**
1. **Acquisition:** Get 10 paying subscribers (you'll have ~$500/year profit)
2. **Retention:** Keep churn under 30% annually
3. **Product:** Make the newsletter so good people tell their friends
4. **Compliance:** Upgrade to Vercel Pro when you hit 3-4 subscribers

**Bottom Line:** You've built a lean, scalable, high-margin SaaS business. The infrastructure costs are solved. Now it's all about getting users and delivering value.
