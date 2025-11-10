import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Manual endpoint to delete today's brief from archive
 * This allows regenerating today's brief for testing
 * 
 * Usage: GET /api/manual/delete-todays-brief
 */
export async function GET(request: NextRequest) {
  try {
    const date = new Date().toISOString().split('T')[0];
    console.log(`🗑️  Deleting brief for ${date}...`);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Delete stocks first (foreign key constraint)
    const { data: briefs } = await supabase
      .from('briefs')
      .select('id')
      .eq('date', date);

    if (briefs && briefs.length > 0) {
      const briefIds = briefs.map(b => b.id);
      
      // Delete stocks associated with these briefs
      const { error: stocksError } = await supabase
        .from('stocks')
        .delete()
        .in('brief_id', briefIds);

      if (stocksError) {
        console.error('Error deleting stocks:', stocksError);
        return NextResponse.json(
          { error: 'Failed to delete stocks', details: stocksError },
          { status: 500 }
        );
      }

      // Delete briefs
      const { error: briefsError } = await supabase
        .from('briefs')
        .delete()
        .eq('date', date);

      if (briefsError) {
        console.error('Error deleting briefs:', briefsError);
        return NextResponse.json(
          { error: 'Failed to delete briefs', details: briefsError },
          { status: 500 }
        );
      }

      console.log(`✅ Deleted ${briefs.length} brief(s) for ${date}`);
      return NextResponse.json({
        success: true,
        message: `Deleted ${briefs.length} brief(s) for ${date}`,
        date,
      });
    } else {
      return NextResponse.json({
        success: true,
        message: `No brief found for ${date}`,
        date,
      });
    }
  } catch (error) {
    console.error('Error deleting brief:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

