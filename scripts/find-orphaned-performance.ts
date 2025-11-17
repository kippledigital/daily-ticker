import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Find orphaned performance data or test data
 */
async function findOrphanedData() {
  console.log('🔍 Searching for orphaned or test performance data...\n');
  console.log('═'.repeat(60));

  try {
    // Get all performance data with entry price 495 or exit price 604
    const { data: testPerformance, error: perfError } = await supabase
      .from('stock_performance')
      .select(`
        *,
        stocks!inner(
          id,
          ticker,
          entry_price,
          brief_id,
          briefs!inner(date, subject_premium)
        )
      `)
      .or('entry_price.eq.495,exit_price.eq.604');

    if (perfError) {
      throw new Error(`Failed to fetch performance: ${perfError.message}`);
    }

    if (testPerformance && testPerformance.length > 0) {
      console.log(`⚠️  Found ${testPerformance.length} potential test performance record(s):\n`);
      
      for (const perf of testPerformance) {
        const stock = (perf as any).stocks;
        const brief = stock?.briefs;
        console.log(`Performance ID: ${perf.id}`);
        console.log(`  Stock ID: ${perf.stock_id}`);
        console.log(`  Ticker: ${stock?.ticker || 'N/A'}`);
        console.log(`  Entry: $${perf.entry_price} on ${perf.entry_date}`);
        console.log(`  Exit: ${perf.exit_price ? `$${perf.exit_price} on ${perf.exit_date}` : 'Still open'}`);
        console.log(`  Return: ${perf.return_percent ? `${perf.return_percent.toFixed(1)}%` : 'N/A'}`);
        console.log(`  Brief Date: ${brief?.date || 'N/A'}`);
        console.log(`  Brief Subject: ${brief?.subject_premium || 'N/A'}`);
        console.log();
      }
    } else {
      console.log('✅ No performance data found with entry $495 or exit $604');
    }

    // Check for orphaned performance (no matching stock)
    console.log('═'.repeat(60));
    console.log('🔍 Checking for orphaned performance data...\n');

    const { data: allPerformance } = await supabase
      .from('stock_performance')
      .select('stock_id');

    if (allPerformance) {
      const perfStockIds = new Set(allPerformance.map(p => p.stock_id));
      
      const { data: allStocks } = await supabase
        .from('stocks')
        .select('id');

      if (allStocks) {
        const stockIds = new Set(allStocks.map(s => s.id));
        const orphanedIds = Array.from(perfStockIds).filter(id => !stockIds.has(id));

        if (orphanedIds.length > 0) {
          console.log(`⚠️  Found ${orphanedIds.length} orphaned performance record(s):`);
          orphanedIds.forEach(id => console.log(`  • ${id}`));
        } else {
          console.log('✅ No orphaned performance data found');
        }
      }
    }

    // Check specifically for NVDA with October 15 date
    console.log('\n═'.repeat(60));
    console.log('🔍 Checking for NVDA performance on October 15, 2025...\n');

    const { data: nvdaPerf } = await supabase
      .from('stock_performance')
      .select(`
        *,
        stocks!inner(ticker)
      `)
      .eq('entry_date', '2025-10-15')
      .eq('stocks.ticker', 'NVDA');

    if (nvdaPerf && nvdaPerf.length > 0) {
      console.log(`⚠️  Found ${nvdaPerf.length} NVDA performance record(s) for October 15:`);
      nvdaPerf.forEach(p => {
        console.log(`  • Entry: $${p.entry_price} | Exit: ${p.exit_price ? `$${p.exit_price}` : 'Open'}`);
        console.log(`    Stock ID: ${p.stock_id}`);
        console.log(`    Return: ${p.return_percent ? `${p.return_percent.toFixed(1)}%` : 'N/A'}`);
      });
    } else {
      console.log('✅ No NVDA performance data found for October 15, 2025');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

findOrphanedData();

