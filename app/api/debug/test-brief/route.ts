import { NextResponse } from 'next/server';
import { discoverTrendingStocks } from '@/lib/automation/stock-discovery';
import { getHistoricalWatchlistData } from '@/lib/automation/historical-data';
import { gatherFinancialDataBatch } from '@/lib/automation/news-gatherer';
import { analyzeStock } from '@/lib/automation/ai-analyzer';
import { validateStockAnalysis } from '@/lib/automation/validator';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Debug endpoint to test the full automation and see detailed validation errors
 */
export async function GET() {
  const logs: string[] = [];

  try {
    logs.push('🚀 Starting test automation...');

    // Step 1: Discover stocks
    logs.push('\n📊 Step 1: Discovering trending stocks...');
    const tickers = await discoverTrendingStocks({
      numberOfTickers: 3,
      focusSectors: ['Technology', 'Healthcare', 'Energy', 'Finance'],
    });
    logs.push(`✅ Discovered: ${tickers.join(', ')}`);

    // Step 2: Get historical data
    logs.push('\n📜 Step 2: Fetching historical data...');
    const historicalData = await getHistoricalWatchlistData();
    logs.push('✅ Historical data retrieved');

    // Step 3: Gather financial data
    logs.push('\n📰 Step 3: Gathering financial data...');
    const { formattedData: financialData, rawData: aggregatedDataMap } = await gatherFinancialDataBatch(tickers);
    logs.push(`✅ Financial data gathered for ${tickers.length} tickers`);

    // Step 4: AI Analysis
    logs.push('\n🤖 Step 4: Analyzing stocks with AI...');
    const analysisPromises = tickers.map(ticker =>
      analyzeStock({
        ticker,
        financialData: financialData[ticker] || `Limited data available for ${ticker}`,
        historicalWatchlist: historicalData,
        aggregatedData: aggregatedDataMap[ticker] || null,
      })
    );
    const analyses = await Promise.all(analysisPromises);
    logs.push(`✅ AI analysis complete for ${analyses.length} stocks`);

    // Step 5: Validate and capture detailed errors
    logs.push('\n✔️  Step 5: Validating stock analyses...');
    const validationResults = [];

    for (let i = 0; i < analyses.length; i++) {
      const analysis = analyses[i];
      const ticker = tickers[i];

      if (!analysis) {
        validationResults.push({
          ticker,
          valid: false,
          error: 'AI analysis returned null/undefined',
          rawResponse: null
        });
        continue;
      }

      const validated = validateStockAnalysis(analysis);

      if (validated) {
        validationResults.push({
          ticker,
          valid: true,
          data: validated
        });
      } else {
        // Capture detailed information about why it failed
        validationResults.push({
          ticker,
          valid: false,
          error: 'Validation failed - see rawResponse for details',
          rawResponse: analysis,
          rawResponseSample: JSON.stringify(analysis).substring(0, 1000)
        });
      }
    }

    // Return detailed results
    return NextResponse.json({
      success: true,
      logs: logs.join('\n'),
      validationResults,
      summary: {
        totalStocks: tickers.length,
        validStocks: validationResults.filter(r => r.valid).length,
        invalidStocks: validationResults.filter(r => !r.valid).length
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      logs: logs.join('\n')
    }, { status: 500 });
  }
}
