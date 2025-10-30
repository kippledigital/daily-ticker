import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export interface StockRecommendation {
  ticker: string;
  sector: string;
  confidence: number;
  riskLevel: string;
  action: string; // BUY, WATCH, HOLD, AVOID
  entryPrice: number;
  entryZoneLow?: number;
  entryZoneHigh?: number;
  stopLoss?: number;
  profitTarget?: number;
  summary: string;
  whyMatters: string;
  momentumCheck: string;
  actionableInsight: string;
  allocation?: string;
  cautionNotes?: string;
  learningMoment?: string;
}

export interface BriefData {
  date: string; // YYYY-MM-DD
  subject: string;
  htmlContent: string;
  tldr?: string;
  actionableCount: number;
  stocks: StockRecommendation[];
}

export async function POST(request: NextRequest) {
  try {
    const data: BriefData = await request.json();

    // Validate required fields
    if (!data.date || !data.subject || !data.htmlContent || !data.stocks) {
      return NextResponse.json(
        { error: 'Missing required fields: date, subject, htmlContent, stocks' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate stocks is an array
    if (!Array.isArray(data.stocks) || data.stocks.length === 0) {
      return NextResponse.json(
        { error: 'Stocks must be a non-empty array' },
        { status: 400 }
      );
    }

    // Check if brief already exists
    const { data: existingBrief } = await supabase
      .from('briefs')
      .select('id')
      .eq('date', data.date)
      .single();

    if (existingBrief) {
      return NextResponse.json(
        { error: `Brief for ${data.date} already exists` },
        { status: 409 }
      );
    }

    // Insert brief
    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .insert({
        date: data.date,
        subject: data.subject,
        html_content: data.htmlContent,
        tldr: data.tldr || null,
        actionable_count: data.actionableCount,
      })
      .select()
      .single();

    if (briefError || !brief) {
      console.error('Error inserting brief:', briefError);
      return NextResponse.json(
        { error: 'Failed to store brief' },
        { status: 500 }
      );
    }

    // Insert stocks
    const stocksToInsert = data.stocks.map((stock) => ({
      brief_id: brief.id,
      ticker: stock.ticker,
      sector: stock.sector,
      confidence: stock.confidence,
      risk_level: stock.riskLevel,
      action: stock.action,
      entry_price: stock.entryPrice,
      entry_zone_low: stock.entryZoneLow || null,
      entry_zone_high: stock.entryZoneHigh || null,
      stop_loss: stock.stopLoss || null,
      profit_target: stock.profitTarget || null,
      summary: stock.summary,
      why_matters: stock.whyMatters,
      momentum_check: stock.momentumCheck,
      actionable_insight: stock.actionableInsight,
      allocation: stock.allocation || null,
      caution_notes: stock.cautionNotes || null,
      learning_moment: stock.learningMoment || null,
    }));

    const { error: stocksError } = await supabase
      .from('stocks')
      .insert(stocksToInsert);

    if (stocksError) {
      console.error('Error inserting stocks:', JSON.stringify(stocksError, null, 2));
      // Rollback: delete the brief
      await supabase.from('briefs').delete().eq('id', brief.id);
      return NextResponse.json(
        { error: 'Failed to store stock data', details: stocksError },
        { status: 500 }
      );
    }

    console.log(`✅ Stored brief for ${data.date} with ${data.stocks.length} stocks`);

    return NextResponse.json(
      {
        success: true,
        message: `Brief for ${data.date} stored successfully`,
        data: {
          date: data.date,
          stockCount: data.stocks.length,
          actionableCount: data.actionableCount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error storing brief:', error);
    return NextResponse.json(
      { error: 'Failed to store brief. Please try again.' },
      { status: 500 }
    );
  }
}
