# GSC "Excluded by 'noindex' tag" Analysis

**Issue:** Ticker pages showing "Excluded by 'noindex' tag" in GSC  
**Date:** November 2025  
**Status:** 🔍 Investigating

---

## Problem Summary

Google Search Console reports ticker pages as "Excluded by 'noindex' tag":
- `/stocks/PSX`
- `/stocks/XOM`
- `/stocks/HAL`
- `/stocks/VLO`

**All are www URLs** (will redirect after our fix deploys)

---

## Root Cause Analysis

### Current Implementation Check:

**Looking at the code:**
1. **`app/stocks/[ticker]/page.tsx`** - No noindex logic found
2. **`lib/seo/generate-ticker-metadata.ts`** - No robots/noindex in metadata
3. **`app/sitemap.ts`** - Has `hasMinimumDataForSEO()` check (60 days)

**Possible Causes:**

1. **60-Day Threshold (Most Likely)**
   - Documentation mentions 60-day threshold for indexing
   - Sitemap excludes ticker pages until 60+ days
   - But pages might still have noindex meta tags

2. **Missing Implementation**
   - Code might not have the noindex logic yet
   - Or it was removed but GSC still shows old data

3. **WWW URLs**
   - All examples are www URLs
   - Might be redirecting, then hitting noindex

---

## Is This a Problem?

### 🟡 **Depends on Your Data Age**

**If you have < 60 days of data:**
- ✅ **This is CORRECT** - Ticker pages should be noindex until you have enough data
- ✅ Prevents premature indexing with thin content
- ✅ Protects SEO quality

**If you have 60+ days of data:**
- ❌ **This is a PROBLEM** - Ticker pages should be indexed
- ❌ Missing out on SEO opportunity
- ❌ Need to remove noindex logic

---

## What to Check

### 1. How Many Days of Data Do You Have?

**Check your first brief date:**
- If first brief was < 60 days ago → noindex is correct ✅
- If first brief was 60+ days ago → noindex is wrong ❌

### 2. Are Ticker Pages Actually Noindex?

**Check a ticker page source:**
```bash
curl https://dailyticker.co/stocks/XOM | grep -i "noindex\|robots"
```

**Expected if noindex:**
```html
<meta name="robots" content="noindex, nofollow">
```

### 3. Is the 60-Day Check Working?

**Check sitemap:**
- Are ticker pages in sitemap?
- If yes → 60+ days, should be indexed
- If no → < 60 days, noindex is correct

---

## Solutions

### Solution 1: If You Have 60+ Days (Remove Noindex)

**If you have 60+ days of data, remove the noindex logic:**

1. **Check `generateTickerMetadata`** - Add robots: index
2. **Check sitemap** - Ensure ticker pages are included
3. **Remove any conditional noindex** - Allow indexing

### Solution 2: If You Have < 60 Days (Keep Noindex)

**If you have < 60 days, this is correct:**

- ✅ Keep noindex until 60+ days
- ✅ Wait until you have enough data
- ✅ Then remove noindex and allow indexing

### Solution 3: Remove 60-Day Threshold (Recommended)

**Based on documentation analysis, the 60-day threshold might be too strict:**

- ✅ Use per-ticker filter (3+ picks) instead
- ✅ Remove global 60-day threshold
- ✅ Allow indexing of quality tickers immediately

**Benefits:**
- Faster indexing of good tickers
- Quality based on content, not time
- Still protected by 3+ picks filter

---

## Expected Behavior

### Current (If < 60 Days):
- ✅ Ticker pages have noindex
- ✅ Not in sitemap
- ✅ Not indexed by Google
- ✅ This is correct

### After 60 Days (If Threshold Remains):
- ✅ Ticker pages should lose noindex
- ✅ Should be added to sitemap
- ✅ Should be indexed by Google

### If Threshold Removed:
- ✅ Ticker pages with 3+ picks indexed immediately
- ✅ Quality based on picks, not time
- ✅ Faster SEO growth

---

## Action Plan

### Immediate:

1. **Check Your Data Age**
   - How many days since first brief?
   - If < 60 days → noindex is correct ✅
   - If 60+ days → need to fix ❌

2. **Check Actual Page Source**
   - Visit a ticker page
   - View source
   - Check for noindex meta tag

3. **Check Sitemap**
   - Visit `/sitemap.xml`
   - See if ticker pages are included
   - If yes → should be indexed
   - If no → noindex is correct

### Next Steps:

**If < 60 Days:**
- ✅ Keep noindex (correct)
- ✅ Wait until 60+ days
- ✅ Then remove noindex

**If 60+ Days:**
- ❌ Remove noindex logic
- ❌ Ensure ticker pages are in sitemap
- ❌ Allow indexing

**Or Remove Threshold:**
- ✅ Remove 60-day global threshold
- ✅ Use 3+ picks filter only
- ✅ Index quality tickers immediately

---

## Recommendation

**Based on documentation analysis:**

**Remove the 60-day threshold** and use the per-ticker filter (3+ picks) instead:

**Benefits:**
- ✅ Quality based on content, not arbitrary time
- ✅ Faster indexing of good tickers
- ✅ Still protected (3+ picks minimum)
- ✅ More flexible and scalable

**Keep:**
- ✅ Per-ticker filter (3+ picks in sitemap)
- ✅ 404 for tickers with 0 picks

**Remove:**
- ❌ 60-day global threshold
- ❌ Conditional noindex based on days

---

**Status:** 🔍 Need to verify data age and actual noindex implementation

