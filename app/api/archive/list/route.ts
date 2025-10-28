import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import type { BriefData } from '../store/route';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const ticker = searchParams.get('ticker')?.toUpperCase();

    // Get all brief dates (sorted by newest first)
    const allDates = await kv.zrange('briefs:dates', 0, -1, { rev: true }) as string[];

    if (!allDates || allDates.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        limit,
        offset,
      });
    }

    // If filtering by ticker, fetch all briefs and filter
    let filteredDates = allDates;

    if (ticker) {
      const briefsToCheck = await Promise.all(
        allDates.map(async (date) => {
          const brief = await kv.get(`brief:${date}`) as BriefData | null;
          return brief;
        })
      );

      filteredDates = allDates.filter((date, index) => {
        const brief = briefsToCheck[index];
        if (!brief) return false;
        return brief.stocks.some(stock => stock.ticker === ticker);
      });
    }

    // Apply pagination
    const paginatedDates = filteredDates.slice(offset, offset + limit);

    // Fetch brief metadata for paginated dates
    const briefs = await Promise.all(
      paginatedDates.map(async (date) => {
        const brief = await kv.get(`brief:${date}`) as BriefData | null;
        if (!brief) return null;

        // Return metadata only (not full HTML)
        const uniqueSectors = new Set(brief.stocks.map(s => s.sector));
        return {
          date: brief.date,
          subject: brief.subject,
          tldr: brief.tldr,
          actionableCount: brief.actionableCount,
          stockCount: brief.stocks.length,
          tickers: brief.stocks.map(s => s.ticker),
          sectors: Array.from(uniqueSectors),
        };
      })
    );

    // Filter out null values
    const validBriefs = briefs.filter(b => b !== null);

    return NextResponse.json({
      success: true,
      data: validBriefs,
      total: filteredDates.length,
      limit,
      offset,
      hasMore: offset + limit < filteredDates.length,
    });
  } catch (error) {
    console.error('Error listing briefs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch briefs list' },
      { status: 500 }
    );
  }
}
