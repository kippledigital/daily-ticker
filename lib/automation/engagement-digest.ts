import { createClient } from '@supabase/supabase-js';
import {
  EngagementDigestNotificationParams,
  sendEngagementDigestNotification,
} from '@/lib/emails/admin-notifications';

export interface EngagementDigestResult {
  success: boolean;
  error?: string;
  stats?: Omit<EngagementDigestNotificationParams, 'periodStart' | 'periodEnd'> & {
    periodStart: string;
    periodEnd: string;
  };
}

/**
 * Generates and sends an engagement digest email for the last N days (default 7).
 * Uses Supabase subscriber + cron tables as the source of truth.
 */
export async function runEngagementDigest(days: number = 7): Promise<EngagementDigestResult> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const today = new Date();
    const endDateObj = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const startDateObj = new Date(endDateObj);
    startDateObj.setDate(startDateObj.getDate() - (days - 1));

    const periodStart = startDateObj.toISOString().split('T')[0];
    const periodEnd = endDateObj.toISOString().split('T')[0];

    const startISO = `${periodStart}T00:00:00Z`;
    const endISO = `${periodEnd}T23:59:59Z`;

    // Overall subscriber stats (includes ARR + engagement rates)
    const { data: statsRow, error: statsError } = await supabase
      .from('subscriber_stats')
      .select('*')
      .single();

    if (statsError) {
      console.error('❌ Error fetching subscriber_stats view:', statsError);
    }

    const subscriberSummary = {
      activeFree: statsRow?.active_free_subscribers ?? 0,
      activePremium: statsRow?.active_premium_subscribers ?? 0,
      activeTotal: statsRow?.active_subscribers ?? 0,
      unsubscribed: statsRow?.unsubscribed ?? 0,
      bounced: statsRow?.bounced ?? 0,
      total: statsRow?.total_subscribers ?? 0,
      avgOpenRate: statsRow?.avg_open_rate ?? null,
      avgClickRate: statsRow?.avg_click_rate ?? null,
      payingCustomers: statsRow?.paying_customers ?? 0,
      annualRecurringRevenue: statsRow?.annual_recurring_revenue ?? 0,
    };

    // New subscribers in the period
    const { data: newSubs, error: newSubsError } = await supabase
      .from('subscribers')
      .select('tier, subscribed_at, utm_source')
      .gte('subscribed_at', startISO)
      .lte('subscribed_at', endISO);

    if (newSubsError) {
      console.error('❌ Error fetching new subscribers for engagement digest:', newSubsError);
    }

    const newSubscribers = {
      total: newSubs?.length ?? 0,
      free: (newSubs || []).filter((s) => s.tier === 'free').length,
      premium: (newSubs || []).filter((s) => s.tier === 'premium').length,
    };

    // Unsubscribes in the period
    const { data: unsubRows, error: unsubError } = await supabase
      .from('subscribers')
      .select('status, updated_at')
      .eq('status', 'unsubscribed')
      .gte('updated_at', startISO)
      .lte('updated_at', endISO);

    if (unsubError) {
      console.error('❌ Error fetching unsubscribes for engagement digest:', unsubError);
    }

    const unsubscribes = {
      total: unsubRows?.length ?? 0,
    };

    // Premium churn (canceled / past_due / unpaid) in the period
    const { data: churnRows, error: churnError } = await supabase
      .from('subscribers')
      .select('subscription_status, tier, updated_at')
      .eq('tier', 'premium')
      .in('subscription_status', ['canceled', 'past_due', 'unpaid'])
      .gte('updated_at', startISO)
      .lte('updated_at', endISO);

    if (churnError) {
      console.error('❌ Error fetching churned premium subscribers for engagement digest:', churnError);
    }

    const churnedPremium = {
      total: churnRows?.length ?? 0,
    };

    // Cron runs for the daily brief in the period
    const { data: cronRuns, error: cronError } = await supabase
      .from('cron_runs')
      .select('run_date, status, emails_sent_free, emails_sent_premium')
      .gte('run_date', periodStart)
      .lte('run_date', periodEnd);

    if (cronError) {
      console.error('❌ Error fetching cron_runs for engagement digest:', cronError);
    }

    const cronSummary = {
      runs: cronRuns?.length ?? 0,
      successes: (cronRuns || []).filter((r) => r.status === 'success').length,
      failures: (cronRuns || []).filter((r) => r.status === 'failed').length,
      emailsSentFree: (cronRuns || []).reduce(
        (sum, r) => sum + (r.emails_sent_free ?? 0),
        0
      ),
      emailsSentPremium: (cronRuns || []).reduce(
        (sum, r) => sum + (r.emails_sent_premium ?? 0),
        0
      ),
    };

    // UTM source breakdown for new subscribers (proxy for GA/GSC)
    const utmCounts: Record<string, number> = {};
    for (const row of newSubs || []) {
      const source = row.utm_source || 'direct/unknown';
      utmCounts[source] = (utmCounts[source] || 0) + 1;
    }

    const utmSources = Object.entries(utmCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const digestParams: EngagementDigestNotificationParams = {
      periodStart,
      periodEnd,
      subscriberSummary,
      newSubscribers,
      unsubscribes,
      churnedPremium,
      cronSummary,
      utmSources,
    };

    await sendEngagementDigestNotification(digestParams);

    return {
      success: true,
      stats: {
        ...digestParams,
      },
    };
  } catch (error) {
    console.error('❌ Error running engagement digest:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error running engagement digest',
    };
  }
}


