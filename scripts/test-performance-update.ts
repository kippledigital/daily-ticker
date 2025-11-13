import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  console.log('Testing a direct update to stock_performance...\n');

  // Try to update one position
  const { data: position, error: fetchError } = await supabase
    .from('stock_performance')
    .select('id, entry_price')
    .eq('outcome', 'open')
    .limit(1)
    .single();

  if (fetchError || !position) {
    console.log('Error fetching position:', fetchError);
    return;
  }

  console.log('Found position:', position.id);
  console.log('Trying to update with exit data...\n');

  const { error: updateError } = await supabase
    .from('stock_performance')
    .update({
      exit_price: 100,
      exit_reason: 'stop_loss',
      exit_date: '2025-11-13',
    })
    .eq('id', position.id);

  if (updateError) {
    console.log('❌ Update failed:');
    console.log(JSON.stringify(updateError, null, 2));
  } else {
    console.log('✅ Update succeeded!');

    // Check the result
    const { data: updated } = await supabase
      .from('stock_performance')
      .select('*')
      .eq('id', position.id)
      .single();

    console.log('\nUpdated record:');
    console.log(`  Exit price: $${updated?.exit_price}`);
    console.log(`  Exit reason: ${updated?.exit_reason}`);
    console.log(`  Return: ${updated?.return_percent}%`);
    console.log(`  Outcome: ${updated?.outcome}`);
  }
})();
