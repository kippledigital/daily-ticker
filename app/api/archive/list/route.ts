import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const ticker = searchParams.get('ticker')?.toUpperCase();

    // Build query (now using subject_premium for list view)
    let query = supabase
      .from('briefs')
      .select(`
        id,
        date,
        subject_premium,
        tldr,
        actionable_count,
        stocks (
          ticker,
          sector
        )
      `)
      .order('date', { ascending: false });

    // If filtering by ticker, join with stocks table
    if (ticker) {
      query = query.filter('stocks.ticker', 'eq', ticker);
    }

    // Get total count
    const { count } = await supabase
      .from('briefs')
      .select('*', { count: 'exact', head: true });

    // Get paginated data
    const { data: briefs, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching briefs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch briefs list' },
        { status: 500 }
      );
    }

    // Transform data
    const transformedBriefs = briefs?.map((brief: any) => {
      const stocks = brief.stocks || [];
      const uniqueSectors = Array.from(new Set(stocks.map((s: any) => s.sector)));
      const tickers = stocks.map((s: any) => s.ticker);

      return {
        date: brief.date,
        subject: brief.subject_premium, // Use premium subject for archive list
        tldr: brief.tldr,
        actionableCount: brief.actionable_count,
        stockCount: stocks.length,
        tickers,
        sectors: uniqueSectors,
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: transformedBriefs,
      total: count || 0,
      limit,
      offset,
      hasMore: offset + limit < (count || 0),
    });
  } catch (error) {
    console.error('Error listing briefs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch briefs list' },
      { status: 500 }
    );
  }
}
