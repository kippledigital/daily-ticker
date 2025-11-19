import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
  subject_free?: string; // Free tier subject
  subject_premium?: string; // Premium tier subject
  subject?: string; // Backwards compatibility
  html_content_free?: string; // Free tier HTML
  html_content_premium?: string; // Premium tier HTML
  htmlContent?: string; // Backwards compatibility
  tldr?: string;
  actionableCount: number;
  stocks: StockRecommendation[];
}

export async function POST(request: NextRequest) {
  try {
    const data: BriefData = await request.json();

    // Support both new (free/premium) and old (single) format
    const subject_free = data.subject_free || data.subject;
    const subject_premium = data.subject_premium || data.subject;
    const html_content_free = data.html_content_free || data.htmlContent;
    const html_content_premium = data.html_content_premium || data.htmlContent;

    // Validate required fields (check the fallback variables, not the original data)
    if (!data.date || !subject_free || !subject_premium || !html_content_free || !html_content_premium || !data.stocks) {
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

    // Check if brief already exists - if so, delete it first (allow overwriting)
    const { data: existingBrief } = await supabase
      .from('briefs')
      .select('id')
      .eq('date', data.date)
      .single();

    if (existingBrief) {
      console.log(`⚠️  Brief for ${data.date} already exists. Deleting to allow overwrite...`);
      
      // Delete associated stocks first (foreign key constraint)
      const { error: stocksError } = await supabase
        .from('stocks')
        .delete()
        .eq('brief_id', existingBrief.id);

      if (stocksError) {
        console.error('Error deleting existing stocks:', stocksError);
        return NextResponse.json(
          { error: 'Failed to delete existing stocks', details: stocksError },
          { status: 500 }
        );
      }

      // Delete the existing brief
      const { error: deleteError } = await supabase
        .from('briefs')
        .delete()
        .eq('id', existingBrief.id);

      if (deleteError) {
        console.error('Error deleting existing brief:', deleteError);
        return NextResponse.json(
          { error: 'Failed to delete existing brief', details: deleteError },
          { status: 500 }
        );
      }

      console.log(`✅ Deleted existing brief for ${data.date}, proceeding with new brief...`);
    }

    // Insert brief with BOTH free and premium versions
    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .insert({
        date: data.date,
        subject_free: subject_free,
        subject_premium: subject_premium,
        html_content_free: html_content_free,
        html_content_premium: html_content_premium,
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

    const { data: insertedStocks, error: stocksError } = await supabase
      .from('stocks')
      .insert(stocksToInsert)
      .select();

    if (stocksError) {
      console.error('Error inserting stocks:', JSON.stringify(stocksError, null, 2));
      // Rollback: delete the brief
      await supabase.from('briefs').delete().eq('id', brief.id);
      return NextResponse.json(
        { error: 'Failed to store stock data', details: stocksError },
        { status: 500 }
      );
    }

    // Create performance tracking records for each stock
    if (insertedStocks && insertedStocks.length > 0) {
      const performanceRecords = insertedStocks.map((stock) => ({
        stock_id: stock.id,
        entry_date: data.date,
        entry_price: stock.entry_price,
        // exit_date, exit_price, exit_reason will be set by the update cron when targets are hit
      }));

      const { error: perfError } = await supabase
        .from('stock_performance')
        .insert(performanceRecords);

      if (perfError) {
        console.error('Error creating performance records:', perfError);
        // Don't fail the entire operation, just log it
        // The update cron can backfill missing records if needed
      } else {
        console.log(`✅ Created ${performanceRecords.length} performance tracking records`);
      }
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
