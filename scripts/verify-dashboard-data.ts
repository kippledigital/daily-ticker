import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Verify dashboard data matches database
 */
async function verifyDashboardData() {
  console.log('🔍 Verifying Dashboard Data Matches Database...\n');
  console.log('═'.repeat(60));

  try {
    // Get data from performance_summary view (what dashboard uses)
    const { data: summaryView, error: viewError } = await supabase
      .from('performance_summary')
      .select('*')
      .single();

    if (viewError) {
      console.error('❌ Error fetching performance_summary view:', viewError.message);
      return;
    }

    console.log('📊 Performance Summary View (Dashboard Source):');
    console.log(`  Total Closed: ${summaryView?.total_closed_picks || 0}`);
    console.log(`  Total Open: ${summaryView?.total_open_picks || 0}`);
    console.log(`  Total Wins: ${summaryView?.total_wins || 0}`);
    console.log(`  Total Losses: ${summaryView?.total_losses || 0}`);
    console.log(`  Win Rate: ${summaryView?.win_rate_percent || 0}%`);
    console.log(`  Avg Return: ${summaryView?.avg_return_percent || 0}%`);
    console.log(`  Avg Win: ${summaryView?.avg_win_percent || 0}%`);
    console.log(`  Avg Loss: ${summaryView?.avg_loss_percent || 0}%`);
    console.log(`  Best Pick: ${summaryView?.best_pick_percent || 0}%`);
    console.log(`  Worst Pick: ${summaryView?.worst_pick_percent || 0}%`);
    console.log();

    // Calculate from raw data
    const { data: allPerformance, error: rawError } = await supabase
      .from('stock_performance')
      .select('outcome, return_percent');

    if (rawError) {
      console.error('❌ Error fetching raw data:', rawError.message);
      return;
    }

    if (!allPerformance) {
      console.log('No performance data found');
      return;
    }

    const closed = allPerformance.filter(p => p.outcome !== 'open');
    const open = allPerformance.filter(p => p.outcome === 'open');
    const wins = closed.filter(p => p.outcome === 'win');
    const losses = closed.filter(p => p.outcome === 'loss');

    const calculatedWinRate = closed.length > 0
      ? Math.round((wins.length / closed.length) * 100 * 100) / 100
      : 0;

    const avgReturn = closed.length > 0
      ? closed.reduce((sum, p) => sum + (p.return_percent || 0), 0) / closed.length
      : 0;

    const avgWin = wins.length > 0
      ? wins.reduce((sum, p) => sum + (p.return_percent || 0), 0) / wins.length
      : 0;

    const avgLoss = losses.length > 0
      ? losses.reduce((sum, p) => sum + (p.return_percent || 0), 0) / losses.length
      : 0;

    const returns = closed.map(p => p.return_percent || 0).filter(r => r !== 0);
    const bestPick = returns.length > 0 ? Math.max(...returns) : 0;
    const worstPick = returns.length > 0 ? Math.min(...returns) : 0;

    console.log('📊 Calculated from Raw Data:');
    console.log(`  Total Closed: ${closed.length}`);
    console.log(`  Total Open: ${open.length}`);
    console.log(`  Total Wins: ${wins.length}`);
    console.log(`  Total Losses: ${losses.length}`);
    console.log(`  Win Rate: ${calculatedWinRate}%`);
    console.log(`  Avg Return: ${Math.round(avgReturn * 100) / 100}%`);
    console.log(`  Avg Win: ${Math.round(avgWin * 100) / 100}%`);
    console.log(`  Avg Loss: ${Math.round(avgLoss * 100) / 100}%`);
    console.log(`  Best Pick: ${Math.round(bestPick * 100) / 100}%`);
    console.log(`  Worst Pick: ${Math.round(worstPick * 100) / 100}%`);
    console.log();

    // Compare
    console.log('═'.repeat(60));
    console.log('🔍 Comparison:\n');

    const comparisons = [
      { name: 'Total Closed', view: summaryView?.total_closed_picks || 0, calculated: closed.length },
      { name: 'Total Open', view: summaryView?.total_open_picks || 0, calculated: open.length },
      { name: 'Total Wins', view: summaryView?.total_wins || 0, calculated: wins.length },
      { name: 'Total Losses', view: summaryView?.total_losses || 0, calculated: losses.length },
      { name: 'Win Rate', view: summaryView?.win_rate_percent || 0, calculated: calculatedWinRate },
      { name: 'Avg Return', view: summaryView?.avg_return_percent || 0, calculated: Math.round(avgReturn * 100) / 100 },
    ];

    let allMatch = true;
    comparisons.forEach(({ name, view, calculated }) => {
      const match = Math.abs(view - calculated) < 0.01; // Allow small rounding differences
      const status = match ? '✅' : '❌';
      if (!match) allMatch = false;
      console.log(`${status} ${name}: View=${view}, Calculated=${calculated} ${!match ? '⚠️ MISMATCH' : ''}`);
    });

    console.log();
    if (allMatch) {
      console.log('✅ All data matches! Dashboard is showing correct data.');
    } else {
      console.log('⚠️  Some data does not match. The view may need to be refreshed.');
    }

    // Check API endpoint
    console.log('\n═'.repeat(60));
    console.log('🌐 Checking API Endpoint Response...\n');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/performance`);
      const apiData = await response.json();

      if (apiData.success && apiData.data) {
        const apiSummary = apiData.data.summary;
        console.log('📊 API Response:');
        console.log(`  Total Closed: ${apiSummary?.total_closed_picks || 0}`);
        console.log(`  Total Wins: ${apiSummary?.total_wins || 0}`);
        console.log(`  Win Rate: ${apiSummary?.win_rate_percent || 0}%`);
        console.log();

        const apiMatches = 
          Math.abs((apiSummary?.total_closed_picks || 0) - closed.length) < 0.01 &&
          Math.abs((apiSummary?.total_wins || 0) - wins.length) < 0.01;

        if (apiMatches) {
          console.log('✅ API matches database!');
        } else {
          console.log('⚠️  API does not match database');
        }
      }
    } catch (apiError) {
      console.log('⚠️  Could not check API (server may not be running)');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

verifyDashboardData();

