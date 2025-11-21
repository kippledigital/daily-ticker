# Performance Update Optimization Strategies

## Current Problem
- 41 open positions
- Polygon free tier: 5 calls/minute (13s delay needed)
- Processing time: ~9 minutes (41 × 13s)
- Vercel Pro timeout: 60 seconds
- **Result**: Can't process all positions in one run

## Better Approaches

### Option 1: Batch Processing (Recommended) ⭐
**Process 4 positions per run, run multiple times per day**

**Pros:**
- Stays under 60s timeout (4 × 13s = 52s)
- Respects rate limits
- Simple to implement
- No additional infrastructure needed

**Implementation:**
- Add `limit` query param to endpoint
- Process oldest positions first (highest priority)
- Run cron 3x per day (morning, afternoon, evening)
- Track which positions have been checked today

**Cron Schedule:**
```json
{
  "path": "/api/performance/update",
  "schedule": "0 22,23,0 * * 1-5"  // 5 PM, 6 PM, 7 PM EST
}
```

### Option 2: Smart Filtering
**Only check positions that are likely to hit targets**

**Pros:**
- Reduces API calls significantly
- Faster execution
- More efficient

**Logic:**
- Skip positions < 7 days old (unlikely to hit targets yet)
- Skip positions far from targets (>10% away from stop-loss/profit-target)
- Prioritize positions > 20 days old (approaching 30-day limit)
- Check positions within 5% of targets more frequently

**Estimated reduction:** 41 positions → ~10-15 positions/day

### Option 3: Supabase Edge Functions
**Move processing to Supabase Edge Functions**

**Pros:**
- Longer timeout (up to 60s, can chain)
- Closer to database (faster queries)
- Can use Supabase cron jobs

**Cons:**
- Need to migrate code
- Still limited by Polygon rate limits

### Option 4: Queue System (Inngest/Trigger.dev)
**Process positions asynchronously in background**

**Pros:**
- No timeout limits
- Automatic retries
- Better error handling
- Can process all positions sequentially

**Cons:**
- Additional service cost (~$20/month)
- More complex setup

### Option 5: Alternative API (IEX Cloud)
**Switch to IEX Cloud free tier**

**Pros:**
- 50,000 messages/month (much more generous)
- Real-time data
- No date restrictions

**Cons:**
- Need to migrate API calls
- Different data format

## Recommended Solution: Hybrid Approach

**Combine Option 1 + Option 2:**

1. **Smart filtering** to reduce positions checked
2. **Batch processing** for remaining positions
3. **Priority queue**: Check older positions first

**Expected flow:**
- Filter: 41 positions → ~15 positions need checking
- Batch: Process 4 positions per run
- Runs: 4 runs per day (15 positions ÷ 4 = ~4 runs)
- Time: Each run ~52 seconds (under timeout)

**Benefits:**
- Stays under timeout
- Respects rate limits
- Processes all positions daily
- No additional costs

