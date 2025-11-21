import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Check what the performance_summary view is returning
 */
async function checkPerformanceSummary() {
  console.log('🔍 Checking performance_summary view...\n');
  console.log('═'.repeat(60));

  try {
    // Query the view directly
    const { data: summary, error: viewError } = await supabase
      .from('performance_summary')
      .select('*')
      .single();

    if (viewError) {
      console.error('❌ Error querying view:', viewError.message);
      console.error('   Code:', viewError.code);
      return;
    }

    console.log('📊 performance_summary VIEW Results:');
    console.log(`  Total Closed: ${summary?.total_closed_picks || 0}`);
    console.log(`  Total Open: ${summary?.total_open_picks || 0}`);
    console.log(`  Total Wins: ${summary?.total_wins || 0}`);
    console.log(`  Total Losses: ${summary?.total_losses || 0}`);
    console.log(`  Win Rate: ${summary?.win_rate_percent || 0}%`);
    console.log(`  Avg Return: ${summary?.avg_return_percent || 0}%`);
    console.log();

    // Also check raw data
    const { data: rawData, error: rawError } = await supabase
      .from('stock_performance')
      .select('outcome')
      .neq('outcome', 'open');

    if (!rawError && rawData) {
      const wins = rawData.filter(p => p.outcome === 'win').length;
      const losses = rawData.filter(p => p.outcome === 'loss').length;
      const totalClosed = wins + losses;
      const calculatedWinRate = totalClosed > 0 ? Math.round((wins / totalClosed) * 100) : 0;

      console.log('📊 Raw stock_performance Data:');
      console.log(`  Total Closed: ${totalClosed}`);
      console.log(`  Wins: ${wins}`);
      console.log(`  Losses: ${losses}`);
      console.log(`  Calculated Win Rate: ${calculatedWinRate}%`);
      console.log();

      // Compare
      if (summary?.total_wins !== wins || summary?.total_closed_picks !== totalClosed) {
        console.log('⚠️  MISMATCH BETWEEN VIEW AND RAW DATA!');
        console.log(`  View shows: ${summary?.total_wins} wins / ${summary?.total_closed_picks} closed`);
        console.log(`  Raw data shows: ${wins} wins / ${totalClosed} closed`);
        console.log();
        console.log('💡 The view might need to be refreshed or there\'s a calculation issue.');
      } else {
        console.log('✅ View matches raw data!');
      }
    }

    // Test the API endpoint
    console.log('\n═'.repeat(60));
    console.log('🌐 Testing /api/performance endpoint...\n');

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

        if (apiSummary?.total_wins !== summary?.total_wins) {
          console.log('⚠️  API RESPONSE DOES NOT MATCH VIEW!');
          console.log(`  View: ${summary?.total_wins} wins`);
          console.log(`  API: ${apiSummary?.total_wins} wins`);
        } else {
          console.log('✅ API matches view!');
        }
      } else {
        console.log('⚠️  API returned error:', apiData.error);
      }
    } catch (apiError) {
      console.log('⚠️  Could not test API (might not be running):', apiError instanceof Error ? apiError.message : apiError);
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

checkPerformanceSummary();

