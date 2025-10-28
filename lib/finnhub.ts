/**
 * Finnhub API Integration
 *
 * Provides:
 * - Company news
 * - Social sentiment (Reddit, Twitter)
 * - Insider trading
 * - Analyst recommendations
 *
 * Free tier: 60 API calls/minute (more than sufficient)
 * Docs: https://finnhub.io/docs/api
 */

const API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

export interface FinnhubNewsItem {
  category: string;
  datetime: number; // Unix timestamp
  headline: string;
  id: number;
  image: string;
  related: string; // Ticker symbol
  source: string;
  summary: string;
  url: string;
}

export interface FinnhubSocialSentiment {
  symbol: string;
  reddit: {
    mention: number;
    positiveMention: number;
    negativeMention: number;
    positiveScore: number;
    negativeScore: number;
    score: number; // Overall sentiment score
  };
  twitter: {
    mention: number;
    positiveMention: number;
    negativeMention: number;
    positiveScore: number;
    negativeScore: number;
    score: number;
  };
  overall: {
    totalMentions: number;
    sentimentScore: number; // -1 to 1
    trend: 'rising' | 'falling' | 'stable';
  };
}

export interface FinnhubInsiderTransaction {
  symbol: string;
  name: string; // Insider name
  share: number; // Number of shares
  change: number; // Change in shares
  filingDate: string;
  transactionDate: string;
  transactionCode: string; // P = Purchase, S = Sale
  transactionPrice: number;
}

export interface FinnhubRecommendation {
  symbol: string;
  buy: number;
  hold: number;
  sell: number;
  strongBuy: number;
  strongSell: number;
  period: string; // e.g., "2025-10-01"
}

/**
 * Fetch company news for a stock
 */
export async function getCompanyNews(
  symbol: string,
  daysBack: number = 7
): Promise<FinnhubNewsItem[]> {
  try {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);

    const from = fromDate.toISOString().split('T')[0];
    const to = toDate.toISOString().split('T')[0];

    const url = `${BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error(`Finnhub API error for ${symbol}:`, data.error);
      return [];
    }

    return data;
  } catch (error) {
    console.error(`Error fetching Finnhub news for ${symbol}:`, error);
    return [];
  }
}

/**
 * Fetch social sentiment for a stock (Reddit + Twitter)
 */
export async function getSocialSentiment(symbol: string): Promise<FinnhubSocialSentiment | null> {
  try {
    const url = `${BASE_URL}/stock/social-sentiment?symbol=${symbol}&token=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error(`Finnhub API error for ${symbol}:`, data.error);
      return null;
    }

    if (!data.reddit && !data.twitter) {
      return null;
    }

    // Aggregate Reddit data
    const reddit = data.reddit?.reduce(
      (acc: any, item: any) => ({
        mention: acc.mention + item.mention,
        positiveMention: acc.positiveMention + item.positiveMention,
        negativeMention: acc.negativeMention + item.negativeMention,
        positiveScore: acc.positiveScore + item.positiveScore,
        negativeScore: acc.negativeScore + item.negativeScore,
        score: acc.score + item.score,
      }),
      { mention: 0, positiveMention: 0, negativeMention: 0, positiveScore: 0, negativeScore: 0, score: 0 }
    ) || { mention: 0, positiveMention: 0, negativeMention: 0, positiveScore: 0, negativeScore: 0, score: 0 };

    // Aggregate Twitter data
    const twitter = data.twitter?.reduce(
      (acc: any, item: any) => ({
        mention: acc.mention + item.mention,
        positiveMention: acc.positiveMention + item.positiveMention,
        negativeMention: acc.negativeMention + item.negativeMention,
        positiveScore: acc.positiveScore + item.positiveScore,
        negativeScore: acc.negativeScore + item.negativeScore,
        score: acc.score + item.score,
      }),
      { mention: 0, positiveMention: 0, negativeMention: 0, positiveScore: 0, negativeScore: 0, score: 0 }
    ) || { mention: 0, positiveMention: 0, negativeMention: 0, positiveScore: 0, negativeScore: 0, score: 0 };

    const totalMentions = reddit.mention + twitter.mention;
    const avgSentiment = totalMentions > 0
      ? (reddit.score * reddit.mention + twitter.score * twitter.mention) / totalMentions
      : 0;

    // Determine trend (simplified)
    const trend = avgSentiment > 0.1 ? 'rising' : avgSentiment < -0.1 ? 'falling' : 'stable';

    return {
      symbol,
      reddit,
      twitter,
      overall: {
        totalMentions,
        sentimentScore: avgSentiment,
        trend,
      },
    };
  } catch (error) {
    console.error(`Error fetching Finnhub social sentiment for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch insider transactions for a stock
 */
export async function getInsiderTransactions(
  symbol: string
): Promise<FinnhubInsiderTransaction[]> {
  try {
    const url = `${BASE_URL}/stock/insider-transactions?symbol=${symbol}&token=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error(`Finnhub API error for ${symbol}:`, data.error);
      return [];
    }

    return (data.data || []).map((item: any) => ({
      symbol: item.symbol,
      name: item.name,
      share: item.share,
      change: item.change,
      filingDate: item.filingDate,
      transactionDate: item.transactionDate,
      transactionCode: item.transactionCode,
      transactionPrice: item.transactionPrice,
    }));
  } catch (error) {
    console.error(`Error fetching Finnhub insider transactions for ${symbol}:`, error);
    return [];
  }
}

/**
 * Fetch analyst recommendations for a stock
 */
export async function getRecommendations(symbol: string): Promise<FinnhubRecommendation | null> {
  try {
    const url = `${BASE_URL}/stock/recommendation?symbol=${symbol}&token=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error(`Finnhub API error for ${symbol}:`, data.error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Get most recent recommendation
    const latest = data[0];

    return {
      symbol: latest.symbol,
      buy: latest.buy,
      hold: latest.hold,
      sell: latest.sell,
      strongBuy: latest.strongBuy,
      strongSell: latest.strongSell,
      period: latest.period,
    };
  } catch (error) {
    console.error(`Error fetching Finnhub recommendations for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch complete social + news data for a stock
 * Uses 2 API calls
 */
export async function getCompleteStockData(symbol: string) {
  const [news, sentiment, insider, recommendations] = await Promise.all([
    getCompanyNews(symbol, 7),
    getSocialSentiment(symbol),
    getInsiderTransactions(symbol),
    getRecommendations(symbol),
  ]);

  return {
    news,
    sentiment,
    insider,
    recommendations,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get aggregated sentiment summary (for quick overview)
 */
export function getSentimentSummary(sentiment: FinnhubSocialSentiment | null): string {
  if (!sentiment) return 'No social sentiment data available';

  const { overall } = sentiment;

  if (overall.totalMentions === 0) {
    return 'Low social media activity';
  }

  const score = overall.sentimentScore;
  const mentions = overall.totalMentions;

  if (score > 0.3) {
    return `Highly bullish (${mentions} mentions, +${(score * 100).toFixed(0)}% sentiment)`;
  } else if (score > 0.1) {
    return `Moderately bullish (${mentions} mentions, +${(score * 100).toFixed(0)}% sentiment)`;
  } else if (score < -0.3) {
    return `Highly bearish (${mentions} mentions, ${(score * 100).toFixed(0)}% sentiment)`;
  } else if (score < -0.1) {
    return `Moderately bearish (${mentions} mentions, ${(score * 100).toFixed(0)}% sentiment)`;
  } else {
    return `Neutral sentiment (${mentions} mentions)`;
  }
}
