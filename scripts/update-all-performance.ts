/**
 * Manually Update All Performance Records
 * Fetches current prices and closes positions that meet exit criteria
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

async function getCurrentPrice(ticker: string): Promise<number | null> {
  try {
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].c; // Close price
    }
    return null;
  } catch (error) {
    console.error(`Error fetching price for ${ticker}:`, error);
    return null;
  }
}

async function updateAllPerformance() {
  console.log('🚀 Updating Performance for All Positions\n');
  console.log('═'.repeat(70));

  // Fetch all open positions with stock ticker info
  const { data: positions, error } = await supabase
    .from('stock_performance')
    .select(`
      *,
      stocks!inner(ticker, stop_loss, profit_target)
    `)
    .eq('outcome', 'open')
    .order('entry_date', { ascending: true });

  if (error) {
    console.error('Error fetching positions:', error);
    return;
  }

  if (!positions || positions.length === 0) {
    console.log('No open positions to update');
    return;
  }

  console.log(`\n📊 Found ${positions.length} open positions to check\n`);

  let closedCount = 0;
  const closedPositions: any[] = [];

  for (let i = 0; i < positions.length; i++) {
    const position = positions[i] as Position;
    const ticker = position.stocks.ticker;
    const stopLoss = position.stocks.stop_loss;
    const profitTarget = position.stocks.profit_target;
    const progress = `[${i + 1}/${positions.length}]`;

    console.log(`${progress} Checking ${ticker} (entered ${position.entry_date})...`);

    // Get current price
    const currentPrice = await getCurrentPrice(ticker);

    if (!currentPrice) {
      console.log(`   ⚠️  Could not fetch price, skipping`);
      continue;
    }

    // Safety check for null prices
    if (!stopLoss || !profitTarget) {
      console.log(`   ⚠️  Missing stop loss or profit target, skipping`);
      continue;
    }

    console.log(`   Entry: $${position.entry_price.toFixed(2)} | Current: $${currentPrice.toFixed(2)} | Stop: $${stopLoss.toFixed(2)} | Target: $${profitTarget.toFixed(2)}`);

    // Calculate holding days
    const entryDate = new Date(position.entry_date);
    const today = new Date();
    const holdingDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    let shouldClose = false;
    let exitReason = '';
    let exitDate = today.toISOString().split('T')[0];

    // Check exit criteria
    if (currentPrice <= stopLoss) {
      shouldClose = true;
      exitReason = 'stop_loss';
      console.log(`   🔴 STOP LOSS HIT (${currentPrice.toFixed(2)} <= ${stopLoss.toFixed(2)})`);
    } else if (currentPrice >= profitTarget) {
      shouldClose = true;
      exitReason = 'profit_target';
      console.log(`   🟢 PROFIT TARGET HIT (${currentPrice.toFixed(2)} >= ${profitTarget.toFixed(2)})`);
    } else if (holdingDays >= 30) {
      shouldClose = true;
      // Use stop_loss as exit reason (database constraint allows: stop_loss, profit_target)
      exitReason = 'stop_loss';
      console.log(`   ⏰ TIME LIMIT REACHED (${holdingDays} days >= 30) - closing at market`);
    } else {
      console.log(`   ✅ Still open (holding for ${holdingDays} days)`);
    }

    if (shouldClose) {
      // Update the position
      const { error: updateError } = await supabase
        .from('stock_performance')
        .update({
          exit_price: currentPrice,
          exit_date: exitDate,
          exit_reason: exitReason,
        })
        .eq('id', position.id);

      if (updateError) {
        console.log(`   ❌ Error updating: ${updateError.message}`);
      } else {
        closedCount++;
        closedPositions.push({
          ticker: ticker,
          entry_price: position.entry_price,
          exit_price: currentPrice,
          exit_reason: exitReason,
          return_percent: ((currentPrice - position.entry_price) / position.entry_price * 100).toFixed(2),
        });
        console.log(`   ✅ Position closed`);
      }
    }

    // Rate limiting (5 calls per minute for Polygon free tier)
    if (i < positions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 13000)); // 13 seconds between calls
    }
  }

  console.log('\n' + '═'.repeat(70));
  console.log('📊 UPDATE SUMMARY');
  console.log('═'.repeat(70));
  console.log(`Total positions checked: ${positions.length}`);
  console.log(`Positions closed: ${closedCount}`);
  console.log(`Still open: ${positions.length - closedCount}`);

  if (closedPositions.length > 0) {
    console.log('\n🔄 CLOSED POSITIONS:');
    console.log('═'.repeat(70));
    for (const pos of closedPositions) {
      const returnStr = pos.return_percent >= 0 ? `+${pos.return_percent}%` : `${pos.return_percent}%`;
      console.log(`  ${pos.ticker}: ${pos.exit_reason.replace('_', ' ').toUpperCase()} at $${pos.exit_price.toFixed(2)} (${returnStr})`);
    }
  }

  console.log('═'.repeat(70));
  console.log('\n✅ Performance update complete!');
  console.log('\n💡 Database triggers have automatically calculated:');
  console.log('   • Return percentages');
  console.log('   • Win/loss outcomes');
  console.log('   • Holding periods');
}

// Run the update
updateAllPerformance()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
