import { NextRequest, NextResponse } from 'next/server';
import { sendMorningBrief } from '@/lib/automation/email-sender';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Manual endpoint to send today's premium brief to premium subscribers
 * 
 * Usage: 
 * - GET /api/manual/send-premium-brief (sends to all premium subscribers)
 * - GET /api/manual/send-premium-brief?email=your@email.com (sends to specific email)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const specificEmail = searchParams.get('email');
  try {
    console.log('📧 Manual premium brief send triggered');

    // Get today's date
    const date = new Date().toISOString().split('T')[0];

    // Get the latest brief from archive (today's brief)
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Try to find today's brief
    const { data: archiveData, error: archiveError } = await supabase
      .from('briefs')
      .select('*')
      .eq('date', date)
      .single();

    // If not found, try to get the most recent brief
    if (archiveError || !archiveData) {
      console.log('No brief found for today, checking for most recent brief...');
      const { data: recentBrief } = await supabase
        .from('briefs')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (!recentBrief) {
        return NextResponse.json(
          {
            error: 'No brief found in archive. Please run the automation first.',
            date,
            archiveError: archiveError?.message,
          },
          { status: 404 }
        );
      }

      // Use the most recent brief
      console.log(`Using most recent brief from ${recentBrief.date}`);
      const briefToUse = recentBrief;
      
      // Send premium email using the most recent brief
      const premiumEmailSent = await sendMorningBrief({
        subject: briefToUse.subject_premium || briefToUse.subject_free || briefToUse.subject,
        htmlContent: briefToUse.html_content_premium || briefToUse.html_content_free || briefToUse.html_content,
        tier: specificEmail ? undefined : 'premium',
        to: specificEmail ? [specificEmail] : undefined,
      });

      if (!premiumEmailSent) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to send premium email. Check logs for details.',
            message: 'This could mean there are no premium subscribers, or there was an error sending.',
            briefDate: briefToUse.date,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Premium brief sent successfully',
        briefDate: briefToUse.date,
        note: `Sent brief from ${briefToUse.date} (today's brief not found)`,
      });
    }

    // Check how many premium subscribers exist
    const { data: premiumSubscribers } = await supabase
      .from('subscribers')
      .select('email')
      .eq('status', 'active')
      .eq('tier', 'premium');

    const premiumCount = premiumSubscribers?.length || 0;
    console.log(`Found ${premiumCount} premium subscribers`);

    // Send premium email using today's brief
    // If specific email provided, send directly to that email
    // Otherwise, send to all premium subscribers
    const premiumEmailSent = await sendMorningBrief({
      subject: archiveData.subject_premium || archiveData.subject_free,
      htmlContent: archiveData.html_content_premium || archiveData.html_content_free,
      tier: specificEmail ? undefined : 'premium', // Don't filter by tier if specific email
      to: specificEmail ? [specificEmail] : undefined, // Send to specific email if provided
    });

    if (!premiumEmailSent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send premium email. Check logs for details.',
          message: 'This could mean there are no premium subscribers, or there was an error sending.',
          premiumSubscriberCount: premiumCount,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Premium brief sent successfully',
      date,
    });
  } catch (error) {
    console.error('Error in manual premium brief send:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

