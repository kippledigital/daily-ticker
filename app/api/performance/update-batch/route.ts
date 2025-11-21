import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * GET /api/performance/update-batch
 * 
 * Batch version: Processes only a few positions per run
 * Designed to stay under Vercel's 60s timeout
 * 
 * Query params:
 * - limit: Number of positions to process (default: 4)
 * - priority: 'oldest' | 'closest_to_targets' (default: 'oldest')
 */
export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '4', 10)
    const priority = searchParams.get('priority') || 'oldest'

    // Fetch open positions with smart filtering
    let query = supabase
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

    // Priority: oldest positions first (approaching 30-day limit)
    if (priority === 'oldest') {
      query = query.order('entry_date', { ascending: true })
    }

    const { data: openPositions, error } = await query.limit(limit)

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch positions',
      }, { status: 500 })
    }

    if (!openPositions || openPositions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No open positions to process',
        processed: 0,
      })
    }

    console.log(`📊 Processing ${openPositions.length} position(s) (batch mode)...`)

    const RATE_LIMIT_DELAY_MS = 13000
    const updates: any[] = []
    const skipped: string[] = []

    for (let i = 0; i < openPositions.length; i++) {
      const position = openPositions[i]
      const { stocks } = position as any
      const ticker = stocks?.ticker

      if (!ticker) {
        skipped.push('unknown')
        continue
      }

      // Rate limiting: Wait 13 seconds BEFORE each API call
      if (i > 0) {
        console.log(`  ⏳ [${i + 1}/${openPositions.length}] Waiting 13s...`)
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS))
      }

      // Fetch previous trading day's price
      try {
        const polygonResponse = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${process.env.POLYGON_API_KEY}`
        )

        if (!polygonResponse.ok) {
          if (polygonResponse.status === 403) {
            console.warn(`  ⚠️  ${ticker}: Free tier doesn't support this data (403)`)
            skipped.push(ticker)
            continue
          }
          if (polygonResponse.status === 429) {
            console.warn(`  ⚠️  ${ticker}: Rate limited (429)`)
            skipped.push(ticker)
            continue
          }
          skipped.push(ticker)
          continue
        }

        const polygonData = await polygonResponse.json()
        const priceBar = polygonData.results?.[0]

        if (!priceBar) {
          skipped.push(ticker)
          continue
        }

        const { h: high, l: low, c: close, t: timestamp } = priceBar
        const priceDate = new Date(timestamp).toISOString().split('T')[0]
        console.log(`  💰 ${ticker} (${priceDate}): H=$${high.toFixed(2)} L=$${low.toFixed(2)} C=$${close.toFixed(2)}`)

        // Calculate holding days
        const entryDate = new Date(position.entry_date)
        const today = new Date()
        const holdingDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

        let exitPrice: number | null = null
        let exitReason: string | null = null
        let exitDate: string | null = null

        // Check exit conditions
        if (stocks.stop_loss && low <= stocks.stop_loss) {
          exitPrice = stocks.stop_loss
          exitReason = 'stop_loss'
          exitDate = priceDate
        } else if (stocks.profit_target && high >= stocks.profit_target) {
          exitPrice = stocks.profit_target
          exitReason = 'profit_target'
          exitDate = priceDate
        } else if (holdingDays >= 30) {
          exitPrice = close
          exitReason = '30_day_limit'
          exitDate = priceDate
        }

        // Update if closed
        if (exitPrice && exitReason && exitDate) {
          const { error: updateError } = await supabase
            .from('stock_performance')
            .update({
              exit_price: exitPrice,
              exit_reason: exitReason,
              exit_date: exitDate,
            })
            .eq('id', position.id)

          if (!updateError) {
            updates.push({ ticker, exit_reason: exitReason })
            console.log(`  ✅ ${ticker}: CLOSED (${exitReason})`)
          }
        } else {
          console.log(`  ⚪ ${ticker}: Still open`)
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${ticker}:`, error)
        skipped.push(ticker)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${openPositions.length} positions`,
      processed: openPositions.length,
      closed: updates.length,
      skipped: skipped.length,
      details: updates,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred',
    }, { status: 500 })
  }
}

