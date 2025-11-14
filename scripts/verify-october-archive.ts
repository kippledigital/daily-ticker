/**
 * Verify October archive status after deletion
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyArchive() {
  console.log('\n📅 OCTOBER 2025 ARCHIVE VERIFICATION\n');
  console.log('='.repeat(60));

  // Get all October briefs
  const { data: briefs } = await supabase
    .from('briefs')
    .select('id, date, actionable_count')
    .gte('date', '2025-10-01')
    .lte('date', '2025-10-31')
    .order('date');

  console.log(`\n✅ Total October briefs in database: ${briefs?.length || 0}\n`);

  if (briefs && briefs.length > 0) {
    console.log('Dates with briefs:');
    for (const brief of briefs) {
      const { data: stocks } = await supabase
        .from('stocks')
        .select('ticker, action')
        .eq('brief_id', brief.id);

      const stockList = stocks?.map(s => s.ticker).join(', ') || 'none';
      console.log(`  ✅ ${brief.date}: ${stocks?.length || 0} stocks (${stockList})`);
    }
  }

  // Generate all October weekdays
  const start = new Date('2025-10-01');
  const end = new Date('2025-10-31');
  let current = new Date(start);
  const allWeekdays = [];

  while (current <= end) {
    if (current.getDay() >= 1 && current.getDay() <= 5) {
      allWeekdays.push(current.toISOString().split('T')[0]);
    }
    current.setDate(current.getDate() + 1);
  }

  const existingDates = new Set((briefs || []).map(b => b.date));
  const missingDates = allWeekdays.filter(d => !existingDates.has(d));

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total October trading days: ${allWeekdays.length}`);
  console.log(`✅ Have briefs: ${briefs?.length || 0}`);
  console.log(`❌ Missing briefs: ${missingDates.length}`);
  console.log(`📈 Completion: ${(((briefs?.length || 0) / allWeekdays.length) * 100).toFixed(1)}%`);

  if (missingDates.length > 0) {
    console.log('\n🔴 Missing dates (first 10):');
    missingDates.slice(0, 10).forEach(d => console.log(`  • ${d}`));
    if (missingDates.length > 10) {
      console.log(`  ... and ${missingDates.length - 10} more`);
    }
  }

  console.log('\n✨ Next step: Run backfill script to add authentic briefs');
  console.log('   Command: npx tsx scripts/backfill-october-minimal.ts');
  console.log('   (Uses only 3 OpenAI calls per brief)');
  console.log();
}

verifyArchive();
