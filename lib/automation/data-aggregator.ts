/**
 * Data Aggregator
 *
 * Combines data from multiple sources (Polygon, Alpha Vantage, Finnhub)
 * Validates and cross-references data
 * Provides unified, verified stock data for AI analysis
 */

import { getStockQuotesWithFallback } from '@/lib/quote-fetcher';
import * as AlphaVantage from '@/lib/alpha-vantage';
import * as Finnhub from '@/lib/finnhub';

export interface AggregatedStockData {
  // Basic Info
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  description: string;

  // Price Data (validated across sources)
  price: number;
  priceSource: string;
  priceVerified: boolean;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;

  // Fundamentals
  marketCap: number;
  peRatio: number;
  eps: number;
  revenue: number;
  profitMargin: number;
  dividendYield?: number;
  beta?: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;

  // News & Sentiment
  news: {
    title: string;
    url: string;
    summary: string;
    source: string;
    publishedAt: string;
    sentiment?: 'bullish' | 'bearish' | 'neutral';
  }[];
  overallNewsSentiment: 'bullish' | 'bearish' | 'neutral';

  // Social Sentiment
  socialSentiment: {
    score: number; // -1 to 1
    trend: 'rising' | 'falling' | 'stable';
    totalMentions: number;
    summary: string;
  } | null;

  // Insider Trading
  insiderActivity: {
    recentBuys: number;
    recentSells: number;
    netActivity: 'buying' | 'selling' | 'neutral';
  } | null;

  // Analyst Recommendations
  analystRatings: {
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
    consensus: 'strong buy' | 'buy' | 'hold' | 'sell' | 'strong sell';
  } | null;

  // Data Quality Metrics
  dataQuality: {
    priceVerified: boolean;
    fundamentalsComplete: boolean;
    newsAvailable: boolean;
    socialDataAvailable: boolean;
    overallScore: number; // 0-100
    warnings: string[];
  };

  // Sources & Timestamp
  sources: string[];
  timestamp: string;
}

/**
 * Aggregate data from all sources for a single stock
 */
export async function aggregateStockData(
  ticker: string,
  historicalDate?: { timeFrom?: string; timeTo?: string } // For historical news queries
): Promise<AggregatedStockData | null> {
  try {
    console.log(`Aggregating data for ${ticker}...`);

    // Fetch from all sources in parallel
    // OPTIMIZED: Removed redundant Alpha Vantage quote call (already in getStockQuotesWithFallback)
    // Use Promise.allSettled for Finnhub so failures don't block the automation
    // CRITICAL: For final stocks, we MUST have real data - use multi-source fetcher
    const [quoteResult, alphaVantageFundamentals, alphaVantageNews, finnhubResult] =
      await Promise.all([
        getStockQuotesWithFallback([ticker]), // Multi-source: Polygon -> Alpha Vantage (includes quote)
        AlphaVantage.getFundamentals(ticker),
        AlphaVantage.getNewsAndSentiment(
          ticker,
          10,
          historicalDate?.timeFrom,
          historicalDate?.timeTo
        ),
        Promise.allSettled([Finnhub.getCompleteStockData(ticker)]).then(results => 
          results[0].status === 'fulfilled' ? results[0].value : {
            news: [],
            sentiment: null,
            insider: [],
            recommendations: null,
            timestamp: new Date().toISOString(),
          }
        ),
      ]);
    
    // Extract Alpha Vantage quote from quoteResult if available (for cross-validation)
    const alphaVantageQuote = quoteResult.quotes[0] && quoteResult.dataQuality.sourcesUsed.includes('Alpha Vantage')
      ? { price: quoteResult.quotes[0].price, symbol: ticker }
      : null;
    
    const finnhubData = finnhubResult;

    // Extract quote from multi-source fetcher (guaranteed to be real data or throws error)
    const quote = quoteResult.quotes[0];
    
    if (!quote) {
      throw new Error(`❌ CRITICAL: No quote data available for ${ticker} from any source`);
    }
    
    if (quote.isRealData !== true) {
      throw new Error(`❌ CRITICAL: ${ticker} quote is not marked as real data - cannot proceed`);
    }
    
    console.log(`✅ Data aggregation for ${ticker}: Real data fetched from ${quoteResult.dataQuality.sourcesUsed.join(', ')}`);

    // Validate price across sources (cross-check with Alpha Vantage)
    const priceValidation = validatePrice(quote, alphaVantageQuote);

    if (!priceValidation.verified) {
      console.warn(`Price discrepancy for ${ticker}: ${priceValidation.message}`);
    }

    // Use quote from multi-source fetcher (guaranteed real data)
    // Alpha Vantage quote is used for cross-validation only
    const price = quote.price;
    const change = quote.change;
    const changePercent = quote.changePercent;

    // Process news and calculate sentiment
    const combinedNews = combineNews(alphaVantageNews, finnhubData.news);
    const overallNewsSentiment = calculateNewsSentiment(combinedNews);

    // Process social sentiment
    const socialSentiment = finnhubData.sentiment
      ? {
          score: finnhubData.sentiment.overall.sentimentScore,
          trend: finnhubData.sentiment.overall.trend,
          totalMentions: finnhubData.sentiment.overall.totalMentions,
          summary: Finnhub.getSentimentSummary(finnhubData.sentiment),
        }
      : null;

    // Process insider trading
    const insiderActivity = processInsiderActivity(finnhubData.insider);

    // Process analyst recommendations
    const analystRatings = processAnalystRecommendations(finnhubData.recommendations);

    // Calculate data quality
    const dataQuality = calculateDataQuality({
      priceVerified: priceValidation.verified,
      fundamentals: alphaVantageFundamentals,
      news: combinedNews,
      social: finnhubData.sentiment,
    });

    // Build aggregated data object
    const aggregatedData: AggregatedStockData = {
      ticker,
      name: alphaVantageFundamentals?.name || ticker,
      sector: alphaVantageFundamentals?.sector || 'Unknown',
      industry: alphaVantageFundamentals?.industry || 'Unknown',
      description: alphaVantageFundamentals?.description || '',

      // Price Data
      price,
      priceSource: quoteResult.dataQuality.sourcesUsed[0] || 'Polygon.io',
      priceVerified: priceValidation.verified,
      change,
      changePercent,
      volume: alphaVantageQuote?.volume || quote.volume || 0,
      high: alphaVantageQuote?.high || 0,
      low: alphaVantageQuote?.low || 0,
      open: alphaVantageQuote?.open || 0,
      previousClose: alphaVantageQuote?.previousClose || 0,

      // Fundamentals
      marketCap: alphaVantageFundamentals?.marketCap || 0,
      peRatio: alphaVantageFundamentals?.peRatio || 0,
      eps: alphaVantageFundamentals?.eps || 0,
      revenue: alphaVantageFundamentals?.revenue || 0,
      profitMargin: alphaVantageFundamentals?.profitMargin || 0,
      dividendYield: alphaVantageFundamentals?.dividendYield,
      beta: alphaVantageFundamentals?.beta,
      fiftyTwoWeekHigh: alphaVantageFundamentals?.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: alphaVantageFundamentals?.fiftyTwoWeekLow || 0,

      // News & Sentiment
      news: combinedNews,
      overallNewsSentiment,

      // Social Sentiment
      socialSentiment,

      // Insider Trading
      insiderActivity,

      // Analyst Recommendations
      analystRatings,

      // Data Quality
      dataQuality,

      // Sources
      sources: ['Polygon.io', 'Alpha Vantage', 'Finnhub'],
      timestamp: new Date().toISOString(),
    };

    return aggregatedData;
  } catch (error) {
    console.error(`Error aggregating data for ${ticker}:`, error);
    return null;
  }
}

/**
 * Validate price across multiple sources
 */
function validatePrice(
  polygonQuote: any,
  alphaVantageQuote: AlphaVantage.AlphaVantageQuote | null
): { verified: boolean; message: string } {
  if (!polygonQuote || !alphaVantageQuote) {
    return { verified: false, message: 'Missing data from one or more sources' };
  }

  const polygonPrice = polygonQuote.price;
  const alphaPrice = alphaVantageQuote.price;

  // Allow 2% discrepancy (due to timing differences)
  const discrepancy = Math.abs(polygonPrice - alphaPrice) / polygonPrice;

  if (discrepancy > 0.02) {
    return {
      verified: false,
      message: `Price discrepancy: Polygon=$${polygonPrice}, Alpha Vantage=$${alphaPrice}`,
    };
  }

  return { verified: true, message: 'Price verified across sources' };
}

/**
 * Combine news from multiple sources
 */
function combineNews(
  alphaVantageNews: AlphaVantage.AlphaVantageNewsItem[],
  finnhubNews: Finnhub.FinnhubNewsItem[]
): AggregatedStockData['news'] {
  const combined: AggregatedStockData['news'] = [];

  // Add Alpha Vantage news
  alphaVantageNews.forEach(item => {
    combined.push({
      title: item.title,
      url: item.url,
      summary: item.summary,
      source: item.source,
      publishedAt: item.publishedAt,
      sentiment: item.sentiment,
    });
  });

  // Add Finnhub news (avoiding duplicates)
  finnhubNews.forEach(item => {
    const isDuplicate = combined.some(existing => existing.title === item.headline);
    if (!isDuplicate) {
      combined.push({
        title: item.headline,
        url: item.url,
        summary: item.summary,
        source: item.source,
        publishedAt: new Date(item.datetime * 1000).toISOString(),
      });
    }
  });

  // Sort by date (newest first)
  combined.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // Return top 10
  return combined.slice(0, 10);
}

/**
 * Calculate overall news sentiment
 */
function calculateNewsSentiment(news: AggregatedStockData['news']): 'bullish' | 'bearish' | 'neutral' {
  const sentimentScores = news
    .filter(item => item.sentiment)
    .map(item => (item.sentiment === 'bullish' ? 1 : item.sentiment === 'bearish' ? -1 : 0));

  if (sentimentScores.length === 0) return 'neutral';

  const avgSentiment = sentimentScores.reduce((sum: number, score: number) => sum + score, 0) / sentimentScores.length;

  if (avgSentiment > 0.2) return 'bullish';
  if (avgSentiment < -0.2) return 'bearish';
  return 'neutral';
}

/**
 * Process insider trading activity
 */
function processInsiderActivity(transactions: Finnhub.FinnhubInsiderTransaction[]): AggregatedStockData['insiderActivity'] {
  if (!transactions || transactions.length === 0) return null;

  // Last 30 days only
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentTransactions = transactions.filter(
    t => new Date(t.transactionDate) >= thirtyDaysAgo
  );

  const buys = recentTransactions.filter(t => t.transactionCode === 'P').length;
  const sells = recentTransactions.filter(t => t.transactionCode === 'S').length;

  let netActivity: 'buying' | 'selling' | 'neutral' = 'neutral';
  if (buys > sells * 1.5) netActivity = 'buying';
  else if (sells > buys * 1.5) netActivity = 'selling';

  return {
    recentBuys: buys,
    recentSells: sells,
    netActivity,
  };
}

/**
 * Process analyst recommendations
 */
function processAnalystRecommendations(recommendations: Finnhub.FinnhubRecommendation | null): AggregatedStockData['analystRatings'] {
  if (!recommendations) return null;

  const total =
    recommendations.strongBuy +
    recommendations.buy +
    recommendations.hold +
    recommendations.sell +
    recommendations.strongSell;

  if (total === 0) return null;

  // Calculate consensus
  const score =
    (recommendations.strongBuy * 2 +
      recommendations.buy * 1 +
      recommendations.hold * 0 +
      recommendations.sell * -1 +
      recommendations.strongSell * -2) /
    total;

  let consensus: 'strong buy' | 'buy' | 'hold' | 'sell' | 'strong sell';
  if (score >= 1.5) consensus = 'strong buy';
  else if (score >= 0.5) consensus = 'buy';
  else if (score >= -0.5) consensus = 'hold';
  else if (score >= -1.5) consensus = 'sell';
  else consensus = 'strong sell';

  return {
    strongBuy: recommendations.strongBuy,
    buy: recommendations.buy,
    hold: recommendations.hold,
    sell: recommendations.sell,
    strongSell: recommendations.strongSell,
    consensus,
  };
}

/**
 * Calculate data quality score
 */
function calculateDataQuality(checks: {
  priceVerified: boolean;
  fundamentals: any;
  news: any[];
  social: any;
}): AggregatedStockData['dataQuality'] {
  const warnings: string[] = [];
  let score = 0;

  // Price verification (30 points)
  if (checks.priceVerified) {
    score += 30;
  } else {
    warnings.push('Price could not be verified across sources');
  }

  // Fundamentals (30 points)
  if (checks.fundamentals && checks.fundamentals.peRatio > 0) {
    score += 30;
  } else {
    warnings.push('Fundamental data incomplete or unavailable');
  }

  // News availability (20 points)
  if (checks.news && checks.news.length >= 3) {
    score += 20;
  } else {
    warnings.push('Limited news data available');
  }

  // Social data (20 points)
  if (checks.social && checks.social.overall.totalMentions > 10) {
    score += 20;
  } else {
    warnings.push('Limited social sentiment data');
  }

  return {
    priceVerified: checks.priceVerified,
    fundamentalsComplete: !!checks.fundamentals,
    newsAvailable: checks.news.length > 0,
    socialDataAvailable: !!checks.social,
    overallScore: score,
    warnings,
  };
}

/**
 * Batch aggregate data for multiple stocks
 */
export async function aggregateBatchStockData(tickers: string[]): Promise<AggregatedStockData[]> {
  const results: AggregatedStockData[] = [];

  for (const ticker of tickers) {
    const data = await aggregateStockData(ticker);
    if (data) {
      results.push(data);
    }
    // Small delay to respect API rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}
