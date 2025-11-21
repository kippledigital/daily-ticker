# Redirect Loop Fix - Vercel Domain Configuration

**Issue:** `ERR_TOO_MANY_REDIRECTS` on `_next/static` files  
**Root Cause:** Vercel domain configuration causing redirect loops  
**Date:** November 2025

---

## Problem

Static assets (`_next/static/*`) are getting caught in redirect loops:
- `dailyticker.co/_next/static/...` → redirects to `www.dailyticker.co/_next/static/...`
- `www.dailyticker.co/_next/static/...` → redirects back (loop)

**Evidence:**
```bash
curl -I https://dailyticker.co/_next/static/css/0c4ec55acdc1f820.css
# Returns: HTTP/2 307 → www.dailyticker.co
```

---

## Root Cause

**Vercel Domain Configuration:**
- There's likely a redirect configured in Vercel Dashboard
- Or DNS is pointing both domains, causing conflicts
- The redirect is happening at Vercel edge level (before application)

---

## Solution: Fix Vercel Domain Settings

### Step 1: Check Vercel Domain Configuration

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Check what domains are configured:
   - `dailyticker.co` (should be primary)
   - `www.dailyticker.co` (should redirect to non-www OR be removed)

### Step 2: Configure Correctly

**Option A: Set Non-WWW as Primary (Recommended)**

1. In Vercel Dashboard → Domains:
   - Set `dailyticker.co` as **Primary Domain**
   - Remove `www.dailyticker.co` OR set it to redirect to `dailyticker.co`
   - Make sure redirect applies to **all paths** (including `_next/static`)

**Option B: Remove WWW Domain**

1. Remove `www.dailyticker.co` from Vercel domains entirely
2. Only use `dailyticker.co`
3. Configure DNS to not point www to Vercel

**Option C: Use Vercel's Domain Redirect Feature**

1. In Vercel Dashboard → Domains:
   - Add both domains
   - Use Vercel's built-in redirect feature (not custom redirects)
   - This handles `_next/static` correctly

---

## Temporary Fix: Exclude from Middleware

**Already Applied:**
- ✅ Updated middleware matcher to exclude ALL `_next` paths
- ✅ Middleware won't run on static assets

**But:** This doesn't fix Vercel-level redirects

---

## Verification

After fixing Vercel domain settings:

```bash
# Should return 200 OK (not redirect)
curl -I https://dailyticker.co/_next/static/css/0c4ec55acdc1f820.css

# Should redirect www to non-www (301)
curl -I https://www.dailyticker.co/

# Should return 200 OK (not redirect)
curl -I https://www.dailyticker.co/_next/static/css/0c4ec55acdc1f820.css
```

---

## Expected Behavior

**After Fix:**
- ✅ `dailyticker.co/_next/static/*` → 200 OK (no redirect)
- ✅ `www.dailyticker.co/` → 301 redirect to `dailyticker.co/`
- ✅ `www.dailyticker.co/_next/static/*` → 200 OK OR redirects to non-www first, then 200 OK

---

## Next Steps

1. **Check Vercel Dashboard** → Settings → Domains
2. **Configure redirect properly** (use Vercel's built-in redirect, not custom)
3. **Test static assets** load without redirect loops
4. **Verify www redirect** works for regular pages

---

**Status:** ⚠️ Need to fix Vercel domain configuration in Dashboard

