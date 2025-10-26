import { NextRequest, NextResponse } from 'next/server';
import { getStockQuotes } from '@/lib/polygon';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Default watchlist
const DEFAULT_WATCHLIST = [
  'AAPL',
  'MSFT',
  'GOOGL',
  'AMZN',
  'NVDA',
  'TSLA',
  'META',
  'AMD',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');

    // Parse symbols from query param or use default
    const symbols = symbolsParam
      ? symbolsParam.split(',').map(s => s.trim().toUpperCase())
      : DEFAULT_WATCHLIST;

    // Validate symbols (only letters, 1-5 chars)
    const validSymbols = symbols.filter(s => /^[A-Z]{1,5}$/.test(s));

    if (validSymbols.length === 0) {
      return NextResponse.json(
        { error: 'No valid symbols provided' },
        { status: 400 }
      );
    }

    // Fetch stock quotes
    const quotes = await getStockQuotes(validSymbols);

    return NextResponse.json(
      {
        success: true,
        data: quotes,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Error in stocks API:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch stock data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
