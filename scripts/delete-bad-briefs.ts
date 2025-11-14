/**
 * Delete specific October briefs that have bad/fake data
 * Removes: Oct 1, 2, 3, and 15 (2025)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DATES_TO_DELETE = ['2025-10-23', '2025-10-24', '2025-10-25', '2025-10-26', '2025-10-27'];

async function deleteBadBriefs() {
  console.log('🗑️  DELETING BAD OCTOBER BRIEFS\n');
  console.log('━'.repeat(70));
  console.log('Removing briefs with fake/unhelpful data');
  console.log('━'.repeat(70));
  console.log();

  // First, check what we're about to delete
  console.log('📋 Briefs to delete:');
  for (const date of DATES_TO_DELETE) {
    const { data: brief } = await supabase
      .from('briefs')
      .select('id, date, actionable_count')
      .eq('date', date)
      .single();

    if (brief) {
      const { data: stocks } = await supabase
        .from('stocks')
        .select('ticker')
        .eq('brief_id', brief.id);

      console.log(
        `  • ${date}: ${stocks?.length || 0} stocks (${stocks?.map(s => s.ticker).join(', ') || 'none'})`
      );
    } else {
      console.log(`  • ${date}: Not found`);
    }
  }

  console.log();
  console.log('⚠️  This will delete these briefs and all associated stocks');
  console.log('🔄 Proceeding in 2 seconds...\n');

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Delete briefs (stocks will be cascade deleted due to foreign key)
  console.log('🗑️  Deleting briefs...');

  for (const date of DATES_TO_DELETE) {
    const { data: brief } = await supabase.from('briefs').select('id').eq('date', date).single();

    if (brief) {
      // Delete stocks first
      const { error: stockError } = await supabase.from('stocks').delete().eq('brief_id', brief.id);

      if (stockError) {
        console.log(`  ❌ Failed to delete stocks for ${date}:`, stockError.message);
        continue;
      }

      // Delete brief
      const { error: briefError } = await supabase.from('briefs').delete().eq('date', date);

      if (briefError) {
        console.log(`  ❌ Failed to delete brief ${date}:`, briefError.message);
      } else {
        console.log(`  ✅ Deleted ${date}`);
      }
    } else {
      console.log(`  ⏭️  ${date} not found (already deleted)`);
    }
  }

  console.log();
  console.log('━'.repeat(70));
  console.log('✅ CLEANUP COMPLETE');
  console.log('━'.repeat(70));
  console.log();

  // Show remaining October briefs
  const { data: remaining } = await supabase
    .from('briefs')
    .select('date')
    .gte('date', '2025-10-01')
    .lte('date', '2025-10-31')
    .order('date');

  console.log(`📊 Remaining October briefs: ${remaining?.length || 0}`);
  if (remaining && remaining.length > 0) {
    console.log('Dates:');
    remaining.forEach(b => console.log(`  • ${b.date}`));
  }
}

deleteBadBriefs();
