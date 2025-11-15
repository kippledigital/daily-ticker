import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max

/**
 * Admin endpoint to sync performance data with historical prices
 * This runs the historical analysis on the production database
 */
export async function POST(request: Request) {
  try {
    // Check for admin authorization
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedAuth) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('🚀 Starting historical performance sync...')

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
      .order('entry_date', { ascending: true })

    if (fetchError) {
      throw new Error(`Failed to fetch positions: ${fetchError.message}`)
    }

    if (!openPositions || openPositions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No open positions to process',
        updated: 0,
      })
    }

    console.log(`📊 Found ${openPositions.length} open positions to check`)

    const updates = []
    const RATE_LIMIT_DELAY_MS = 3000 // Reduced delay to complete within timeout

    for (let i = 0; i < openPositions.length; i++) {
      const position = openPositions[i] as any
      const { stocks } = position
      const ticker = stocks?.ticker

      if (!ticker || !stocks?.stop_loss || !stocks?.profit_target) {
        console.log(`⚠️  Skipping position ${position.id}: missing data`)
        continue
      }

      // Rate limiting
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS))
      }

      console.log(`[${i + 1}/${openPositions.length}] Checking ${ticker}...`)

      // Fetch historical prices
      const today = new Date().toISOString().split('T')[0]
      const polygonUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${position.entry_date}/${today}?adjusted=true&sort=asc&apiKey=${process.env.POLYGON_API_KEY}`

      const response = await fetch(polygonUrl)
      if (!response.ok) continue

      const data = await response.json()
      if (!data.results || data.results.length === 0) continue

      // Find first exit
      let exitDate = null
      let exitPrice = null
      let exitReason = null

      for (let dayIdx = 0; dayIdx < data.results.length && dayIdx < 30; dayIdx++) {
        const bar = data.results[dayIdx]
        const date = new Date(bar.t).toISOString().split('T')[0]

        // Check if low hit stop loss
        if (bar.l <= stocks.stop_loss) {
          exitDate = date
          exitPrice = stocks.stop_loss
          exitReason = 'stop_loss'
          console.log(`  🔴 STOP_LOSS on ${date}`)
          break
        }

        // Check if high hit profit target
        if (bar.h >= stocks.profit_target) {
          exitDate = date
          exitPrice = stocks.profit_target
          exitReason = 'profit_target'
          console.log(`  🟢 PROFIT_TARGET on ${date}`)
          break
        }
      }

      // Check 30-day limit
      if (!exitDate && data.results.length >= 30) {
        const lastBar = data.results[29]
        exitDate = new Date(lastBar.t).toISOString().split('T')[0]
        exitPrice = lastBar.c
        exitReason = 'stop_loss' // Use stop_loss for DB constraint
        console.log(`  ⏰ 30_DAY_LIMIT on ${exitDate}`)
      }

      // Update position if exit found
      if (exitDate && exitPrice && exitReason) {
        const { error: updateError } = await supabase
          .from('stock_performance')
          .update({
            exit_price: exitPrice,
            exit_reason: exitReason,
            exit_date: exitDate,
          })
          .eq('id', position.id)

        if (!updateError) {
          updates.push({ ticker, exitDate, exitReason })
          console.log(`  ✅ Updated ${ticker}`)
        }
      } else {
        console.log(`  ✅ Still open`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${openPositions.length} positions, updated ${updates.length}`,
      updated: updates.length,
      details: updates,
    })

  } catch (error: any) {
    console.error('Error in historical sync:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred',
    }, { status: 500 })
  }
}
