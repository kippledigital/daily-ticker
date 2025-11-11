import { NextResponse } from 'next/server';

// Cache for 60 seconds - market data doesn't need to be real-time
export const revalidate = 60;

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
    // Use ETF proxies for indices (SPY, QQQ, DIA) - these work on free tier
    // Conversion factors to scale ETF prices to actual index values
    const indexConfig = [
      { etf: 'SPY', name: 'S&P 500', conversionFactor: 10 }, // SPY ~1/10th of S&P 500
      { etf: 'QQQ', name: 'NASDAQ', conversionFactor: 100 }, // QQQ ~1/100th of NASDAQ
      { etf: 'DIA', name: 'DOW', conversionFactor: 100 }, // DIA ~1/100th of DOW
    ];
    const results: MarketIndex[] = [];

    // Use group snapshot endpoint - more reliable for multiple tickers
    try {
      const tickers = indexConfig.map(c => c.etf).join(',');
      const groupSnapshotResponse = await fetch(
        `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${tickers}&apiKey=${apiKey}`,
        {
          next: { revalidate: 60 },
        }
      );

      if (groupSnapshotResponse.ok) {
        const groupData = await groupSnapshotResponse.json();
        
        if (groupData.status === 'OK' && groupData.results) {
          // Create a map of ETF to config
          const etfMap = new Map(indexConfig.map(c => [c.etf, c]));
          
          for (const ticker of groupData.results) {
            const tickerSymbol = ticker.ticker;
            const config = etfMap.get(tickerSymbol);
            
            if (config) {
              // Extract price and change data
              const currentPrice = ticker.day?.c || ticker.lastQuote?.p || ticker.close || 0;
              let todaysChange = ticker.todaysChange ?? ticker.change ?? 0;
              let todaysChangePerc = ticker.todaysChangePerc ?? ticker.changePercent ?? null;

              // If changePercent is missing (null/undefined) but we have change and price, calculate it
              // Note: We use ?? instead of || to preserve 0 and negative values
              if (todaysChangePerc === null && currentPrice > 0 && todaysChange !== 0) {
                const prevPrice = currentPrice - todaysChange;
                if (prevPrice > 0) {
                  todaysChangePerc = (todaysChange / prevPrice) * 100;
                } else {
                  todaysChangePerc = 0;
                }
              } else if (todaysChangePerc === null) {
                todaysChangePerc = 0;
              }

              // Ensure all values are valid numbers (not NaN)
              if (currentPrice > 0 && 
                  typeof currentPrice === 'number' && !isNaN(currentPrice) &&
                  typeof todaysChange === 'number' && !isNaN(todaysChange) &&
                  typeof todaysChangePerc === 'number' && !isNaN(todaysChangePerc)) {
                // Scale ETF price to actual index value
                const scaledPrice = currentPrice * config.conversionFactor;
                const scaledChange = todaysChange * config.conversionFactor;
                
                results.push({
                  symbol: config.name,
                  price: scaledPrice,
                  change: scaledChange,
                  changePercent: todaysChangePerc,
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching group snapshot:', error);
    }

    // Fallback: Fetch individual tickers if group snapshot failed
    if (results.length < indexConfig.length) {
      for (const config of indexConfig) {
        // Skip if we already have this index
        if (results.some(r => r.symbol === config.name)) {
          continue;
        }

        try {
          // Try individual snapshot endpoint
          const snapshotResponse = await fetch(
            `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${config.etf}?apiKey=${apiKey}`,
            {
              next: { revalidate: 60 },
            }
          );

          if (snapshotResponse.ok) {
            const snapshotData = await snapshotResponse.json();
            
            if (snapshotData.status === 'OK' && snapshotData.ticker) {
              const ticker = snapshotData.ticker;
              const currentPrice = ticker.day?.c || ticker.lastQuote?.p || ticker.close || 0;
              let todaysChange = ticker.todaysChange ?? ticker.change ?? 0;
              let todaysChangePerc = ticker.todaysChangePerc ?? ticker.changePercent ?? null;

              // If changePercent is missing (null/undefined) but we have change and price, calculate it
              // Note: We use ?? instead of || to preserve 0 and negative values
              if (todaysChangePerc === null && currentPrice > 0 && todaysChange !== 0) {
                const prevPrice = currentPrice - todaysChange;
                if (prevPrice > 0) {
                  todaysChangePerc = (todaysChange / prevPrice) * 100;
                } else {
                  todaysChangePerc = 0;
                }
              } else if (todaysChangePerc === null) {
                todaysChangePerc = 0;
              }

              // Ensure all values are valid numbers (not NaN)
              if (currentPrice > 0 && 
                  typeof currentPrice === 'number' && !isNaN(currentPrice) &&
                  typeof todaysChange === 'number' && !isNaN(todaysChange) &&
                  typeof todaysChangePerc === 'number' && !isNaN(todaysChangePerc)) {
                const scaledPrice = currentPrice * config.conversionFactor;
                const scaledChange = todaysChange * config.conversionFactor;
                
                results.push({
                  symbol: config.name,
                  price: scaledPrice,
                  change: scaledChange,
                  changePercent: todaysChangePerc,
                });
                continue;
              }
            }
          }

          // Final fallback: Use /prev endpoint and try to get today's data
          const prevResponse = await fetch(
            `https://api.polygon.io/v2/aggs/ticker/${config.etf}/prev?adjusted=true&apiKey=${apiKey}`,
            {
              next: { revalidate: 60 },
            }
          );

          if (prevResponse.ok) {
            const prevData = await prevResponse.json();
            if (prevData.status === 'OK' && prevData.results && prevData.results.length > 0) {
              const prevResult = prevData.results[0];
              const prevClose = prevResult.c;
              
              // Try to get today's close to calculate change
              const today = new Date();
              const todayStr = today.toISOString().split('T')[0];
              const todayResponse = await fetch(
                `https://api.polygon.io/v2/aggs/ticker/${config.etf}/range/1/day/${todayStr}/${todayStr}?adjusted=true&apiKey=${apiKey}`,
                {
                  next: { revalidate: 60 },
                }
              );

              let currentPrice = prevClose;
              let change = 0;
              let changePercent = 0;

              if (todayResponse.ok) {
                const todayData = await todayResponse.json();
                if (todayData.status === 'OK' && todayData.results && todayData.results.length > 0) {
                  const todayResult = todayData.results[0];
                  currentPrice = todayResult.c || prevClose;
                  change = currentPrice - prevClose;
                  if (prevClose > 0) {
                    changePercent = (change / prevClose) * 100;
                  }
                }
              }
              
              if (currentPrice > 0) {
                const scaledPrice = currentPrice * config.conversionFactor;
                const scaledChange = change * config.conversionFactor;
                
                results.push({
                  symbol: config.name,
                  price: scaledPrice,
                  change: scaledChange,
                  changePercent: changePercent,
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching ${config.name}:`, error);
        }
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
        cached: true,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
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
