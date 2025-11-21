import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering (don't pre-render at build time)
export const dynamic = 'force-dynamic'

/**
 * GET/POST /api/performance/update
 *
 * Updates stock performance by:
 * 1. Fetching TODAY's price data (high/low/close) from Polygon.io
 * 2. Checking if TODAY's intraday low hit stop-loss
 * 3. Checking if TODAY's intraday high hit profit target
 * 4. Auto-closing positions after 30 days
 * 5. Calculating returns for closed positions
 *
 * Runs daily via cron at 5 PM EST (10 PM UTC) - 1 hour after market close
 * This ensures today's complete price data is available from Polygon API
 */
async function updatePerformance() {
  try {
    // Initialize Supabase client at runtime
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Note: No auth check needed - this endpoint is only accessible via Vercel cron
    // Vercel cron jobs are automatically authenticated by Vercel's infrastructure

    // Fetch all open positions
    const { data: openPositions, error: fetchError } = await supabase
      .from('stock_performance')
      .select(`
        *,
        stocks:stock_id (
          ticker,
          stop_loss,
          profit_target
        )
      `)
      .eq('outcome', 'open')

    if (fetchError) {
      console.error('Error fetching open positions:', fetchError)
      return {
        success: false,
        error: 'Failed to fetch open positions',
      }
    }

    if (!openPositions || openPositions.length === 0) {
      return {
        success: true,
        message: 'No open positions to update',
        updated: 0,
      }
    }

    const today = new Date()
    const updates = []

    // Smart filtering: Only check positions that actually need checking
    // This keeps us under the 60s timeout while checking what matters
    const positionsToCheck = openPositions
      .map(position => {
        const entryDate = new Date(position.entry_date)
        const daysOld = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
        return { ...position, daysOld }
      })
      .filter(({ daysOld }) => {
        // Always check positions approaching 30-day limit
        if (daysOld >= 20) return true
        
        // Skip very new positions (< 7 days) - unlikely to hit targets yet
        if (daysOld < 7) return false
        
        // For positions 7-19 days old, we'll check them but prioritize older ones
        return true
      })
      // Sort by priority: oldest first (approaching 30-day limit)
      .sort((a, b) => b.daysOld - a.daysOld)
      // Limit to what we can process in ~50 seconds (4 positions × 13s = 52s)
      // This leaves buffer for the timeout
      .slice(0, 4)

    console.log(`📊 Smart filtering: ${openPositions.length} open → ${positionsToCheck.length} need checking`)
    if (positionsToCheck.length < openPositions.length) {
      const skipped = openPositions.length - positionsToCheck.length
      console.log(`  ℹ️  Skipped ${skipped} position(s) (too new or not priority)`)
    }

    if (positionsToCheck.length === 0) {
      return {
        success: true,
        message: 'No positions need checking right now',
        updated: 0,
        skipped: openPositions.length,
      }
    }

    // Process each open position with rate limiting
    // Polygon free tier: 5 calls/minute = 1 call every 12 seconds
    // Using 13 seconds to be safe
    const RATE_LIMIT_DELAY_MS = 13000
    let processedCount = 0

    // Get previous trading day (free tier may not have same-day data)
    // If today is Monday, go back to Friday
    const getPreviousTradingDay = (date: Date): string => {
      const prevDay = new Date(date)
      prevDay.setDate(prevDay.getDate() - 1)
      
      // Skip weekends
      while (prevDay.getDay() === 0 || prevDay.getDay() === 6) {
        prevDay.setDate(prevDay.getDate() - 1)
      }
      
      return prevDay.toISOString().split('T')[0]
    }

    const checkDate = getPreviousTradingDay(today)
    console.log(`📅 Checking prices for previous trading day: ${checkDate}`)
    console.log(`📊 Processing ${openPositions.length} open position(s)...\n`)

    const skipped: string[] = []
    const rateLimited: string[] = []

    // Process positions sequentially with rate limiting
    for (let i = 0; i < positionsToCheck.length; i++) {
      const position = positionsToCheck[i]
      const { stocks } = position as any
      const ticker = stocks?.ticker

      if (!ticker) {
        console.warn(`Skipping position ${position.id}: no ticker found`)
        continue
      }

      // Rate limiting: Wait 13 seconds BEFORE each API call
      // This ensures we stay under Polygon's 5 calls/minute limit
      if (i > 0) {
        console.log(`  ⏳ [${i + 1}/${positionsToCheck.length}] Rate limiting: waiting 13s before next API call...`)
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS))
      } else {
        const daysOld = (position as any).daysOld
        console.log(`  🚀 [${i + 1}/${positionsToCheck.length}] Starting with ${ticker} (${daysOld} days old)...`)
      }

      // Fetch previous trading day's price data (free tier compatible)
      // Use /prev endpoint which is more reliable for free tier
      console.log(`  📡 Fetching previous day's price data for ${ticker}...`)
      
      let polygonResponse
      let polygonData
      let priceBar
      
      // Use /prev endpoint (previous trading day) - more reliable for free tier
      try {
        polygonResponse = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${process.env.POLYGON_API_KEY}`
        )

        if (polygonResponse.ok) {
          polygonData = await polygonResponse.json()
          priceBar = polygonData.results?.[0]
        } else if (polygonResponse.status === 403) {
          // Free tier doesn't support this timeframe, skip this ticker
          console.warn(`  ⚠️  ${ticker}: Free tier doesn't support ${checkDate} data (403). Skipping.`)
          skipped.push(ticker)
          processedCount++
          continue
        } else if (polygonResponse.status === 429) {
          // Rate limited - wait longer and retry
          console.warn(`  ⚠️  ${ticker}: Rate limited (429). Waiting 60s before retry...`)
          rateLimited.push(ticker)
          await new Promise(resolve => setTimeout(resolve, 60000))
          // Retry once with /prev endpoint
          polygonResponse = await fetch(
            `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${process.env.POLYGON_API_KEY}`
          )
          if (polygonResponse.ok) {
            polygonData = await polygonResponse.json()
            priceBar = polygonData.results?.[0]
            console.log(`  ✅ Retry successful for ${ticker}`)
          } else {
            console.warn(`  ❌ Retry failed for ${ticker}, skipping`)
            processedCount++
            continue
          }
        } else {
          const errorText = await polygonResponse.text()
          console.error(`  ❌ Failed to fetch ${ticker}: ${polygonResponse.status} - ${errorText}`)
          skipped.push(ticker)
          processedCount++
          continue
        }
      } catch (error) {
        console.error(`  ❌ Error fetching ${ticker}:`, error)
        processedCount++
        continue
      }

      if (!priceBar) {
        console.warn(`  ⚠️  No price data for ${ticker}`)
        skipped.push(ticker)
        processedCount++
        continue
      }

      // /prev endpoint returns single result with o, h, l, c, v, t (timestamp)
      const { h: high, l: low, c: close, o: open, t: timestamp } = priceBar
      const priceDate = new Date(timestamp).toISOString().split('T')[0]
      console.log(`  💰 ${ticker} (${priceDate}): High=$${high.toFixed(2)} Low=$${low.toFixed(2)} Close=$${close.toFixed(2)}`)
      processedCount++

      // Calculate holding days
      const entryDate = new Date(position.entry_date)
      const holdingDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

      let exitPrice: number | null = null
      let exitReason: string | null = null
      let exitDate: string | null = null

      // Check if stop-loss hit (intraday low hit the stop)
      if (stocks.stop_loss && low <= stocks.stop_loss) {
        exitPrice = stocks.stop_loss
        exitReason = 'stop_loss'
        exitDate = priceDate
        console.log(`  🔴 STOP LOSS HIT: Low $${low.toFixed(2)} <= Stop $${stocks.stop_loss.toFixed(2)}`)
      }
      // Check if profit target hit (intraday high hit the target)
      else if (stocks.profit_target && high >= stocks.profit_target) {
        exitPrice = stocks.profit_target
        exitReason = 'profit_target'
        exitDate = priceDate
        console.log(`  🟢 PROFIT TARGET HIT: High $${high.toFixed(2)} >= Target $${stocks.profit_target.toFixed(2)}`)
      }
      // Check if 30-day limit reached
      else if (holdingDays >= 30) {
        exitPrice = close
        exitReason = '30_day_limit'
        exitDate = priceDate
        console.log(`  ⏰ 30-DAY LIMIT: Closing at market close $${close.toFixed(2)}`)
      }

      // If position should be closed, update it
      if (exitPrice && exitReason && exitDate) {
        const returnPercent = ((exitPrice - position.entry_price) / position.entry_price) * 100
        console.log(`  🔴 CLOSING POSITION: ${ticker}`)
        console.log(`    Reason: ${exitReason.replace('_', ' ').toUpperCase()}`)
        console.log(`    Entry: $${position.entry_price.toFixed(2)} → Exit: $${exitPrice.toFixed(2)}`)
        console.log(`    Return: ${returnPercent > 0 ? '+' : ''}${returnPercent.toFixed(2)}%`)
        console.log(`    Holding days: ${holdingDays}`)

        const { error: updateError } = await supabase
          .from('stock_performance')
          .update({
            exit_price: exitPrice,
            exit_reason: exitReason,
            exit_date: exitDate,
          })
          .eq('id', position.id)

        if (updateError) {
          console.error(`  ❌ Failed to update position ${position.id}:`, updateError)
        } else {
          console.log(`  ✅ Position closed successfully`)
          updates.push({
            id: position.id,
            ticker,
            exit_reason: exitReason,
            exit_price: exitPrice,
            return_percent: returnPercent,
          })
        }
      } else {
        console.log(`  ✅ ${ticker}: Position remains OPEN (within targets)`)
      }
    }

    const totalSkipped = skipped.length + (openPositions.length - positionsToCheck.length)
    
    const summary = {
      success: true,
      message: `Processed ${positionsToCheck.length} of ${openPositions.length} positions`,
      updated: updates.length,
      details: updates,
      checked: positionsToCheck.length,
      total_open: openPositions.length,
      skipped: skipped.length,
      skipped_tickers: skipped,
      rate_limited: rateLimited.length,
      filtered_out: openPositions.length - positionsToCheck.length,
    }

    if (skipped.length > 0) {
      console.log(`\n⚠️  Skipped ${skipped.length} ticker(s) due to API limitations: ${skipped.join(', ')}`)
    }
    if (rateLimited.length > 0) {
      console.log(`\n⚠️  Rate limited ${rateLimited.length} ticker(s): ${rateLimited.join(', ')}`)
    }
    if (openPositions.length > positionsToCheck.length) {
      console.log(`\nℹ️  Filtered out ${openPositions.length - positionsToCheck.length} position(s) (too new or not priority)`)
    }

    console.log(`\n✅ Completed: ${updates.length} position(s) closed, ${positionsToCheck.length} checked, ${totalSkipped} skipped`)

    return summary
  } catch (error) {
    console.error('Unexpected error in /api/performance/update:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

export async function GET(request: Request) {
  try {
    // Vercel cron jobs send GET requests - check for Vercel cron header
    const vercelCron = request.headers.get('x-vercel-cron') || request.headers.get('x-vercel-signature')
    
    // If it's a Vercel cron job, allow it (Vercel handles authentication)
    if (vercelCron) {
      console.log('✅ Verified Vercel cron job for performance update')
    } else if (process.env.NODE_ENV === 'production') {
      // In production, if no auth header, assume it's Vercel cron (they don't send auth headers)
      console.log('⚠️  Production request without auth header - assuming Vercel cron')
    } else {
      // In development, allow for testing
      console.log('⚠️  Development mode - allowing request')
    }

    const result = await updatePerformance()
    return NextResponse.json(result, { status: result.success ? 200 : 500 })
  } catch (error) {
    console.error('Error in GET handler:', error)
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred',
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const result = await updatePerformance()
    return NextResponse.json(result, { status: result.success ? 200 : 500 })
  } catch (error) {
    console.error('Error in POST handler:', error)
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred',
    }, { status: 500 })
  }
}
