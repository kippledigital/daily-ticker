import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Check October 27 NVDA data in detail
 */
async function checkOct27NVDA() {
  console.log('🔍 Checking October 27, 2025 NVDA data...\n');
  console.log('═'.repeat(60));

  try {
    // Get stock with brief date October 27
    const { data: stock } = await supabase
      .from('stocks')
      .select(`
        id,
        ticker,
        entry_price,
        brief_id,
        briefs!inner(id, date, subject_premium)
      `)
      .eq('ticker', 'NVDA')
      .eq('briefs.date', '2025-10-27')
      .single();

    if (stock) {
      const brief = (stock as any).briefs;
      console.log('📊 Stock Record:');
      console.log(`  Stock ID: ${stock.id}`);
      console.log(`  Entry Price (stocks table): $${stock.entry_price}`);
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
        console.log('📈 Performance Record:');
        console.log(`  Entry Price (performance table): $${performance.entry_price}`);
        console.log(`  Entry Date: ${performance.entry_date}`);
        console.log(`  Exit Price: ${performance.exit_price ? `$${performance.exit_price}` : 'Open'}`);
        console.log(`  Exit Date: ${performance.exit_date || 'Open'}`);
        console.log(`  Return: ${performance.return_percent ? `${performance.return_percent.toFixed(1)}%` : 'N/A'}`);
        console.log(`  Outcome: ${performance.outcome || 'N/A'}`);
        console.log();

        // Check if there's a mismatch
        if (stock.entry_price !== performance.entry_price) {
          console.log('⚠️  MISMATCH DETECTED!');
          console.log(`  Stock entry_price: $${stock.entry_price}`);
          console.log(`  Performance entry_price: $${performance.entry_price}`);
          console.log(`  Difference: $${Math.abs(stock.entry_price - performance.entry_price)}`);
          console.log();
          console.log('💡 The page is showing performance.entry_price ($460.00)');
          console.log('   but the stock.entry_price is different.');
        } else {
          console.log('✅ Entry prices match');
        }
      } else {
        console.log('⚠️  No performance record found for this stock');
      }
    } else {
      console.log('❌ No stock found for October 27, 2025');
    }

    // Also check what the actual NVDA price was on October 27
    console.log('\n═'.repeat(60));
    console.log('💡 Recommendation:');
    console.log('   The entry_price in stock_performance should match');
    console.log('   the actual stock price on that date, not the stock.entry_price');
    console.log('   which might be from the brief recommendation.');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

checkOct27NVDA();

