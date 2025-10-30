import { AutomationResult, ValidatedStock } from '@/types/automation';
import { discoverTrendingStocks } from './stock-discovery';
import { getHistoricalWatchlistData } from './historical-data';
import { gatherFinancialDataBatch, getRawAggregatedData } from './news-gatherer';
import { analyzeStock } from './ai-analyzer';
import { validateStockAnalysis } from './validator';
import { injectTrendSymbol } from './trend-injector';
import { generateEmailContent } from './email-generator';
import { sendMorningBrief } from './email-sender';

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
 */
export async function runDailyAutomation(): Promise<AutomationResult> {
  const result: AutomationResult = {
    success: false,
    steps: {},
  };

  try {
    console.log('🚀 Starting daily automation...');

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

    // Step 5: Validate each analysis
    console.log('✔️  Step 5: Validating stock analyses...');
    const validatedStocks: ValidatedStock[] = [];

    for (const analysis of analyses) {
      if (analysis) {
        const validated = validateStockAnalysis(analysis);
        if (validated) {
          validatedStocks.push(validated);
        }
      }
    }

    if (validatedStocks.length === 0) {
      throw new Error('No valid stock analyses after validation');
    }

    console.log(`✅ ${validatedStocks.length} stocks validated successfully`);
    result.steps.validation = true;

    // Step 6: Inject trend symbols
    console.log('📈 Step 6: Injecting trend symbols...');
    const stocksWithTrends = validatedStocks.map(injectTrendSymbol);
    console.log(`✅ Trend symbols added`);
    result.steps.trendInjection = true;

    // Step 7: Generate email content
    console.log('📧 Step 7: Generating email content...');
    const date = new Date().toISOString().split('T')[0];

    const emailContent = await generateEmailContent({
      stocks: stocksWithTrends,
      date,
    });

    console.log(`✅ Email generated with subject: "${emailContent.subject}"`);
    result.steps.emailGeneration = true;

    // Step 8: Send email to subscribers
    console.log('📮 Step 8: Sending email to subscribers...');
    const emailSent = await sendMorningBrief({
      subject: emailContent.subject,
      htmlContent: emailContent.htmlContent,
    });

    if (!emailSent) {
      console.warn('⚠️  Email sending failed, continuing with other steps...');
    } else {
      console.log(`✅ Email sent successfully`);
    }

    result.steps.emailSending = emailSent;

    // Step 9: Store in archive (Supabase)
    console.log('💾 Step 9: Storing in archive...');
    const archived = await storeInArchive({
      date,
      subject: emailContent.subject,
      htmlContent: emailContent.htmlContent,
      tldr: emailContent.tldr,
      stocks: stocksWithTrends,
    });

    if (!archived) {
      console.warn('⚠️  Archive storage failed');
    } else {
      console.log(`✅ Brief archived successfully`);
    }

    result.steps.archiveStorage = archived;

    // Prepare final result
    result.success = true;
    result.brief = {
      date,
      subject: emailContent.subject,
      htmlContent: emailContent.htmlContent,
      tldr: emailContent.tldr,
      actionableCount: stocksWithTrends.filter(s => {
        const action = s.actionable_insight.toLowerCase();
        return action.includes('buy') || action.includes('potential');
      }).length,
      stocks: stocksWithTrends,
    };

    console.log('🎉 Daily automation completed successfully!');
    return result;
  } catch (error) {
    console.error('❌ Automation failed:', error);
    result.success = false;
    result.error = error instanceof Error ? error.message : 'Unknown error';
    return result;
  }
}

/**
 * Stores brief in Supabase archive
 * Calls the existing /api/archive/store endpoint
 */
async function storeInArchive(data: {
  date: string;
  subject: string;
  htmlContent: string;
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
        subject: data.subject,
        htmlContent: data.htmlContent,
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
