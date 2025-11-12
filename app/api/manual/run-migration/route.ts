import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Manual Migration Runner
 * Runs the cron_runs table migration
 *
 * DELETE THIS FILE AFTER RUNNING ONCE
 */
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('🚀 Running cron tracking migration...');

    // Create the cron_runs table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS cron_runs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        run_date DATE NOT NULL,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMPTZ,
        status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed', 'partial')),
        trigger_source TEXT,
        steps_completed JSONB DEFAULT '{}'::jsonb,
        stocks_discovered INTEGER,
        stocks_validated INTEGER,
        emails_sent_free INTEGER DEFAULT 0,
        emails_sent_premium INTEGER DEFAULT 0,
        archive_stored BOOLEAN DEFAULT false,
        error_message TEXT,
        error_details JSONB,
        execution_time_ms INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // Create indexes
    const createIndexesSQL = [
      `CREATE INDEX IF NOT EXISTS idx_cron_runs_date ON cron_runs(run_date DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_cron_runs_status ON cron_runs(status);`,
      `CREATE INDEX IF NOT EXISTS idx_cron_runs_started_at ON cron_runs(started_at DESC);`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_cron_runs_successful_date ON cron_runs(run_date) WHERE status = 'success';`,
    ];

    // Create trigger
    const createTriggerSQL = `
      CREATE TRIGGER IF NOT EXISTS update_cron_runs_updated_at
        BEFORE UPDATE ON cron_runs
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    // Create views
    const createViewsSQL = [
      `CREATE OR REPLACE VIEW recent_cron_runs AS
       SELECT
         run_date,
         status,
         started_at,
         completed_at,
         EXTRACT(EPOCH FROM (completed_at - started_at))::INTEGER as duration_seconds,
         stocks_discovered,
         stocks_validated,
         emails_sent_free + emails_sent_premium as total_emails_sent,
         archive_stored,
         error_message
       FROM cron_runs
       ORDER BY started_at DESC
       LIMIT 30;`,

      `CREATE OR REPLACE VIEW cron_health AS
       SELECT
         COUNT(*) FILTER (WHERE status = 'success') as successful_runs_30d,
         COUNT(*) FILTER (WHERE status = 'failed') as failed_runs_30d,
         COUNT(*) FILTER (WHERE status = 'partial') as partial_runs_30d,
         MAX(started_at) FILTER (WHERE status = 'success') as last_success_at,
         MAX(started_at) FILTER (WHERE status = 'failed') as last_failure_at,
         AVG(execution_time_ms) FILTER (WHERE status = 'success') as avg_execution_time_ms,
         SUM(emails_sent_free + emails_sent_premium) as total_emails_sent_30d
       FROM cron_runs
       WHERE started_at >= NOW() - INTERVAL '30 days';`,
    ];

    const results = [];

    // Execute table creation
    try {
      const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      if (tableError) throw tableError;
      results.push('✅ Table created');
    } catch (err: any) {
      if (err.message?.includes('already exists')) {
        results.push('⚠️  Table already exists');
      } else {
        throw err;
      }
    }

    // Execute indexes
    for (const indexSQL of createIndexesSQL) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: indexSQL });
        if (error && !error.message?.includes('already exists')) throw error;
        results.push('✅ Index created');
      } catch (err: any) {
        results.push(`⚠️  Index: ${err.message}`);
      }
    }

    // Execute trigger
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: createTriggerSQL });
      if (error && !error.message?.includes('already exists')) throw error;
      results.push('✅ Trigger created');
    } catch (err: any) {
      results.push(`⚠️  Trigger: ${err.message}`);
    }

    // Execute views
    for (const viewSQL of createViewsSQL) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: viewSQL });
        if (error) throw error;
        results.push('✅ View created');
      } catch (err: any) {
        results.push(`⚠️  View: ${err.message}`);
      }
    }

    // Verify table exists
    const { data, error: verifyError } = await supabase
      .from('cron_runs')
      .select('id')
      .limit(1);

    if (verifyError) {
      return NextResponse.json({
        success: false,
        message: 'Migration completed but verification failed',
        results,
        error: verifyError.message,
        instructions: 'Please run the SQL manually via Supabase SQL Editor'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '✅ Migration completed successfully!',
      results,
      instructions: 'You can now DELETE this endpoint file: app/api/manual/run-migration/route.ts'
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      instructions: 'Please run supabase/migrations/add_cron_run_tracking.sql manually via Supabase SQL Editor'
    }, { status: 500 });
  }
}
