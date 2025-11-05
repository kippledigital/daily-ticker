/**
 * Backfill Performance Data for Archived Briefs
 *
 * This script:
 * 1. Finds all stocks without performance tracking records
 * 2. Creates performance records with entry data
 * 3. Fetches current prices from Polygon.io
 * 4. Checks if stop-loss or profit targets were hit
 * 5. Updates exit data for closed positions
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const POLYGON_API_KEY = process.env.POLYGON_API_KEY!

async function fetchCurrentPrice(ticker: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
    )
    const data = await response.json()
    return data.results?.[0]?.c || null // Close price
  } catch (error) {
    console.error(`Failed to fetch price for ${ticker}:`, error)
    return null
  }
}

async function backfillPerformanceData() {
  console.log('🔄 Starting performance data backfill...\n')

  // Step 1: Find stocks without performance records
  const { data: stocksWithoutPerf, error: fetchError } = await supabase
    .from('stocks')
    .select(`
      id,
      ticker,
      entry_price,
      stop_loss,
      profit_target,
      briefs!inner(date)
    `)
    .is('stock_performance.stock_id', null)

  if (fetchError) {
    console.error('Error fetching stocks:', fetchError)
    return
  }

  console.log(`📊 Found ${stocksWithoutPerf?.length || 0} stocks without performance records\n`)

  if (!stocksWithoutPerf || stocksWithoutPerf.length === 0) {
    console.log('✅ All stocks already have performance records!')

    // Check for open positions to update
    const { data: openPositions } = await supabase
      .from('stock_performance')
      .select(`
        *,
        stocks!inner(ticker, stop_loss, profit_target)
      `)
      .eq('outcome', 'open')

    console.log(`\n📈 Checking ${openPositions?.length || 0} open positions for updates...\n`)

    if (openPositions && openPositions.length > 0) {
      for (const position of openPositions) {
        const stock = (position as any).stocks
        const ticker = stock.ticker
        const currentPrice = await fetchCurrentPrice(ticker)

        if (!currentPrice) {
          console.log(`⚠️  ${ticker}: Could not fetch price`)
          continue
        }

        const entryDate = new Date(position.entry_date)
        const today = new Date()
        const holdingDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

        let exitPrice: number | null = null
        let exitReason: string | null = null

        // Check exit conditions
        if (stock.stop_loss && currentPrice <= stock.stop_loss) {
          exitPrice = stock.stop_loss
          exitReason = 'stop_loss'
        } else if (stock.profit_target && currentPrice >= stock.profit_target) {
          exitPrice = stock.profit_target
          exitReason = 'profit_target'
        } else if (holdingDays >= 30) {
          exitPrice = currentPrice
          exitReason = '30_day_limit'
        }

        if (exitPrice && exitReason) {
          const { error: updateError } = await supabase
            .from('stock_performance')
            .update({
              exit_date: today.toISOString().split('T')[0],
              exit_price: exitPrice,
              exit_reason: exitReason
            })
            .eq('id', position.id)

          if (updateError) {
            console.log(`❌ ${ticker}: Failed to update - ${updateError.message}`)
          } else {
            const returnPct = ((exitPrice - position.entry_price) / position.entry_price * 100).toFixed(2)
            const outcome = parseFloat(returnPct) > 0 ? '✅ WIN' : '❌ LOSS'
            console.log(`${outcome} ${ticker}: Entry $${position.entry_price} → Exit $${exitPrice} (${returnPct}%) via ${exitReason}`)
          }
        } else {
          console.log(`📊 ${ticker}: Still open at $${currentPrice} (Entry: $${position.entry_price})`)
        }
      }
    }

    return
  }

  // Step 2: Create performance records
  const recordsToCreate = []

  for (const stock of stocksWithoutPerf) {
    const brief = (stock as any).briefs

    recordsToCreate.push({
      stock_id: stock.id,
      entry_date: brief.date,
      entry_price: stock.entry_price
    })

    console.log(`📝 Creating record: ${stock.ticker} - Entry $${stock.entry_price} on ${brief.date}`)
  }

  const { error: insertError } = await supabase
    .from('stock_performance')
    .insert(recordsToCreate)

  if (insertError) {
    console.error('❌ Error creating performance records:', insertError)
    return
  }

  console.log(`\n✅ Created ${recordsToCreate.length} performance records!\n`)

  // Step 3: Update with current prices
  console.log('💰 Fetching current prices and checking for exits...\n')

  for (const stock of stocksWithoutPerf) {
    const currentPrice = await fetchCurrentPrice(stock.ticker)

    if (!currentPrice) {
      console.log(`⚠️  ${stock.ticker}: Could not fetch price`)
      continue
    }

    const brief = (stock as any).briefs
    const entryDate = new Date(brief.date)
    const today = new Date()
    const holdingDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

    let exitPrice: number | null = null
    let exitReason: string | null = null

    // Check exit conditions
    if (stock.stop_loss && currentPrice <= stock.stop_loss) {
      exitPrice = stock.stop_loss
      exitReason = 'stop_loss'
    } else if (stock.profit_target && currentPrice >= stock.profit_target) {
      exitPrice = stock.profit_target
      exitReason = 'profit_target'
    } else if (holdingDays >= 30) {
      exitPrice = currentPrice
      exitReason = '30_day_limit'
    }

    if (exitPrice && exitReason) {
      const { error: updateError } = await supabase
        .from('stock_performance')
        .update({
          exit_date: today.toISOString().split('T')[0],
          exit_price: exitPrice,
          exit_reason: exitReason
        })
        .eq('stock_id', stock.id)

      if (updateError) {
        console.log(`❌ ${stock.ticker}: Failed to update - ${updateError.message}`)
      } else {
        const returnPct = ((exitPrice - stock.entry_price) / stock.entry_price * 100).toFixed(2)
        const outcome = parseFloat(returnPct) > 0 ? '✅ WIN' : '❌ LOSS'
        console.log(`${outcome} ${stock.ticker}: Entry $${stock.entry_price} → Exit $${exitPrice} (${returnPct}%) via ${exitReason} (${holdingDays}d)`)
      }
    } else {
      console.log(`📊 ${stock.ticker}: Still open at $${currentPrice} (Entry: $${stock.entry_price}, ${holdingDays}d)`)
    }
  }

  // Step 4: Show final summary
  console.log('\n📊 Performance Summary:')
  const { data: summary } = await supabase
    .from('performance_summary')
    .select('*')
    .single()

  if (summary) {
    console.log(`   Win Rate: ${summary.win_rate_percent}%`)
    console.log(`   Avg Return: ${summary.avg_return_percent}%`)
    console.log(`   Total Wins: ${summary.total_wins}`)
    console.log(`   Total Losses: ${summary.total_losses}`)
    console.log(`   Open Positions: ${summary.total_open_picks}`)
  }

  console.log('\n✅ Backfill complete!')
}

// Run the script
backfillPerformanceData().catch(console.error)
