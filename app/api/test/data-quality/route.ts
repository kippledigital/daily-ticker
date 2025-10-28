import { NextRequest, NextResponse } from 'next/server';
import { aggregateStockData } from '@/lib/automation/data-aggregator';

/**
 * Test endpoint for data quality validation
 *
 * Usage:
 * GET /api/test/data-quality?ticker=AAPL
 *
 * Returns complete aggregated data with quality metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');

    if (!ticker) {
      return NextResponse.json(
        { error: 'Missing ticker parameter. Usage: /api/test/data-quality?ticker=AAPL' },
        { status: 400 }
      );
    }

    console.log(`Testing data quality for ${ticker}...`);

    // Fetch aggregated data
    const data = await aggregateStockData(ticker);

    if (!data) {
      return NextResponse.json(
        { error: `No data available for ${ticker}` },
        { status: 404 }
      );
    }

    // Format response for easy reading
    const response = {
      ticker: data.ticker,
      name: data.name,
      timestamp: data.timestamp,

      // Price Validation
      priceValidation: {
        currentPrice: data.price,
        priceSource: data.priceSource,
        priceVerified: data.priceVerified,
        change: data.change,
        changePercent: data.changePercent,
        volume: data.volume,
        dayRange: `$${data.low.toFixed(2)} - $${data.high.toFixed(2)}`,
        fiftyTwoWeekRange: `$${data.fiftyTwoWeekLow.toFixed(2)} - $${data.fiftyTwoWeekHigh.toFixed(2)}`,
      },

      // Fundamentals
      fundamentals: {
        marketCap: `$${(data.marketCap / 1e9).toFixed(2)}B`,
        peRatio: data.peRatio.toFixed(2),
        eps: data.eps.toFixed(2),
        revenue: `$${(data.revenue / 1e9).toFixed(2)}B`,
        profitMargin: `${(data.profitMargin * 100).toFixed(2)}%`,
        dividendYield: data.dividendYield ? `${(data.dividendYield * 100).toFixed(2)}%` : null,
        beta: data.beta?.toFixed(2),
        sector: data.sector,
        industry: data.industry,
      },

      // News & Sentiment
      news: {
        totalArticles: data.news.length,
        overallSentiment: data.overallNewsSentiment,
        recentHeadlines: data.news.slice(0, 3).map(article => ({
          title: article.title,
          source: article.source,
          sentiment: article.sentiment,
          publishedAt: new Date(article.publishedAt).toLocaleDateString(),
        })),
      },

      // Social Sentiment
      socialSentiment: data.socialSentiment ? {
        score: data.socialSentiment.score.toFixed(2),
        trend: data.socialSentiment.trend,
        totalMentions: data.socialSentiment.totalMentions,
        summary: data.socialSentiment.summary,
      } : null,

      // Insider Activity
      insiderActivity: data.insiderActivity ? {
        recentBuys: data.insiderActivity.recentBuys,
        recentSells: data.insiderActivity.recentSells,
        netActivity: data.insiderActivity.netActivity,
      } : null,

      // Analyst Ratings
      analystRatings: data.analystRatings ? {
        strongBuy: data.analystRatings.strongBuy,
        buy: data.analystRatings.buy,
        hold: data.analystRatings.hold,
        sell: data.analystRatings.sell,
        strongSell: data.analystRatings.strongSell,
        consensus: data.analystRatings.consensus,
      } : null,

      // Data Quality Score (MOST IMPORTANT)
      dataQuality: {
        overallScore: data.dataQuality.overallScore,
        scoreBreakdown: {
          priceVerified: data.dataQuality.priceVerified ? '✅ 30/30' : '❌ 0/30',
          fundamentalsComplete: data.dataQuality.fundamentalsComplete ? '✅ 30/30' : '❌ 0/30',
          newsAvailable: data.dataQuality.newsAvailable ? '✅ 20/20' : '❌ 0/20',
          socialDataAvailable: data.dataQuality.socialDataAvailable ? '✅ 20/20' : '❌ 0/20',
        },
        warnings: data.dataQuality.warnings,
        status:
          data.dataQuality.overallScore >= 80 ? '✅ EXCELLENT' :
          data.dataQuality.overallScore >= 70 ? '⚠️ GOOD' :
          data.dataQuality.overallScore >= 50 ? '⚠️ FAIR' :
          '❌ POOR',
      },

      // Sources
      sources: data.sources,

      // Investment Decision Helper
      investmentReady: {
        priceAccurate: data.priceVerified,
        hasFundamentals: data.dataQuality.fundamentalsComplete,
        hasRecentNews: data.news.length >= 3,
        qualityScore: data.dataQuality.overallScore,
        readyToAnalyze: data.dataQuality.overallScore >= 70,
        recommendation:
          data.dataQuality.overallScore >= 80 ? 'Safe to include in daily brief' :
          data.dataQuality.overallScore >= 70 ? 'Include with caution note' :
          data.dataQuality.overallScore >= 50 ? 'Skip or mark as low-confidence' :
          'DO NOT INCLUDE - insufficient data',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in data quality test:', error);
    return NextResponse.json(
      {
        error: 'Failed to test data quality',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
