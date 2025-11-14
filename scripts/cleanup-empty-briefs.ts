/**
 * Clean up empty October briefs (briefs with no stock picks)
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanupEmptyBriefs() {
  console.log('\n🧹 Cleaning up empty October briefs...\n');

  // Find all October briefs
  const { data: briefs, error: briefsError } = await supabase
    .from('briefs')
    .select('id, date')
    .gte('date', '2025-10-01')
    .lte('date', '2025-10-31')
    .order('date', { ascending: true });

  if (briefsError || !briefs) {
    console.error('❌ Failed to fetch briefs:', briefsError);
    return;
  }

  console.log(`Found ${briefs.length} October briefs. Checking which are empty...\n`);

  let deletedCount = 0;

  for (const brief of briefs) {
    // Check if this brief has any stocks
    const { data: stocks, error: stocksError } = await supabase
      .from('stocks')
      .select('id')
      .eq('brief_id', brief.id);

    if (stocksError) {
      console.error(`❌ Error checking stocks for ${brief.date}:`, stocksError);
      continue;
    }

    if (!stocks || stocks.length === 0) {
      console.log(`🗑️  Deleting empty brief: ${brief.date}`);

      // Delete the brief
      const { error: deleteError } = await supabase
        .from('briefs')
        .delete()
        .eq('id', brief.id);

      if (deleteError) {
        console.error(`  ❌ Failed to delete: ${deleteError.message}`);
      } else {
        console.log(`  ✅ Deleted`);
        deletedCount++;
      }
    } else {
      console.log(`✓ Keeping ${brief.date} (${stocks.length} stocks)`);
    }
  }

  console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} empty briefs.\n`);
}

cleanupEmptyBriefs().catch(console.error);
