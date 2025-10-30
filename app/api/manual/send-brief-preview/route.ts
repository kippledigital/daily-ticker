import { NextRequest, NextResponse } from 'next/server';
import { generateEmailContent } from '@/lib/automation/email-generator';
import type { ValidatedStock } from '@/types/automation';

/**
 * Manual endpoint to send a preview of the daily brief email
 * Uses sample stock data to show the new branded email design
 *
 * Usage: GET /api/manual/send-brief-preview?email=your@email.com
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipientEmail = searchParams.get('email');

    if (!recipientEmail) {
      return NextResponse.json(
        {
          error: 'Missing email parameter',
          usage: '/api/manual/send-brief-preview?email=your@email.com',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    console.log(`Generating branded email preview for ${recipientEmail}...`);

    // Sample validated stocks with realistic data
    const sampleStocks: ValidatedStock[] = [
      {
        ticker: 'NVDA',
        sector: 'TECHNOLOGY',
        last_price: 207.04,
        stop_loss: 190.48,
        profit_target: 240.16,
        confidence: 85,
        risk_level: 'Medium',
        summary: 'NVDA showing strong momentum after positive AI chip demand outlook from major cloud providers.',
        why_matters: 'AI infrastructure spending remains robust. NVDA dominates the GPU market for training large language models.',
        momentum_check: 'Trading above 50-day MA with increasing volume. RSI at 62 (healthy uptrend, not overbought).',
        actionable_insight: 'Consider scaling in on dips near $200 support. Set stop loss below $190 to protect downside.',
        suggested_allocation: '3-5% of portfolio (medium conviction)',
        why_trust: 'Cross-verified pricing from 3 sources. High data quality score (88/100). Strong insider buying last quarter.',
        caution_notes: 'Semiconductor sector can be volatile. Watch for any China export restriction news.',
        ideal_entry_zone: '$200-205 range offers good risk/reward',
        mini_learning_moment: 'GPU (Graphics Processing Unit) chips are essential for AI training. Think of them as specialized calculators that can do millions of math operations simultaneously.',
        data_quality_score: 88,
        validation_flags: [],
      },
      {
        ticker: 'MSFT',
        sector: 'TECHNOLOGY',
        last_price: 541.55,
        stop_loss: 497.82,
        profit_target: 628.99,
        confidence: 78,
        risk_level: 'Low',
        summary: 'Microsoft continues steady growth driven by Azure cloud revenue and AI integration across products.',
        why_matters: 'MSFT is a safe, dividend-paying tech giant. Azure growing 30% YoY. Copilot adoption accelerating in enterprise.',
        momentum_check: 'Consolidating after recent highs. Volume is average. Good time to accumulate on weakness.',
        actionable_insight: 'Long-term hold. Consider adding on any dip below $530. Dividend yield provides downside cushion.',
        suggested_allocation: '5-8% of portfolio (high conviction, lower risk)',
        why_trust: 'Fundamentals verified across Alpha Vantage and Finnhub. Consistent analyst upgrades. P/E of 35 is reasonable for growth.',
        caution_notes: 'Large cap means slower growth. Regulatory scrutiny on AI partnerships.',
        ideal_entry_zone: '$530-540 is attractive for long-term investors',
        mini_learning_moment: 'P/E Ratio (Price-to-Earnings) shows how much investors pay per dollar of earnings. Lower is cheaper, but growth stocks often have higher P/E ratios.',
        data_quality_score: 92,
        validation_flags: [],
      },
      {
        ticker: 'AMD',
        sector: 'TECHNOLOGY',
        last_price: 165.43,
        stop_loss: 152.09,
        profit_target: 192.10,
        confidence: 72,
        risk_level: 'Medium',
        summary: 'AMD gaining market share in datacenter CPUs and launching competitive AI accelerators.',
        why_matters: 'NVDA competitor with better value proposition. MI300 chip showing promise in AI workloads.',
        momentum_check: 'Recent pullback creating entry opportunity. Support holding at $160. Watch for bounce.',
        actionable_insight: 'Wait for confirmation above $168 before entering. Or nibble at $160 support level.',
        suggested_allocation: '2-4% of portfolio (speculative, higher risk)',
        why_trust: 'Data quality good (82/100). Recent analyst conference highlighted strong product roadmap.',
        caution_notes: 'Trailing NVDA in AI chip race. Execution risk on new product launches.',
        ideal_entry_zone: '$160-165 offers good risk/reward for patient investors',
        mini_learning_moment: 'Market share matters in tech. Even if a company is #2, winning customers from the leader (like AMD vs Intel) can drive explosive growth.',
        data_quality_score: 82,
        validation_flags: [],
      },
    ];

    // Generate email content using the new branded template
    const today = new Date().toISOString().split('T')[0];
    const emailContent = await generateEmailContent({
      stocks: sampleStocks,
      date: today,
    });

    console.log('Email content generated:', {
      subject: emailContent.subject,
      contentLength: emailContent.htmlContent.length,
    });

    // Send email to recipient using Resend
    const Resend = (await import('resend')).Resend;
    const resend = new Resend(process.env.RESEND_API_KEY);

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'brief@dailyticker.co';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [recipientEmail],
      subject: `${emailContent.subject} (Preview)`,
      html: emailContent.htmlContent,
    });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send preview email',
          details: error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Branded email preview sent to ${recipientEmail}`,
      subject: emailContent.subject,
      stocksIncluded: sampleStocks.map(s => s.ticker),
      emailId: data?.id,
      note: 'This preview shows the new Daily Ticker branded design with sample stock analysis.',
    });
  } catch (error) {
    console.error('Error generating email preview:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate email preview',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
