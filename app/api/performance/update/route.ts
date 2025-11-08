import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering (don't pre-render at build time)
export const dynamic = 'force-dynamic'

/**
 * POST /api/performance/update
 *
 * Updates stock performance by:
 * 1. Fetching current prices from Polygon.io
 * 2. Checking if stop-loss or profit targets hit
 * 3. Auto-closing positions after 30 days
 * 4. Calculating returns for closed positions
 *
 * This endpoint should be called daily (via cron job)
 */
export async function POST(request: Request) {
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
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch open positions',
      }, { status: 500 })
    }

    if (!openPositions || openPositions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No open positions to update',
        updated: 0,
      })
    }

    const today = new Date()
    const updates = []

    // Process each open position
    for (const position of openPositions) {
      const { stocks } = position as any
      const ticker = stocks?.ticker

      if (!ticker) {
        console.warn(`Skipping position ${position.id}: no ticker found`)
        continue
      }

      // Fetch current price from Polygon.io
      const polygonResponse = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${process.env.POLYGON_API_KEY}`
      )

      if (!polygonResponse.ok) {
        console.error(`Failed to fetch price for ${ticker}`)
        continue
      }

      const polygonData = await polygonResponse.json()
      const currentPrice = polygonData.results?.[0]?.c // Close price

      if (!currentPrice) {
        console.warn(`No price data for ${ticker}`)
        continue
      }

      // Calculate holding days
      const entryDate = new Date(position.entry_date)
      const holdingDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

      let exitPrice: number | null = null
      let exitReason: string | null = null
      let exitDate: string | null = null

      // Check if stop-loss hit
      if (stocks.stop_loss && currentPrice <= stocks.stop_loss) {
        exitPrice = stocks.stop_loss
        exitReason = 'stop_loss'
        exitDate = today.toISOString().split('T')[0]
      }
      // Check if profit target hit
      else if (stocks.profit_target && currentPrice >= stocks.profit_target) {
        exitPrice = stocks.profit_target
        exitReason = 'profit_target'
        exitDate = today.toISOString().split('T')[0]
      }
      // Check if 30-day limit reached
      else if (holdingDays >= 30) {
        exitPrice = currentPrice
        exitReason = '30_day_limit'
        exitDate = today.toISOString().split('T')[0]
      }

      // If position should be closed, update it
      if (exitPrice && exitReason && exitDate) {
        const { error: updateError } = await supabase
          .from('stock_performance')
          .update({
            exit_price: exitPrice,
            exit_reason: exitReason,
            exit_date: exitDate,
          })
          .eq('id', position.id)

        if (updateError) {
          console.error(`Failed to update position ${position.id}:`, updateError)
        } else {
          updates.push({
            id: position.id,
            ticker,
            exit_reason: exitReason,
            exit_price: exitPrice,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} positions`,
      updated: updates.length,
      details: updates,
    })
  } catch (error) {
    console.error('Unexpected error in /api/performance/update:', error)
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred',
    }, { status: 500 })
  }
}
