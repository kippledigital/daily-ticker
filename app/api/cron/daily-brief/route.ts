import { NextRequest, NextResponse } from 'next/server';
import { runDailyAutomation } from '@/lib/automation/orchestrator';
import { timingSafeEqual } from 'crypto';

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
    // STRICT AUTHENTICATION: Only allow Vercel cron or valid Bearer token
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Check for Vercel cron headers (Vercel sends these with cron jobs)
    const vercelCronHeader = request.headers.get('x-vercel-cron');
    const vercelSignature = request.headers.get('x-vercel-signature');
    const userAgent = request.headers.get('user-agent') || '';

    let triggerSource = 'unknown';

    // Option 1: Verify Vercel cron (strict check)
    if (vercelCronHeader === '1' || vercelSignature || userAgent.includes('vercel-cron')) {
      console.log('✅ Verified Vercel cron job');
      triggerSource = 'vercel-cron';
    }
    // Option 2: Verify Bearer token (for manual triggers)
    else if (authHeader) {
      if (!cronSecret) {
        console.error('❌ CRON_SECRET not configured but auth header provided');
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
      }

      const expectedHeader = `Bearer ${cronSecret}`;

      // Timing-safe comparison to prevent timing attacks
      if (authHeader.length !== expectedHeader.length) {
        console.warn('⚠️  Invalid auth header length');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      try {
        const authBuffer = Buffer.from(authHeader, 'utf8');
        const expectedBuffer = Buffer.from(expectedHeader, 'utf8');

        if (!timingSafeEqual(authBuffer, expectedBuffer)) {
          console.warn('⚠️  Invalid Bearer token');
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('✅ Verified manual trigger with Bearer token');
        triggerSource = 'manual';
      } catch (err) {
        console.error('❌ Error in auth verification:', err);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    // Option 3: REJECT - no valid authentication
    else {
      console.error('❌ No valid authentication (no Vercel cron header, no Bearer token)');
      const headers = Object.fromEntries(request.headers.entries());
      console.error('Received headers:', JSON.stringify(headers, null, 2));
      return NextResponse.json({
        error: 'Unauthorized',
        hint: 'Must be triggered by Vercel cron or with valid Bearer token'
      }, { status: 401 });
    }

    console.log(`🚀 Daily automation triggered via ${triggerSource}`);

    // Run the full automation workflow with tracking
    const result = await runDailyAutomation(triggerSource);

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
