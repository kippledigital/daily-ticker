import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Fix NVDA October 27, 2025 entry price
 * Actual price: $189.99 (open price on that date)
 */
async function fixNVDAOct27() {
  console.log('🔧 Fixing NVDA October 27, 2025 entry price...\n');
  console.log('═'.repeat(60));

  try {
    // Get the stock
    const { data: stock } = await supabase
      .from('stocks')
      .select(`
        id,
        ticker,
        entry_price,
        brief_id,
        briefs!inner(date)
      `)
      .eq('ticker', 'NVDA')
      .eq('briefs.date', '2025-10-27')
      .single();

    if (!stock) {
      console.log('❌ No stock found for October 27, 2025');
      return;
    }

    // Get performance data
    const { data: performance } = await supabase
      .from('stock_performance')
      .select('*')
      .eq('stock_id', stock.id)
      .single();

    if (!performance) {
      console.log('❌ No performance data found');
      return;
    }

    console.log('📊 Current Data:');
    console.log(`  Entry Price: $${performance.entry_price}`);
    console.log(`  Exit Price: ${performance.exit_price ? `$${performance.exit_price}` : 'Open'}`);
    console.log(`  Return: ${performance.return_percent ? `${performance.return_percent.toFixed(1)}%` : 'N/A'}`);
    console.log();

    // Correct entry price (actual market price on Oct 27, 2025)
    const CORRECT_ENTRY_PRICE = 189.99;

    if (performance.entry_price === CORRECT_ENTRY_PRICE) {
      console.log('✅ Entry price is already correct');
      return;
    }

    console.log(`⚠️  Updating entry price: $${performance.entry_price} → $${CORRECT_ENTRY_PRICE}`);
    console.log();

    // Recalculate return if exit price exists
    let newReturnPercent = null;
    let newOutcome = performance.outcome;

    if (performance.exit_price) {
      newReturnPercent = ((performance.exit_price - CORRECT_ENTRY_PRICE) / CORRECT_ENTRY_PRICE) * 100;
      
      // Update outcome based on new return
      if (newReturnPercent > 0) {
        newOutcome = 'win';
      } else if (newReturnPercent < 0) {
        newOutcome = 'loss';
      } else {
        newOutcome = 'open';
      }

      console.log(`📈 Recalculated Return:`);
      console.log(`  Old: ${performance.return_percent ? `${performance.return_percent.toFixed(1)}%` : 'N/A'}`);
      console.log(`  New: ${newReturnPercent.toFixed(1)}%`);
      console.log(`  Outcome: ${performance.outcome} → ${newOutcome}`);
      console.log();
    }

    // Update the performance record
    const { error: updateError } = await supabase
      .from('stock_performance')
      .update({
        entry_price: CORRECT_ENTRY_PRICE,
        return_percent: newReturnPercent,
        outcome: newOutcome,
      })
      .eq('id', performance.id);

    if (updateError) {
      console.error('❌ Failed to update:', updateError.message);
      process.exit(1);
    }

    console.log('✅ Successfully updated entry price!');
    console.log();
    console.log('📊 Updated Data:');
    console.log(`  Entry Price: $${CORRECT_ENTRY_PRICE}`);
    console.log(`  Exit Price: ${performance.exit_price ? `$${performance.exit_price}` : 'Open'}`);
    console.log(`  Return: ${newReturnPercent !== null ? `${newReturnPercent.toFixed(1)}%` : 'N/A'}`);
    console.log(`  Outcome: ${newOutcome}`);

    // Also update stock.entry_price to match
    const { error: stockUpdateError } = await supabase
      .from('stocks')
      .update({ entry_price: CORRECT_ENTRY_PRICE })
      .eq('id', stock.id);

    if (stockUpdateError) {
      console.warn(`⚠️  Could not update stock.entry_price: ${stockUpdateError.message}`);
    } else {
      console.log('✅ Also updated stock.entry_price to match');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

fixNVDAOct27();

