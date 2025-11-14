import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  const { data: allPerformance } = await supabase
    .from('stock_performance')
    .select('outcome, return_percent, exit_reason');

  const closed = allPerformance?.filter(p => p.outcome !== 'open') || [];
  const open = allPerformance?.filter(p => p.outcome === 'open') || [];
  const wins = closed.filter(p => p.outcome === 'win');
  const losses = closed.filter(p => p.outcome === 'loss');

  console.log('\n' + '═'.repeat(70));
  console.log('🎯 FINAL PERFORMANCE SUMMARY');
  console.log('═'.repeat(70));
  console.log(`Total Positions Tracked: ${allPerformance?.length || 0}`);
  console.log(`  Closed: ${closed.length}`);
  console.log(`  Open: ${open.length}`);
  console.log(`\n📊 RESULTS:`);
  console.log(`  Wins: ${wins.length}`);
  console.log(`  Losses: ${losses.length}`);
  console.log(`  Win Rate: ${closed.length > 0 ? (wins.length / closed.length * 100).toFixed(1) : 0}%`);

  if (closed.length > 0) {
    const avgReturn = closed.reduce((sum, p) => sum + (p.return_percent || 0), 0) / closed.length;
    const avgWin = wins.length > 0 ? wins.reduce((sum, p) => sum + (p.return_percent || 0), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((sum, p) => sum + (p.return_percent || 0), 0) / losses.length : 0;

    console.log(`\n💰 RETURNS:`);
    console.log(`  Average Return: ${avgReturn.toFixed(2)}%`);
    console.log(`  Average Win: +${avgWin.toFixed(2)}%`);
    console.log(`  Average Loss: ${avgLoss.toFixed(2)}%`);

    const stopLosses = closed.filter(p => p.exit_reason === 'stop_loss');
    const profitTargets = closed.filter(p => p.exit_reason === 'profit_target');
    const thirtyDay = closed.filter(p => p.exit_reason === '30_day_limit');

    console.log(`\n📋 EXIT REASONS:`);
    console.log(`  Profit Target Hit: ${profitTargets.length}`);
    console.log(`  Stop Loss Hit: ${stopLosses.length}`);
    console.log(`  30-Day Limit: ${thirtyDay.length}`);
  }

  console.log('═'.repeat(70));
  console.log('\n✅ Performance tracking is LIVE and will update automatically!');
  console.log('📅 Next update: Tomorrow at 5 PM ET (if market is open)');
  console.log('═'.repeat(70));
})();
