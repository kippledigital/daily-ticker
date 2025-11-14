/**
 * Test Claude Fallback System
 * Verifies that Claude can analyze stocks when OpenAI quota is exceeded
 */

import { analyzeStock } from '@/lib/automation/ai-analyzer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testClaudeFallback() {
  console.log('🧪 Testing Claude Fallback System');
  console.log('═'.repeat(70));

  // Test stock data (AAPL as example)
  const testParams = {
    ticker: 'AAPL',
    financialData: `
      Company: Apple Inc.
      Price: $175.50
      Volume: 52,431,200
      Market Cap: $2.75T
      P/E Ratio: 28.4
      52-Week Range: $164.08 - $199.62
      Sector: Technology
      Industry: Consumer Electronics
      Recent News: Apple announces new AI features in latest iPhone update
    `,
    historicalWatchlist: 'No recent picks for AAPL in last 30 days',
  };

  console.log(`\n📊 Testing stock analysis for ${testParams.ticker}...`);
  console.log('   This will try OpenAI first, then fallback to Claude if it fails\n');

  try {
    const startTime = Date.now();
    const analysis = await analyzeStock(testParams);
    const duration = Date.now() - startTime;

    if (analysis) {
      console.log('\n✅ ANALYSIS SUCCESSFUL!');
      console.log('═'.repeat(70));
      console.log(`Ticker: ${analysis.ticker}`);
      console.log(`Confidence: ${analysis.confidence}%`);
      console.log(`Risk Level: ${analysis.risk_level}`);
      console.log(`Price: $${analysis.last_price.toFixed(2)}`);
      console.log(`Sector: ${analysis.sector}`);
      console.log(`Summary: ${analysis.summary.substring(0, 100)}...`);
      console.log(`Stop Loss: $${analysis.stop_loss?.toFixed(2) || 'N/A'}`);
      console.log(`Profit Target: $${analysis.profit_target?.toFixed(2) || 'N/A'}`);
      console.log(`\nAnalysis completed in ${duration}ms`);
      console.log('═'.repeat(70));

      // Determine which AI was used based on logs
      console.log('\n💡 TIP: Check the logs above to see which AI provider was used');
      console.log('   • "OpenAI analysis successful" = Primary (OpenAI)');
      console.log('   • "Claude analysis successful (OpenAI fallback)" = Backup (Claude)');
    } else {
      console.error('\n❌ ANALYSIS FAILED');
      console.error('   Both OpenAI and Claude returned null');
      console.error('   Check API keys and quota limits');
    }

  } catch (error: any) {
    console.error('\n❌ TEST FAILED');
    console.error('═'.repeat(70));
    console.error('Error:', error.message || error);

    if (error.message?.includes('ANTHROPIC_API_KEY')) {
      console.error('\n🚨 ANTHROPIC API KEY NOT CONFIGURED!');
      console.error('   Add ANTHROPIC_API_KEY to your .env.local file');
      console.error('   Get your key at: https://console.anthropic.com/settings/keys');
    }
  }

  console.log('\n');
}

// Run test
testClaudeFallback()
  .then(() => {
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
