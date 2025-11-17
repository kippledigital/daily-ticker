import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

/**
 * Verify exit price for NVDA October 27 position
 */
async function verifyExitPrice() {
  console.log('🔍 Verifying NVDA October 27 exit price...\n');
  console.log('═'.repeat(60));

  try {
    const { data: performance } = await supabase
      .from('stock_performance')
      .select(`
        *,
        stocks!inner(ticker, briefs!inner(date))
      `)
      .eq('stocks.ticker', 'NVDA')
      .eq('entry_date', '2025-10-27')
      .single();

    if (!performance) {
      console.log('❌ No performance data found');
      return;
    }

    const stock = (performance as any).stocks;
    const brief = stock?.briefs;

    console.log('📊 Current Performance Data:');
    console.log(`  Entry Date: ${performance.entry_date}`);
    console.log(`  Entry Price: $${performance.entry_price}`);
    console.log(`  Exit Date: ${performance.exit_date || 'Open'}`);
    console.log(`  Exit Price: ${performance.exit_price ? `$${performance.exit_price}` : 'Open'}`);
    console.log(`  Return: ${performance.return_percent ? `${performance.return_percent.toFixed(1)}%` : 'N/A'}`);
    console.log(`  Outcome: ${performance.outcome}`);
    console.log();

    if (!performance.exit_price || !performance.exit_date) {
      console.log('ℹ️  Position is still open - no exit price to verify');
      return;
    }

    // Check if entry and exit are same day (suspicious)
    if (performance.entry_date === performance.exit_date) {
      console.log('⚠️  Entry and exit are on the same day - this seems unusual');
      console.log('   (Unless it was a day trade or data error)');
      console.log();
    }

    // Fetch actual price on exit date
    if (POLYGON_API_KEY) {
      console.log(`🔍 Fetching actual price on exit date (${performance.exit_date})...\n`);
      
      const url = `https://api.polygon.io/v2/aggs/ticker/NVDA/range/1/day/${performance.exit_date}/${performance.exit_date}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const result = data.results[0];
          console.log(`✅ Actual NVDA Price on ${performance.exit_date}:`);
          console.log(`  Open: $${result.o.toFixed(2)}`);
          console.log(`  High: $${result.h.toFixed(2)}`);
          console.log(`  Low: $${result.l.toFixed(2)}`);
          console.log(`  Close: $${result.c.toFixed(2)}`);
          console.log();

          const actualClose = result.c;
          const currentExit = performance.exit_price;

          if (Math.abs(actualClose - currentExit) > 1) {
            console.log('⚠️  EXIT PRICE MISMATCH!');
            console.log(`  Database shows: $${currentExit}`);
            console.log(`  Actual close was: $${actualClose.toFixed(2)}`);
            console.log(`  Difference: $${Math.abs(actualClose - currentExit).toFixed(2)}`);
            console.log();
            console.log('💡 Recommendation: Update exit_price to match actual market close');
            console.log(`   Suggested exit price: $${actualClose.toFixed(2)}`);
          } else {
            console.log('✅ Exit price matches actual market close');
          }

          // Recalculate return with correct prices
          const correctEntry = performance.entry_price; // Already fixed to $189.99
          const correctExit = actualClose;
          const correctReturn = ((correctExit - correctEntry) / correctEntry) * 100;

          console.log();
          console.log('📈 Corrected Calculation:');
          console.log(`  Entry: $${correctEntry.toFixed(2)}`);
          console.log(`  Exit: $${correctExit.toFixed(2)}`);
          console.log(`  Return: ${correctReturn > 0 ? '+' : ''}${correctReturn.toFixed(1)}%`);
          console.log(`  Outcome: ${correctReturn > 0 ? 'WIN' : correctReturn < 0 ? 'LOSS' : 'BREAKEVEN'}`);

        } else {
          console.log('⚠️  Could not fetch exit date price data');
        }
      } catch (error) {
        console.log('⚠️  Error fetching from Polygon:', error instanceof Error ? error.message : error);
      }
    } else {
      console.log('⚠️  POLYGON_API_KEY not set, cannot verify exit price');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

verifyExitPrice();

