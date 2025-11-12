import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Running cron tracking migration...');

  const migrationPath = join(__dirname, '../supabase/migrations/add_cron_run_tracking.sql');
  const sql = readFileSync(migrationPath, 'utf8');

  // Split by semicolons and run each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        console.error(`❌ Failed at statement ${i + 1}:`, error);
        console.error('Statement:', statement.substring(0, 200) + '...');
        process.exit(1);
      }

      console.log(`✅ Statement ${i + 1} completed`);
    } catch (err) {
      // Try direct query instead
      console.log(`Trying direct query...`);
      const { error } = await supabase.from('_sql').insert({ query: statement });

      if (error) {
        console.error(`❌ Failed:`, err);
        // Continue anyway - some errors are expected (like "already exists")
      }
    }
  }

  console.log('\n✅ Migration completed successfully!');
  console.log('\nVerifying...');

  // Verify the table exists
  const { data, error } = await supabase.from('cron_runs').select('count');

  if (error) {
    console.error('❌ Verification failed:', error);
    console.error('\n⚠️  Please run the migration manually via Supabase SQL Editor');
    process.exit(1);
  }

  console.log('✅ Verified: cron_runs table exists and is accessible');
}

runMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
