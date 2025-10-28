import { NextRequest, NextResponse } from 'next/server';
import { discoverTrendingStocks } from '@/lib/automation/stock-discovery';
import { gatherFinancialDataBatch, getRawAggregatedData } from '@/lib/automation/news-gatherer';
import { analyzeStock } from '@/lib/automation/ai-analyzer';
import { validateStockAnalysis } from '@/lib/automation/validator';
import { injectTrendSymbol } from '@/lib/automation/trend-injector';

/**
 * Test endpoint for full automation pipeline
 *
 * Usage:
 * GET /api/test/full-pipeline?tickers=AAPL,NVDA,MSFT
 * GET /api/test/full-pipeline (uses stock discovery to find 3 tickers)
 *
 * Tests the complete workflow from discovery to validated analysis
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tickersParam = searchParams.get('tickers');

    let tickers: string[];

    if (tickersParam) {
      // Manual tickers provided
      tickers = tickersParam.split(',').map(t => t.trim().toUpperCase());
      console.log(`Testing with manual tickers: ${tickers.join(', ')}`);
    } else {
      // Use stock discovery
      console.log('Testing stock discovery...');
      tickers = await discoverTrendingStocks({
        numberOfTickers: 3,
        focusSectors: ['Technology', 'Healthcare', 'Energy', 'Finance'],
      });
      console.log(`Discovered tickers: ${tickers.join(', ')}`);
    }

    if (tickers.length === 0) {
      return NextResponse.json(
        { error: 'No tickers found' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const results = [];

    // Process each ticker through the full pipeline
    for (const ticker of tickers) {
      console.log(`\n=== Processing ${ticker} ===`);
      const tickerStartTime = Date.now();

      try {
        // Step 1: Gather financial data
        const financialData = await gatherFinancialDataBatch([ticker]);
        console.log(`✅ Financial data gathered for ${ticker}`);

        // Step 2: Get aggregated data for validation
        const aggregatedData = await getRawAggregatedData(ticker);
        console.log(`✅ Aggregated data fetched for ${ticker}`);

        if (!aggregatedData) {
          results.push({
            ticker,
            status: 'FAILED',
            error: 'No aggregated data available',
          });
          continue;
        }

        // Step 3: AI Analysis with validation
        const analysis = await analyzeStock({
          ticker,
          financialData: financialData[ticker],
          historicalWatchlist: 'No historical data (test mode)',
          aggregatedData, // Enables validation
        });
        console.log(`✅ AI analysis complete for ${ticker}`);

        if (!analysis) {
          results.push({
            ticker,
            status: 'FAILED',
            error: 'AI analysis failed',
          });
          continue;
        }

        // Step 4: Validation
        const validated = validateStockAnalysis(analysis);
        console.log(`✅ Validation complete for ${ticker}`);

        if (!validated) {
          results.push({
            ticker,
            status: 'FAILED',
            error: 'Failed validation check',
          });
          continue;
        }

        // Step 5: Trend injection
        const withTrend = injectTrendSymbol(validated);
        console.log(`✅ Trend symbol injected for ${ticker}`);

        // Calculate processing time
        const processingTime = Date.now() - tickerStartTime;

        // Build result
        results.push({
          ticker,
          status: 'SUCCESS',
          processingTime: `${(processingTime / 1000).toFixed(2)}s`,

          dataQuality: {
            score: aggregatedData.dataQuality.overallScore,
            priceVerified: aggregatedData.priceVerified,
            warnings: aggregatedData.dataQuality.warnings,
          },

          analysis: {
            price: withTrend.last_price,
            confidence: withTrend.confidence,
            riskLevel: withTrend.risk_level,
            sector: withTrend.sector,
            summary: withTrend.summary,
            momentumCheck: withTrend.momentum_check,
            actionableInsight: withTrend.actionable_insight,
          },

          validation: {
            priceMatchesReal: Math.abs(withTrend.last_price - aggregatedData.price) / aggregatedData.price < 0.02,
            confidenceAdjustedForQuality: aggregatedData.dataQuality.overallScore < 70
              ? withTrend.confidence <= 75
              : true,
            hasSocialSentiment: withTrend.why_trust.toLowerCase().includes('social'),
            hasAnalystRatings: withTrend.why_trust.toLowerCase().includes('analyst'),
            hasInsiderWarnings: withTrend.caution_notes.toLowerCase().includes('insider'),
          },

          recommendation:
            aggregatedData.dataQuality.overallScore >= 80 && withTrend.confidence >= 70
              ? '✅ SAFE TO USE'
              : aggregatedData.dataQuality.overallScore >= 70
                ? '⚠️ USE WITH CAUTION'
                : '❌ DO NOT USE',
        });
      } catch (error) {
        results.push({
          ticker,
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const totalTime = Date.now() - startTime;

    const response = {
      timestamp: new Date().toISOString(),
      totalProcessingTime: `${(totalTime / 1000).toFixed(2)}s`,
      tickersProcessed: tickers.length,
      successful: results.filter(r => r.status === 'SUCCESS').length,
      failed: results.filter(r => r.status !== 'SUCCESS').length,
      results,

      summary: {
        averageDataQuality: results
          .filter(r => r.status === 'SUCCESS')
          .reduce((sum, r: any) => sum + r.dataQuality.score, 0) /
          Math.max(results.filter(r => r.status === 'SUCCESS').length, 1),
        averageConfidence: results
          .filter(r => r.status === 'SUCCESS')
          .reduce((sum, r: any) => sum + r.analysis.confidence, 0) /
          Math.max(results.filter(r => r.status === 'SUCCESS').length, 1),
        priceVerificationRate: `${(results.filter((r: any) => r.status === 'SUCCESS' && r.dataQuality.priceVerified).length / Math.max(results.filter(r => r.status === 'SUCCESS').length, 1) * 100).toFixed(0)}%`,
        socialSentimentCoverage: `${(results.filter((r: any) => r.status === 'SUCCESS' && r.validation.hasSocialSentiment).length / Math.max(results.filter(r => r.status === 'SUCCESS').length, 1) * 100).toFixed(0)}%`,
        analystCoverage: `${(results.filter((r: any) => r.status === 'SUCCESS' && r.validation.hasAnalystRatings).length / Math.max(results.filter(r => r.status === 'SUCCESS').length, 1) * 100).toFixed(0)}%`,
      },

      pipelineStatus:
        results.filter(r => r.status === 'SUCCESS').length === tickers.length
          ? '✅ ALL PASSED'
          : results.filter(r => r.status === 'SUCCESS').length > 0
            ? '⚠️ PARTIAL SUCCESS'
            : '❌ ALL FAILED',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in full pipeline test:', error);
    return NextResponse.json(
      {
        error: 'Failed to test full pipeline',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
