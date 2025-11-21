import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Verify win rate calculation from database
 */
async function verifyWinRate() {
  console.log('🔍 Verifying Win Rate Calculation...\n');
  console.log('═'.repeat(60));

  try {
    // Get all closed positions
    const { data: closedPositions, error: closedError } = await supabase
      .from('stock_performance')
      .select('id, outcome, return_percent')
      .neq('outcome', 'open');

    if (closedError) {
      throw new Error(`Failed to fetch closed positions: ${closedError.message}`);
    }

    if (!closedPositions || closedPositions.length === 0) {
      console.log('ℹ️  No closed positions found');
      return;
    }

    const totalClosed = closedPositions.length;
    const wins = closedPositions.filter(p => p.outcome === 'win').length;
    const losses = closedPositions.filter(p => p.outcome === 'loss').length;
    const winRate = totalClosed > 0 ? Math.round((wins / totalClosed) * 100) : 0;

    console.log('📊 Database Statistics:');
    console.log(`  Total Closed: ${totalClosed}`);
    console.log(`  Wins: ${wins}`);
    console.log(`  Losses: ${losses}`);
    console.log(`  Calculated Win Rate: ${winRate}%`);
    console.log(`  Expected: 33 wins / 47 closed = 70%`);
    console.log();

    if (wins !== 33 || totalClosed !== 47) {
      console.log('⚠️  MISMATCH DETECTED!');
      console.log(`  Database shows: ${wins} wins / ${totalClosed} closed`);
      console.log(`  Dashboard shows: 33 wins / 47 closed`);
      console.log();
    }

    // Check open positions
    const { count: openCount } = await supabase
      .from('stock_performance')
      .select('*', { count: 'exact', head: true })
      .eq('outcome', 'open');

    console.log('📈 Additional Stats:');
    console.log(`  Open Positions: ${openCount || 0}`);
    console.log(`  Total Positions: ${(totalClosed || 0) + (openCount || 0)}`);
    console.log();

    // Check recent closures
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const { count: recentClosed } = await supabase
      .from('stock_performance')
      .select('*', { count: 'exact', head: true })
      .neq('outcome', 'open')
      .gte('exit_date', sevenDaysAgoStr);

    console.log(`  Recent Closures (7 days): ${recentClosed || 0}`);
    console.log();

    // Show breakdown by outcome
    console.log('📋 Breakdown by Outcome:');
    const outcomeBreakdown = closedPositions.reduce((acc, p) => {
      acc[p.outcome] = (acc[p.outcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(outcomeBreakdown).forEach(([outcome, count]) => {
      console.log(`  ${outcome.toUpperCase()}: ${count}`);
    });

    // Check if there are any positions that should have been closed
    console.log('\n═'.repeat(60));
    console.log('🔍 Checking for positions that should be closed...\n');

    const { data: openPositions } = await supabase
      .from('stock_performance')
      .select(`
        id,
        entry_date,
        stocks!inner(ticker)
      `)
      .eq('outcome', 'open')
      .order('entry_date', { ascending: true })
      .limit(10);

    if (openPositions && openPositions.length > 0) {
      const today = new Date();
      openPositions.forEach((pos: any) => {
        const entryDate = new Date(pos.entry_date);
        const daysOpen = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysOpen >= 30) {
          console.log(`⚠️  ${pos.stocks.ticker} - ${daysOpen} days open (should auto-close at 30 days)`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

verifyWinRate();

