import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering (don't pre-render at build time)
export const dynamic = 'force-dynamic'

/**
 * GET /api/performance
 *
 * Returns performance summary and recent picks with outcomes
 *
 * Query params:
 * - limit: Number of recent picks to return (default: 10)
 * - status: Filter by outcome ('win', 'loss', 'open', or 'all')
 */
export async function GET(request: Request) {
  try {
    // Initialize Supabase client at runtime
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const status = searchParams.get('status') || 'all'

    // Fetch performance summary
    const { data: summary, error: summaryError } = await supabase
      .from('performance_summary')
      .select('*')
      .single()

    if (summaryError && summaryError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (expected if no data yet)
      console.error('Error fetching performance summary:', summaryError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch performance summary',
      }, { status: 500 })
    }

    // Fetch recent picks with details
    let query = supabase
      .from('stock_performance')
      .select(`
        *,
        stocks:stock_id (
          ticker,
          company_name,
          sector,
          current_price,
          stop_loss,
          profit_target,
          confidence
        )
      `)
      .order('entry_date', { ascending: false })
      .limit(limit)

    // Filter by status if specified
    if (status !== 'all') {
      query = query.eq('outcome', status)
    }

    const { data: picks, error: picksError } = await query

    if (picksError) {
      console.error('Error fetching stock picks:', picksError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch stock picks',
      }, { status: 500 })
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        summary: summary || {
          total_closed_picks: 0,
          total_open_picks: 0,
          total_wins: 0,
          total_losses: 0,
          win_rate_percent: 0,
          avg_return_percent: 0,
          avg_win_percent: 0,
          avg_loss_percent: 0,
          avg_holding_days: 0,
          best_pick_percent: 0,
          worst_pick_percent: 0,
        },
        picks: picks || [],
      },
    })
  } catch (error) {
    console.error('Unexpected error in /api/performance:', error)
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred',
    }, { status: 500 })
  }
}
