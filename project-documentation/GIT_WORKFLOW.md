# Daily Ticker - Git Workflow

## 🚨 CRITICAL: Protect Production Emails

**The `main` branch must ALWAYS work** - it sends daily emails to subscribers.

## Workflow Rules

### ✅ DO:
1. **Always work on feature branches** for new features
2. **Push to main only when features are tested and working**
3. **Test locally before pushing to main**
4. **Push immediately after committing critical fixes**

### ❌ DON'T:
1. **Never commit untested code to main**
2. **Never leave commits unpushed** (Vercel won't deploy them)
3. **Never break the email automation**

---

## Daily Development Workflow

### Step 1: Create a Feature Branch
```bash
# Create and switch to a new branch for your feature
git checkout -b feature/your-feature-name

# Examples:
git checkout -b feature/ticker-pages
git checkout -b feature/performance-dashboard
git checkout -b fix/email-template
```

### Step 2: Work on Your Feature
```bash
# Make changes, commit as you go
git add .
git commit -m "Add feature X"

# Push your feature branch to GitHub
git push origin feature/your-feature-name
```

### Step 3: Test Locally
```bash
# Test the email automation still works
curl -X GET "http://localhost:3000/api/cron/daily-brief" \
  -H "Authorization: Bearer $CRON_SECRET"

# Test performance tracking
curl "http://localhost:3000/api/performance/update"

# Make sure everything builds
npm run build
```

### Step 4: Merge to Main (When Ready)
```bash
# Switch back to main
git checkout main

# Pull latest changes
git pull origin main

# Merge your feature branch
git merge feature/your-feature-name

# Push to GitHub (triggers Vercel deployment)
git push origin main
```

### Step 5: Clean Up
```bash
# Delete the feature branch locally
git branch -d feature/your-feature-name

# Delete the feature branch remotely
git push origin --delete feature/your-feature-name
```

---

## Emergency: If Emails Fail

### Check if commits were pushed:
```bash
git status
# If it says "Your branch is ahead of 'origin/main' by X commits"
# You forgot to push!

git push origin main
```

### Manually trigger today's email:
```bash
curl -X GET "https://www.dailyticker.co/api/cron/daily-brief" \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Check Vercel deployment status:
```bash
vercel ls daily-ticker
```

---

## Current Branch Structure

- **`main`** - Production branch (deployed to Vercel)
  - Must always work
  - Sends daily emails at 8 AM EST
  - Updates performance at 5 PM EST

- **`feature/*`** - Feature branches (for development)
  - Safe to experiment
  - Not deployed until merged to main

---

## Quick Reference

### Create feature branch:
```bash
git checkout -b feature/my-feature
```

### Save work to feature branch:
```bash
git add .
git commit -m "Your changes"
git push origin feature/my-feature
```

### Merge to main when ready:
```bash
git checkout main
git pull origin main
git merge feature/my-feature
git push origin main  # ← THIS DEPLOYS TO PRODUCTION
```

### Check what's deployed:
```bash
git log origin/main --oneline -5
```

---

## Common Mistakes to Avoid

❌ **Mistake:** Committing to main but forgetting to push
```bash
git commit -m "Fix email"
# Site breaks because commit never deployed!
```

✅ **Fix:** Always push after committing to main
```bash
git commit -m "Fix email"
git push origin main  # ← Don't forget this!
```

❌ **Mistake:** Working directly on main
```bash
git checkout main
# make changes...
git commit -m "Experimental feature"
git push origin main  # ← Breaks production!
```

✅ **Fix:** Use feature branches
```bash
git checkout -b feature/experimental
# make changes...
git commit -m "Experimental feature"
git push origin feature/experimental  # ← Safe!
```

---

## Monitoring

### Check if cron jobs ran:
```bash
vercel logs --project=daily-ticker --since=24h | grep "cron\|daily-brief"
```

### Check database for today's brief:
```bash
curl "https://www.dailyticker.co/api/archive/$(date +%Y-%m-%d)"
```

### View recent deployments:
```bash
vercel ls daily-ticker
```

---

## Key Files (Don't Break These!)

- `app/api/cron/daily-brief/route.ts` - Sends daily emails
- `app/api/performance/update/route.ts` - Closes positions daily
- `lib/automation/orchestrator.ts` - Main automation logic
- `vercel.json` - Cron job configuration

**If you modify these files, TEST THOROUGHLY before pushing to main!**
