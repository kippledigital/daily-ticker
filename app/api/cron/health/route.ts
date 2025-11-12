import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Health Check Endpoint
 *
 * Returns the status of the daily cron automation
 * - Last successful run
 * - Recent failures
 * - Overall health metrics
 */
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get health metrics from view
    const { data: health, error: healthError } = await supabase
      .from('cron_health')
      .select('*')
      .single();

    if (healthError) {
      console.error('Error fetching cron health:', healthError);
    }

    // Get recent runs
    const { data: recentRuns, error: runsError } = await supabase
      .from('recent_cron_runs')
      .select('*')
      .limit(10);

    if (runsError) {
      console.error('Error fetching recent runs:', runsError);
    }

    // Get today's run status
    const today = new Date().toISOString().split('T')[0];
    const { data: todayRun, error: todayError } = await supabase
      .from('cron_runs')
      .select('*')
      .eq('run_date', today)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (todayError && todayError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (expected if cron hasn't run today)
      console.error('Error fetching today run:', todayError);
    }

    // Determine overall status
    const now = new Date();
    const lastSuccess = health?.last_success_at ? new Date(health.last_success_at) : null;
    const hoursSinceSuccess = lastSuccess
      ? (now.getTime() - lastSuccess.getTime()) / (1000 * 60 * 60)
      : null;

    // Health status logic:
    // - HEALTHY: Last success within 24 hours and no today run yet, OR today run succeeded
    // - WARNING: Last success 24-48 hours ago, OR today run is still running
    // - CRITICAL: Last success >48 hours ago, OR today run failed
    let status = 'unknown';
    let statusMessage = 'No cron runs recorded';

    if (todayRun) {
      if (todayRun.status === 'success') {
        status = 'healthy';
        statusMessage = 'Today\'s brief sent successfully';
      } else if (todayRun.status === 'running') {
        status = 'warning';
        statusMessage = 'Cron job currently running';
      } else if (todayRun.status === 'failed') {
        status = 'critical';
        statusMessage = `Today's cron failed: ${todayRun.error_message}`;
      }
    } else if (hoursSinceSuccess !== null) {
      if (hoursSinceSuccess < 24) {
        status = 'healthy';
        statusMessage = 'Last run successful, waiting for today\'s scheduled run';
      } else if (hoursSinceSuccess < 48) {
        status = 'warning';
        statusMessage = 'No successful run in 24+ hours';
      } else {
        status = 'critical';
        statusMessage = 'No successful run in 48+ hours';
      }
    }

    return NextResponse.json({
      status,
      statusMessage,
      health: {
        successful_runs_30d: health?.successful_runs_30d || 0,
        failed_runs_30d: health?.failed_runs_30d || 0,
        partial_runs_30d: health?.partial_runs_30d || 0,
        last_success_at: health?.last_success_at,
        last_failure_at: health?.last_failure_at,
        hours_since_success: hoursSinceSuccess,
        avg_execution_time_sec: health?.avg_execution_time_ms
          ? (health.avg_execution_time_ms / 1000).toFixed(2)
          : null,
        total_emails_sent_30d: health?.total_emails_sent_30d || 0,
      },
      today: todayRun ? {
        status: todayRun.status,
        started_at: todayRun.started_at,
        completed_at: todayRun.completed_at,
        stocks_validated: todayRun.stocks_validated,
        emails_sent: (todayRun.emails_sent_free || 0) + (todayRun.emails_sent_premium || 0),
        error_message: todayRun.error_message,
      } : null,
      recent_runs: recentRuns?.map(run => ({
        date: run.run_date,
        status: run.status,
        duration_sec: run.duration_seconds,
        stocks: run.stocks_validated,
        emails: run.total_emails_sent,
        error: run.error_message,
      })) || [],
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Error in health check:', error);
    return NextResponse.json({
      status: 'error',
      statusMessage: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
