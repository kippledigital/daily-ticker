import { NextRequest, NextResponse } from 'next/server';
import { runDailyAutomation } from '@/lib/automation/orchestrator';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

/**
 * Manual Test Endpoint for Daily Brief Automation
 *
 * Use this to manually trigger the automation for testing
 * Does NOT require authentication in development
 *
 * Usage:
 * - Development: GET http://localhost:3000/api/manual/test-brief
 * - Production: GET https://dailyticker.co/api/manual/test-brief?key=YOUR_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // In production, require a secret key
    if (process.env.NODE_ENV === 'production') {
      const { searchParams } = new URL(request.url);
      const key = searchParams.get('key');

      if (key !== process.env.MANUAL_TRIGGER_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('🧪 Manual test automation triggered');

    // Run the full automation workflow
    const result = await runDailyAutomation();

    // Return full result for debugging
    return NextResponse.json(
      {
        success: result.success,
        error: result.error,
        brief: result.brief,
        steps: result.steps,
        message: result.success
          ? 'Automation completed successfully'
          : 'Automation failed - see error and steps for details',
      },
      { status: result.success ? 200 : 500 }
    );
  } catch (error) {
    console.error('Error in manual test endpoint:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for testing specific components
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { component, params } = body;

    // Allow testing individual components
    switch (component) {
      case 'stock-discovery':
        const { discoverTrendingStocks } = await import('@/lib/automation/stock-discovery');
        const tickers = await discoverTrendingStocks(params);
        return NextResponse.json({ tickers });

      case 'news-gathering':
        const { gatherFinancialData } = await import('@/lib/automation/news-gatherer');
        const news = await gatherFinancialData(params.ticker);
        return NextResponse.json({ news });

      case 'ai-analysis':
        const { analyzeStock } = await import('@/lib/automation/ai-analyzer');
        const analysis = await analyzeStock(params);
        return NextResponse.json({ analysis });

      case 'email-generation':
        const { generateEmailContent } = await import('@/lib/automation/email-generator');
        const email = await generateEmailContent(params);
        return NextResponse.json({ email });

      case 'twitter-post':
        const { postDailyWatchlist } = await import('@/lib/automation/twitter-poster');
        const posted = await postDailyWatchlist(params.stocks, params.date);
        return NextResponse.json({ posted });

      default:
        return NextResponse.json({ error: 'Unknown component' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in component test:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
