import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export interface StockRecommendation {
  ticker: string;
  sector: string;
  confidence: number;
  riskLevel: string;
  action: string; // BUY, WATCH, HOLD, AVOID
  entryPrice: number;
  entryZoneLow?: number;
  entryZoneHigh?: number;
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
    const existingBrief = await kv.get(`brief:${data.date}`);
    if (existingBrief) {
      return NextResponse.json(
        { error: `Brief for ${data.date} already exists` },
        { status: 409 }
      );
    }

    // Store brief in KV
    await kv.set(`brief:${data.date}`, data);

    // Add date to index (for listing briefs)
    await kv.lpush('briefs:index', data.date);

    // Also create a sorted set for date-based queries
    const timestamp = new Date(data.date).getTime();
    await kv.zadd('briefs:dates', { score: timestamp, member: data.date });

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
