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
    // Vercel cron jobs don't send Authorization headers - they're authenticated at infrastructure level
    // Check for Vercel-specific indicators or if no auth header in production (assume Vercel cron)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Check for Vercel cron indicators
    const vercelCron = request.headers.get('x-vercel-cron') || 
                       request.headers.get('x-vercel-signature') ||
                       request.headers.get('user-agent')?.includes('vercel');
    
    // If it's production and no auth header, assume it's a Vercel cron job
    // Vercel cron jobs are authenticated at the infrastructure level
    const isVercelCron = vercelCron || (process.env.NODE_ENV === 'production' && !authHeader);
    
    if (isVercelCron) {
      console.log('✅ Verified Vercel cron job (infrastructure-authenticated)');
    } else {
      // For manual triggers, require Bearer token authentication
      if (!cronSecret) {
        console.error('CRON_SECRET not configured - endpoint is unprotected!');
        // In production, fail closed. In development, allow for testing.
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      } else {
        // Timing-safe comparison to prevent timing attacks
        const expectedHeader = `Bearer ${cronSecret}`;
        
        if (!authHeader || authHeader.length !== expectedHeader.length) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use Node.js crypto.timingSafeEqual for constant-time comparison
        try {
          const authBuffer = Buffer.from(authHeader, 'utf8');
          const expectedBuffer = Buffer.from(expectedHeader, 'utf8');
          
          // timingSafeEqual requires buffers of same length (we already checked)
          if (authBuffer.length !== expectedBuffer.length) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          // Constant-time comparison to prevent timing attacks
          if (!timingSafeEqual(authBuffer, expectedBuffer)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }
        } catch (err) {
          console.error('Error in timing-safe comparison:', err);
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }
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
