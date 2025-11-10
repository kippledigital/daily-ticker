import { NextRequest, NextResponse } from 'next/server';
import { sendMorningBrief } from '@/lib/automation/email-sender';
import { generateEmailContent } from '@/lib/automation/email-generator';
import { getHistoricalWatchlistData } from '@/lib/automation/historical-data';
import { gatherFinancialDataBatch, getRawAggregatedData } from '@/lib/automation/news-gatherer';
import { analyzeStock } from '@/lib/automation/ai-analyzer';
import { validateStockAnalysis } from '@/lib/automation/validator';
import { injectTrendSymbol } from '@/lib/automation/trend-injector';
import type { ValidatedStock } from '@/types/automation';

/**
 * Manual endpoint to send today's premium brief to premium subscribers
 * 
 * Usage: GET /api/manual/send-premium-brief
 */
export async function GET(request: NextRequest) {
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

    const { data: archiveData, error: archiveError } = await supabase
      .from('archive')
      .select('*')
      .eq('date', date)
      .single();

    if (archiveError || !archiveData) {
      return NextResponse.json(
        {
          error: 'No brief found for today. Please run the automation first.',
          date,
        },
        { status: 404 }
      );
    }

    // Send premium email using today's brief
    const premiumEmailSent = await sendMorningBrief({
      subject: archiveData.subject_premium || archiveData.subject_free,
      htmlContent: archiveData.html_content_premium || archiveData.html_content_free,
      tier: 'premium',
    });

    if (!premiumEmailSent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send premium email. Check logs for details.',
          message: 'This could mean there are no premium subscribers, or there was an error sending.',
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

