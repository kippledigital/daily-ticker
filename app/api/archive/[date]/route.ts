import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
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

    const redis = await getRedis();

    // Fetch brief from Redis
    const briefData = await redis.get(`brief:${date}`);
    const brief = briefData ? JSON.parse(briefData) as BriefData : null;

    if (!brief) {
      return NextResponse.json(
        { error: `Brief not found for date: ${date}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: brief,
    });
  } catch (error) {
    console.error(`Error fetching brief for ${params.date}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch brief' },
      { status: 500 }
    );
  }
}
