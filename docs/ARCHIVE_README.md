# Daily Ticker Archive System

Complete documentation for the Daily Ticker brief archive and Gumloop integration.

---

## Overview

The archive system allows Daily Ticker to:
- Store daily automation outputs from Gumloop
- Display historical briefs to website visitors
- Search briefs by stock ticker
- Provide SEO-optimized pages for each brief
- Build foundation for future performance analytics

**Storage:** Vercel KV (Redis) - 30 MB free tier (~3,750 briefs, 14+ years)

---

## Quick Start

### 1. Setup Vercel KV Database
👉 **[VERCEL_KV_SETUP.md](./VERCEL_KV_SETUP.md)**

- Create KV database in Vercel dashboard
- Connect to daily-ticker project
- Verify automatic deployment

**Time:** 5 minutes

---

### 2. Test the Archive System
👉 **[TESTING_ARCHIVE.md](./TESTING_ARCHIVE.md)**

- Verify archive page loads
- Test webhook endpoint with sample data
- Verify briefs appear correctly
- Test search and pagination

**Time:** 15 minutes

---

### 3. Connect Gumloop Automation
👉 **[GUMLOOP_WEBHOOK.md](./GUMLOOP_WEBHOOK.md)**

- Add Node 20 to Gumloop workflow
- Map automation outputs to webhook payload
- Configure POST request to Daily Ticker API
- Test with first real brief

**Time:** 20 minutes

---

## Architecture

### Frontend Pages

| Route | Purpose | Type |
|-------|---------|------|
| `/archive` | List all briefs | Client component (search, pagination) |
| `/archive/[date]` | Individual brief | Server component (SEO optimized) |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/archive/store` | POST | Webhook receiver from Gumloop |
| `/api/archive/list` | GET | Paginated list with search |
| `/api/archive/[date]` | GET | Get individual brief |

### Data Storage (Vercel KV)

```
Key Structure:
- brief:{YYYY-MM-DD}     → Full BriefData object
- briefs:dates           → Sorted set of dates (newest first)

Example:
- brief:2025-10-27       → { date, subject, htmlContent, stocks[] }
- briefs:dates           → ZSET with timestamps as scores
```

### Data Flow

```
Gumloop Automation (Daily 6am)
    ↓
POST /api/archive/store
    ↓
Validate & Store in KV
    ↓
Display on /archive
```

---

## Features

### Archive List Page (`/archive`)
- ✅ Paginated list (10 per page, load more)
- ✅ Search by ticker symbol
- ✅ Empty state with subscribe CTA
- ✅ Stock count and actionable count badges
- ✅ Ticker badges for quick scanning
- ✅ Responsive mobile design

### Individual Brief Page (`/archive/[date]`)
- ✅ Full HTML content rendering
- ✅ Stock summary cards with:
  - Confidence score
  - Risk level (color-coded)
  - Action badge (BUY/WATCH/HOLD/AVOID)
  - Entry price and zone
  - Detailed recommendations
- ✅ Social sharing (Twitter, LinkedIn, copy link)
- ✅ SEO optimization (meta tags, OG images)
- ✅ Subscribe CTA

### Webhook API (`/api/archive/store`)
- ✅ Validates required fields
- ✅ Date format validation (YYYY-MM-DD)
- ✅ Duplicate prevention (409 Conflict)
- ✅ Error handling with detailed messages
- ✅ Returns confirmation with stock count

---

## Data Schema

### BriefData Interface

```typescript
interface BriefData {
  date: string              // YYYY-MM-DD
  subject: string           // Email subject with emoji
  htmlContent: string       // Full Morning Brief HTML
  tldr?: string            // Optional summary
  actionableCount: number   // Count of actionable recommendations
  stocks: StockRecommendation[]
}
```

### StockRecommendation Interface

```typescript
interface StockRecommendation {
  // Required fields
  ticker: string
  sector: string
  confidence: number        // 0-100
  riskLevel: string         // "Low" | "Medium" | "High"
  action: string            // "BUY" | "WATCH" | "HOLD" | "AVOID"
  entryPrice: number
  summary: string
  whyMatters: string
  momentumCheck: string
  actionableInsight: string

  // Optional fields
  entryZoneLow?: number
  entryZoneHigh?: number
  allocation?: string
  cautionNotes?: string
  learningMoment?: string
}
```

---

## Gumloop Integration

### Node Mapping

| Gumloop Output | Webhook Field |
|----------------|---------------|
| Current date | `date` |
| Subject Line Generator | `subject` |
| Morning Brief Output | `htmlContent` |
| Create TL;DR Brief | `tldr` |
| Action Confidence Scoring | `actionableCount` |
| Stock Analysis JSON Parser | `stocks[]` |

**See [GUMLOOP_WEBHOOK.md](./GUMLOOP_WEBHOOK.md) for detailed field mappings.**

---

## Storage Capacity Planning

### Current Setup (Vercel KV)
- **Free Tier:** 30 MB
- **Per Brief:** ~8 KB (average)
- **Capacity:** ~3,750 briefs
- **Daily Usage:** 1 brief/day
- **Years of Storage:** 14+ years

### Future Migration (When Needed)

**Trigger for Migration:**
- Need for performance analytics (win rates, % gains)
- Want to track daily price updates
- Require complex queries across briefs

**Migration Path:**
1. Create Supabase/Vercel Postgres database
2. Export briefs from KV using Vercel CLI
3. Import to Postgres with migration script
4. Update API routes to use Postgres
5. Optional: Keep KV as cache layer

---

## Monitoring & Maintenance

### Daily Monitoring
- Verify Gumloop automation runs successfully (6am daily)
- Check brief appears in archive within 5 minutes
- Monitor Vercel function logs for errors

### Weekly Monitoring
- Review KV storage usage in Vercel dashboard
- Check for any failed webhook calls
- Verify search functionality works correctly

### Monthly Monitoring
- Analyze archive traffic in Google Analytics
- Review most-searched tickers
- Check mobile vs desktop usage
- Optimize based on user behavior

---

## Future Enhancements

### Phase 1 (Current)
- ✅ Archive list and detail pages
- ✅ Search by ticker
- ✅ Pagination
- ✅ Webhook integration
- ✅ SEO optimization

### Phase 2 (Future)
- ⏳ Performance tracking (win rates)
- ⏳ Daily price updates via cron job
- ⏳ % gain/loss calculations
- ⏳ Best/worst calls leaderboard
- ⏳ Sector performance analytics

### Phase 3 (Future)
- ⏳ User accounts (save favorites)
- ⏳ Email alerts for specific tickers
- ⏳ Historical charts for recommendations
- ⏳ Export brief as PDF
- ⏳ RSS feed for archive

---

## Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Storage:** Vercel KV (Redis/Upstash)
- **Deployment:** Vercel
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Analytics:** Google Analytics
- **Automation:** Gumloop

---

## File Structure

```
daily-ticker/
├── app/
│   ├── archive/
│   │   ├── page.tsx                    # Archive list page
│   │   └── [date]/
│   │       └── page.tsx                # Individual brief page
│   └── api/
│       └── archive/
│           ├── store/
│           │   └── route.ts            # Webhook endpoint
│           ├── list/
│           │   └── route.ts            # List API
│           └── [date]/
│               └── route.ts            # Get brief API
├── docs/
│   ├── ARCHIVE_README.md               # This file
│   ├── VERCEL_KV_SETUP.md             # Setup guide
│   ├── TESTING_ARCHIVE.md             # Testing guide
│   └── GUMLOOP_WEBHOOK.md             # Integration guide
└── .env.local
    └── KV_URL, KV_REST_API_URL, etc.  # Auto-set by Vercel
```

---

## Getting Help

### Documentation
1. **Setup Issues:** [VERCEL_KV_SETUP.md](./VERCEL_KV_SETUP.md)
2. **Testing Issues:** [TESTING_ARCHIVE.md](./TESTING_ARCHIVE.md)
3. **Gumloop Issues:** [GUMLOOP_WEBHOOK.md](./GUMLOOP_WEBHOOK.md)

### Logs & Debugging
- **Vercel Function Logs:** Dashboard → Project → Logs
- **Browser Console:** F12 → Console tab
- **Network Tab:** F12 → Network → Filter by `/api/archive`

### Common Issues

**Archive page shows error:**
- Check KV environment variables in Vercel
- Verify database status in Storage tab
- Redeploy if variables were just added

**Webhook fails:**
- Validate JSON payload format
- Check required fields are present
- Review field types (date format, number types)

**Brief doesn't appear:**
- Verify webhook returned 201 status
- Check Vercel function logs for errors
- Test API directly: `curl https://dailyticker.co/api/archive/list`

---

## Success Criteria

Before going live, verify:

- [x] Archive codebase complete and deployed
- [ ] Vercel KV database connected
- [ ] Archive page accessible at dailyticker.co/archive
- [ ] Webhook endpoint tested successfully
- [ ] Test brief appears in archive
- [ ] Search functionality works
- [ ] Individual brief pages render correctly
- [ ] SEO meta tags present
- [ ] Social sharing works
- [ ] Gumloop Node 20 configured
- [ ] First automated brief delivered successfully

---

## Timeline

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| 1 | Archive implementation | 2 hours | ✅ Complete |
| 2 | Vercel KV setup | 5 min | ⏳ In Progress |
| 3 | Testing | 15 min | ⏳ Pending |
| 4 | Gumloop integration | 20 min | ⏳ Pending |
| 5 | First automated brief | Daily 6am | ⏳ Pending |

**Next Step:** Complete Vercel KV setup (Step 2 above)

---

## Contact

For questions or issues:
- **Email:** brief@dailyticker.co
- **Repository:** github.com/kippledigital/daily-ticker
- **Documentation:** docs/ folder
