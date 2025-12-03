import { NextRequest, NextResponse } from 'next/server';
import { generateEmailContentLightPreview } from '@/lib/automation/email-generator';
import { sendTestEmail } from '@/lib/automation/email-sender';
import { ValidatedStock } from '@/types/automation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Test endpoint to preview a LIGHT THEME version of the premium brief.
 *
 * Usage (development):
 *   GET /api/test/light-pro-email?email=you@example.com
 *
 * This does NOT affect production sends – it only sends a single test email
 * using sample stock data so you can review how the light theme renders
 * (especially on iOS Mail).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        {
          error: 'Missing email parameter',
          usage: '/api/test/light-pro-email?email=you@example.com',
        },
        { status: 400 }
      );
    }

    // Basic email format validation (same as other test routes)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Lightweight, realistic sample data (no live API calls needed)
    const stocks: ValidatedStock[] = [
      {
        ticker: 'NVDA',
        sector: 'Technology',
        last_price: 177,
        stop_loss: 162.84,
        profit_target: 205.32,
        confidence: 78,
        risk_level: 'Medium',
        summary: 'Leading designer of GPUs critical for AI and gaming.',
        why_matters: 'AI demand and data-center growth keep NVDA in focus.',
        momentum_check: 'Cooling slightly after a strong multi-week run.',
        actionable_insight: 'Watch for pullbacks toward support before adding.',
        suggested_allocation: '6% of portfolio',
        why_trust: 'Consistent earnings beats and strong AI tailwinds.',
        caution_notes: 'High valuation and sector volatility.',
        ideal_entry_zone: '$170–$175',
        mini_learning_moment: 'How AI chip demand influences semiconductor stocks.',
        avg_volume: 0, // Not used in email, safe placeholder
        trend_symbol: '📈',
      },
      {
        ticker: 'ABBV',
        sector: 'Healthcare',
        last_price: 229.51,
        stop_loss: 211.15,
        profit_target: 266.23,
        confidence: 72,
        risk_level: 'Medium',
        summary: 'Pharma company focused on advanced therapies.',
        why_matters: 'Trading near 52-week highs with recent pullback.',
        momentum_check: 'Cooling off after a strong advance.',
        actionable_insight: 'Consider as a watchlist name on deeper dips.',
        suggested_allocation: '5% of portfolio',
        why_trust: 'Diversified drug pipeline and solid cash flows.',
        caution_notes: 'Pipeline and patent risks can create volatility.',
        ideal_entry_zone: '$220–$225',
        mini_learning_moment: 'How dividend stocks can cushion volatility.',
        avg_volume: 0,
        trend_symbol: '→',
      },
    ];

    const date = new Date().toISOString();

    const generated = await generateEmailContentLightPreview({
      stocks,
      date,
    });

    const result = await sendTestEmail({
      testEmail: email,
      subject: generated.subject,
      htmlContent: generated.htmlContent,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send light-theme test email',
          details: result.errorDetails,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Light-theme premium test email sent to ${email}`,
        emailId: result.emailId,
        note: 'This uses sample NVDA/ABBV data and only sends to the specified address.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in light-pro-email test route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


