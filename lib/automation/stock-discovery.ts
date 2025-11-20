import { StockDiscoveryConfig } from '@/types/automation';
import { getStockQuotesWithFallback } from '@/lib/quote-fetcher';
import { getRecentlyAnalyzedTickers } from './historical-data';
import { getSocialSentiment } from '@/lib/finnhub';

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
 * Discovers trending stocks using Polygon.io data + Finnhub social sentiment
 * Enhanced with social media buzz to find stocks gaining traction
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

    // Limit candidates to avoid Polygon rate limits (5 calls/minute)
    // REDUCED: 20 stocks was taking 4+ minutes (20 × 13s = 260s)
    // Now limiting to 10 stocks max = ~2 minutes, leaving 3 minutes for rest of automation
    const maxCandidates = 10;
    const limitedCandidates = candidates.slice(0, maxCandidates);
    
    if (candidates.length > maxCandidates) {
      console.log(`Limiting candidates from ${candidates.length} to ${maxCandidates} to respect Polygon rate limits`);
    }

    // Fetch real-time quotes for limited candidates (with multi-source fallback)
    // Note: For stock discovery, we allow some failures since we're just ranking candidates
    // The final 3 stocks will use strict validation in data-aggregator
    let quotesResult;
    try {
      quotesResult = await getStockQuotesWithFallback(limitedCandidates);
    } catch (error) {
      // If all sources fail during discovery, log but continue with available data
      console.error(`❌ Stock discovery: Failed to fetch quotes from all sources:`, error);
      // Fall back to default stocks if discovery completely fails
      console.warn(`⚠️ Falling back to default stocks due to API failures`);
      return ['AAPL', 'MSFT', 'GOOGL'].slice(0, finalConfig.numberOfTickers);
    }
    
    const quotes = quotesResult.quotes;

    // Log data quality info
    if (quotesResult.dataQuality.failed > 0) {
      console.warn(`⚠️ Stock discovery: ${quotesResult.dataQuality.failed}/${quotesResult.dataQuality.totalRequested} stocks failed to fetch`);
      console.warn(`   Sources used: ${quotesResult.dataQuality.sourcesUsed.join(', ')}`);
      console.warn(`   Failed symbols: ${quotesResult.dataQuality.failedSymbols.join(', ')}`);
    } else {
      console.log(`✅ Stock discovery: All ${quotesResult.dataQuality.successful} stocks fetched successfully`);
      console.log(`   Sources used: ${quotesResult.dataQuality.sourcesUsed.join(', ')}`);
    }

    // Fetch social sentiment for top movers (limit API calls)
    // Only fetch for stocks with significant price movement (> 1%)
    const topMovers = quotes
      .filter(q => Math.abs(q.changePercent) > 1)
      .slice(0, 15) // Limit to top 15 to save API calls
      .map(q => q.symbol);

    console.log(`Fetching social sentiment for ${topMovers.length} top movers...`);
    const sentimentPromises = topMovers.map(async ticker => {
      try {
        const sentiment = await getSocialSentiment(ticker);
        return { ticker, sentiment };
      } catch {
        return { ticker, sentiment: null };
      }
    });

    const sentimentResults = await Promise.all(sentimentPromises);
    const sentimentMap = new Map(
      sentimentResults.map(r => [r.ticker, r.sentiment])
    );

    // Score each stock based on:
    // 1. Price change % (momentum) - 40% weight
    // 2. Social sentiment score - 30% weight
    // 3. Social mentions count - 20% weight
    // 4. Randomization for variety - 10% weight

    const scoredStocks = quotes
      .filter(q => {
        // Apply filters
        if (q.price < (finalConfig.minPrice || 0)) return false;
        if (q.volume && q.volume < (finalConfig.minVolume || 0)) return false;
        return true;
      })
      .map(q => {
        const sentiment = sentimentMap.get(q.symbol);

        // Momentum score (0-40 points)
        const momentumScore = Math.abs(q.changePercent) * 4; // 10% move = 40 points

        // Social sentiment score (0-30 points)
        // Sentiment ranges from -1 to 1, we normalize to 0-30
        const sentimentScore = sentiment
          ? ((sentiment.overall.sentimentScore + 1) / 2) * 30
          : 0;

        // Social buzz score (0-20 points)
        // More mentions = higher score (capped at 20)
        const buzzScore = sentiment
          ? Math.min((sentiment.overall.totalMentions / 100) * 20, 20)
          : 0;

        // Randomization (0-10 points) for variety
        const randomScore = Math.random() * 10;

        const totalScore = momentumScore + sentimentScore + buzzScore + randomScore;

        return {
          ticker: q.symbol,
          score: totalScore,
          changePercent: q.changePercent,
          sentiment: sentiment
            ? {
                score: sentiment.overall.sentimentScore.toFixed(2),
                mentions: sentiment.overall.totalMentions,
                trend: sentiment.overall.trend,
              }
            : null,
          breakdown: {
            momentum: momentumScore.toFixed(1),
            sentiment: sentimentScore.toFixed(1),
            buzz: buzzScore.toFixed(1),
            random: randomScore.toFixed(1),
          },
        };
      })
      .sort((a, b) => b.score - a.score);

    // Log top candidates for transparency
    console.log('Top candidates with scores:');
    scoredStocks.slice(0, 10).forEach(s => {
      console.log(
        `${s.ticker}: ${s.score.toFixed(1)} (${s.breakdown.momentum}m + ${s.breakdown.sentiment}s + ${s.breakdown.buzz}b + ${s.breakdown.random}r) ${s.changePercent >= 0 ? '📈' : '📉'}${Math.abs(s.changePercent).toFixed(2)}%${s.sentiment ? ` | ${s.sentiment.mentions} mentions` : ''}`
      );
    });

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
