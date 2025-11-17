import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Remove test data from database
 * Specifically targets the October 15, 2025 NVDA test entry
 */
async function removeTestData() {
  console.log('🔍 Searching for test data...\n');
  console.log('═'.repeat(60));

  try {
    // Find NVDA stock with entry price 495.00 (test data)
    const { data: nvdaStocks, error: stocksError } = await supabase
      .from('stocks')
      .select('id, ticker, entry_price, brief_id, briefs!inner(date)')
      .eq('ticker', 'NVDA')
      .eq('entry_price', 495.00);

    if (stocksError) {
      throw new Error(`Failed to fetch stocks: ${stocksError.message}`);
    }

    if (!nvdaStocks || nvdaStocks.length === 0) {
      console.log('✅ No test data found (NVDA with entry price $495.00)');
      return;
    }

    console.log(`⚠️  Found ${nvdaStocks.length} test stock(s) to remove:\n`);

    for (const stock of nvdaStocks) {
      const brief = (stock as any).briefs;
      console.log(`  • Stock ID: ${stock.id}`);
      console.log(`    Ticker: ${stock.ticker}`);
      console.log(`    Entry Price: $${stock.entry_price}`);
      console.log(`    Brief Date: ${brief?.date || 'N/A'}`);
      console.log(`    Brief ID: ${stock.brief_id}\n`);

      // Check for associated performance data
      const { data: performance } = await supabase
        .from('stock_performance')
        .select('*')
        .eq('stock_id', stock.id);

      if (performance && performance.length > 0) {
        console.log(`    Performance data found:`);
        performance.forEach(p => {
          console.log(`      - Entry: $${p.entry_price} on ${p.entry_date}`);
          console.log(`      - Exit: ${p.exit_price ? `$${p.exit_price} on ${p.exit_date}` : 'Still open'}`);
          console.log(`      - Return: ${p.return_percent ? `${p.return_percent.toFixed(1)}%` : 'N/A'}`);
        });
        console.log();
      }
    }

    console.log('⚠️  This will delete:');
    console.log('  1. Stock performance records');
    console.log('  2. Stock records');
    console.log('  3. Brief records (if they only contain test data)\n');

    console.log('🔄 Proceeding in 3 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Delete performance data first
    for (const stock of nvdaStocks) {
      const { error: perfError } = await supabase
        .from('stock_performance')
        .delete()
        .eq('stock_id', stock.id);

      if (perfError) {
        console.error(`❌ Failed to delete performance for stock ${stock.id}:`, perfError.message);
      } else {
        console.log(`✅ Deleted performance data for stock ${stock.id}`);
      }
    }

    // Delete stocks
    const stockIds = nvdaStocks.map(s => s.id);
    const { error: stocksDeleteError } = await supabase
      .from('stocks')
      .delete()
      .in('id', stockIds);

    if (stocksDeleteError) {
      console.error(`❌ Failed to delete stocks:`, stocksDeleteError.message);
    } else {
      console.log(`✅ Deleted ${stockIds.length} stock record(s)`);
    }

    // Check if briefs should be deleted (only if they have no other stocks)
    const briefIds = Array.from(new Set(nvdaStocks.map(s => s.brief_id).filter(Boolean)));
    
    for (const briefId of briefIds) {
      const { data: remainingStocks } = await supabase
        .from('stocks')
        .select('id')
        .eq('brief_id', briefId)
        .limit(1);

      if (!remainingStocks || remainingStocks.length === 0) {
        // Brief has no stocks left, safe to delete
        const { error: briefError } = await supabase
          .from('briefs')
          .delete()
          .eq('id', briefId);

        if (briefError) {
          console.error(`❌ Failed to delete brief ${briefId}:`, briefError.message);
        } else {
          console.log(`✅ Deleted empty brief ${briefId}`);
        }
      } else {
        console.log(`ℹ️  Brief ${briefId} still has other stocks, keeping it`);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ CLEANUP COMPLETE');
    console.log('═'.repeat(60));
    console.log('\n📊 Verifying NVDA data after cleanup...\n');

    // Verify cleanup
    const { data: remainingNVDA } = await supabase
      .from('stocks')
      .select('id, ticker, entry_price, briefs!inner(date)')
      .eq('ticker', 'NVDA')
      .order('created_at', { ascending: false })
      .limit(5);

    if (remainingNVDA && remainingNVDA.length > 0) {
      console.log(`✅ Remaining NVDA stocks (${remainingNVDA.length}):`);
      remainingNVDA.forEach(s => {
        const brief = (s as any).briefs;
        console.log(`  • Entry: $${s.entry_price} | Brief: ${brief?.date || 'N/A'}`);
      });
    } else {
      console.log('ℹ️  No NVDA stocks remaining in database');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

removeTestData();

