import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Fix incorrect entry prices in stock_performance table
 * 
 * This script helps identify and fix entry prices that don't match
 * the actual stock price on the entry date.
 * 
 * Usage: Update the CORRECT_PRICES object with the correct entry prices
 */
const CORRECT_PRICES: Record<string, { stockId: string; correctEntryPrice: number }> = {
  // Format: 'brief-date-ticker': { stockId: 'uuid', correctEntryPrice: 123.45 }
  // Example:
  // '2025-10-27-NVDA': { stockId: 'fa35eb86-c14b-4ca8-9d89-708dde3bcf01', correctEntryPrice: 188.15 },
};

async function fixIncorrectEntryPrices() {
  console.log('🔍 Checking for incorrect entry prices...\n');
  console.log('═'.repeat(60));

  try {
    // Get all performance records with their stocks
    const { data: allPerformance, error } = await supabase
      .from('stock_performance')
      .select(`
        id,
        stock_id,
        entry_date,
        entry_price,
        exit_price,
        return_percent,
        outcome,
        stocks!inner(
          id,
          ticker,
          entry_price
        )
      `)
      .order('entry_date', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Failed to fetch performance: ${error.message}`);
    }

    if (!allPerformance || allPerformance.length === 0) {
      console.log('No performance records found');
      return;
    }

    console.log(`📊 Found ${allPerformance.length} performance records\n`);

    // Show all records for review
    for (const perf of allPerformance) {
      const stock = (perf as any).stocks;
      const key = `${perf.entry_date}-${stock.ticker}`;
      
      console.log(`${stock.ticker} - ${perf.entry_date}`);
      console.log(`  Stock Entry Price: $${stock.entry_price}`);
      console.log(`  Performance Entry Price: $${perf.entry_price}`);
      console.log(`  Exit Price: ${perf.exit_price ? `$${perf.exit_price}` : 'Open'}`);
      console.log(`  Return: ${perf.return_percent ? `${perf.return_percent.toFixed(1)}%` : 'N/A'}`);
      
      // Check if this needs fixing
      if (CORRECT_PRICES[key]) {
        const correct = CORRECT_PRICES[key];
        if (perf.entry_price !== correct.correctEntryPrice) {
          console.log(`  ⚠️  NEEDS FIX: Should be $${correct.correctEntryPrice}`);
        }
      }
      console.log();
    }

    // Fix prices if corrections are provided
    if (Object.keys(CORRECT_PRICES).length > 0) {
      console.log('═'.repeat(60));
      console.log('🔧 Fixing entry prices...\n');

      for (const [key, correction] of Object.entries(CORRECT_PRICES)) {
        const [date, ticker] = key.split('-');
        
        // Find the performance record
        const perf = allPerformance.find(p => {
          const s = (p as any).stocks;
          return p.entry_date === date && s.ticker === ticker && p.stock_id === correction.stockId;
        });

        if (!perf) {
          console.log(`⚠️  Could not find record for ${key}`);
          continue;
        }

        if (perf.entry_price === correction.correctEntryPrice) {
          console.log(`✅ ${key} already correct`);
          continue;
        }

        // Recalculate return_percent if exit_price exists
        let newReturnPercent = null;
        if (perf.exit_price) {
          newReturnPercent = ((perf.exit_price - correction.correctEntryPrice) / correction.correctEntryPrice) * 100;
        }

        // Update the performance record
        const { error: updateError } = await supabase
          .from('stock_performance')
          .update({
            entry_price: correction.correctEntryPrice,
            return_percent: newReturnPercent,
          })
          .eq('id', perf.id);

        if (updateError) {
          console.error(`❌ Failed to update ${key}:`, updateError.message);
        } else {
          console.log(`✅ Fixed ${key}: $${perf.entry_price} → $${correction.correctEntryPrice}`);
          if (newReturnPercent !== null) {
            console.log(`   Return recalculated: ${perf.return_percent?.toFixed(1)}% → ${newReturnPercent.toFixed(1)}%`);
          }
        }
      }
    } else {
      console.log('\n💡 To fix prices, add entries to CORRECT_PRICES object in the script');
      console.log('   Format: "date-ticker": { stockId: "uuid", correctEntryPrice: 123.45 }');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

fixIncorrectEntryPrices();

