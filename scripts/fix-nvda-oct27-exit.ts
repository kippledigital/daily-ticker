import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Fix NVDA October 27 exit price
 * Actual close price: $191.49
 */
async function fixNVDAOct27Exit() {
  console.log('🔧 Fixing NVDA October 27 exit price...\n');
  console.log('═'.repeat(60));

  try {
    const { data: performance } = await supabase
      .from('stock_performance')
      .select('*')
      .eq('entry_date', '2025-10-27')
      .eq('stocks.ticker', 'NVDA')
      .single();

    if (!performance) {
      // Try without the stocks filter
      const { data: perf } = await supabase
        .from('stock_performance')
        .select(`
          *,
          stocks!inner(ticker)
        `)
        .eq('entry_date', '2025-10-27')
        .eq('stocks.ticker', 'NVDA')
        .single();

      if (!perf) {
        console.log('❌ No performance data found');
        return;
      }

      await updatePerformance(perf);
      return;
    }

    await updatePerformance(performance);

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }

  async function updatePerformance(perf: any) {
    const CORRECT_ENTRY = 189.99;
    const CORRECT_EXIT = 191.49; // Actual close price on Oct 27
    const CORRECT_EXIT_DATE = '2025-10-27';

    console.log('📊 Current Data:');
    console.log(`  Entry: $${perf.entry_price} on ${perf.entry_date}`);
    console.log(`  Exit: ${perf.exit_price ? `$${perf.exit_price} on ${perf.exit_date}` : 'Open'}`);
    console.log(`  Return: ${perf.return_percent ? `${perf.return_percent.toFixed(1)}%` : 'N/A'}`);
    console.log();

    // Recalculate return
    const correctReturn = ((CORRECT_EXIT - CORRECT_ENTRY) / CORRECT_ENTRY) * 100;
    const correctOutcome = correctReturn > 0 ? 'win' : correctReturn < 0 ? 'loss' : 'open';

    console.log('📈 Corrected Values:');
    console.log(`  Entry: $${CORRECT_ENTRY}`);
    console.log(`  Exit: $${CORRECT_EXIT} on ${CORRECT_EXIT_DATE}`);
    console.log(`  Return: ${correctReturn > 0 ? '+' : ''}${correctReturn.toFixed(1)}%`);
    console.log(`  Outcome: ${correctOutcome.toUpperCase()}`);
    console.log();

    // Update performance record
    const { error: updateError } = await supabase
      .from('stock_performance')
      .update({
        entry_price: CORRECT_ENTRY,
        exit_price: CORRECT_EXIT,
        exit_date: CORRECT_EXIT_DATE,
        return_percent: correctReturn,
        outcome: correctOutcome,
      })
      .eq('id', perf.id);

    if (updateError) {
      console.error('❌ Failed to update:', updateError.message);
      process.exit(1);
    }

    console.log('✅ Successfully updated exit price and recalculated return!');
  }
}

fixNVDAOct27Exit();

