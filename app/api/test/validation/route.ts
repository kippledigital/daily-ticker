import { NextRequest, NextResponse } from 'next/server';
import { getRawAggregatedData } from '@/lib/automation/news-gatherer';
import { analyzeStock } from '@/lib/automation/ai-analyzer';

/**
 * Test endpoint for AI validation layer
 *
 * Usage:
 * GET /api/test/validation?ticker=AAPL
 *
 * Tests the AI analyzer with validation against real data
 * Shows before/after validation adjustments
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');

    if (!ticker) {
      return NextResponse.json(
        { error: 'Missing ticker parameter. Usage: /api/test/validation?ticker=AAPL' },
        { status: 400 }
      );
    }

    console.log(`Testing AI validation for ${ticker}...`);

    // Step 1: Get aggregated data
    const aggregatedData = await getRawAggregatedData(ticker);

    if (!aggregatedData) {
      return NextResponse.json(
        { error: `No aggregated data available for ${ticker}` },
        { status: 404 }
      );
    }

    // Step 2: Format data for AI (same as news-gatherer does)
    const financialDataSummary = formatDataSummaryForAI(aggregatedData);

    // Step 3: Run AI analysis WITH validation
    const analysisWithValidation = await analyzeStock({
      ticker,
      financialData: financialDataSummary,
      historicalWatchlist: 'No historical data (test mode)',
      aggregatedData, // Enables validation
    });

    if (!analysisWithValidation) {
      return NextResponse.json(
        { error: 'AI analysis failed' },
        { status: 500 }
      );
    }

    // Step 4: Run AI analysis WITHOUT validation (for comparison)
    const analysisWithoutValidation = await analyzeStock({
      ticker,
      financialData: financialDataSummary,
      historicalWatchlist: 'No historical data (test mode)',
      // No aggregatedData = no validation
    });

    // Format response
    const response = {
      ticker,
      timestamp: new Date().toISOString(),

      // Real Data (Ground Truth)
      realData: {
        price: aggregatedData.price,
        priceVerified: aggregatedData.priceVerified,
        volume: aggregatedData.volume,
        sector: aggregatedData.sector,
        peRatio: aggregatedData.peRatio,
        marketCap: aggregatedData.marketCap,
        dataQualityScore: aggregatedData.dataQuality.overallScore,
        warnings: aggregatedData.dataQuality.warnings,
      },

      // AI Analysis WITHOUT Validation
      aiWithoutValidation: analysisWithoutValidation ? {
        price: analysisWithoutValidation.last_price,
        volume: analysisWithoutValidation.avg_volume,
        sector: analysisWithoutValidation.sector,
        confidence: analysisWithoutValidation.confidence,
        riskLevel: analysisWithoutValidation.risk_level,
      } : null,

      // AI Analysis WITH Validation
      aiWithValidation: {
        price: analysisWithValidation.last_price,
        volume: analysisWithValidation.avg_volume,
        sector: analysisWithValidation.sector,
        confidence: analysisWithValidation.confidence,
        riskLevel: analysisWithValidation.risk_level,
        whyTrust: analysisWithValidation.why_trust,
        cautionNotes: analysisWithValidation.caution_notes,
      },

      // Validation Impact
      validationImpact: {
        priceAdjusted: analysisWithoutValidation
          ? analysisWithoutValidation.last_price !== analysisWithValidation.last_price
          : null,
        priceDifference: analysisWithoutValidation
          ? `$${(analysisWithValidation.last_price - analysisWithoutValidation.last_price).toFixed(2)}`
          : null,
        confidenceAdjusted: analysisWithoutValidation
          ? analysisWithoutValidation.confidence !== analysisWithValidation.confidence
          : null,
        confidenceDifference: analysisWithoutValidation
          ? analysisWithValidation.confidence - analysisWithoutValidation.confidence
          : null,
        riskLevelAdjusted: analysisWithoutValidation
          ? analysisWithoutValidation.risk_level !== analysisWithValidation.risk_level
          : null,
        socialSentimentAdded: analysisWithValidation.why_trust.toLowerCase().includes('social'),
        analystRatingsAdded: analysisWithValidation.why_trust.toLowerCase().includes('analyst'),
        insiderWarningAdded: analysisWithValidation.caution_notes.toLowerCase().includes('insider'),
      },

      // Quality Assessment
      qualityAssessment: {
        dataQualityScore: aggregatedData.dataQuality.overallScore,
        finalConfidence: analysisWithValidation.confidence,
        confidenceAdjustedForQuality:
          aggregatedData.dataQuality.overallScore < 70
            ? analysisWithValidation.confidence <= 75
            : true,
        priceMatchesRealData:
          Math.abs(analysisWithValidation.last_price - aggregatedData.price) / aggregatedData.price < 0.02,
        validationWorking:
          Math.abs(analysisWithValidation.last_price - aggregatedData.price) / aggregatedData.price < 0.02
            ? '✅ PASS - Price matches real data'
            : '❌ FAIL - Price still incorrect',
      },

      // Recommendation
      recommendation:
        aggregatedData.dataQuality.overallScore >= 80 && analysisWithValidation.confidence >= 70
          ? '✅ SAFE TO USE - High quality data + confident analysis'
          : aggregatedData.dataQuality.overallScore >= 70
            ? '⚠️ USE WITH CAUTION - Good data quality, include disclaimer'
            : '❌ DO NOT USE - Low data quality or low confidence',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in validation test:', error);
    return NextResponse.json(
      {
        error: 'Failed to test validation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Quick data summary formatter for AI (simplified version)
 */
function formatDataSummaryForAI(data: any): string {
  return `
${data.name} (${data.ticker}) - ${data.sector}
Price: $${data.price.toFixed(2)} | Change: ${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%
Market Cap: $${(data.marketCap / 1e9).toFixed(2)}B | P/E: ${data.peRatio.toFixed(2)}
Volume: ${data.volume.toLocaleString()}
Recent News: ${data.news.slice(0, 3).map((n: any) => n.title).join(' | ')}
Overall Sentiment: ${data.overallNewsSentiment}
${data.socialSentiment ? `Social Sentiment: ${data.socialSentiment.summary}` : ''}
${data.analystRatings ? `Analyst Consensus: ${data.analystRatings.consensus}` : ''}
Data Quality: ${data.dataQuality.overallScore}/100
`.trim();
}
