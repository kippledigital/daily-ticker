import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { BriefData } from '../store/route';

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const { date } = params;

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Fetch brief with stocks
    const { data: brief, error } = await supabase
      .from('briefs')
      .select(`
        *,
        stocks (*)
      `)
      .eq('date', date)
      .single();

    if (error || !brief) {
      return NextResponse.json(
        { error: `Brief not found for date: ${date}` },
        { status: 404 }
      );
    }

    // Transform to BriefData format
    // For now, show premium version in archive (will gate later with tier detection)
    const briefData: BriefData = {
      date: (brief as any).date,
      subject: (brief as any).subject_premium || (brief as any).subject, // Backwards compatible
      htmlContent: (brief as any).html_content_premium || (brief as any).html_content, // Backwards compatible
      tldr: (brief as any).tldr || undefined,
      actionableCount: (brief as any).actionable_count,
      stocks: ((brief as any).stocks as any[]).map((stock) => ({
        ticker: stock.ticker,
        sector: stock.sector,
        confidence: stock.confidence,
        riskLevel: stock.risk_level,
        action: stock.action,
        entryPrice: stock.entry_price,
        entryZoneLow: stock.entry_zone_low || undefined,
        entryZoneHigh: stock.entry_zone_high || undefined,
        stopLoss: stock.stop_loss || undefined,
        profitTarget: stock.profit_target || undefined,
        summary: stock.summary,
        whyMatters: stock.why_matters,
        momentumCheck: stock.momentum_check,
        actionableInsight: stock.actionable_insight,
        allocation: stock.allocation || undefined,
        cautionNotes: stock.caution_notes || undefined,
        learningMoment: stock.learning_moment || undefined,
      })),
    };

    return NextResponse.json({
      success: true,
      data: briefData,
    });
  } catch (error) {
    console.error(`Error fetching brief for ${params.date}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch brief' },
      { status: 500 }
    );
  }
}
