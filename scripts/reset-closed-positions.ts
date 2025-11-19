/**
 * Reset all closed positions back to 'open' status
 * So we can re-run the accurate historical analysis
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function resetClosedPositions() {
  console.log('🔄 Resetting all closed positions to re-analyze with historical data...\n');

  const { data, error } = await supabase
    .from('stock_performance')
    .update({
      exit_price: null,
      exit_date: null,
      exit_reason: null,
      outcome: 'open',
    })
    .neq('outcome', 'open')
    .select();

  if (error) {
    console.error('Error resetting positions:', error);
    return;
  }

  console.log(`✅ Reset ${data?.length || 0} positions back to 'open' status\n`);
  console.log('Ready to run accurate historical analysis!');
}

resetClosedPositions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
