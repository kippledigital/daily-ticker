import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to list all tickers with pick counts
 */
export async function GET() {
  try {
    const { data: stocks, error } = await supabase
      .from('stocks')
      .select('ticker, brief_id')
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Count picks per ticker
    const tickerCounts = new Map<string, number>();
    stocks?.forEach((stock: any) => {
      const count = tickerCounts.get(stock.ticker) || 0;
      tickerCounts.set(stock.ticker, count + 1);
    });

    const tickers = Array.from(tickerCounts.entries())
      .map(([ticker, count]) => ({ ticker, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      total: tickers.length,
      tickers,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tickers' },
      { status: 500 }
    );
  }
}

