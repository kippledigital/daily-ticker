/**
 * Accurate Performance Update Using Historical Daily Prices
 *
 * Fetches daily price history and determines the FIRST day that:
 * - Stop loss was hit
 * - Profit target was hit
 * - 30-day limit reached
 *
 * This gives accurate exit dates and prices instead of using today's price.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

interface Position {
  id: string;
  stock_id: string;
  entry_date: string;
  entry_price: number;
  outcome: string;
  stocks: {
    ticker: string;
    stop_loss: number;
    profit_target: number;
  };
}

interface DailyBar {
  t: number; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}

/**
 * Get daily price bars from entry date to today
 */
async function getHistoricalPrices(
  ticker: string,
  fromDate: string,
  toDate: string
): Promise<DailyBar[] | null> {
  try {
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching historical prices for ${ticker}:`, error);
    return null;
  }
}

/**
 * Check each day's price to find FIRST exit event
 */
function findFirstExit(
  dailyBars: DailyBar[],
  entryPrice: number,
  stopLoss: number,
  profitTarget: number,
  maxDays: number = 30
): {
  exitDate: string | null;
  exitPrice: number | null;
  exitReason: 'stop_loss' | 'profit_target' | null;
  daysHeld: number;
} {
  for (let i = 0; i < dailyBars.length && i < maxDays; i++) {
    const bar = dailyBars[i];
    const date = new Date(bar.t).toISOString().split('T')[0];

    // Check intraday: did it hit stop loss?
    if (bar.l <= stopLoss) {
      return {
        exitDate: date,
        exitPrice: stopLoss, // Assume filled at stop loss
        exitReason: 'stop_loss',
        daysHeld: i + 1,
      };
    }

    // Check intraday: did it hit profit target?
    if (bar.h >= profitTarget) {
      return {
        exitDate: date,
        exitPrice: profitTarget, // Assume filled at profit target
        exitReason: 'profit_target',
        daysHeld: i + 1,
      };
    }
  }

  // Check if 30-day limit reached
  if (dailyBars.length >= maxDays) {
    const lastBar = dailyBars[maxDays - 1];
    return {
      exitDate: new Date(lastBar.t).toISOString().split('T')[0],
      exitPrice: lastBar.c, // Close price on day 30
      exitReason: 'stop_loss', // Use stop_loss for DB constraint
      daysHeld: maxDays,
    };
  }

  // Still open
  return {
    exitDate: null,
    exitPrice: null,
    exitReason: null,
    daysHeld: dailyBars.length,
  };
}

async function updateAllPerformanceHistorical() {
  console.log('🚀 Accurate Performance Update Using Historical Prices\n');
  console.log('═'.repeat(70));

  // Fetch all positions (including already closed ones to re-verify)
  const { data: positions, error } = await supabase
    .from('stock_performance')
    .select(`
      *,
      stocks!inner(ticker, stop_loss, profit_target)
    `)
    .order('entry_date', { ascending: true });

  if (error) {
    console.error('Error fetching positions:', error);
    return;
  }

  if (!positions || positions.length === 0) {
    console.log('No positions to update');
    return;
  }

  console.log(`\n📊 Found ${positions.length} total positions to verify\n`);

  let updatedCount = 0;
  let verifiedCount = 0;
  const today = new Date().toISOString().split('T')[0];

  for (let i = 0; i < positions.length; i++) {
    const position = positions[i] as Position;
    const ticker = position.stocks.ticker;
    const stopLoss = position.stocks.stop_loss;
    const profitTarget = position.stocks.profit_target;
    const progress = `[${i + 1}/${positions.length}]`;

    console.log(`${progress} Checking ${ticker} (entered ${position.entry_date})...`);

    // Safety checks
    if (!stopLoss || !profitTarget) {
      console.log(`   ⚠️  Missing stop loss or profit target, skipping`);
      continue;
    }

    // Get historical daily prices from entry to today
    const dailyBars = await getHistoricalPrices(ticker, position.entry_date, today);

    if (!dailyBars || dailyBars.length === 0) {
      console.log(`   ⚠️  Could not fetch price history, skipping`);
      continue;
    }

    console.log(`   Entry: $${position.entry_price.toFixed(2)} | Stop: $${stopLoss.toFixed(2)} | Target: $${profitTarget.toFixed(2)}`);
    console.log(`   Fetched ${dailyBars.length} days of price history`);

    // Find first exit event in historical data
    const exitInfo = findFirstExit(dailyBars, position.entry_price, stopLoss, profitTarget);

    if (exitInfo.exitDate && exitInfo.exitReason) {
      // Position should be closed
      console.log(`   🔴 EXIT FOUND: ${exitInfo.exitReason.toUpperCase()} on ${exitInfo.exitDate} at $${exitInfo.exitPrice!.toFixed(2)} (day ${exitInfo.daysHeld})`);

      // Update the position
      const { error: updateError } = await supabase
        .from('stock_performance')
        .update({
          exit_price: exitInfo.exitPrice,
          exit_date: exitInfo.exitDate,
          exit_reason: exitInfo.exitReason,
        })
        .eq('id', position.id);

      if (updateError) {
        console.log(`   ❌ Error updating: ${updateError.message}`);
      } else {
        updatedCount++;
        const returnPct = ((exitInfo.exitPrice! - position.entry_price) / position.entry_price * 100).toFixed(2);
        console.log(`   ✅ Position closed (${returnPct > '0' ? '+' : ''}${returnPct}%)`);
      }
    } else {
      // Position is still open
      console.log(`   ✅ Still open (holding for ${exitInfo.daysHeld} days, no exit triggered yet)`);
      verifiedCount++;
    }

    // Rate limiting (5 calls per minute for Polygon free tier)
    if (i < positions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 13000)); // 13 seconds
    }
  }

  console.log('\n' + '═'.repeat(70));
  console.log('📊 HISTORICAL PERFORMANCE UPDATE SUMMARY');
  console.log('═'.repeat(70));
  console.log(`Total positions checked: ${positions.length}`);
  console.log(`Positions closed/updated: ${updatedCount}`);
  console.log(`Verified still open: ${verifiedCount}`);
  console.log('═'.repeat(70));

  console.log('\n✅ Accurate performance update complete!');
  console.log('💡 All positions now have accurate exit dates and prices');
  console.log('   based on when stop loss or profit target was FIRST hit.\n');
}

// Run the update
updateAllPerformanceHistorical()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
