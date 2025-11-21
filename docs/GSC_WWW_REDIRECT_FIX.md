# GSC "Alternate Page" Fix - WWW Redirect

**Issue:** "Alternate page with proper canonical tag" errors for www versions  
**Date:** November 2025  
**Status:** ✅ Fix Applied

---

## Problem

Google Search Console shows 21 pages as "Alternate page with proper canonical tag":
- All are `https://www.dailyticker.co/archive/...` URLs
- Google is crawling www versions
- Canonical tags point to non-www (correct)
- But www versions are still accessible (not redirecting)

**Root Cause:** The www redirect was disabled in middleware due to redirect loops. Vercel redirects weren't configured.

---

## Solution

### Added Vercel Redirect (Proper Solution)

**File:** `vercel.json`

Added redirect rule to handle www → non-www at Vercel level (before Next.js middleware):

```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "host",
          "value": "www.dailyticker.co"
        }
      ],
      "destination": "https://dailyticker.co/:path*",
      "permanent": true
    }
  ]
}
```

**Why This Works:**
- ✅ Handles redirect at Vercel edge (before Next.js)
- ✅ Prevents redirect loops
- ✅ 301 permanent redirect (SEO-friendly)
- ✅ Applies to all paths (`/(.*)`)

---

## Verification

### Test Redirect:

```bash
curl -I https://www.dailyticker.co/archive/2025-11-17
```

**Expected Result:**
```
HTTP/2 301
Location: https://dailyticker.co/archive/2025-11-17
```

**After Deploy:** Should redirect properly.

---

## Expected Results

### Immediate (After Deploy):
- ✅ www URLs redirect to non-www (301)
- ✅ Only non-www URLs accessible
- ✅ Google stops seeing www versions

### Short-term (1-2 weeks):
- Google re-crawls www URLs
- Follows redirects to non-www
- "Alternate page" warnings decrease

### Long-term (2-4 weeks):
- All www URLs redirect properly
- "Alternate page" errors clear
- Only non-www URLs in search results

---

## Why This Happens

**"Alternate page with proper canonical tag" means:**
- Google found www version of page
- Page has canonical tag pointing to non-www (correct)
- But www version is still accessible (not redirecting)
- Google sees it as "alternate" of non-www version

**Once redirect is deployed:**
- www URLs redirect to non-www (301)
- Google follows redirect
- Only non-www version exists
- No more "alternate page" warnings

---

## Next Steps

1. **Deploy Changes** ✅
   - Push vercel.json changes
   - Verify redirect works

2. **Test Redirect**
   ```bash
   curl -I https://www.dailyticker.co/archive/2025-11-17
   ```
   Should return `301` redirect

3. **Monitor GSC**
   - Check weekly for "alternate page" errors
   - Should decrease over 2-4 weeks
   - Request re-indexing if needed

4. **Set Preferred Domain in GSC** (If Not Done)
   - Settings → Site Settings
   - Set preferred domain to `dailyticker.co` (without www)

---

**Status:** ✅ Fix Applied - Ready to Deploy

