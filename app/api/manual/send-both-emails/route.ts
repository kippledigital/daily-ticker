import { NextRequest, NextResponse } from 'next/server';
import { sendMorningBrief } from '@/lib/automation/email-sender';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Manual endpoint to send both free and premium emails for today's brief
 * 
 * Usage: GET /api/manual/send-both-emails
 */
export async function GET(request: NextRequest) {
  try {
    const date = new Date().toISOString().split('T')[0];
    console.log(`📧 Manual send both emails triggered for ${date}`);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get today's brief
    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .select('*')
      .eq('date', date)
      .single();

    if (briefError || !brief) {
      return NextResponse.json(
        {
          error: 'No brief found for today. Please run automation first.',
          date,
        },
        { status: 404 }
      );
    }

    // Get subscriber counts
    const { data: freeSubscribers } = await supabase
      .from('subscribers')
      .select('email')
      .eq('status', 'active')
      .eq('tier', 'free');

    const { data: premiumSubscribers } = await supabase
      .from('subscribers')
      .select('email')
      .eq('status', 'active')
      .eq('tier', 'premium');

    const freeCount = freeSubscribers?.length || 0;
    const premiumCount = premiumSubscribers?.length || 0;

    console.log(`Found ${freeCount} free and ${premiumCount} premium subscribers`);

    // Send free email
    const freeEmailSent = await sendMorningBrief({
      subject: brief.subject_free || brief.subject,
      htmlContent: brief.html_content_free || brief.html_content,
      tier: 'free',
    });

    // Send premium email
    const premiumEmailSent = await sendMorningBrief({
      subject: brief.subject_premium || brief.subject_free || brief.subject,
      htmlContent: brief.html_content_premium || brief.html_content_free || brief.html_content,
      tier: 'premium',
    });

    return NextResponse.json({
      success: freeEmailSent && premiumEmailSent,
      freeEmail: {
        sent: freeEmailSent,
        subscriberCount: freeCount,
      },
      premiumEmail: {
        sent: premiumEmailSent,
        subscriberCount: premiumCount,
      },
      message: freeEmailSent && premiumEmailSent
        ? 'Both emails sent successfully'
        : `Free: ${freeEmailSent ? '✅' : '❌'}, Premium: ${premiumEmailSent ? '✅' : '❌'}`,
      date,
    });
  } catch (error) {
    console.error('Error sending both emails:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

