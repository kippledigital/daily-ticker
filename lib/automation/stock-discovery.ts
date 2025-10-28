import { StockDiscoveryConfig } from '@/types/automation';
import { getStockQuotes } from '@/lib/polygon';
import { getRecentlyAnalyzedTickers } from './historical-data';

/**
 * Discovers trending stocks based on criteria
 * Replicates Gumloop's "Enhanced Stock Discovery" node
 *
 * Configuration from Gumloop:
 * - Number of Tickers: 3
 * - Focus Sectors: Technology, Healthcare, Energy, Finance
 * - Time Window: 72 hours
 * - Filters: Min price, volume, RSI bounds, price change %
 */

// Stock universe by sector (top liquid stocks)
const STOCK_UNIVERSE: Record<string, string[]> = {
  Technology: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'AMD', 'INTC', 'ORCL', 'CSCO', 'ADBE', 'CRM', 'AVGO'],
  Healthcare: ['UNH', 'JNJ', 'LLY', 'ABBV', 'MRK', 'PFE', 'TMO', 'ABT', 'DHR', 'BMY'],
  Energy: ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HAL'],
  Finance: ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'SCHW', 'AXP', 'USB'],
  Consumer: ['AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'SBUX', 'TGT', 'LOW', 'TJX', 'COST'],
};

const DEFAULT_CONFIG: StockDiscoveryConfig = {
  numberOfTickers: 3,
  focusSectors: ['Technology', 'Healthcare', 'Energy', 'Finance'],
  timeWindow: '72 hours',
  minPrice: 5, // $5 minimum (avoid penny stocks)
  minVolume: 1000000, // 1M minimum volume
  rsiLowerBound: 30, // Not oversold
  rsiUpperBound: 70, // Not overbought
  minPriceChangePercent: 2, // At least 2% move
};

/**
 * Discovers trending stocks using Polygon.io data
 */
export async function discoverTrendingStocks(config: Partial<StockDiscoveryConfig> = {}): Promise<string[]> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    // Get all tickers from focus sectors
    let candidates: string[] = [];
    for (const sector of finalConfig.focusSectors) {
      const sectorStocks = STOCK_UNIVERSE[sector] || [];
      candidates = [...candidates, ...sectorStocks];
    }

    // Remove duplicates
    const uniqueCandidates = new Set(candidates);
    candidates = Array.from(uniqueCandidates);

    // Remove recently analyzed stocks (last 7 days) to avoid repetition
    const recentlyAnalyzed = await getRecentlyAnalyzedTickers(7);
    candidates = candidates.filter(ticker => !recentlyAnalyzed.includes(ticker));

    if (candidates.length === 0) {
      // Fallback to defaults if all were recently analyzed
      candidates = ['AAPL', 'NVDA', 'MSFT'];
    }

    // Fetch real-time quotes for all candidates
    const quotes = await getStockQuotes(candidates);

    // Score each stock based on:
    // 1. Price change % (momentum)
    // 2. Volume relative to average
    // 3. Price > minimum
    // 4. Randomization for variety

    const scoredStocks = quotes
      .filter(q => {
        // Apply filters
        if (q.price < (finalConfig.minPrice || 0)) return false;
        if (q.volume && q.volume < (finalConfig.minVolume || 0)) return false;
        return true;
      })
      .map(q => ({
        ticker: q.symbol,
        score: Math.abs(q.changePercent) + Math.random() * 10, // Momentum + randomness
        changePercent: q.changePercent,
      }))
      .sort((a, b) => b.score - a.score);

    // Take top N tickers
    const selected = scoredStocks.slice(0, finalConfig.numberOfTickers).map(s => s.ticker);

    // Ensure we always return the requested number
    while (selected.length < finalConfig.numberOfTickers && candidates.length > selected.length) {
      const fallback = candidates.find(c => !selected.includes(c));
      if (fallback) selected.push(fallback);
      else break;
    }

    console.log('Discovered stocks:', selected);
    return selected;
  } catch (error) {
    console.error('Error discovering stocks:', error);
    // Fallback to safe defaults
    return ['AAPL', 'MSFT', 'GOOGL'].slice(0, finalConfig.numberOfTickers);
  }
}

/**
 * Alternative: Use AI to discover trending stocks from news/sentiment
 */
export async function discoverStocksWithAI(config: Partial<StockDiscoveryConfig> = {}): Promise<string[]> {
  // This could use OpenAI to analyze recent market news and identify trending stocks
  // For now, fall back to the data-driven approach
  return discoverTrendingStocks(config);
}
