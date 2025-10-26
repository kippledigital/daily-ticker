// API utilities for fetching market briefs from Gumloop

export interface MarketBrief {
  id: string;
  date: string;
  tickers: TickerBrief[];
  marketSummary: string;
}

export interface TickerBrief {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  summary: string;
  context: string;
  riskLevel: 'low' | 'medium' | 'high';
  actionableTakeaway: string;
}

/**
 * Fetches the latest market brief from Gumloop
 * TODO: Replace with actual Gumloop webhook endpoint
 */
export async function getLatestBrief(): Promise<MarketBrief | null> {
  try {
    // TODO: Replace with actual Gumloop endpoint
    // const gumloopEndpoint = process.env.GUMLOOP_ENDPOINT;
    // const response = await fetch(gumloopEndpoint, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.GUMLOOP_API_KEY}`,
    //   },
    // });
    //
    // if (!response.ok) {
    //   throw new Error('Failed to fetch brief');
    // }
    //
    // return await response.json();

    // Sample data for development
    return {
      id: '2025-10-25',
      date: new Date().toISOString(),
      marketSummary: 'Markets opened mixed today as investors digest recent earnings reports.',
      tickers: [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          currentPrice: 178.45,
          change: 2.34,
          changePercent: 1.33,
          summary: 'Apple rises on strong iPhone demand in Asia.',
          context: 'China sales exceeded expectations by 12%, driven by iPhone 15 Pro adoption.',
          riskLevel: 'low',
          actionableTakeaway: 'Watch for earnings call commentary on Q4 guidance.',
        },
        {
          symbol: 'NVDA',
          name: 'NVIDIA Corporation',
          currentPrice: 875.28,
          change: -5.67,
          changePercent: -0.64,
          summary: 'Slight pullback after recent rally.',
          context: 'Investors taking profits after 40% gain over past quarter.',
          riskLevel: 'medium',
          actionableTakeaway: 'Dip may present buying opportunity for long-term holders.',
        },
      ],
    };
  } catch (error) {
    console.error('Error fetching brief:', error);
    return null;
  }
}

/**
 * Fetches brief archive by date
 */
export async function getBriefByDate(date: string): Promise<MarketBrief | null> {
  try {
    // TODO: Implement archive fetch from Gumloop or database
    return null;
  } catch (error) {
    console.error('Error fetching brief by date:', error);
    return null;
  }
}
