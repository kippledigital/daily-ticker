import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Check cron job activity and recent pick closures
 */
async function checkCronActivity() {
  console.log('🔍 Checking cron job activity and recent pick closures...\n');
  console.log('═'.repeat(60));

  try {
    // Check recent stock performance updates (closed positions)
    console.log('📊 Recent Pick Closures (Last 7 Days):\n');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const { data: recentClosures, error: closureError } = await supabase
      .from('stock_performance')
      .select(`
        id,
        entry_date,
        exit_date,
        entry_price,
        exit_price,
        return_percent,
        outcome,
        exit_reason,
        stocks!inner(ticker, sector)
      `)
      .neq('outcome', 'open')
      .gte('exit_date', sevenDaysAgoStr)
      .order('exit_date', { ascending: false })
      .limit(20);

    if (closureError) {
      console.error('❌ Error fetching closures:', closureError.message);
    } else if (recentClosures && recentClosures.length > 0) {
      console.log(`✅ Found ${recentClosures.length} closed position(s) in the last 7 days:\n`);
      
      recentClosures.forEach((closure: any) => {
        const stock = closure.stocks;
        const returnColor = closure.return_percent > 0 ? '🟢' : closure.return_percent < 0 ? '🔴' : '⚪';
        
        console.log(`${returnColor} ${stock.ticker} - ${closure.exit_date}`);
        console.log(`   Entry: $${closure.entry_price} on ${closure.entry_date}`);
        console.log(`   Exit: $${closure.exit_price} on ${closure.exit_date}`);
        console.log(`   Return: ${closure.return_percent > 0 ? '+' : ''}${closure.return_percent?.toFixed(1)}%`);
        console.log(`   Outcome: ${closure.outcome.toUpperCase()}`);
        console.log(`   Reason: ${closure.exit_reason || 'N/A'}`);
        console.log();
      });
    } else {
      console.log('ℹ️  No positions closed in the last 7 days');
      console.log();
    }

    // Check open positions
    console.log('═'.repeat(60));
    console.log('📈 Current Open Positions:\n');

    const { data: openPositions, error: openError } = await supabase
      .from('stock_performance')
      .select(`
        id,
        entry_date,
        entry_price,
        stocks!inner(ticker, sector, stop_loss, profit_target)
      `)
      .eq('outcome', 'open')
      .order('entry_date', { ascending: false })
      .limit(20);

    if (openError) {
      console.error('❌ Error fetching open positions:', openError.message);
    } else if (openPositions && openPositions.length > 0) {
      console.log(`📊 Found ${openPositions.length} open position(s):\n`);
      
      openPositions.forEach((position: any) => {
        const stock = position.stocks;
        const entryDate = new Date(position.entry_date);
        const today = new Date();
        const daysOpen = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        
        console.log(`  ${stock.ticker} - Entry: $${position.entry_price} on ${position.entry_date}`);
        console.log(`    Days Open: ${daysOpen}`);
        console.log(`    Stop Loss: $${stock.stop_loss || 'N/A'}`);
        console.log(`    Profit Target: $${stock.profit_target || 'N/A'}`);
        console.log();
      });
    } else {
      console.log('ℹ️  No open positions found');
      console.log();
    }

    // Check if cron_runs table exists and has data
    console.log('═'.repeat(60));
    console.log('⏰ Cron Job Execution History:\n');

    try {
      const { data: cronRuns, error: cronError } = await supabase
        .from('cron_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (cronError) {
        if (cronError.code === '42P01') {
          console.log('ℹ️  cron_runs table does not exist (this is okay)');
        } else {
          console.error('❌ Error fetching cron runs:', cronError.message);
        }
      } else if (cronRuns && cronRuns.length > 0) {
        console.log(`📋 Last ${cronRuns.length} cron run(s):\n`);
        
        cronRuns.forEach((run: any) => {
          const duration = run.completed_at && run.started_at
            ? Math.round((new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()) / 1000)
            : 'N/A';
          
          console.log(`  ${run.run_date} - ${run.status.toUpperCase()}`);
          console.log(`    Started: ${new Date(run.started_at).toLocaleString()}`);
          console.log(`    Completed: ${run.completed_at ? new Date(run.completed_at).toLocaleString() : 'Still running'}`);
          console.log(`    Duration: ${duration}s`);
          if (run.stocks_validated) {
            console.log(`    Stocks Validated: ${run.stocks_validated}`);
          }
          if (run.error_message) {
            console.log(`    Error: ${run.error_message}`);
          }
          console.log();
        });
      } else {
        console.log('ℹ️  No cron run history found');
      }
    } catch (error) {
      console.log('ℹ️  Could not check cron_runs table (may not exist)');
    }

    // Summary
    console.log('═'.repeat(60));
    console.log('📊 Summary:\n');
    
    const { count: totalOpen } = await supabase
      .from('stock_performance')
      .select('*', { count: 'exact', head: true })
      .eq('outcome', 'open');

    const { count: totalClosed } = await supabase
      .from('stock_performance')
      .select('*', { count: 'exact', head: true })
      .neq('outcome', 'open');

    console.log(`  Total Open Positions: ${totalOpen || 0}`);
    console.log(`  Total Closed Positions: ${totalClosed || 0}`);
    console.log(`  Recent Closures (7 days): ${recentClosures?.length || 0}`);
    console.log();

    // Check when performance update cron should run
    console.log('💡 Performance Update Cron:');
    console.log('   Schedule: Daily at 5 PM EST (10 PM UTC)');
    console.log('   Endpoint: /api/performance/update');
    console.log('   Checks: Stop-loss, profit target, 30-day auto-close');
    console.log();

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

checkCronActivity();

