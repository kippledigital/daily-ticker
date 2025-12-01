import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Check which positions were recently updated
 */
async function checkRecentUpdates() {
  console.log('🔍 Checking recently updated positions...\n');
  console.log('═'.repeat(60));

  try {
    // Get open positions sorted by last_updated
    const { data: openPositions, error } = await supabase
      .from('stock_performance')
      .select(`
        id,
        entry_date,
        entry_price,
        last_updated,
        stocks!inner(ticker, stop_loss, profit_target)
      `)
      .eq('outcome', 'open')
      .order('last_updated', { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(`Failed to fetch: ${error.message}`);
    }

    if (!openPositions || openPositions.length === 0) {
      console.log('No open positions found');
      return;
    }

    console.log('📊 Most Recently Updated Positions:\n');

    const today = new Date();
    openPositions.forEach((position: any) => {
      const stock = position.stocks;
      const entryDate = new Date(position.entry_date);
      const daysOld = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      const lastUpdated = new Date(position.last_updated);
      const hoursSinceUpdate = Math.floor((today.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60));

      console.log(`${stock.ticker}:`);
      console.log(`  Entry: $${position.entry_price} on ${position.entry_date}`);
      console.log(`  Days Open: ${daysOld}`);
      console.log(`  Last Updated: ${lastUpdated.toLocaleString()} (${hoursSinceUpdate}h ago)`);
      console.log(`  Stop Loss: $${stock.stop_loss || 'N/A'}`);
      console.log(`  Profit Target: $${stock.profit_target || 'N/A'}`);
      console.log();
    });

    // Check if any positions were closed recently
    const { data: recentClosures } = await supabase
      .from('stock_performance')
      .select(`
        id,
        entry_date,
        exit_date,
        entry_price,
        exit_price,
        return_percent,
        outcome,
        stocks!inner(ticker)
      `)
      .neq('outcome', 'open')
      .order('exit_date', { ascending: false })
      .limit(5);

    if (recentClosures && recentClosures.length > 0) {
      console.log('═'.repeat(60));
      console.log('📈 Recent Closures:\n');
      
      recentClosures.forEach((closure: any) => {
        const stock = closure.stocks;
        console.log(`${stock.ticker}:`);
        console.log(`  Entry: $${closure.entry_price} on ${closure.entry_date}`);
        console.log(`  Exit: $${closure.exit_price} on ${closure.exit_date}`);
        console.log(`  Return: ${closure.return_percent > 0 ? '+' : ''}${closure.return_percent?.toFixed(1)}%`);
        console.log(`  Outcome: ${closure.outcome.toUpperCase()}`);
        console.log();
      });
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

checkRecentUpdates();

