import { AutomationResult, ValidatedStock } from '@/types/automation';
import { discoverTrendingStocks } from './stock-discovery';
import { getHistoricalWatchlistData } from './historical-data';
import { gatherFinancialDataBatch, getRawAggregatedData } from './news-gatherer';
import { analyzeStock } from './ai-analyzer';
import { validateStockAnalysis } from './validator';
import { injectTrendSymbol } from './trend-injector';
import { generateEmailContent } from './email-generator';
import { generateFreeEmail } from './email-generator-free';
import { sendMorningBrief } from './email-sender';
import { sendErrorNotification } from './error-notifier';

/**
 * Main automation orchestrator
 * Replicates entire Gumloop workflow end-to-end
 *
 * Workflow:
 * 1. Enhanced Stock Discovery (3 tickers from focus sectors)
 * 2. Get Historical Data (last 30 days)
 * 3. Gather Financial Data & News (real-time APIs)
 * 4. AI Stock Analysis (GPT-4 with validation layer)
 * 5. Validation Check (ensure all fields present)
 * 6. Trend Symbol Injection (add 📈/📉/→)
 * 7. Email Generation (Scout persona with beginner-friendly content)
 * 8. Send Email (Resend to subscribers)
 * 9. Store in Archive (Supabase)
 *
 * NOW WITH STRICT SUCCESS CRITERIA:
 * - MUST generate at least 1 validated stock
 * - MUST send emails successfully
 * - MUST store in archive
 * - TRACKS every run in database for monitoring
 */
export async function runDailyAutomation(triggerSource: string = 'unknown'): Promise<AutomationResult> {
  const startTime = Date.now();
  const date = new Date().toISOString().split('T')[0];

  const result: AutomationResult = {
    success: false,
    steps: {},
  };

  // Initialize Supabase for cron tracking
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Create cron run tracking record
  const { data: cronRun, error: cronRunError } = await supabase
    .from('cron_runs')
    .insert({
      run_date: date,
      status: 'running',
      trigger_source: triggerSource,
    })
    .select()
    .single();

  if (cronRunError || !cronRun) {
    console.error('❌ Failed to create cron run tracking record:', cronRunError);
    // Continue anyway - don't fail the whole automation because of tracking
  } else {
    console.log(`📊 Cron run tracking started: ${cronRun.id}`);
  }

  const cronRunId = cronRun?.id;

  try {
    console.log(`🚀 Starting daily automation for ${date}...`);

    // Check if brief already exists for today (prevent duplicate runs)
    const { data: existingBrief } = await supabase
      .from('briefs')
      .select('id, date')
      .eq('date', date)
      .single();

    if (existingBrief) {
      console.warn(`⚠️  Brief for ${date} already exists. Deleting to allow regeneration...`);
      
      // Delete associated stocks first (foreign key constraint)
      const { error: stocksError } = await supabase
        .from('stocks')
        .delete()
        .eq('brief_id', existingBrief.id);

      if (stocksError) {
        console.error('Error deleting existing stocks:', stocksError);
        return {
          success: false,
          error: `Failed to delete existing stocks: ${stocksError.message}`,
          steps: {},
        };
      }

      // Delete the existing brief
      const { error: deleteError } = await supabase
        .from('briefs')
        .delete()
        .eq('id', existingBrief.id);

      if (deleteError) {
        console.error('Error deleting existing brief:', deleteError);
        return {
          success: false,
          error: `Failed to delete existing brief: ${deleteError.message}`,
          steps: {},
        };
      }

      console.log(`✅ Deleted existing brief for ${date}, proceeding with new automation...`);
    } else {
      console.log(`✅ No existing brief found for ${date}, proceeding with automation...`);
    }

    // Step 1: Discover trending stocks
    console.log('📊 Step 1: Discovering trending stocks...');
    const tickers = await discoverTrendingStocks({
      numberOfTickers: 3,
      focusSectors: ['Technology', 'Healthcare', 'Energy', 'Finance'],
    });

    if (tickers.length === 0) {
      throw new Error('No tickers discovered');
    }

    console.log(`✅ Discovered: ${tickers.join(', ')}`);
    result.steps.stockDiscovery = true;

    // Step 2: Get historical watchlist data (last 30 days)
    console.log('📜 Step 2: Fetching historical watchlist data...');
    const historicalData = await getHistoricalWatchlistData();
    console.log(`✅ Historical data retrieved`);
    result.steps.historicalData = true;

    // Step 3: Gather financial data and news for each ticker
    console.log('📰 Step 3: Gathering financial data and news...');
    const financialData = await gatherFinancialDataBatch(tickers);
    console.log(`✅ Financial data gathered for ${tickers.length} tickers`);
    result.steps.newsGathering = true;

    // Step 3b: Get raw aggregated data for validation
    console.log('🔍 Step 3b: Fetching aggregated data for validation...');
    const aggregatedDataPromises = tickers.map(ticker => getRawAggregatedData(ticker));
    const aggregatedDataArray = await Promise.all(aggregatedDataPromises);

    // Create map of ticker -> aggregated data
    const aggregatedDataMap = new Map();
    tickers.forEach((ticker, index) => {
      if (aggregatedDataArray[index]) {
        aggregatedDataMap.set(ticker, aggregatedDataArray[index]);
      }
    });

    console.log(`✅ Aggregated data fetched for validation`);

    // Step 4: AI Analysis for each stock with validation
    console.log('🤖 Step 4: Analyzing stocks with AI (with validation layer)...');
    const analysisPromises = tickers.map(ticker =>
      analyzeStock({
        ticker,
        financialData: financialData[ticker],
        historicalWatchlist: historicalData,
        aggregatedData: aggregatedDataMap.get(ticker), // Pass for validation
      })
    );

    const analyses = await Promise.all(analysisPromises);
    console.log(`✅ AI analysis complete for ${analyses.length} stocks (validated against real data)`);
    result.steps.aiAnalysis = true;

    // Step 5: Validate each analysis (with retry logic)
    console.log('✔️  Step 5: Validating stock analyses...');
    const validatedStocks: ValidatedStock[] = [];
    const failedTickers: string[] = [];

    for (let i = 0; i < analyses.length; i++) {
      const analysis = analyses[i];
      const ticker = tickers[i];

      if (!analysis) {
        console.warn(`⚠️ ${ticker}: Analysis returned null/undefined (AI analysis failed)`);
        failedTickers.push(ticker);
        continue;
      }

      const validated = validateStockAnalysis(analysis);
      if (validated) {
        validatedStocks.push(validated);
        console.log(`✅ ${ticker}: Validation passed`);
      } else {
        console.warn(`⚠️ ${ticker}: Validation failed (missing required fields or quality issues)`);
        failedTickers.push(ticker);
      }
    }

    // Step 5b: Retry failed stocks once
    if (failedTickers.length > 0 && validatedStocks.length < 3) {
      console.log(`🔄 Retrying ${failedTickers.length} failed stock(s): ${failedTickers.join(', ')}`);

      for (const ticker of failedTickers) {
        try {
          console.log(`  Retrying ${ticker}...`);
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

              // Stop retrying once we have 3 stocks
              if (validatedStocks.length >= 3) break;
            } else {
              console.warn(`  ⚠️ ${ticker}: Retry validation failed`);
            }
          } else {
            console.warn(`  ⚠️ ${ticker}: Retry analysis returned null`);
          }
        } catch (error) {
          console.error(`  ❌ ${ticker}: Retry failed with error:`, error);
        }
      }
    }

    if (validatedStocks.length === 0) {
      throw new Error('No valid stock analyses after validation and retry');
    }

    console.log(`✅ ${validatedStocks.length}/${tickers.length} stocks validated successfully (${failedTickers.length} retried)`);
    result.steps.validation = true;

    // Step 6: Inject trend symbols
    console.log('📈 Step 6: Injecting trend symbols...');
    const stocksWithTrends = validatedStocks.map(injectTrendSymbol);
    console.log(`✅ Trend symbols added`);
    result.steps.trendInjection = true;

    // Step 7: Generate BOTH free and premium email content
    console.log('📧 Step 7: Generating email content (free + premium versions)...');

    // Generate premium email (full features)
    const premiumEmail = await generateEmailContent({
      stocks: stocksWithTrends,
      date,
    });

    // Generate free email (stripped-down version)
    const freeEmail = await generateFreeEmail({
      stocks: stocksWithTrends,
      date,
    });

    console.log(`✅ Premium email generated: "${premiumEmail.subject}"`);
    console.log(`✅ Free email generated: "${freeEmail.subject}"`);
    result.steps.emailGeneration = true;

    // Step 8: Send emails to BOTH free and premium subscribers (WITH RETRY)
    console.log('📮 Step 8: Sending emails to subscribers (segmented by tier)...');

    // Send premium email to premium subscribers (with retry)
    let premiumEmailResult = await sendMorningBrief({
      subject: premiumEmail.subject,
      htmlContent: premiumEmail.htmlContent,
      tier: 'premium',
    });

    // Retry premium email once if failed
    if (!premiumEmailResult.success && premiumEmailResult.recipientCount > 0) {
      console.warn('⚠️  Premium email failed, retrying once...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
      premiumEmailResult = await sendMorningBrief({
        subject: premiumEmail.subject,
        htmlContent: premiumEmail.htmlContent,
        tier: 'premium',
      });
    }

    // Send free email to free subscribers (with retry)
    let freeEmailResult = await sendMorningBrief({
      subject: freeEmail.subject,
      htmlContent: freeEmail.htmlContent,
      tier: 'free',
    });

    // Retry free email once if failed
    if (!freeEmailResult.success && freeEmailResult.recipientCount > 0) {
      console.warn('⚠️  Free email failed, retrying once...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
      freeEmailResult = await sendMorningBrief({
        subject: freeEmail.subject,
        htmlContent: freeEmail.htmlContent,
        tier: 'free',
      });
    }

    // Check if ANY emails were sent (some subscribers is better than none)
    const anyEmailsSent = premiumEmailResult.success || freeEmailResult.success;
    const totalEmailsSent = premiumEmailResult.sentCount + freeEmailResult.sentCount;

    if (!anyEmailsSent) {
      // CRITICAL FAILURE: No emails sent at all
      throw new Error('CRITICAL: Failed to send any emails to any subscribers after retry');
    }

    if (!premiumEmailResult.success) {
      console.error(`❌ Premium email failed: ${premiumEmailResult.error}`);
    } else {
      console.log(`✅ Premium email sent to ${premiumEmailResult.sentCount} subscribers`);
    }

    if (!freeEmailResult.success) {
      console.error(`❌ Free email failed: ${freeEmailResult.error}`);
    } else {
      console.log(`✅ Free email sent to ${freeEmailResult.sentCount} subscribers`);
    }

    console.log(`✅ Total emails sent: ${totalEmailsSent}`);

    result.steps.emailSending = anyEmailsSent;
    result.emailsSent = {
      free: freeEmailResult.sentCount,
      premium: premiumEmailResult.sentCount,
      total: totalEmailsSent,
    };

    // Step 9: Store BOTH versions in archive (Supabase) - CRITICAL STEP
    console.log('💾 Step 9: Storing both versions in archive...');
    const archived = await storeInArchive({
      date,
      subject_free: freeEmail.subject,
      subject_premium: premiumEmail.subject,
      html_content_free: freeEmail.htmlContent,
      html_content_premium: premiumEmail.htmlContent,
      tldr: premiumEmail.tldr,
      stocks: stocksWithTrends,
    });

    if (!archived) {
      // CRITICAL FAILURE: Archive storage is mandatory
      throw new Error('CRITICAL: Failed to store brief in archive');
    }

    console.log(`✅ Brief archived successfully`);
    result.steps.archiveStorage = true;

    // STRICT SUCCESS CHECK: All critical steps must pass
    const criticalStepsPassed =
      result.steps.stockDiscovery &&
      result.steps.validation &&
      result.steps.emailGeneration &&
      result.steps.emailSending &&
      result.steps.archiveStorage;

    if (!criticalStepsPassed) {
      throw new Error('CRITICAL: One or more critical steps failed');
    }

    // Calculate execution time
    const executionTimeMs = Date.now() - startTime;

    // Update cron run tracking with SUCCESS
    if (cronRunId) {
      await supabase
        .from('cron_runs')
        .update({
          status: 'success',
          completed_at: new Date().toISOString(),
          steps_completed: result.steps,
          stocks_discovered: tickers.length,
          stocks_validated: validatedStocks.length,
          emails_sent_free: result.emailsSent?.free || 0,
          emails_sent_premium: result.emailsSent?.premium || 0,
          archive_stored: true,
          execution_time_ms: executionTimeMs,
        })
        .eq('id', cronRunId);
    }

    // Prepare final result
    result.success = true;
    result.brief = {
      date,
      subject: premiumEmail.subject, // Use premium subject for result
      htmlContent: premiumEmail.htmlContent, // Use premium content for result
      tldr: premiumEmail.tldr,
      actionableCount: stocksWithTrends.filter(s => {
        const action = s.actionable_insight.toLowerCase();
        return action.includes('buy') || action.includes('potential');
      }).length,
      stocks: stocksWithTrends,
    };

    console.log('🎉 Daily automation completed successfully!');
    console.log(`   Execution time: ${(executionTimeMs / 1000).toFixed(2)}s`);
    console.log(`   Stocks: ${validatedStocks.length} validated`);
    console.log(`   Emails: ${result.emailsSent?.total || 0} sent`);
    console.log(`   Archive: ✅ Stored`);

    return result;
  } catch (error) {
    console.error('❌ Automation failed:', error);
    result.success = false;
    result.error = error instanceof Error ? error.message : 'Unknown error';

    // Calculate execution time even on failure
    const executionTimeMs = Date.now() - startTime;

    // Update cron run tracking with FAILURE
    if (cronRunId) {
      await supabase
        .from('cron_runs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          steps_completed: result.steps,
          error_message: result.error,
          error_details: error instanceof Error ? {
            name: error.name,
            stack: error.stack,
          } : { error },
          execution_time_ms: executionTimeMs,
        })
        .eq('id', cronRunId);
    }

    // Send error notification to admin
    await sendErrorNotification({
      step: 'Daily Automation',
      message: result.error,
      details: error instanceof Error ? {
        name: error.name,
        stack: error.stack,
        steps: result.steps,
      } : { error, steps: result.steps },
      timestamp: new Date(),
    });

    return result;
  }
}

/**
 * Stores BOTH free and premium brief versions in Supabase archive
 * Calls the existing /api/archive/store endpoint
 */
async function storeInArchive(data: {
  date: string;
  subject_free: string;
  subject_premium: string;
  html_content_free: string;
  html_content_premium: string;
  tldr: string;
  stocks: ValidatedStock[];
}): Promise<boolean> {
  try {
    // Map ValidatedStock to archive format
    const archiveStocks = data.stocks.map(stock => ({
      ticker: stock.ticker,
      sector: stock.sector,
      confidence: stock.confidence,
      riskLevel: stock.risk_level,
      action: stock.actionable_insight.toLowerCase().includes('buy')
        ? 'BUY'
        : stock.actionable_insight.toLowerCase().includes('watch')
        ? 'WATCH'
        : stock.actionable_insight.toLowerCase().includes('hold')
        ? 'HOLD'
        : 'WATCH',
      entryPrice: stock.last_price,
      entryZoneLow: parseFloat(stock.ideal_entry_zone.match(/[\d.]+/)?.[0] || '0'),
      entryZoneHigh: parseFloat(stock.ideal_entry_zone.match(/[\d.]+/g)?.[1] || '0'),
      stopLoss: stock.stop_loss,
      profitTarget: stock.profit_target,
      summary: stock.summary,
      whyMatters: stock.why_matters,
      momentumCheck: stock.momentum_check,
      actionableInsight: stock.actionable_insight,
      allocation: stock.suggested_allocation,
      cautionNotes: stock.caution_notes,
      learningMoment: stock.mini_learning_moment,
    }));

    // Call the archive storage endpoint
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/archive/store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: data.date,
        subject_free: data.subject_free,
        subject_premium: data.subject_premium,
        html_content_free: data.html_content_free,
        html_content_premium: data.html_content_premium,
        tldr: data.tldr,
        actionableCount: archiveStocks.filter(s => s.action === 'BUY').length,
        stocks: archiveStocks,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Archive storage failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error storing in archive:', error);
    return false;
  }
}
