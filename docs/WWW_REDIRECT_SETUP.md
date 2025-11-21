# WWW Redirect Setup Guide

**Issue:** Redirect loops when handling www → non-www redirect in code  
**Solution:** Handle redirect at DNS/Vercel project level, not in application code

---

## Problem

When handling www → non-www redirects in application code (middleware or vercel.json), it causes redirect loops because:
- Redirects catch `_next/static` files
- Middleware runs on redirected requests
- Static assets get caught in redirect loops

---

## Solution: Configure at Vercel Project Level

### Option 1: Vercel Dashboard (Recommended)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add both domains:
   - `dailyticker.co` (primary)
   - `www.dailyticker.co` (redirect)
3. Set `dailyticker.co` as primary domain
4. Configure redirect in Vercel's domain settings (not in code)

**Benefits:**
- ✅ Handled at edge/CDN level (before application)
- ✅ No redirect loops
- ✅ Better performance
- ✅ Works for all paths including `_next/static`

---

### Option 2: DNS Level (Alternative)

1. Point both domains to same Vercel deployment
2. Configure redirect at DNS/CDN level
3. Or use CNAME records pointing to same destination

**Benefits:**
- ✅ Handled before application
- ✅ No code changes needed
- ✅ Works for all paths

---

## Current Status

**Redirect Removed from Code:**
- ✅ Removed from `vercel.json`
- ✅ Removed from `middleware.ts`
- ✅ No redirect loops

**Next Steps:**
1. Configure redirect in Vercel Dashboard (recommended)
2. Or handle at DNS level
3. Test redirect works: `curl -I https://www.dailyticker.co/`

---

## Why Code-Based Redirects Fail

**In `vercel.json`:**
- Redirects apply to all paths including `_next/static`
- Can't easily exclude Next.js internal paths
- Causes redirect loops on static assets

**In Middleware:**
- Runs on every request (including redirected ones)
- Can cause loops if not careful
- Hard to exclude all edge cases

**At Vercel/DNS Level:**
- Handled before application code
- Applies to all paths correctly
- No loops possible

---

## Verification

After configuring redirect in Vercel:

```bash
# Should redirect www to non-www
curl -I https://www.dailyticker.co/

# Should return 301 redirect
# Location: https://dailyticker.co/
```

---

**Status:** ✅ Redirect removed from code - Configure in Vercel Dashboard

