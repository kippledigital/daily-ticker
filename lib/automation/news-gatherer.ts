/**
 * Financial Data & News Gatherer
 *
 * NOW USES REAL APIs instead of AI hallucination:
 * - Alpha Vantage for fundamentals and news
 * - Finnhub for social sentiment and insider trading
 * - Data Aggregator for unified, verified data
 *
 * This replaces the old GPT-4 "simulation" approach with real-time market data
 */

import { aggregateStockData, AggregatedStockData } from './data-aggregator';

/**
 * Gathers comprehensive financial data and news for a stock using REAL APIs
 *
 * Returns formatted text summary for AI analysis
 */
export async function gatherFinancialData(
  ticker: string,
  historicalDate?: { timeFrom?: string; timeTo?: string }
): Promise<string> {
  try {
    console.log(`Gathering real financial data for ${ticker}...`);

    // Get aggregated, validated data from all sources
    const data = await aggregateStockData(ticker, historicalDate);

    if (!data) {
      console.error(`No data available for ${ticker}`);
      return `Limited data available for ${ticker}. Stock ticker: ${ticker}`;
    }

    // Format data as readable text for AI analysis
    const summary = formatDataForAI(data);

    return summary;
  } catch (error) {
    console.error(`Error gathering financial data for ${ticker}:`, error);
    return `Error gathering data for ${ticker}. Stock ticker: ${ticker}`;
  }
}

/**
 * Format aggregated data as readable text for AI analysis
 */
function formatDataForAI(data: AggregatedStockData): string {
  const sections: string[] = [];

  // Header
  sections.push(`=== ${data.name} (${data.ticker}) ===`);
  sections.push(`Sector: ${data.sector} | Industry: ${data.industry}`);
  sections.push(`Data Quality Score: ${data.dataQuality.overallScore}/100`);
  if (data.dataQuality.warnings.length > 0) {
    sections.push(`Warnings: ${data.dataQuality.warnings.join(', ')}`);
  }
  sections.push('');

  // Price Information
  sections.push('--- PRICE DATA (VERIFIED) ---');
  sections.push(`Current Price: $${data.price.toFixed(2)} (${data.priceSource})`);
  sections.push(`Price Verified: ${data.priceVerified ? 'YES ✓' : 'NO ⚠️'}`);
  sections.push(`Change: ${data.change >= 0 ? '+' : ''}$${data.change.toFixed(2)} (${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%)`);
  sections.push(`Volume: ${data.volume.toLocaleString()}`);
  sections.push(`Day Range: $${data.low.toFixed(2)} - $${data.high.toFixed(2)}`);
  sections.push(`52-Week Range: $${data.fiftyTwoWeekLow.toFixed(2)} - $${data.fiftyTwoWeekHigh.toFixed(2)}`);
  sections.push('');

  // Fundamentals
  sections.push('--- FUNDAMENTALS (REAL-TIME) ---');
  sections.push(`Market Cap: $${(data.marketCap / 1e9).toFixed(2)}B`);
  sections.push(`P/E Ratio: ${data.peRatio.toFixed(2)}`);
  sections.push(`EPS: $${data.eps.toFixed(2)}`);
  sections.push(`Revenue (TTM): $${(data.revenue / 1e9).toFixed(2)}B`);
  sections.push(`Profit Margin: ${(data.profitMargin * 100).toFixed(2)}%`);
  if (data.dividendYield) {
    sections.push(`Dividend Yield: ${(data.dividendYield * 100).toFixed(2)}%`);
  }
  if (data.beta) {
    sections.push(`Beta: ${data.beta.toFixed(2)}`);
  }
  sections.push('');

  // News & Sentiment
  sections.push('--- RECENT NEWS & SENTIMENT ---');
  sections.push(`Overall News Sentiment: ${data.overallNewsSentiment.toUpperCase()}`);
  sections.push(`Recent News Articles: ${data.news.length}`);
  sections.push('');
  sections.push('Top News Headlines:');
  data.news.slice(0, 5).forEach((article, index) => {
    const sentiment = article.sentiment ? ` [${article.sentiment.toUpperCase()}]` : '';
    sections.push(`${index + 1}. ${article.title}${sentiment}`);
    sections.push(`   Source: ${article.source} | ${new Date(article.publishedAt).toLocaleDateString()}`);
    sections.push(`   Summary: ${article.summary.substring(0, 150)}...`);
    sections.push('');
  });

  // Social Sentiment
  if (data.socialSentiment) {
    sections.push('--- SOCIAL SENTIMENT (REDDIT + TWITTER) ---');
    sections.push(`Sentiment Score: ${data.socialSentiment.score.toFixed(2)} (-1 to 1)`);
    sections.push(`Trend: ${data.socialSentiment.trend.toUpperCase()}`);
    sections.push(`Total Mentions: ${data.socialSentiment.totalMentions.toLocaleString()}`);
    sections.push(`Summary: ${data.socialSentiment.summary}`);
    sections.push('');
  } else {
    sections.push('--- SOCIAL SENTIMENT ---');
    sections.push('Limited social media activity for this stock');
    sections.push('');
  }

  // Insider Trading
  if (data.insiderActivity) {
    sections.push('--- INSIDER TRADING (LAST 30 DAYS) ---');
    sections.push(`Recent Buys: ${data.insiderActivity.recentBuys}`);
    sections.push(`Recent Sells: ${data.insiderActivity.recentSells}`);
    sections.push(`Net Activity: ${data.insiderActivity.netActivity.toUpperCase()}`);
    sections.push('');
  }

  // Analyst Recommendations
  if (data.analystRatings) {
    sections.push('--- ANALYST RECOMMENDATIONS ---');
    sections.push(`Strong Buy: ${data.analystRatings.strongBuy}`);
    sections.push(`Buy: ${data.analystRatings.buy}`);
    sections.push(`Hold: ${data.analystRatings.hold}`);
    sections.push(`Sell: ${data.analystRatings.sell}`);
    sections.push(`Strong Sell: ${data.analystRatings.strongSell}`);
    sections.push(`Consensus: ${data.analystRatings.consensus.toUpperCase()}`);
    sections.push('');
  }

  // Company Description
  if (data.description) {
    sections.push('--- COMPANY OVERVIEW ---');
    sections.push(data.description.substring(0, 500) + '...');
    sections.push('');
  }

  // Data Sources
  sections.push('--- DATA SOURCES ---');
  sections.push(`Sources: ${data.sources.join(', ')}`);
  sections.push(`Retrieved: ${new Date(data.timestamp).toLocaleString()}`);

  return sections.join('\n');
}

/**
 * Gathers financial data for multiple stocks
 * Returns both formatted text (for AI) and raw aggregated data (for validation)
 * This avoids duplicate API calls - we fetch once and reuse the data
 */
export async function gatherFinancialDataBatch(
  tickers: string[],
  historicalDate?: { timeFrom?: string; timeTo?: string }
): Promise<{
  formattedData: Record<string, string>;
  rawData: Record<string, AggregatedStockData>;
}> {
  const formattedResults: Record<string, string> = {};
  const rawResults: Record<string, AggregatedStockData> = {};

  // OPTIMIZATION: Batch fetch quotes for all stocks at once to avoid 13s delays
  // This saves ~26 seconds (2 × 13s delays) when fetching 3 stocks
  const { getStockQuotesWithFallback } = await import('@/lib/quote-fetcher');
  let batchQuotes: Record<string, any> = {};
  
  try {
    console.log(`📡 Batch fetching quotes for ${tickers.length} stocks (saves ~26s)...`);
    const batchQuoteResult = await getStockQuotesWithFallback(tickers);
    // Create a map of symbol -> quote for quick lookup
    batchQuotes = batchQuoteResult.quotes.reduce((acc, quote) => {
      acc[quote.symbol] = quote;
      return acc;
    }, {} as Record<string, any>);
    console.log(`✅ Batch quotes fetched: ${Object.keys(batchQuotes).length} stocks`);
  } catch (error) {
    console.warn(`⚠️ Batch quote fetch failed, will fetch individually:`, error);
  }

  // Now fetch other data (fundamentals, news) for each stock
  // Quotes are already fetched, so aggregateStockData will reuse them
  for (const ticker of tickers) {
    // Fetch aggregated data ONCE per stock
    // Pass pre-fetched quote to avoid duplicate API calls
    const rawData = await aggregateStockData(ticker, historicalDate, batchQuotes[ticker]);
    
    if (rawData) {
      // Store raw data for validation
      rawResults[ticker] = rawData;
      // Format as text for AI analysis
      formattedResults[ticker] = formatDataForAI(rawData);
    } else {
      // Fallback if data fetch fails
      formattedResults[ticker] = `Limited data available for ${ticker}. Stock ticker: ${ticker}`;
    }

    // Small delay between Alpha Vantage calls (not quotes - those are already fetched)
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return {
    formattedData: formattedResults,
    rawData: rawResults,
  };
}

/**
 * Get raw aggregated data (for use in other modules)
 */
export async function getRawAggregatedData(
  ticker: string,
  historicalDate?: { timeFrom?: string; timeTo?: string }
): Promise<AggregatedStockData | null> {
  return aggregateStockData(ticker, historicalDate);
}
