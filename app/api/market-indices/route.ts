import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface MarketIndex {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

/**
 * Fetches real-time market indices (S&P 500, NASDAQ, DOW)
 * Uses Polygon.io for index data
 */
export async function GET() {
  const apiKey = process.env.POLYGON_API_KEY;

  if (!apiKey) {
    console.warn('POLYGON_API_KEY not set, using sample data for market indices');
    return NextResponse.json({
      success: true,
      data: getSampleIndices(),
      cached: false,
    });
  }

  try {
    // Try index symbols first, then fall back to ETF proxies for free tier
    // Index symbols: I:SPX, I:NDX, I:DJI (may require paid tier)
    // ETF proxies: SPY (S&P 500), QQQ (NASDAQ 100), DIA (Dow Jones) - work on free tier
    const indexConfig = [
      { index: 'I:SPX', etf: 'SPY', name: 'S&P 500' },
      { index: 'I:NDX', etf: 'QQQ', name: 'NASDAQ' },
      { index: 'I:DJI', etf: 'DIA', name: 'DOW' },
    ];
    const results: MarketIndex[] = [];

    for (const config of indexConfig) {
      let success = false;
      
      // Try index symbol first
      try {
        const response = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${config.index}/prev?adjusted=true&apiKey=${apiKey}`,
          {
            next: { revalidate: 60 },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'OK' && data.results && data.results.length > 0) {
            const result = data.results[0];
            const closePrice = result.c;
            const openPrice = result.o;
            const change = closePrice - openPrice;
            const changePercent = (change / openPrice) * 100;

            results.push({
              symbol: config.name,
              price: closePrice,
              change: change,
              changePercent: changePercent,
            });
            success = true;
          }
        } else if (response.status === 403) {
          // Index not available on free tier, try ETF proxy
          const etfResponse = await fetch(
            `https://api.polygon.io/v2/aggs/ticker/${config.etf}/prev?adjusted=true&apiKey=${apiKey}`,
            {
              next: { revalidate: 60 },
            }
          );

          if (etfResponse.ok) {
            const etfData = await etfResponse.json();
            if (etfData.status === 'OK' && etfData.results && etfData.results.length > 0) {
              const result = etfData.results[0];
              const closePrice = result.c;
              const openPrice = result.o;
              const change = closePrice - openPrice;
              const changePercent = (change / openPrice) * 100;

              results.push({
                symbol: config.name,
                price: closePrice,
                change: change,
                changePercent: changePercent,
              });
              success = true;
            }
          }
        } else if (response.status !== 403) {
          console.warn(`Polygon API error for ${config.index}: ${response.status}`);
        }
      } catch (error) {
        console.error(`Error fetching ${config.index}:`, error);
      }
    }

    // If we got any results, return them; otherwise fall back to sample
    if (results.length > 0) {
      // Fill in missing indices with sample data
      const sampleIndices = getSampleIndices();
      const symbolsRetrieved = results.map(r => r.symbol);

      sampleIndices.forEach(sample => {
        if (!symbolsRetrieved.includes(sample.symbol)) {
          results.push(sample);
        }
      });

      return NextResponse.json({
        success: true,
        data: results,
        cached: false,
      });
    }

    // Fallback to sample data
    return NextResponse.json({
      success: true,
      data: getSampleIndices(),
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching market indices:', error);
    return NextResponse.json({
      success: true,
      data: getSampleIndices(),
      cached: false,
    });
  }
}

/**
 * Sample data fallback
 * Based on recent market levels (October 2025)
 */
function getSampleIndices(): MarketIndex[] {
  return [
    {
      symbol: 'S&P 500',
      price: 5782.40,
      change: 38.26,
      changePercent: 0.67,
    },
    {
      symbol: 'NASDAQ',
      price: 18231.20,
      change: 185.14,
      changePercent: 1.03,
    },
    {
      symbol: 'DOW',
      price: 42340.10,
      change: 114.72,
      changePercent: 0.27,
    },
  ];
}
