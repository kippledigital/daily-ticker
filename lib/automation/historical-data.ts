import { createClient } from '@supabase/supabase-js';
import { HistoricalStockData } from '@/types/automation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Fetches historical stock analysis data from the last 30 days
 * Replicates Gumloop's "Get Historical Data (Last 30 Days)" HTTP GET node
 *
 * Returns historical watchlist data to:
 * 1) Avoid repeating stocks analyzed recently
 * 2) Build on previous insights if re-analyzing
 * 3) Reference past performance trends
 */
export async function getHistoricalWatchlistData(): Promise<string> {
  try {
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    // Query briefs from last 30 days with their stocks
    const { data: briefs, error } = await supabase
      .from('briefs')
      .select(
        `
        date,
        stocks (
          ticker,
          sector,
          confidence,
          risk_level,
          action,
          entry_price,
          summary,
          why_matters,
          momentum_check,
          actionable_insight
        )
      `
      )
      .gte('date', startDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching historical data:', error);
      return 'No historical data available';
    }

    if (!briefs || briefs.length === 0) {
      return 'No stocks analyzed in the last 30 days';
    }

    // Format historical data for AI prompt
    const historicalSummary: string[] = [];

    for (const brief of briefs) {
      const date = brief.date;
      const stocks = brief.stocks as any[];

      if (stocks && stocks.length > 0) {
        historicalSummary.push(`Date: ${date}`);
        for (const stock of stocks) {
          historicalSummary.push(
            `- ${stock.ticker} (${stock.sector}): ${stock.action} | Confidence: ${stock.confidence}% | ${stock.summary}`
          );
        }
        historicalSummary.push('');
      }
    }

    const formattedData = historicalSummary.join('\n');

    return formattedData || 'No historical stock data available';
  } catch (error) {
    console.error('Error in getHistoricalWatchlistData:', error);
    return 'Error fetching historical data';
  }
}

/**
 * Gets recent analysis for a specific ticker (last 30 days)
 * Useful for checking if we recently analyzed this stock
 */
export async function getRecentAnalysisForTicker(ticker: string): Promise<any | null> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: stocks, error } = await supabase
      .from('stocks')
      .select('*, briefs!inner(date)')
      .eq('ticker', ticker.toUpperCase())
      .gte('briefs.date', startDate)
      .order('briefs.date', { ascending: false })
      .limit(1)
      .single();

    if (error || !stocks) {
      return null;
    }

    return stocks;
  } catch (error) {
    console.error(`Error fetching recent analysis for ${ticker}:`, error);
    return null;
  }
}

/**
 * Gets list of tickers analyzed in the last N days
 * Useful for avoiding repeated analysis
 */
export async function getRecentlyAnalyzedTickers(days: number = 7): Promise<string[]> {
  try {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days);
    const startDate = targetDate.toISOString().split('T')[0];

    const { data: stocks, error } = await supabase
      .from('stocks')
      .select('ticker, briefs!inner(date)')
      .gte('briefs.date', startDate);

    if (error || !stocks) {
      return [];
    }

    // Get unique tickers
    const tickerSet = new Set<string>();
    stocks.forEach((s: any) => tickerSet.add(s.ticker));
    const tickers = Array.from(tickerSet);

    return tickers;
  } catch (error) {
    console.error('Error fetching recently analyzed tickers:', error);
    return [];
  }
}
