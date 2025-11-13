/**
 * Initialize Performance Tracking for All Stocks
 *
 * This script creates stock_performance records for all stocks in the database
 * that don't already have tracking records. This is needed for:
 * 1. Legacy stocks imported before performance tracking was set up
 * 2. New stocks added directly to the database
 *
 * After running this, the /api/performance/update endpoint will be able to
 * check prices and close positions automatically.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Stock {
  id: string;
  ticker: string;
  entry_price: number;
  briefs: {
    date: string;
  };
}

async function initializePerformanceTracking() {
  console.log('🚀 Initializing Performance Tracking for All Stocks\n');
  console.log('═'.repeat(60));

  try {
    // Step 1: Fetch all stocks with their brief dates
    console.log('\n📊 Step 1: Fetching all stocks from database...');
    const { data: stocks, error: stocksError } = await supabase
      .from('stocks')
      .select(`
        id,
        ticker,
        entry_price,
        briefs!inner (
          date
        )
      `)
      .order('created_at', { ascending: true });

    if (stocksError) {
      throw new Error(`Failed to fetch stocks: ${stocksError.message}`);
    }

    if (!stocks || stocks.length === 0) {
      console.log('✅ No stocks found in database.');
      return;
    }

    console.log(`✅ Found ${stocks.length} total stocks\n`);

    // Step 2: Fetch existing performance records
    console.log('📈 Step 2: Fetching existing performance records...');
    const { data: existingPerformance, error: performanceError } = await supabase
      .from('stock_performance')
      .select('stock_id');

    if (performanceError) {
      throw new Error(`Failed to fetch performance records: ${performanceError.message}`);
    }

    const existingStockIds = new Set(existingPerformance?.map(p => p.stock_id) || []);
    console.log(`✅ Found ${existingStockIds.size} existing performance records\n`);

    // Step 3: Create performance records for stocks without them
    console.log('🔄 Step 3: Creating missing performance records...\n');

    let createdCount = 0;
    let skippedCount = 0;

    for (const stock of stocks as Stock[]) {
      const brief = Array.isArray(stock.briefs) ? stock.briefs[0] : stock.briefs;
      const entryDate = brief.date;

      // Skip if performance record already exists
      if (existingStockIds.has(stock.id)) {
        console.log(`  ⏭️  ${stock.ticker} (${entryDate}): Already has performance tracking`);
        skippedCount++;
        continue;
      }

      // Create new performance record
      console.log(`  📝 ${stock.ticker} (${entryDate}): Creating performance record...`);

      const { error: insertError } = await supabase
        .from('stock_performance')
        .insert({
          stock_id: stock.id,
          entry_date: entryDate,
          entry_price: stock.entry_price,
          outcome: 'open', // Will be auto-calculated by trigger if exit data exists
        });

      if (insertError) {
        console.error(`  ❌ Failed: ${insertError.message}`);
      } else {
        console.log(`  ✅ Created: Entry at $${stock.entry_price.toFixed(2)}`);
        createdCount++;
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 INITIALIZATION SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Total stocks: ${stocks.length}`);
    console.log(`Already tracked: ${skippedCount}`);
    console.log(`Newly created: ${createdCount}`);
    console.log('═'.repeat(60));

    console.log('\n✅ Performance tracking initialization complete!');
    console.log('\n💡 Next step: Run the daily position closing endpoint:');
    console.log('   curl http://localhost:3000/api/performance/update');

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error);
    throw error;
  }
}

// Run the script
initializePerformanceTracking()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
