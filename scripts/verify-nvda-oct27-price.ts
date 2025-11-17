import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

/**
 * Verify what NVDA's actual price was on October 27, 2025
 */
async function verifyNVDAOct27Price() {
  console.log('🔍 Verifying NVDA price on October 27, 2025...\n');
  console.log('═'.repeat(60));

  try {
    // Get the stock and performance data
    const { data: stock } = await supabase
      .from('stocks')
      .select(`
        id,
        ticker,
        entry_price,
        brief_id,
        briefs!inner(date, subject_premium)
      `)
      .eq('ticker', 'NVDA')
      .eq('briefs.date', '2025-10-27')
      .single();

    if (!stock) {
      console.log('❌ No stock found for October 27, 2025');
      return;
    }

    const brief = (stock as any).briefs;
    console.log('📊 Current Database Values:');
    console.log(`  Stock Entry Price: $${stock.entry_price}`);
    console.log(`  Brief Date: ${brief?.date}`);
    console.log(`  Brief Subject: ${brief?.subject_premium || 'N/A'}`);
    console.log();

    // Get performance data
    const { data: performance } = await supabase
      .from('stock_performance')
      .select('*')
      .eq('stock_id', stock.id)
      .single();

    if (performance) {
      console.log('📈 Performance Data:');
      console.log(`  Entry Price: $${performance.entry_price}`);
      console.log(`  Entry Date: ${performance.entry_date}`);
      console.log(`  Exit Price: ${performance.exit_price ? `$${performance.exit_price}` : 'Open'}`);
      console.log(`  Return: ${performance.return_percent ? `${performance.return_percent.toFixed(1)}%` : 'N/A'}`);
      console.log();
    }

    // Try to fetch actual historical price from Polygon
    if (POLYGON_API_KEY) {
      console.log('🔍 Fetching actual price from Polygon API...\n');
      
      const date = '2025-10-27';
      const url = `https://api.polygon.io/v2/aggs/ticker/NVDA/range/1/day/${date}/${date}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const result = data.results[0];
          console.log('✅ Actual NVDA Price on October 27, 2025:');
          console.log(`  Open: $${result.o.toFixed(2)}`);
          console.log(`  High: $${result.h.toFixed(2)}`);
          console.log(`  Low: $${result.l.toFixed(2)}`);
          console.log(`  Close: $${result.c.toFixed(2)}`);
          console.log(`  Volume: ${(result.v / 1_000_000).toFixed(1)}M`);
          console.log();

          const actualPrice = result.o; // Open price (typical entry)
          const currentEntry = performance?.entry_price || stock.entry_price;

          if (Math.abs(actualPrice - currentEntry) > 1) {
            console.log('⚠️  PRICE MISMATCH DETECTED!');
            console.log(`  Database shows: $${currentEntry}`);
            console.log(`  Actual price was: $${actualPrice.toFixed(2)}`);
            console.log(`  Difference: $${Math.abs(actualPrice - currentEntry).toFixed(2)}`);
            console.log();
            console.log('💡 Recommendation: Update entry_price to match actual market price');
          } else {
            console.log('✅ Entry price matches actual market price');
          }
        } else {
          console.log('⚠️  Could not fetch price data from Polygon');
          console.log('   (API may be rate-limited or date may be too recent)');
        }
      } catch (error) {
        console.log('⚠️  Error fetching from Polygon:', error instanceof Error ? error.message : error);
      }
    } else {
      console.log('⚠️  POLYGON_API_KEY not set, cannot verify actual price');
      console.log('💡 What should the correct entry price be for October 27, 2025?');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

verifyNVDAOct27Price();

