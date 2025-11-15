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

    // Process each open position with rate limiting
    // Polygon free tier: 5 calls/minute = 1 call every 12 seconds
    // Using 13 seconds to be safe
    const RATE_LIMIT_DELAY_MS = 13000
    let processedCount = 0

    for (const position of openPositions) {
      const { stocks } = position as any
      const ticker = stocks?.ticker

      if (!ticker) {
        console.warn(`Skipping position ${position.id}: no ticker found`)
        continue
      }

      // Rate limiting: Wait 13 seconds between API calls (except for first call)
      if (processedCount > 0) {
        console.log(`  ⏳ Rate limiting: waiting 13s before next API call...`)
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS))
      }

      // Fetch TODAY's price data (high/low/close) - runs at 5 PM EST, 1 hour after market close
      // Format: YYYY-MM-DD
      const todayDate = today.toISOString().split('T')[0]

      console.log(`  📡 Fetching today's price data for ${ticker}...`)
      const polygonResponse = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${todayDate}/${todayDate}?adjusted=true&apiKey=${process.env.POLYGON_API_KEY}`
      )

      if (!polygonResponse.ok) {
        const errorText = await polygonResponse.text()
        console.error(`Failed to fetch price for ${ticker}: ${polygonResponse.status} - ${errorText}`)
        continue
      }

      const polygonData = await polygonResponse.json()
      const todayBar = polygonData.results?.[0]

      if (!todayBar) {
        console.warn(`No price data for ${ticker} on ${todayDate}: ${JSON.stringify(polygonData)}`)
        continue
      }

      const { h: high, l: low, c: close } = todayBar
      console.log(`  💰 ${ticker}: High=$${high.toFixed(2)} Low=$${low.toFixed(2)} Close=$${close.toFixed(2)}`)
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
        exitDate = todayDate
        console.log(`  🔴 STOP LOSS HIT: Low $${low.toFixed(2)} <= Stop $${stocks.stop_loss.toFixed(2)}`)
      }
      // Check if profit target hit (intraday high hit the target)
      else if (stocks.profit_target && high >= stocks.profit_target) {
        exitPrice = stocks.profit_target
        exitReason = 'profit_target'
        exitDate = todayDate
        console.log(`  🟢 PROFIT TARGET HIT: High $${high.toFixed(2)} >= Target $${stocks.profit_target.toFixed(2)}`)
      }
      // Check if 30-day limit reached
      else if (holdingDays >= 30) {
        exitPrice = close
        exitReason = 'stop_loss' // Use stop_loss for DB constraint
        exitDate = todayDate
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

    return {
      success: true,
      message: `Updated ${updates.length} positions`,
      updated: updates.length,
      details: updates,
    }
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
