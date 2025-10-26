// Polygon.io API integration for real-time stock data

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  timestamp?: number;
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
 * Fetches real-time stock quotes from Polygon.io
 * @param symbols Array of stock symbols to fetch
 * @returns Array of stock quotes
 */
export async function getStockQuotes(symbols: string[]): Promise<StockQuote[]> {
  const apiKey = process.env.POLYGON_API_KEY;

  if (!apiKey) {
    console.warn('POLYGON_API_KEY not set, using sample data');
    return getSampleData(symbols);
  }

  try {
    // Fetch previous day close for each symbol with delay to respect rate limits
    // Free tier: 5 calls/minute, so we space them out with 250ms delay
    const quotes: StockQuote[] = [];
    const sampleData = getSampleData(symbols);

    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];

      try {
        // Add delay between requests (250ms = ~4 calls/second, well under 5/minute limit)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 250));
        }

        const response = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${apiKey}`,
          {
            next: { revalidate: 3600 }, // Cache for 1 hour (data doesn't change often)
          }
        );

        if (!response.ok) {
          throw new Error(`Polygon API error for ${symbol}: ${response.status}`);
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
          });
        } else {
          throw new Error(`No data available for ${symbol}`);
        }
      } catch (error) {
        console.warn(`Failed to fetch ${symbol}, using sample data:`, error);
        quotes.push(sampleData[i]);
      }
    }

    return quotes;
  } catch (error) {
    console.error('Error fetching stock data from Polygon:', error);
    // Fallback to sample data on error
    return getSampleData(symbols);
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
    const quotes = await getStockQuotes(watchlist);
    const sorted = quotes.sort((a, b) => b.changePercent - a.changePercent);

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
    const quotes = await getStockQuotes(watchlist);
    const sorted = quotes.sort((a, b) => b.changePercent - a.changePercent);

    return {
      gainers: sorted.slice(0, 4),
      losers: sorted.slice(-4).reverse(),
    };
  }
}
