/**
 * Alpha Vantage API Integration
 *
 * Provides:
 * - Real-time stock quotes
 * - Company fundamentals (P/E, market cap, revenue, etc.)
 * - News & sentiment analysis
 *
 * Free tier: 25 API calls/day (sufficient for 3 stocks/day)
 * Docs: https://www.alphavantage.co/documentation/
 */

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export interface AlphaVantageQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: string;
}

export interface AlphaVantageFundamentals {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  marketCap: number;
  peRatio: number;
  pegRatio?: number;
  eps: number;
  revenue: number;
  profitMargin: number;
  operatingMargin: number;
  returnOnEquity: number;
  dividendYield?: number;
  beta?: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  sharesOutstanding: number;
  bookValue?: number;
}

export interface AlphaVantageNewsItem {
  title: string;
  url: string;
  summary: string;
  source: string;
  publishedAt: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number; // -1 to 1
  relevanceScore: number; // 0 to 1
  tickers: string[];
}

/**
 * Fetch real-time quote for a stock
 */
export async function getQuote(symbol: string): Promise<AlphaVantageQuote | null> {
  try {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message'] || data['Note']) {
      console.error(`Alpha Vantage API error for ${symbol}:`, data);
      return null;
    }

    const quote = data['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      console.error(`No quote data for ${symbol}`);
      return null;
    }

    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      open: parseFloat(quote['02. open']),
      previousClose: parseFloat(quote['08. previous close']),
      timestamp: quote['07. latest trading day'],
    };
  } catch (error) {
    console.error(`Error fetching Alpha Vantage quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch company fundamentals (overview data)
 */
export async function getFundamentals(symbol: string): Promise<AlphaVantageFundamentals | null> {
  try {
    const url = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message'] || data['Note']) {
      console.error(`Alpha Vantage API error for ${symbol}:`, data);
      return null;
    }

    if (!data.Symbol) {
      console.error(`No fundamental data for ${symbol}`);
      return null;
    }

    return {
      symbol: data.Symbol,
      name: data.Name,
      description: data.Description,
      sector: data.Sector,
      industry: data.Industry,
      marketCap: parseInt(data.MarketCapitalization) || 0,
      peRatio: parseFloat(data.PERatio) || 0,
      pegRatio: parseFloat(data.PEGRatio) || undefined,
      eps: parseFloat(data.EPS) || 0,
      revenue: parseInt(data.RevenueTTM) || 0,
      profitMargin: parseFloat(data.ProfitMargin) || 0,
      operatingMargin: parseFloat(data.OperatingMarginTTM) || 0,
      returnOnEquity: parseFloat(data.ReturnOnEquityTTM) || 0,
      dividendYield: parseFloat(data.DividendYield) || undefined,
      beta: parseFloat(data.Beta) || undefined,
      fiftyTwoWeekHigh: parseFloat(data['52WeekHigh']) || 0,
      fiftyTwoWeekLow: parseFloat(data['52WeekLow']) || 0,
      sharesOutstanding: parseInt(data.SharesOutstanding) || 0,
      bookValue: parseFloat(data.BookValue) || undefined,
    };
  } catch (error) {
    console.error(`Error fetching Alpha Vantage fundamentals for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch news and sentiment for a stock
 */
export async function getNewsAndSentiment(
  symbol: string,
  limit: number = 10
): Promise<AlphaVantageNewsItem[]> {
  try {
    const url = `${BASE_URL}?function=NEWS_SENTIMENT&tickers=${symbol}&limit=${limit}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message'] || data['Note']) {
      console.error(`Alpha Vantage API error for ${symbol}:`, data);
      return [];
    }

    if (!data.feed || data.feed.length === 0) {
      return [];
    }

    return data.feed.map((item: any) => {
      // Find sentiment for this specific ticker
      const tickerSentiment = item.ticker_sentiment?.find((ts: any) => ts.ticker === symbol);
      const sentimentScore = tickerSentiment ? parseFloat(tickerSentiment.ticker_sentiment_score) : 0;
      const relevanceScore = tickerSentiment ? parseFloat(tickerSentiment.relevance_score) : 0;

      // Classify sentiment
      let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      if (sentimentScore >= 0.15) sentiment = 'bullish';
      else if (sentimentScore <= -0.15) sentiment = 'bearish';

      return {
        title: item.title,
        url: item.url,
        summary: item.summary,
        source: item.source,
        publishedAt: item.time_published,
        sentiment,
        sentimentScore,
        relevanceScore,
        tickers: item.ticker_sentiment?.map((ts: any) => ts.ticker) || [],
      };
    });
  } catch (error) {
    console.error(`Error fetching Alpha Vantage news for ${symbol}:`, error);
    return [];
  }
}

/**
 * Fetch complete stock data (quote + fundamentals)
 * Uses 2 API calls
 */
export async function getCompleteStockData(symbol: string) {
  const [quote, fundamentals] = await Promise.all([
    getQuote(symbol),
    getFundamentals(symbol),
  ]);

  return {
    quote,
    fundamentals,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Batch fetch quotes for multiple stocks
 * Note: Alpha Vantage doesn't have a batch endpoint, so we do sequential calls
 * with rate limiting (25 calls/day limit)
 */
export async function getBatchQuotes(symbols: string[]): Promise<Record<string, AlphaVantageQuote | null>> {
  const results: Record<string, AlphaVantageQuote | null> = {};

  for (const symbol of symbols) {
    results[symbol] = await getQuote(symbol);
    // Small delay to respect rate limits (not strictly necessary for 3 stocks/day)
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return results;
}
