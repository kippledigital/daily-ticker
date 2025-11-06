import { NextRequest, NextResponse } from 'next/server';
import { runDailyAutomation } from '@/lib/automation/orchestrator';

export const runtime = 'nodejs'; // Use Node.js runtime for cron jobs
export const maxDuration = 300; // 5 minutes max (Vercel Pro allows up to 5 min)
export const dynamic = 'force-dynamic'; // Prevent static rendering

/**
 * Daily Brief Automation Cron Endpoint
 *
 * Runs automatically via Vercel Cron (configured in vercel.json)
 * Schedule: Monday-Friday at 8:00 AM EST (1:00 PM UTC)
 *
 * Can also be manually triggered with proper authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Daily automation triggered via cron');

    // Run the full automation workflow
    const result = await runDailyAutomation();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          steps: result.steps,
        },
        { status: 500 }
      );
    }

    // Return success with summary
    return NextResponse.json(
      {
        success: true,
        message: 'Daily automation completed successfully',
        brief: {
          date: result.brief?.date,
          subject: result.brief?.subject,
          stockCount: result.brief?.stocks.length,
          actionableCount: result.brief?.actionableCount,
        },
        steps: result.steps,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in cron endpoint:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
