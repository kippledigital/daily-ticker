/**
 * Multi-source stock quote fetcher
 * 
 * Tries multiple real API sources in order:
 * 1. Polygon.io (primary - 5 calls/min free tier)
 * 2. Alpha Vantage (backup - 25 calls/day free tier)
 * 
 * NOTE: IEX Cloud shut down on August 31, 2024, so it's no longer available
 * 
 * NEVER uses sample/fake data - fails if all sources unavailable
 */

import { getStockQuotes as getPolygonQuotes, StockQuote, StockQuotesResult } from './polygon';
import { getQuote as getAlphaVantageQuote, AlphaVantageQuote } from './alpha-vantage';

export interface QuoteFetchResult {
  quotes: StockQuote[];
  dataQuality: {
    totalRequested: number;
    successful: number;
    failed: number;
    sourcesUsed: string[];
    failedSymbols: string[];
    successRate: number;
  };
}

/**
 * Fetch quotes with fallback to multiple real API sources
 * NEVER returns sample data - throws error if all sources fail
 */
export async function getStockQuotesWithFallback(symbols: string[]): Promise<QuoteFetchResult> {
  const sourcesUsed: string[] = [];
  const failedSymbols: string[] = [];
  const quotes: StockQuote[] = [];
  let successful = 0;

  // Try Polygon first (primary source)
  try {
    console.log(`📡 Attempting Polygon.io for ${symbols.length} stocks...`);
    const polygonResult = await getPolygonQuotes(symbols);
    
    // Check if we got any real data
    const realQuotes = polygonResult.quotes.filter(q => q.isRealData === true);
    
    if (realQuotes.length > 0) {
      sourcesUsed.push('Polygon');
      successful += realQuotes.length;
      
      // Add successful quotes
      realQuotes.forEach(q => {
        quotes.push(q);
      });
      
      // Track failed symbols for fallback (only those that didn't get real data)
      const failed = polygonResult.quotes.filter(q => q.isRealData !== true);
      failed.forEach(q => {
        if (!failedSymbols.includes(q.symbol)) {
          failedSymbols.push(q.symbol);
        }
      });
      
      console.log(`✅ Polygon: ${realQuotes.length}/${symbols.length} stocks fetched successfully`);
      
      // If all succeeded, return early
      if (realQuotes.length === symbols.length) {
        return {
          quotes,
          dataQuality: {
            totalRequested: symbols.length,
            successful,
            failed: 0,
            sourcesUsed,
            failedSymbols: [],
            successRate: 100,
          },
        };
      }
    } else {
      console.warn(`⚠️ Polygon returned no real data, trying backups...`);
      // Add all symbols to failed list if none succeeded
      symbols.forEach(s => {
        if (!failedSymbols.includes(s)) {
          failedSymbols.push(s);
        }
      });
    }
  } catch (error) {
    console.error(`❌ Polygon failed:`, error);
    // Add all symbols to failed list
    symbols.forEach(s => {
      if (!failedSymbols.includes(s)) {
        failedSymbols.push(s);
      }
    });
  }

  // Try Alpha Vantage for failed symbols (backup #1)
  const remainingSymbols = symbols.filter(s => !quotes.find(q => q.symbol === s));
  
  if (remainingSymbols.length > 0) {
    console.log(`📡 Attempting Alpha Vantage for ${remainingSymbols.length} stocks...`);
    
    // Alpha Vantage free tier: 25 calls/day, so only use for critical stocks (final 3)
    // For stock discovery phase, skip Alpha Vantage to save quota
    const useAlphaVantage = remainingSymbols.length <= 3;
    
    if (useAlphaVantage) {
      try {
        for (const symbol of remainingSymbols) {
          const alphaQuote = await getAlphaVantageQuote(symbol);
          
          if (alphaQuote) {
            // Convert Alpha Vantage format to StockQuote format
            quotes.push({
              symbol: alphaQuote.symbol,
              price: alphaQuote.price,
              change: alphaQuote.change,
              changePercent: alphaQuote.changePercent,
              volume: alphaQuote.volume,
              timestamp: new Date(alphaQuote.timestamp).getTime(),
              isRealData: true,
            });
            
            successful++;
            const index = failedSymbols.indexOf(symbol);
            if (index > -1) {
              failedSymbols.splice(index, 1);
            }
            
            // Small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        // Check if we fetched any new stocks from Alpha Vantage
        const alphaVantageFetched = remainingSymbols.filter(s => quotes.find(q => q.symbol === s && q.isRealData === true));
        if (alphaVantageFetched.length > 0) {
          if (!sourcesUsed.includes('Alpha Vantage')) {
            sourcesUsed.push('Alpha Vantage');
          }
          console.log(`✅ Alpha Vantage: Fetched ${alphaVantageFetched.length} stocks`);
        }
      } catch (error) {
        console.error(`❌ Alpha Vantage failed:`, error);
      }
    } else {
      console.log(`⚠️ Skipping Alpha Vantage (${remainingSymbols.length} stocks > 3, saving quota for final stocks)`);
    }
  }

  // NOTE: IEX Cloud shut down on August 31, 2024
  // Removed IEX Cloud backup - using only Polygon + Alpha Vantage now

  // Final check: if we still have failed symbols, throw error (NO SAMPLE DATA)
  const finalFailed = symbols.filter(s => !quotes.find(q => q.symbol === s));
  
  if (finalFailed.length > 0) {
    const errorMessage = `❌ CRITICAL: Failed to fetch real data for ${finalFailed.length} stocks: ${finalFailed.join(', ')}. All API sources exhausted. Cannot use sample data for paid service.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const successRate = symbols.length > 0 ? (successful / symbols.length) * 100 : 0;

  console.log(`\n✅ Quote fetch complete:`);
  console.log(`   Sources used: ${sourcesUsed.join(', ') || 'None'}`);
  console.log(`   Successful: ${successful}/${symbols.length} (${successRate.toFixed(1)}%)`);
  console.log(`   Failed: ${finalFailed.length}\n`);

  return {
    quotes,
    dataQuality: {
      totalRequested: symbols.length,
      successful,
      failed: finalFailed.length,
      sourcesUsed,
      failedSymbols: finalFailed,
      successRate,
    },
  };
}

