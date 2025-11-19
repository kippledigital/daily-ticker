// Polygon.io API integration for real-time stock data

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  timestamp?: number;
  isRealData?: boolean; // Track if this is real API data or sample data
}

export interface StockQuotesResult {
  quotes: StockQuote[];
  dataQuality: {
    totalRequested: number;
    successful: number;
    failed: number;
    sampleDataUsed: number;
    successRate: number;
    failedSymbols: string[];
  };
}

export interface PolygonTickerSnapshot {
  ticker: string;
  todaysChangePerc: number;
  todaysChange: number;
  lastQuote?: {
    p: number; // price
  };
  day?: {
    c: number; // close price
    o: number; // open price
    h: number; // high
    l: number; // low
    v: number; // volume
  };
}

export interface PolygonResponse {
  status: string;
  tickers: PolygonTickerSnapshot[];
}

/**
 * Fetches real-time stock quotes from Polygon.io with data quality tracking
 * @param symbols Array of stock symbols to fetch
 * @returns Stock quotes with data quality metrics
 */
export async function getStockQuotes(symbols: string[]): Promise<StockQuotesResult> {
  const apiKey = process.env.POLYGON_API_KEY;

  if (!apiKey) {
    console.error('🚨 CRITICAL: POLYGON_API_KEY not set, using sample data');
    const sampleQuotes = getSampleData(symbols);
    return {
      quotes: sampleQuotes,
      dataQuality: {
        totalRequested: symbols.length,
        successful: 0,
        failed: symbols.length,
        sampleDataUsed: symbols.length,
        successRate: 0,
        failedSymbols: symbols,
      },
    };
  }

  const quotes: StockQuote[] = [];
  const sampleData = getSampleData(symbols);
  const DELAY_MS = 13000; // 13 seconds between calls (safe for 5/minute limit)
  const MAX_RETRIES = 3;
  const failedSymbols: string[] = [];
  let successful = 0;
  let failed = 0;

  try {
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];

      try {
        // Add delay between requests (respect 5 calls/minute limit)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }

        // Retry logic for rate limits
        let retries = 0;
        let response: Response | null = null;
        let lastError: Error | null = null;
        
        while (retries <= MAX_RETRIES) {
          try {
            response = await fetch(
              `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${apiKey}`,
              {
                next: { revalidate: 3600 }, // Cache for 1 hour (data doesn't change often)
              }
            );

            // If rate limited, wait and retry
            if (response.status === 429) {
              retries++;
              if (retries <= MAX_RETRIES) {
                const waitTime = Math.min(60000 * retries, 60000); // Exponential backoff, max 60s
                console.warn(`⚠️ Polygon rate limit hit for ${symbol}, retrying in ${waitTime/1000}s... (attempt ${retries}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
              } else {
                lastError = new Error(`Rate limit exceeded after ${MAX_RETRIES} retries`);
                break;
              }
            }

            // Success or non-429 error
            if (response.ok) {
              break;
            } else {
              lastError = new Error(`Polygon API error for ${symbol}: ${response.status}`);
              break;
            }
          } catch (fetchError) {
            lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
            if (retries < MAX_RETRIES) {
              retries++;
              const waitTime = Math.min(60000 * retries, 60000);
              console.warn(`⚠️ Fetch error for ${symbol}, retrying in ${waitTime/1000}s... (attempt ${retries}/${MAX_RETRIES})`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
            break;
          }
        }

        if (!response || !response.ok || lastError) {
          throw lastError || new Error(`Polygon API error for ${symbol}: ${response?.status || 'unknown'}`);
        }

        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const result = data.results[0];
          const closePrice = result.c;
          const openPrice = result.o;
          const change = closePrice - openPrice;
          const changePercent = (change / openPrice) * 100;

          quotes.push({
            symbol,
            price: closePrice,
            change: change,
            changePercent: changePercent,
            volume: result.v,
            timestamp: result.t,
            isRealData: true, // Mark as real data
          });
          successful++;
        } else {
          throw new Error(`No data available for ${symbol} (status: ${data.status})`);
        }
      } catch (error) {
        failed++;
        failedSymbols.push(symbol);
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to fetch ${symbol} from Polygon: ${errorMessage}`);
        console.warn(`⚠️ Using sample data for ${symbol} - THIS MAY BE INACCURATE`);
        
        // Use sample data but mark it as not real
        const sampleQuote = sampleData[i] || {
          symbol,
          price: 100,
          change: 0,
          changePercent: 0,
        };
        quotes.push({
          ...sampleQuote,
          isRealData: false, // Mark as sample data
        });
      }
    }

    const successRate = symbols.length > 0 ? (successful / symbols.length) * 100 : 0;

    // Log data quality summary
    if (failed > 0) {
      console.error(`\n🚨 POLYGON DATA QUALITY WARNING:`);
      console.error(`   Total requested: ${symbols.length}`);
      console.error(`   Successful: ${successful} (${successRate.toFixed(1)}%)`);
      console.error(`   Failed: ${failed} (${((failed / symbols.length) * 100).toFixed(1)}%)`);
      console.error(`   Failed symbols: ${failedSymbols.join(', ')}`);
      console.error(`   ⚠️ Some stocks are using SAMPLE DATA which may be INACCURATE\n`);
    } else {
      console.log(`✅ Polygon data quality: ${successful}/${symbols.length} stocks fetched successfully (100%)`);
    }

    return {
      quotes,
      dataQuality: {
        totalRequested: symbols.length,
        successful,
        failed,
        sampleDataUsed: failed,
        successRate,
        failedSymbols,
      },
    };
  } catch (error) {
    console.error('❌ CRITICAL: Error fetching stock data from Polygon:', error);
    // Fallback to sample data on error
    const sampleQuotes = getSampleData(symbols);
    return {
      quotes: sampleQuotes.map(q => ({ ...q, isRealData: false })),
      dataQuality: {
        totalRequested: symbols.length,
        successful: 0,
        failed: symbols.length,
        sampleDataUsed: symbols.length,
        successRate: 0,
        failedSymbols: symbols,
      },
    };
  }
}

/**
 * Fetches previous day's closing data for a symbol
 * Useful for calculating daily changes
 */
export async function getPreviousClose(symbol: string): Promise<number | null> {
  const apiKey = process.env.POLYGON_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${apiKey}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].c; // closing price
    }

    return null;
  } catch (error) {
    console.error('Error fetching previous close:', error);
    return null;
  }
}

/**
 * Sample data fallback when API is unavailable
 */
function getSampleData(symbols: string[]): StockQuote[] {
  const sampleData: Record<string, StockQuote> = {
    AAPL: { symbol: 'AAPL', price: 178.45, change: 2.34, changePercent: 1.33 },
    MSFT: { symbol: 'MSFT', price: 412.89, change: -1.23, changePercent: -0.30 },
    GOOGL: { symbol: 'GOOGL', price: 142.56, change: 3.45, changePercent: 2.48 },
    AMZN: { symbol: 'AMZN', price: 178.92, change: 4.12, changePercent: 2.35 },
    NVDA: { symbol: 'NVDA', price: 875.28, change: -5.67, changePercent: -0.64 },
    TSLA: { symbol: 'TSLA', price: 242.84, change: 8.45, changePercent: 3.61 },
    META: { symbol: 'META', price: 489.23, change: 6.78, changePercent: 1.41 },
    AMD: { symbol: 'AMD', price: 165.43, change: -2.34, changePercent: -1.39 },
  };

  return symbols.map(symbol =>
    sampleData[symbol] || {
      symbol,
      price: 100,
      change: 0,
      changePercent: 0
    }
  );
}

/**
 * Get top gainers and losers
 */
export async function getTopMovers(): Promise<{ gainers: StockQuote[], losers: StockQuote[] }> {
  const apiKey = process.env.POLYGON_API_KEY;

  if (!apiKey) {
    const watchlist = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'AMD'];
    const quotesResult = await getStockQuotes(watchlist);
    const sorted = quotesResult.quotes.sort((a, b) => b.changePercent - a.changePercent);

    return {
      gainers: sorted.slice(0, 4),
      losers: sorted.slice(-4).reverse(),
    };
  }

  try {
    // Fetch gainers
    const gainersResponse = await fetch(
      `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/gainers?apiKey=${apiKey}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    // Fetch losers
    const losersResponse = await fetch(
      `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/losers?apiKey=${apiKey}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    const gainersData: PolygonResponse = await gainersResponse.json();
    const losersData: PolygonResponse = await losersResponse.json();

    const gainers = gainersData.tickers?.slice(0, 4).map(ticker => ({
      symbol: ticker.ticker,
      price: ticker.day?.c || 0,
      change: ticker.todaysChange || 0,
      changePercent: ticker.todaysChangePerc || 0,
    })) || [];

    const losers = losersData.tickers?.slice(0, 4).map(ticker => ({
      symbol: ticker.ticker,
      price: ticker.day?.c || 0,
      change: ticker.todaysChange || 0,
      changePercent: ticker.todaysChangePerc || 0,
    })) || [];

    return { gainers, losers };
  } catch (error) {
    console.error('Error fetching top movers:', error);
    // Fallback to sample data
    const watchlist = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'AMD'];
    const quotesResult = await getStockQuotes(watchlist);
    const sorted = quotesResult.quotes.sort((a, b) => b.changePercent - a.changePercent);

    return {
      gainers: sorted.slice(0, 4),
      losers: sorted.slice(-4).reverse(),
    };
  }
}
