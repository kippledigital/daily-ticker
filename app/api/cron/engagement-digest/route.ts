import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { runEngagementDigest } from '@/lib/automation/engagement-digest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Engagement Digest Cron Endpoint
 *
 * Intended to be triggered via Vercel Cron (e.g. weekly).
 * Generates a growth/engagement summary email to the admin inbox.
 */
export async function GET(request: NextRequest) {
  try {
    // STRICT AUTHENTICATION: Only allow Vercel cron or valid Bearer token
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    const vercelProxySignature = request.headers.get('x-vercel-proxy-signature');
    const vercelOidcToken = request.headers.get('x-vercel-oidc-token');
    const userAgent = request.headers.get('user-agent') || '';

    let triggerSource = 'unknown';

    // Option 1: Vercel cron headers
    if (vercelProxySignature || vercelOidcToken || userAgent.includes('vercel-cron')) {
      console.log('✅ Verified Vercel cron job for engagement digest');
      triggerSource = 'vercel-cron';
    }
    // Option 2: Bearer token for manual triggers
    else if (authHeader) {
      if (!cronSecret) {
        console.error('❌ CRON_SECRET not configured but auth header provided');
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
      }

      const expectedHeader = `Bearer ${cronSecret}`;

      if (authHeader.length !== expectedHeader.length) {
        console.warn('⚠️  Invalid auth header length for engagement digest');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      try {
        const authBuffer = Buffer.from(authHeader, 'utf8');
        const expectedBuffer = Buffer.from(expectedHeader, 'utf8');

        if (!timingSafeEqual(authBuffer, expectedBuffer)) {
          console.warn('⚠️  Invalid Bearer token for engagement digest');
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('✅ Verified manual engagement digest trigger with Bearer token');
        triggerSource = 'manual';
      } catch (err) {
        console.error('❌ Error in engagement digest auth verification:', err);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      console.error('❌ No valid authentication for engagement digest endpoint');
      return NextResponse.json(
        {
          error: 'Unauthorized',
          hint: 'Must be triggered by Vercel cron or with valid Bearer token',
        },
        { status: 401 }
      );
    }

    console.log(`🚀 Engagement digest triggered via ${triggerSource}`);

    // Optional: allow overriding period via query param (&days=7)
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');
    const days = daysParam ? Math.max(1, Math.min(30, Number(daysParam) || 7)) : 7;

    const result = await runEngagementDigest(days);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to generate engagement digest',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Engagement digest generated and emailed successfully',
        period: {
          start: result.stats?.periodStart,
          end: result.stats?.periodEnd,
        },
        summary: {
          subscribers: result.stats?.subscriberSummary,
          newSubscribers: result.stats?.newSubscribers,
          unsubscribes: result.stats?.unsubscribes,
          churnedPremium: result.stats?.churnedPremium,
          cronSummary: result.stats?.cronSummary,
          utmSources: result.stats?.utmSources,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error in engagement digest cron endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


