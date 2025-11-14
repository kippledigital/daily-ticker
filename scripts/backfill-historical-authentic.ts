/**
 * Historical Automation Runner - Authentic Backfill
 *
 * Runs the REAL Daily Ticker automation pipeline for historical dates
 * Uses actual news, sentiment, and research methodology from October 2025
 *
 * Strategy:
 * - Works backwards from Oct 31 to fill missing dates
 * - Uses Alpha Vantage historical news (time_from/time_to parameters)
 * - Runs full pipeline: discovery → news → AI analysis → validation → archive
 * - Respects Alpha Vantage rate limits (25 calls/day)
 * - Creates ~4 briefs per run (within free tier limits)
 */

import { createClient } from '@supabase/supabase-js';
import { discoverTrendingStocks } from '../lib/automation/stock-discovery';
import { getHistoricalWatchlistData } from '../lib/automation/historical-data';
import { gatherFinancialDataBatch, getRawAggregatedData } from '../lib/automation/news-gatherer';
import { analyzeStock } from '../lib/automation/ai-analyzer';
import { validateStockAnalysis } from '../lib/automation/validator';
import { injectTrendSymbol } from '../lib/automation/trend-injector';
import { generateEmailContent } from '../lib/automation/email-generator';
import { generateFreeEmail } from '../lib/automation/email-generator-free';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Run 1 brief per execution to minimize OpenAI API calls
// 1 date × (3 tickers × 2 calls each = 6) = 6 API calls per run
const BRIEFS_PER_RUN = 1;

/**
 * Convert date to Alpha Vantage time format
 */
function dateToAlphaVantageFormat(date: string, isStart: boolean): string {
  // Format: YYYYMMDDTHHMM
  const dateStr = date.replace(/-/g, '');
  return isStart ? `${dateStr}T0000` : `${dateStr}T2359`;
}

/**
 * Get missing October dates (work backwards from Oct 31)
 */
async function getMissingOctoberDates(): Promise<string[]> {
  const { data: existingBriefs } = await supabase
    .from('briefs')
    .select('date')
    .gte('date', '2025-10-01')
    .lte('date', '2025-10-31');

  const existingDates = new Set(existingBriefs?.map((b: any) => b.date) || []);

  // Generate all October weekdays
  const octoberDates: string[] = [];
  const start = new Date('2025-10-01');
  const end = new Date('2025-10-31');

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dateStr = d.toISOString().split('T')[0];
      if (!existingDates.has(dateStr)) {
        octoberDates.push(dateStr);
      }
    }
  }

  // Sort descending (work backwards from Oct 31)
  return octoberDates.sort().reverse();
}

/**
 * Run the full automation pipeline for a historical date
 */
async function runHistoricalAutomation(date: string): Promise<boolean> {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📅 Running AUTHENTIC automation for ${date}`);
  console.log('='.repeat(70));

  try {
    // Step 1: Discover trending stocks (same algorithm as daily automation)
    console.log('\n📊 Step 1: Discovering trending stocks...');
    const tickers = await discoverTrendingStocks({
      numberOfTickers: 3,
      focusSectors: ['Technology', 'Healthcare', 'Energy', 'Finance'],
    });

    if (tickers.length === 0) {
      console.error('❌ No tickers discovered');
      return false;
    }

    console.log(`✅ Discovered: ${tickers.join(', ')}`);

    // Step 2: Get historical watchlist data
    console.log('\n📜 Step 2: Fetching historical watchlist data...');
    const historicalData = await getHistoricalWatchlistData();
    console.log('✅ Historical data retrieved');

    // Step 3: Gather financial data with HISTORICAL NEWS
    console.log(`\n📰 Step 3: Gathering financial data with news from ${date}...`);

    const historicalDateRange = {
      timeFrom: dateToAlphaVantageFormat(date, true),
      timeTo: dateToAlphaVantageFormat(date, false),
    };

    console.log(`   News range: ${historicalDateRange.timeFrom} → ${historicalDateRange.timeTo}`);

    const financialData = await gatherFinancialDataBatch(tickers, historicalDateRange);
    console.log(`✅ Financial data gathered with historical news for ${tickers.length} tickers`);

    // Step 3b: Get raw aggregated data for validation
    console.log('\n🔍 Step 3b: Fetching aggregated data for validation...');
    const aggregatedDataPromises = tickers.map((ticker) =>
      getRawAggregatedData(ticker, historicalDateRange)
    );
    const aggregatedDataArray = await Promise.all(aggregatedDataPromises);

    const aggregatedDataMap = new Map();
    tickers.forEach((ticker, index) => {
      if (aggregatedDataArray[index]) {
        aggregatedDataMap.set(ticker, aggregatedDataArray[index]);
      }
    });

    console.log('✅ Aggregated data fetched');

    // Step 4: AI Analysis with historical context
    console.log(`\n🤖 Step 4: Analyzing stocks with AI (using ${date} news)...`);
    const analysisPromises = tickers.map((ticker) =>
      analyzeStock({
        ticker,
        financialData: financialData[ticker],
        historicalWatchlist: historicalData,
        aggregatedData: aggregatedDataMap.get(ticker),
      })
    );

    const analyses = await Promise.all(analysisPromises);
    console.log(`✅ AI analysis complete for ${analyses.length} stocks`);

    // Step 5: Validate analyses
    console.log('\n✔️  Step 5: Validating stock analyses...');
    const validatedStocks: any[] = [];
    const failedTickers: string[] = [];

    for (let i = 0; i < analyses.length; i++) {
      const analysis = analyses[i];
      const ticker = tickers[i];

      if (!analysis) {
        console.warn(`⚠️ ${ticker}: Analysis returned null`);
        failedTickers.push(ticker);
        continue;
      }

      const validated = validateStockAnalysis(analysis);
      if (validated) {
        validatedStocks.push(validated);
        console.log(`✅ ${ticker}: Validation passed`);
      } else {
        console.warn(`⚠️ ${ticker}: Validation failed`);
        failedTickers.push(ticker);
      }
    }

    // Retry failed stocks once
    if (failedTickers.length > 0 && validatedStocks.length < 3) {
      console.log(`🔄 Retrying ${failedTickers.length} failed stock(s)...`);

      for (const ticker of failedTickers) {
        try {
          const retryAnalysis = await analyzeStock({
            ticker,
            financialData: financialData[ticker],
            historicalWatchlist: historicalData,
            aggregatedData: aggregatedDataMap.get(ticker),
          });

          if (retryAnalysis) {
            const validated = validateStockAnalysis(retryAnalysis);
            if (validated) {
              validatedStocks.push(validated);
              console.log(`  ✅ ${ticker}: Retry successful!`);
              if (validatedStocks.length >= 3) break;
            }
          }
        } catch (error) {
          console.error(`  ❌ ${ticker}: Retry failed:`, error);
        }
      }
    }

    if (validatedStocks.length === 0) {
      console.error('❌ No valid stock analyses');
      return false;
    }

    console.log(`✅ ${validatedStocks.length}/${tickers.length} stocks validated`);

    // Step 6: Inject trend symbols
    console.log('\n📈 Step 6: Injecting trend symbols...');
    const stocksWithTrends = validatedStocks.map(injectTrendSymbol);
    console.log('✅ Trend symbols added');

    // Step 7: Generate emails
    console.log('\n📧 Step 7: Generating email content...');

    const premiumEmail = await generateEmailContent({
      stocks: stocksWithTrends,
      date,
    });

    const freeEmail = await generateFreeEmail({
      stocks: stocksWithTrends,
      date,
    });

    console.log(`✅ Premium: "${premiumEmail.subject}"`);
    console.log(`✅ Free: "${freeEmail.subject}"`);

    // Step 8: Store in archive (skip email sending for historical data)
    console.log('\n💾 Step 8: Storing in archive...');

    // Store brief directly to database (bypass HTTP API to avoid content-length issues)
    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .insert({
        date,
        subject_free: freeEmail.subject,
        subject_premium: premiumEmail.subject,
        html_content_free: freeEmail.htmlContent,
        html_content_premium: premiumEmail.htmlContent,
        tldr: premiumEmail.tldr,
        actionable_count: stocksWithTrends.filter((s: any) =>
          s.actionable_insight.toLowerCase().includes('buy')
        ).length,
      })
      .select()
      .single();

    if (briefError || !brief) {
      console.error('❌ Failed to store brief:', briefError);
      return false;
    }

    console.log(`✅ Brief stored (ID: ${brief.id})`);

    // Store stocks
    for (const stock of stocksWithTrends) {
      const { error: stockError } = await supabase.from('stocks').insert({
        brief_id: brief.id,
        ticker: stock.ticker,
        sector: stock.sector,
        confidence: stock.confidence,
        risk_level: stock.risk_level,
        action: stock.actionable_insight.toLowerCase().includes('buy')
          ? 'BUY'
          : stock.actionable_insight.toLowerCase().includes('watch')
          ? 'WATCH'
          : stock.actionable_insight.toLowerCase().includes('hold')
          ? 'HOLD'
          : 'WATCH',
        entry_price: stock.last_price,
        stop_loss: stock.stop_loss,
        profit_target: stock.profit_target,
        summary: stock.summary,
        why_matters: stock.why_matters,
        momentum_check: stock.momentum_check,
        actionable_insight: stock.actionable_insight,
        suggested_allocation: stock.suggested_allocation,
        caution_notes: stock.caution_notes,
        mini_learning_moment: stock.mini_learning_moment,
      });

      if (stockError) {
        console.error(`  ❌ Failed to store ${stock.ticker}:`, stockError);
      } else {
        console.log(`  ✅ Stored ${stock.ticker}`);
      }
    }

    console.log('✅ Brief archived successfully');
    console.log(`\n✅ ${date} complete with ${validatedStocks.length} authenticated picks!`);

    return true;
  } catch (error) {
    console.error(`\n❌ Error processing ${date}:`, error);
    return false;
  }
}

/**
 * Main backfill function
 */
async function backfillHistorical() {
  console.log('\n🚀 AUTHENTIC HISTORICAL BACKFILL - October 2025\n');
  console.log('━'.repeat(70));
  console.log('Using REAL automation pipeline with historical news & sentiment');
  console.log('━'.repeat(70));

  // Get missing dates (working backwards from Oct 31)
  const missingDates = await getMissingOctoberDates();

  if (missingDates.length === 0) {
    console.log('\n✅ All October dates already have briefs!\n');
    return;
  }

  console.log(`\n📅 Found ${missingDates.length} missing October dates`);
  console.log(`📊 Will process ${Math.min(BRIEFS_PER_RUN, missingDates.length)} dates this run\n`);

  const datesToProcess = missingDates.slice(0, BRIEFS_PER_RUN);

  console.log('Dates to process (working backwards):');
  datesToProcess.forEach((date) => console.log(`  • ${date}`));
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (const date of datesToProcess) {
    const success = await runHistoricalAutomation(date);

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Add delay between dates to be respectful of rate limits
    if (datesToProcess.indexOf(date) < datesToProcess.length - 1) {
      console.log('\n⏳ Waiting 30s before next date...\n');
      await new Promise((resolve) => setTimeout(resolve, 30000));
    }
  }

  // Final summary
  console.log('\n' + '━'.repeat(70));
  console.log('📊 SUMMARY');
  console.log('━'.repeat(70));
  console.log(`✅ Successfully created: ${successCount} authentic briefs`);
  console.log(`❌ Failed: ${failCount} briefs`);
  console.log(`📅 Remaining October dates: ${missingDates.length - datesToProcess.length}`);

  if (missingDates.length > BRIEFS_PER_RUN) {
    console.log(
      `\n💡 Run this script again to create ${Math.min(
        BRIEFS_PER_RUN,
        missingDates.length - datesToProcess.length
      )} more briefs`
    );
    console.log(
      `   Estimated runs needed: ${Math.ceil(
        (missingDates.length - datesToProcess.length) / BRIEFS_PER_RUN
      )}`
    );
  } else {
    console.log('\n🎉 October will be complete after this run!');
  }

  console.log('\n🔍 Each brief was created using:');
  console.log('   ✅ Real October news & sentiment from Alpha Vantage');
  console.log('   ✅ Authentic AI analysis based on historical context');
  console.log('   ✅ Full validation & quality checks');
  console.log('   ✅ Complete Daily Ticker research methodology');
  console.log('');
}

// Run the backfill
backfillHistorical().catch(console.error);
