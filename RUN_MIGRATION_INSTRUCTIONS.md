# 🚀 How to Run Database Migrations

## Step-by-Step Instructions

### 1. Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your **daily-ticker** project
3. Click on **SQL Editor** in the left sidebar

### 2. Run the Combined Migration

1. Click **"New Query"** button in SQL Editor
2. Open the file: `supabase/migrations/COMBINED_RUN_THIS_IN_SUPABASE.sql`
3. Copy ALL the contents (Cmd+A, Cmd+C)
4. Paste into the Supabase SQL Editor
5. Click **"Run"** button (or press Cmd+Enter)

### 3. Verify Success

The migration includes verification queries at the bottom. After running, you should see:

**Expected Results:**

1. **Subscribers table columns:**
   - `tier` (text, not null, default 'free')
   - `stripe_customer_id` (text, nullable)
   - `stripe_subscription_id` (text, nullable)
   - `subscription_status` (text, nullable)

2. **Briefs table columns:**
   - `subject_free` (text, not null)
   - `subject_premium` (text, not null)
   - `html_content_free` (text, not null)
   - `html_content_premium` (text, not null)

3. **All existing subscribers:**
   - Should show `tier = 'free'` for all current subscribers

4. **All existing briefs:**
   - Should have both free and premium versions (backfilled)

### 4. Troubleshooting

**If you get an error about columns already existing:**
- This means the migration was partially run
- Run each failing section individually
- Or contact me for help rolling back

**If verification queries show unexpected results:**
- Check the error messages in Supabase
- DM me the error output

### 5. After Migration Success

Once you confirm the migration worked:

1. ✅ All subscribers are now `tier = 'free'`
2. ✅ Existing briefs have both free/premium versions
3. ✅ System is ready to generate dual-tier emails
4. ✅ Ready to test email generation locally

## What Happens Next

After running these migrations:

1. **Next daily brief will:**
   - Generate BOTH free and premium emails
   - Send free version to `tier = 'free'` subscribers
   - Send premium version to `tier = 'premium'` subscribers

2. **To manually upgrade a subscriber to premium:**
   ```sql
   UPDATE subscribers
   SET tier = 'premium'
   WHERE email = 'your-email@example.com';
   ```

3. **To check tier breakdown:**
   ```sql
   SELECT * FROM subscriber_stats;
   ```

## Need Help?

If anything fails, let me know and I'll help troubleshoot!
