import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

/**
 * Verify all entry prices against actual market prices
 * This helps identify any other incorrect data
 */
async function verifyAllEntryPrices() {
  console.log('🔍 Verifying all entry prices against actual market data...\n');
  console.log('═'.repeat(60));

  if (!POLYGON_API_KEY) {
    console.log('⚠️  POLYGON_API_KEY not set - cannot verify prices');
    console.log('💡 This script requires Polygon API to check actual prices');
    return;
  }

  try {
    // Get all performance records with their stocks
    const { data: allPerformance, error } = await supabase
      .from('stock_performance')
      .select(`
        id,
        stock_id,
        entry_date,
        entry_price,
        exit_date,
        exit_price,
        return_percent,
        outcome,
        stocks!inner(
          id,
          ticker
        )
      `)
      .order('entry_date', { ascending: false })
      .limit(20); // Check last 20 entries

    if (error) {
      throw new Error(`Failed to fetch performance: ${error.message}`);
    }

    if (!allPerformance || allPerformance.length === 0) {
      console.log('No performance records found');
      return;
    }

    console.log(`📊 Checking ${allPerformance.length} performance records...\n`);

    const issues: Array<{
      ticker: string;
      date: string;
      currentEntry: number;
      actualEntry: number;
      difference: number;
    }> = [];

    for (const perf of allPerformance) {
      const stock = (perf as any).stocks;
      const ticker = stock.ticker;
      const entryDate = perf.entry_date;

      // Fetch actual price
      try {
        await new Promise(resolve => setTimeout(resolve, 250)); // Rate limiting

        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${entryDate}/${entryDate}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const result = data.results[0];
          const actualOpen = result.o; // Open price (typical entry)
          const currentEntry = perf.entry_price;

          // Check if there's a significant difference (>$1)
          if (Math.abs(actualOpen - currentEntry) > 1) {
            issues.push({
              ticker,
              date: entryDate,
              currentEntry,
              actualEntry: actualOpen,
              difference: Math.abs(actualOpen - currentEntry),
            });
          }
        }
      } catch (error) {
        console.warn(`⚠️  Could not verify ${ticker} on ${entryDate}:`, error instanceof Error ? error.message : error);
      }
    }

    if (issues.length > 0) {
      console.log(`⚠️  Found ${issues.length} entry price issue(s):\n`);
      issues.forEach(issue => {
        console.log(`${issue.ticker} - ${issue.date}`);
        console.log(`  Current: $${issue.currentEntry}`);
        console.log(`  Actual: $${issue.actualEntry.toFixed(2)}`);
        console.log(`  Difference: $${issue.difference.toFixed(2)}`);
        console.log();
      });
    } else {
      console.log('✅ All entry prices appear correct!');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

verifyAllEntryPrices();

