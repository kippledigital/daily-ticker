import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Test the performance update endpoint logic
 * This simulates what the cron should be doing
 */
async function testPerformanceUpdate() {
  console.log('🧪 Testing Performance Update Logic...\n');
  console.log('═'.repeat(60));

  try {
    // Get open positions
    const { data: openPositions, error } = await supabase
      .from('stock_performance')
      .select(`
        *,
        stocks!inner(ticker, stop_loss, profit_target)
      `)
      .eq('outcome', 'open')
      .order('entry_date', { ascending: false })
      .limit(5);

    if (error) {
      throw new Error(`Failed to fetch: ${error.message}`);
    }

    if (!openPositions || openPositions.length === 0) {
      console.log('ℹ️  No open positions to check');
      return;
    }

    console.log(`📊 Checking ${openPositions.length} open position(s)...\n`);

    const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
    if (!POLYGON_API_KEY) {
      console.log('⚠️  POLYGON_API_KEY not set - cannot check actual prices');
      return;
    }

    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];

    for (const position of openPositions) {
      const stock = (position as any).stocks;
      const ticker = stock.ticker;

      console.log(`\n📈 ${ticker}:`);
      console.log(`   Entry: $${position.entry_price} on ${position.entry_date}`);
      console.log(`   Stop Loss: $${stock.stop_loss || 'N/A'}`);
      console.log(`   Profit Target: $${stock.profit_target || 'N/A'}`);

      // Calculate days open
      const entryDate = new Date(position.entry_date);
      const daysOpen = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`   Days Open: ${daysOpen}`);

      // Check 30-day auto-close
      if (daysOpen >= 30) {
        console.log(`   ⚠️  Should auto-close (30+ days)`);
      }

      // Fetch today's price
      try {
        await new Promise(resolve => setTimeout(resolve, 250)); // Rate limiting

        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${todayDate}/${todayDate}?adjusted=true&apiKey=${POLYGON_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const bar = data.results[0];
          const { h: high, l: low, c: close } = bar;

          console.log(`   Today's Price: High=$${high.toFixed(2)} Low=$${low.toFixed(2)} Close=$${close.toFixed(2)}`);

          // Check stop-loss
          if (stock.stop_loss && low <= stock.stop_loss) {
            console.log(`   🔴 STOP-LOSS HIT! Low ($${low.toFixed(2)}) <= Stop Loss ($${stock.stop_loss})`);
          }

          // Check profit target
          if (stock.profit_target && high >= stock.profit_target) {
            console.log(`   🟢 PROFIT TARGET HIT! High ($${high.toFixed(2)}) >= Profit Target ($${stock.profit_target})`);
          }

          if (stock.stop_loss && stock.profit_target) {
            if (low > stock.stop_loss && high < stock.profit_target) {
              console.log(`   ⚪ No exit triggers hit`);
            }
          }
        } else {
          console.log(`   ⚠️  No price data available for today`);
        }
      } catch (error) {
        console.log(`   ❌ Error fetching price: ${error instanceof Error ? error.message : error}`);
      }
    }

    console.log('\n═'.repeat(60));
    console.log('💡 Note: This is a test. The actual cron runs at 5 PM EST daily.');
    console.log('   To manually trigger: curl https://dailyticker.co/api/performance/update');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testPerformanceUpdate();
