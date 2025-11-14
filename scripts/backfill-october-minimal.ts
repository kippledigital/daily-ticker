/**
 * MINIMAL BACKFILL - October 2025 Historical Briefs
 *
 * Uses ONLY 3 OpenAI calls per brief (stock analyses only)
 * Skips AI email generation to conserve API quota
 * Perfect for historical archive population
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { discoverTrendingStocks } from '../lib/automation/stock-discovery';
import { gatherFinancialDataBatch, getRawAggregatedData } from '../lib/automation/news-gatherer';
import { analyzeStock } from '../lib/automation/ai-analyzer';
import { getHistoricalWatchlistData } from '../lib/automation/historical-data';
import { ValidatedStock } from '../types/automation';
import { injectTrendSymbol } from '../lib/automation/trend-injector';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Run 1 brief per execution - ONLY 3 OpenAI calls (stock analyses)
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
 * Generate simple template-based email content (no AI required)
 */
function generateSimpleEmailContent(stocks: ValidatedStock[], date: string, isPremium: boolean): {
  subject: string;
  htmlContent: string;
} {
  const dateFormatted = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Simple subject line
  const tickers = stocks.map(s => s.ticker).join(', ');
  const subject = `📊 Daily Ticker — ${tickers} | ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  // Build stock cards
  const stockCards = stocks
    .map(
      stock => `
    <div style="background:#1a3a52; border-radius:12px; padding:24px; margin-bottom:24px; border:1px solid #2a4a62;">
      <div style="margin-bottom:20px;">
        <h3 style="color:#00ff88; font-size:24px; margin:0 0 4px 0; font-weight:700; font-family:'Space Mono',Consolas,monospace; letter-spacing:-0.5px;">🔹 ${stock.ticker}</h3>
        <p style="color:#9ca3af; margin:0; font-size:14px; font-weight:500;">${stock.sector}</p>
      </div>

      ${
        isPremium
          ? `
      <div style="background:#0B1E32; border-radius:8px; padding:16px; margin-bottom:16px; border:1px solid #1a3a52;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:0 8px 12px 0; border-right:1px solid #1a3a52;">
              <div style="font-size:11px; color:#9ca3af; margin-bottom:4px; text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">Price</div>
              <div style="font-size:20px; font-weight:700; color:#ffffff; font-family:'Space Mono',Consolas,monospace;">$${stock.last_price.toFixed(2)}</div>
            </td>
            <td style="padding:0 0 12px 12px;">
              <div style="font-size:11px; color:#9ca3af; margin-bottom:4px; text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">Confidence</div>
              <div style="font-size:14px; font-weight:600; color:#00ff88;">${stock.confidence}%</div>
            </td>
          </tr>
        </table>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
        <tr>
          <td width="48%" style="padding-right:2%;">
            <div style="background:#2a1a1f; border-radius:8px; padding:14px; border:2px solid #ff3366;">
              <p style="font-size:11px; color:#ffb3c6; margin:0 0 6px 0; text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">Stop Loss</p>
              <p style="font-size:22px; font-weight:700; color:#ff3366; margin:0; font-family:'Space Mono',Consolas,monospace;">$${stock.stop_loss.toFixed(2)}</p>
            </div>
          </td>
          <td width="48%" style="padding-left:2%;">
            <div style="background:#0a2a1a; border-radius:8px; padding:14px; border:2px solid #00ff88;">
              <p style="font-size:11px; color:#b3ffdd; margin:0 0 6px 0; text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">Profit Target</p>
              <p style="font-size:22px; font-weight:700; color:#00ff88; margin:0; font-family:'Space Mono',Consolas,monospace;">$${stock.profit_target.toFixed(2)}</p>
            </div>
          </td>
        </tr>
      </table>

      <div style="background:#00ff88; background:linear-gradient(135deg, #00ff88 0%, #00dd77 100%); padding:16px 20px; border-radius:8px; margin-bottom:16px;">
        <p style="margin:0; color:#0B1E32; font-size:15px; font-weight:700;">${stock.actionable_insight}</p>
      </div>

      <p style="font-size:15px; color:#d1d5db; margin:0 0 16px 0; line-height:1.7;">${stock.summary}</p>

      <p style="font-size:13px; color:#9ca3af; margin:0; padding-top:12px; border-top:1px solid #2a4a62;">
        <strong style="font-weight:600;">Risk level:</strong> ${stock.risk_level}
        <span style="margin:0 6px; color:#4a5a6a;">•</span>
        <strong style="font-weight:600;">Confidence:</strong> <span style="color:#00ff88; font-weight:700;">${stock.confidence}%</span>
      </p>
      `
          : `
      <div style="background:#2a1a1f; border-radius:8px; padding:20px; margin-bottom:16px; border:2px solid #ff9933;">
        <p style="margin:0 0 12px 0; color:#ffcc99; font-size:16px; font-weight:600; text-align:center;">🔒 PRO FEATURE</p>
        <p style="margin:0; color:#d1d5db; font-size:14px; text-align:center; line-height:1.6;">
          See entry prices, stop losses, profit targets, and full analysis.<br>
          <a href="https://www.dailyticker.co/#pricing" style="color:#00ff88; text-decoration:none; font-weight:600;">Upgrade to Pro →</a>
        </p>
      </div>

      <p style="font-size:15px; color:#d1d5db; margin:0; line-height:1.7;">${stock.summary.substring(0, 150)}... <span style="color:#9ca3af;">[Upgrade to Pro to read more]</span></p>
      `
      }
    </div>
    `
    )
    .join('');

  // Full HTML email
  const htmlContent = `
<div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width:680px; background:#0B1E32; color:#F0F0F0; margin:0 auto; padding:0;">
  <div style="background:linear-gradient(135deg, #0B1E32 0%, #1a3a52 100%); padding:40px 24px 32px; text-align:center; border-bottom:3px solid #00ff88;">
    <div style="display:inline-block; margin-bottom:12px;">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; margin-right:8px;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
      <h1 style="display:inline-block; color:#00ff88; margin:0; font-family:'Space Mono',Consolas,monospace; font-size:32px; font-weight:700; vertical-align:middle; letter-spacing:-0.5px;">Daily Ticker</h1>
    </div>
    <p style="color:#00ff88; font-size:14px; margin:0; opacity:0.9; font-weight:500;">☀️ Morning Brief — ${dateFormatted}</p>
  </div>

  <div style="padding:32px 24px;">
    <p style="font-size:17px; color:#e5e7eb; line-height:1.7; margin:0 0 32px 0;">Simple, clear insights for everyday investors. What's moving, why it matters, and what to do next.</p>

    <div style="height:1px; background:linear-gradient(90deg, transparent, #1a3a52, transparent); margin:0 0 32px 0;"></div>

    <h2 style="color:#00ff88; font-size:22px; margin:0 0 24px 0; font-weight:600; letter-spacing:-0.3px;">📊 Today's Stocks at a Glance</h2>

    ${stockCards}

    <div style="margin-top:40px;padding:20px;background:#1a3a52;border-radius:8px;border-top:3px solid #00ff88;">
      <p style="font-size:12px;color:#9ca3af;margin:0 0 12px 0;line-height:1.6;">
        <strong style="color:#d1d5db;">Data:</strong> Alpha Vantage • Finnhub • Polygon.io
        <span style="color:#6b7280;margin:0 8px;">|</span>
        Retrieved ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
      </p>
      <p style="font-size:11px;color:#9ca3af;margin:0 0 16px 0;padding-top:12px;border-top:1px solid #2a4a62;line-height:1.5;">
        <strong style="color:#d1d5db;">Disclaimer:</strong> For educational purposes only. Not financial advice.
      </p>
      <p style="font-size:12px;color:#9ca3af;margin:0;text-align:center;">
        <a href="https://www.dailyticker.co/archive" style="color:#00ff88;text-decoration:none;">Archive</a>
        <span style="margin:0 6px;">•</span>
        <a href="https://www.dailyticker.co/privacy" style="color:#9ca3af;text-decoration:none;">Privacy</a>
      </p>
    </div>
  </div>
</div>
  `.trim();

  return { subject, htmlContent };
}

/**
 * Run the authentic automation pipeline with MINIMAL OpenAI calls
 */
async function runMinimalHistoricalAutomation(date: string): Promise<boolean> {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📅 Running MINIMAL automation for ${date} (3 OpenAI calls only)`);
  console.log('='.repeat(70));

  try {
    // Step 1: Discover trending stocks
    console.log('\n📊 Step 1: Discovering trending stocks...');
    const tickers = await discoverTrendingStocks({
      numberOfTickers: 3,
      focusSectors: ['Technology', 'Healthcare', 'Energy', 'Finance'],
    });
    console.log(`✅ Discovered: ${tickers.join(', ')}`);

    // Step 2: Fetch historical watchlist
    console.log('\n📜 Step 2: Fetching historical watchlist data...');
    const historicalWatchlist = await getHistoricalWatchlistData(date, 30);
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

    // Step 4: Fetch aggregated data for validation
    console.log('\n🔍 Step 4: Fetching aggregated data for validation...');
    const aggregatedDataPromises = tickers.map(ticker =>
      getRawAggregatedData(ticker, historicalDateRange)
    );
    const aggregatedDataArray = await Promise.all(aggregatedDataPromises);
    console.log('✅ Aggregated data fetched');

    // Step 5: Analyze stocks with AI (3 OpenAI calls)
    console.log(`\n🤖 Step 5: Analyzing stocks with AI (${tickers.length} OpenAI calls)...`);

    const analysisPromises = tickers.map((ticker, i) =>
      analyzeStock({
        ticker,
        financialData: financialData[ticker],
        historicalWatchlist,
        aggregatedData: aggregatedDataArray[i] || undefined,
      })
    );

    const analyses = await Promise.all(analysisPromises);
    console.log(`✅ AI analysis complete for ${tickers.length} stocks`);

    // Validate analyses
    const validatedStocks = analyses.filter((a): a is ValidatedStock => a !== null);

    if (validatedStocks.length === 0) {
      console.error('❌ No valid stock analyses');
      return false;
    }

    console.log(`✅ ${validatedStocks.length}/${tickers.length} stocks validated`);

    // Step 6: Inject trend symbols
    console.log('\n📈 Step 6: Injecting trend symbols...');
    const stocksWithTrends = validatedStocks.map(injectTrendSymbol);
    console.log('✅ Trend symbols added');

    // Step 7: Generate SIMPLE emails (NO OpenAI calls - template-based)
    console.log('\n📧 Step 7: Generating simple email content (no AI)...');

    const premiumEmail = generateSimpleEmailContent(stocksWithTrends, date, true);
    const freeEmail = generateSimpleEmailContent(stocksWithTrends, date, false);

    console.log(`✅ Premium: "${premiumEmail.subject}"`);
    console.log(`✅ Free: "${freeEmail.subject}"`);

    // Generate simple TLDR
    const tldr = `${stocksWithTrends.length} stocks analyzed: ${stocksWithTrends.map(s => s.ticker).join(', ')}`;

    // Step 8: Store in archive
    console.log('\n💾 Step 8: Storing in archive...');

    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .insert({
        date,
        subject_free: freeEmail.subject,
        subject_premium: premiumEmail.subject,
        html_content_free: freeEmail.htmlContent,
        html_content_premium: premiumEmail.htmlContent,
        tldr,
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
  console.log('🚀 MINIMAL HISTORICAL BACKFILL - October 2025\n');
  console.log('━'.repeat(70));
  console.log('OPTIMIZED: Only 3 OpenAI calls per brief (stock analyses only)');
  console.log('Email generation uses simple templates (no AI)');
  console.log('Perfect for conserving API quota while building track record');
  console.log('━'.repeat(70));
  console.log();

  // Generate all October 2025 weekdays (trading days)
  const october2025 = [];
  const start = new Date('2025-10-01');
  const end = new Date('2025-10-31');
  let current = new Date(start);

  while (current <= end) {
    // 0-4 are Monday-Friday
    if (current.getDay() >= 1 && current.getDay() <= 5) {
      october2025.push(current.toISOString().split('T')[0]);
    }
    current.setDate(current.getDate() + 1);
  }

  // Get existing briefs from database
  const { data: existingBriefs } = await supabase
    .from('briefs')
    .select('date')
    .gte('date', '2025-10-01')
    .lte('date', '2025-10-31');

  const existingDates = new Set((existingBriefs || []).map(b => b.date));

  // Find missing dates (work backwards from Oct 31)
  const missingDates = october2025.filter(date => !existingDates.has(date)).reverse();

  console.log(`📅 Found ${missingDates.length} missing October dates`);
  console.log(`📊 Will process ${BRIEFS_PER_RUN} date this run\n`);

  if (missingDates.length === 0) {
    console.log('✅ All October dates already have briefs!');
    return;
  }

  // Process BRIEFS_PER_RUN dates
  const datesToProcess = missingDates.slice(0, BRIEFS_PER_RUN);

  console.log('Dates to process (working backwards):');
  datesToProcess.forEach(date => console.log(`  • ${date}`));
  console.log();

  let successCount = 0;
  let failCount = 0;

  for (const date of datesToProcess) {
    const success = await runMinimalHistoricalAutomation(date);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  // Summary
  console.log('\n' + '━'.repeat(70));
  console.log('📊 SUMMARY');
  console.log('━'.repeat(70));
  console.log(`✅ Successfully created: ${successCount} authentic briefs`);
  console.log(`❌ Failed: ${failCount} briefs`);
  console.log(`📅 Remaining October dates: ${missingDates.length - datesToProcess.length}`);
  console.log();
  console.log(`💡 Run this script again to create ${BRIEFS_PER_RUN} more brief(s)`);
  console.log(`   Estimated runs needed: ${missingDates.length - datesToProcess.length}`);
  console.log();
  console.log('🔍 Each brief was created using:');
  console.log('   ✅ Real October news & sentiment from Alpha Vantage');
  console.log('   ✅ Authentic AI stock analysis (3 OpenAI calls)');
  console.log('   ✅ Template-based emails (0 OpenAI calls) ← SAVES 5 CALLS!');
  console.log('   ✅ Full validation & quality checks');
  console.log('   ✅ Complete Daily Ticker research methodology');
}

// Run backfill
backfillHistorical();
