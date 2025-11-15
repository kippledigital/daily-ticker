import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 1 minute should be enough

/**
 * Admin endpoint to initialize performance tracking for all stocks
 * This creates stock_performance records for stocks that don't have them yet
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

    console.log('🚀 Initializing Performance Tracking for All Stocks')

    // Step 1: Fetch all stocks with their brief dates
    const { data: stocks, error: stocksError } = await supabase
      .from('stocks')
      .select(`
        id,
        ticker,
        entry_price,
        briefs!inner (
          date
        )
      `)
      .order('created_at', { ascending: true })

    if (stocksError) {
      throw new Error(`Failed to fetch stocks: ${stocksError.message}`)
    }

    if (!stocks || stocks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No stocks found in database',
        created: 0,
      })
    }

    console.log(`📊 Found ${stocks.length} total stocks`)

    // Step 2: Fetch existing performance records
    const { data: existingPerformance, error: performanceError } = await supabase
      .from('stock_performance')
      .select('stock_id')

    if (performanceError) {
      throw new Error(`Failed to fetch performance records: ${performanceError.message}`)
    }

    const existingStockIds = new Set(existingPerformance?.map(p => p.stock_id) || [])
    console.log(`✅ Found ${existingStockIds.size} existing performance records`)

    // Step 3: Create performance records for stocks without them
    const stocksToCreate = []

    for (const stock of stocks as any[]) {
      const brief = Array.isArray(stock.briefs) ? stock.briefs[0] : stock.briefs
      const entryDate = brief.date

      // Skip if performance record already exists
      if (existingStockIds.has(stock.id)) {
        continue
      }

      stocksToCreate.push({
        stock_id: stock.id,
        entry_date: entryDate,
        entry_price: stock.entry_price,
        outcome: 'open',
      })
    }

    console.log(`🔄 Creating ${stocksToCreate.length} new performance records...`)

    if (stocksToCreate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All stocks already have performance tracking',
        created: 0,
        total: stocks.length,
      })
    }

    // Insert in batches of 50 to avoid timeout
    const batchSize = 50
    let totalCreated = 0

    for (let i = 0; i < stocksToCreate.length; i += batchSize) {
      const batch = stocksToCreate.slice(i, i + batchSize)
      const { error: insertError } = await supabase
        .from('stock_performance')
        .insert(batch)

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError.message)
      } else {
        totalCreated += batch.length
        console.log(`✅ Created batch ${i / batchSize + 1}: ${batch.length} records`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Initialized performance tracking for ${totalCreated} stocks`,
      created: totalCreated,
      total: stocks.length,
      already_tracked: existingStockIds.size,
    })

  } catch (error: any) {
    console.error('Error in performance initialization:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred',
    }, { status: 500 })
  }
}
