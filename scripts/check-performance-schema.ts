import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSchema() {
  const { data, error } = await supabase
    .from('stock_performance')
    .select('*')
    .limit(3);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Sample performance record:');
    console.log(JSON.stringify(data[0], null, 2));
    console.log('\nAvailable columns:', Object.keys(data[0]).join(', '));
  }
}

checkSchema();
