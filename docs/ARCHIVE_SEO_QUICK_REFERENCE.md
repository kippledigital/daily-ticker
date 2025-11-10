# Archive SEO - Quick Reference Guide

**Quick guide for verifying and maintaining archive SEO optimization**

---

## ✅ What's Implemented

### Automatic SEO for All Archive Pages

Every archive page (`/archive/[date]`) now automatically has:

1. **Optimized Title Tag**
   - Format: `Stock Picks [DATE] | [TICKER1], [TICKER2], [TICKER3] | Daily Ticker`
   - Generated from brief data automatically

2. **Meta Description**
   - Format: `[DATE] stock picks: [TICKER1] $[PRICE], [TICKER2] $[PRICE]... See full analysis...`
   - Includes value proposition and CTA

3. **Article Schema Markup**
   - NewsArticle type
   - Proper date, author, publisher
   - Article body summary

4. **OpenGraph & Twitter Cards**
   - Social media sharing optimized
   - Rich previews

5. **Internal Linking**
   - Previous/Next day navigation
   - Ticker links (when ticker pages exist)
   - Archive index link

6. **Performance Summary**
   - Stock count
   - Actionable picks
   - Sectors covered

---

## 🔍 How to Verify It's Working

### 1. Check Page Source

Visit any archive page (e.g., `/archive/2025-01-15`) and view page source:

**Look for:**
```html
<title>Stock Picks January 15, 2025 | AAPL, NVDA, TSLA | Daily Ticker</title>
<meta name="description" content="January 15, 2025 stock picks: AAPL $195.50...">
<script type="application/ld+json">{"@context":"https://schema.org",...}</script>
```

### 2. Test with Google Tools

**Rich Results Test:**
- Go to: https://search.google.com/test/rich-results
- Enter: `https://dailyticker.co/archive/[DATE]`
- Should show NewsArticle schema validated

**OpenGraph Test:**
- Go to: https://www.opengraph.xyz/
- Enter: `https://dailyticker.co/archive/[DATE]`
- Should show rich preview

**Twitter Card Test:**
- Go to: https://cards-dev.twitter.com/validator
- Enter: `https://dailyticker.co/archive/[DATE]`
- Should show card preview

### 3. Check Sitemap

Visit: `https://dailyticker.co/sitemap.xml`

**Should see:**
- All static pages
- All archive pages (up to 365 days)
- Proper priorities and change frequencies

---

## 📋 Testing Checklist

### After Deployment

- [ ] Visit an archive page
- [ ] View page source - verify title tag
- [ ] View page source - verify meta description
- [ ] View page source - verify schema markup
- [ ] Test with Rich Results Test
- [ ] Test with OpenGraph.xyz
- [ ] Check sitemap includes archives
- [ ] Verify navigation links work
- [ ] Verify performance summary displays

### For New Briefs (Automatic)

When a new brief is stored Monday-Friday:

- [ ] Archive page automatically created
- [ ] SEO metadata automatically generated
- [ ] Schema markup automatically added
- [ ] Sitemap automatically updated
- [ ] No manual work required ✅

---

## 🚀 Next Steps

### Phase 2: Ticker Pages (Next Priority)

1. Create `/stocks/[TICKER]` pages
2. Link from archive pages to ticker pages
3. Generate ticker-specific SEO metadata
4. Add to sitemap

### Phase 3: Sector Pages

1. Create `/sectors/[SECTOR]` pages
2. Link from archive pages to sector pages
3. Generate sector-specific SEO metadata
4. Add to sitemap

---

## 📊 Monitoring

### Weekly
- Check Search Console for archive page indexing
- Monitor archive page traffic
- Review top-performing archives

### Monthly
- Analyze conversion rates from archives
- Review keyword rankings
- Optimize based on data

---

## 🐛 Troubleshooting

### Issue: Metadata not appearing

**Check:**
1. Is page server-side rendered? (should be, not client component)
2. Is `generateMetadata` function present?
3. Check browser console for errors
4. Verify Supabase connection

### Issue: Schema markup invalid

**Check:**
1. Validate with Rich Results Test
2. Check JSON syntax in schema component
3. Verify all required fields present

### Issue: Sitemap not including archives

**Check:**
1. Verify Supabase connection in sitemap.ts
2. Check database has briefs
3. Verify sitemap is accessible
4. Check for errors in logs

---

## 📝 Files Reference

**Core SEO Files:**
- `lib/seo/generate-archive-metadata.ts` - Metadata generation
- `components/seo/article-schema.tsx` - Schema markup
- `app/archive/[date]/page.tsx` - Server component with metadata

**Archive Components:**
- `components/archive/archive-page-client.tsx` - Client wrapper
- `components/archive/archive-navigation.tsx` - Navigation
- `components/archive/performance-summary.tsx` - Performance display

**Sitemap:**
- `app/sitemap.ts` - Dynamic sitemap with archives

---

**Last Updated:** January 2025

