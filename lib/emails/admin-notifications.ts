import { Resend } from 'resend';

// Lazily initialized Resend client so missing API key doesn't throw at import time
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY is not configured! Cannot send admin notification email.');
    return null;
  }

  if (!apiKey.startsWith('re_')) {
    console.error('❌ RESEND_API_KEY format appears invalid (should start with re_)');
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL || 'brief@dailyticker.co';
}

function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || 'brief@dailyticker.co';
}

export type SignupTier = 'free' | 'premium';

export interface SignupNotificationParams {
  email: string;
  tier: SignupTier;
  status: 'new' | 'reactivated' | 'upgraded';
  source: 'subscribe-endpoint' | 'stripe-webhook';
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  timestamp?: Date;
}

/**
 * Internal notification when a user signs up or upgrades
 * Sends a short summary to the admin inbox (brief@dailyticker.co by default)
 */
export async function sendSignupNotification(params: SignupNotificationParams) {
  try {
    const resend = getResendClient();
    if (!resend) {
      return;
    }

    const adminEmail = getAdminEmail();
    const fromEmail = getFromEmail();

    const {
      email,
      tier,
      status,
      source,
      utm_source,
      utm_medium,
      utm_campaign,
      ip_address,
      user_agent,
      timestamp,
    } = params;

    const isPremium = tier === 'premium';
    const statusLabel =
      status === 'new'
        ? 'New signup'
        : status === 'reactivated'
          ? 'Reactivated subscriber'
          : 'Upgraded to premium';

    const subjectPrefix = isPremium ? '🚀 New Daily Ticker Pro' : '👤 New Daily Ticker signup';
    const subject = `${subjectPrefix} – ${statusLabel}`;

    const occurredAt = (timestamp || new Date()).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Los_Angeles',
    });

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #0B1E32; color: #F0F0F0; margin: 0; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto; background: #102844; border-radius: 12px; overflow: hidden; border: 1px solid #16375a;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #16375a; background: linear-gradient(135deg, #00ff88 0%, #00c2ff 100%); color: #0B1E32;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700;">
          ${isPremium ? 'New Daily Ticker Pro signup' : 'New Daily Ticker signup'}
        </h1>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">
          ${statusLabel} detected from ${source === 'stripe-webhook' ? 'Stripe checkout' : 'website subscribe form'}.
        </p>
      </div>

      <div style="padding: 20px 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 4px 0; font-weight: 600; width: 120px;">Email</td>
            <td style="padding: 4px 0;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Tier</td>
            <td style="padding: 4px 0;">${tier}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Status</td>
            <td style="padding: 4px 0;">${statusLabel}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Source</td>
            <td style="padding: 4px 0;">${source}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">When</td>
            <td style="padding: 4px 0;">${occurredAt}</td>
          </tr>
        </table>

        ${(utm_source || utm_medium || utm_campaign) ? `
        <h3 style="margin: 16px 0 8px 0; font-size: 14px; font-weight: 600;">UTM / Attribution</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          ${utm_source ? `<tr><td style="padding: 2px 0; width: 120px; opacity: 0.8;">utm_source</td><td style="padding: 2px 0;">${utm_source}</td></tr>` : ''}
          ${utm_medium ? `<tr><td style="padding: 2px 0; width: 120px; opacity: 0.8;">utm_medium</td><td style="padding: 2px 0;">${utm_medium}</td></tr>` : ''}
          ${utm_campaign ? `<tr><td style="padding: 2px 0; width: 120px; opacity: 0.8;">utm_campaign</td><td style="padding: 2px 0;">${utm_campaign}</td></tr>` : ''}
        </table>
        ` : ''}

        ${(ip_address || user_agent) ? `
        <h3 style="margin: 16px 0 8px 0; font-size: 14px; font-weight: 600;">Client</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          ${ip_address ? `<tr><td style="padding: 2px 0; width: 120px; opacity: 0.8;">IP</td><td style="padding: 2px 0;">${ip_address}</td></tr>` : ''}
          ${user_agent ? `<tr><td style="padding: 2px 0; width: 120px; opacity: 0.8;">User agent</td><td style="padding: 2px 0;">${user_agent}</td></tr>` : ''}
        </table>
        ` : ''}
      </div>

      <div style="padding: 16px 24px; border-top: 1px solid #16375a; font-size: 12px; color: #9fb3c8;">
        <p style="margin: 0;">This is an internal notification from Daily Ticker.</p>
      </div>
    </div>
  </body>
</html>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      subject,
      html,
      tags: [
        { name: 'type', value: 'internal-notification' },
        { name: 'category', value: 'signup' },
        { name: 'tier', value: tier },
      ],
    });

    console.log(`✅ Signup notification sent to admin for ${email} (${tier}, ${status})`);
  } catch (error) {
    console.error('❌ Failed to send signup notification:', error);
  }
}

export interface PerformanceUpdateNotificationParams {
  message: string;
  updated: number;
  checked: number;
  total_open: number;
  skipped: number;
  rate_limited: number;
  filtered_out: number;
  details: Array<{
    ticker: string;
    exit_reason: string;
    exit_price: number;
    return_percent: number;
  }>;
  date?: string;
}

/**
 * Internal notification for daily performance cron when positions are closed.
 * Only call this when one or more positions have been updated.
 */
export async function sendPerformanceUpdateNotification(params: PerformanceUpdateNotificationParams) {
  try {
    const resend = getResendClient();
    if (!resend) {
      return;
    }

    const adminEmail = getAdminEmail();
    const fromEmail = getFromEmail();

    const {
      message,
      updated,
      checked,
      total_open,
      skipped,
      rate_limited,
      filtered_out,
      details,
      date,
    } = params;

    const subject = `📈 Daily performance update – ${updated} position${updated === 1 ? '' : 's'} closed`;

    const displayDate =
      date ||
      new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'America/New_York',
      });

    const rowsHtml = details
      .map((d) => {
        const sign = d.return_percent > 0 ? '+' : '';
        const color =
          d.return_percent > 0 ? '#00ff88' : d.return_percent < 0 ? '#ff4d6a' : '#f0f0f0';
        const reason = d.exit_reason.replace(/_/g, ' ');
        return `
        <tr>
          <td style="padding: 6px 8px; border-bottom: 1px solid #16375a; font-family: monospace;">${d.ticker}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #16375a; text-transform: uppercase; font-size: 12px; opacity: 0.9;">${reason}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #16375a;">$${d.exit_price.toFixed(2)}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #16375a; color: ${color};">${sign}${d.return_percent.toFixed(2)}%</td>
        </tr>
      `;
      })
      .join('');

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #0B1E32; color: #F0F0F0; margin: 0; padding: 24px;">
    <div style="max-width: 700px; margin: 0 auto; background: #102844; border-radius: 12px; overflow: hidden; border: 1px solid #16375a;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #16375a; background: linear-gradient(135deg, #00ff88 0%, #00c2ff 100%); color: #0B1E32;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700;">
          Daily performance cron – ${updated} closed
        </h1>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">
          ${displayDate} • ${message}
        </p>
      </div>

      <div style="padding: 20px 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
          <tr>
            <td style="padding: 4px 0; font-weight: 600; width: 180px;">Positions closed</td>
            <td style="padding: 4px 0;">${updated}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Positions checked</td>
            <td style="padding: 4px 0;">${checked} of ${total_open} open</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Skipped (API / filters)</td>
            <td style="padding: 4px 0;">${skipped} skipped, ${filtered_out} filtered out</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Rate limited</td>
            <td style="padding: 4px 0;">${rate_limited}</td>
          </tr>
        </table>

        <h3 style="margin: 8px 0 8px 0; font-size: 15px; font-weight: 600;">Closed positions</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 4px;">
          <thead>
            <tr>
              <th align="left" style="padding: 6px 8px; border-bottom: 1px solid #16375a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.8;">Ticker</th>
              <th align="left" style="padding: 6px 8px; border-bottom: 1px solid #16375a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.8;">Reason</th>
              <th align="left" style="padding: 6px 8px; border-bottom: 1px solid #16375a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.8;">Exit</th>
              <th align="left" style="padding: 6px 8px; border-bottom: 1px solid #16375a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.8;">Return</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <div style="padding: 16px 24px; border-top: 1px solid #16375a; font-size: 12px; color: #9fb3c8;">
        <p style="margin: 0;">This is an internal notification from the performance cron. Only sent when at least one position is closed.</p>
      </div>
    </div>
  </body>
</html>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      subject,
      html,
      tags: [
        { name: 'type', value: 'internal-notification' },
        { name: 'category', value: 'performance-update' },
      ],
    });

    console.log(`✅ Performance update notification sent to admin with ${updated} closed position(s)`);
  } catch (error) {
    console.error('❌ Failed to send performance update notification:', error);
  }
}

export interface NoBriefAlertParams {
  date: string;
  freeSubscribers: number;
  premiumSubscribers: number;
  reason?: string;
}

/**
 * Internal alert when the daily brief has no subscribers to send to.
 * Triggered from the automation when it falls back to admin-only delivery.
 */
export async function sendNoBriefAlert(params: NoBriefAlertParams) {
  try {
    const resend = getResendClient();
    if (!resend) {
      return;
    }

    const adminEmail = getAdminEmail();
    const fromEmail = getFromEmail();

    const { date, freeSubscribers, premiumSubscribers, reason } = params;

    const subject = `⚠️ No subscribers for Daily Ticker brief on ${date}`;

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #0B1E32; color: #F0F0F0; margin: 0; padding: 24px;">
    <div style="max-width: 640px; margin: 0 auto; background: #102844; border-radius: 12px; overflow: hidden; border: 1px solid #16375a;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #16375a; background: #ffb300; color: #0B1E32;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700;">
          No brief recipients for ${date}
        </h1>
        <p style="margin: 4px 0 0 0; font-size: 14px;">
          The daily brief automation ran but there were no active subscribers. The brief was only sent to the admin inbox.
        </p>
      </div>

      <div style="padding: 20px 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 4px 0; font-weight: 600; width: 200px;">Date</td>
            <td style="padding: 4px 0;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Active free subscribers</td>
            <td style="padding: 4px 0;">${freeSubscribers}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Active premium subscribers</td>
            <td style="padding: 4px 0;">${premiumSubscribers}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Reason</td>
            <td style="padding: 4px 0;">${reason || 'No active subscribers in Supabase for either tier.'}</td>
          </tr>
        </table>
      </div>

      <div style="padding: 16px 24px; border-top: 1px solid #16375a; font-size: 12px; color: #9fb3c8;">
        <p style="margin: 0;">This alert is only sent when there are zero subscribers and the brief is delivered to admin only.</p>
      </div>
    </div>
  </body>
</html>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      subject,
      html,
      tags: [
        { name: 'type', value: 'internal-notification' },
        { name: 'category', value: 'no-brief-alert' },
      ],
    });

    console.log(`✅ No-brief alert sent to admin for ${date}`);
  } catch (error) {
    console.error('❌ Failed to send no-brief alert:', error);
  }
}

export interface EngagementDigestNotificationParams {
  periodStart: string;
  periodEnd: string;
  subscriberSummary: {
    activeFree: number;
    activePremium: number;
    activeTotal: number;
    unsubscribed: number;
    bounced: number;
    total: number;
    avgOpenRate: number | null;
    avgClickRate: number | null;
    payingCustomers: number;
    annualRecurringRevenue: number;
  };
  newSubscribers: {
    total: number;
    free: number;
    premium: number;
  };
  unsubscribes: {
    total: number;
  };
  churnedPremium: {
    total: number;
  };
  cronSummary: {
    runs: number;
    successes: number;
    failures: number;
    emailsSentFree: number;
    emailsSentPremium: number;
  };
  utmSources: Array<{ source: string; count: number }>;
}

/**
 * Weekly/daily engagement digest summarizing growth, engagement, and cron stats.
 * Currently based on Supabase subscriber + cron tables (UTMs stand in for GA/GSC sources).
 */
export async function sendEngagementDigestNotification(
  params: EngagementDigestNotificationParams
) {
  try {
    const resend = getResendClient();
    if (!resend) {
      return;
    }

    const adminEmail = getAdminEmail();
    const fromEmail = getFromEmail();

    const {
      periodStart,
      periodEnd,
      subscriberSummary,
      newSubscribers,
      unsubscribes,
      churnedPremium,
      cronSummary,
      utmSources,
    } = params;

    const subject = `📊 Engagement digest (${periodStart} → ${periodEnd})`;

    const utmRows =
      utmSources.length > 0
        ? utmSources
            .map(
              (u) => `
          <tr>
            <td style="padding: 4px 8px; border-bottom: 1px solid #16375a;">${u.source}</td>
            <td style="padding: 4px 8px; border-bottom: 1px solid #16375a;">${u.count}</td>
          </tr>
        `
            )
            .join('')
        : `
          <tr>
            <td colspan="2" style="padding: 4px 8px; border-bottom: 1px solid #16375a; opacity: 0.7;">
              No UTM data recorded for this period.
            </td>
          </tr>
        `;

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #0B1E32; color: #F0F0F0; margin: 0; padding: 24px;">
    <div style="max-width: 720px; margin: 0 auto; background: #102844; border-radius: 12px; overflow: hidden; border: 1px solid #16375a;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #16375a; background: linear-gradient(135deg, #00ff88 0%, #00c2ff 100%); color: #0B1E32;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700;">
          Engagement & growth digest
        </h1>
        <p style="margin: 4px 0 0 0; font-size: 14px;">
          ${periodStart} → ${periodEnd}
        </p>
      </div>

      <div style="padding: 20px 24px;">
        <h2 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Subscribers & revenue</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
          <tr>
            <td style="padding: 4px 0; font-weight: 600; width: 220px;">Active free subscribers</td>
            <td style="padding: 4px 0;">${subscriberSummary.activeFree}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Active premium subscribers</td>
            <td style="padding: 4px 0;">${subscriberSummary.activePremium}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Total active subscribers</td>
            <td style="padding: 4px 0;">${subscriberSummary.activeTotal}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">New subscribers (this period)</td>
            <td style="padding: 4px 0;">${newSubscribers.total} total · ${newSubscribers.free} free · ${newSubscribers.premium} premium</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Unsubscribes (this period)</td>
            <td style="padding: 4px 0;">${unsubscribes.total}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Premium churn (canceled/past_due)</td>
            <td style="padding: 4px 0;">${churnedPremium.total}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Paying customers (now)</td>
            <td style="padding: 4px 0;">${subscriberSummary.payingCustomers}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Estimated ARR (now)</td>
            <td style="padding: 4px 0;">$${subscriberSummary.annualRecurringRevenue}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Avg open rate (all time)</td>
            <td style="padding: 4px 0;">${subscriberSummary.avgOpenRate ?? 'n/a'}%</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Avg click rate (all time)</td>
            <td style="padding: 4px 0;">${subscriberSummary.avgClickRate ?? 'n/a'}%</td>
          </tr>
        </table>

        <h2 style="margin: 12px 0 8px 0; font-size: 16px; font-weight: 600;">Daily brief cron</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
          <tr>
            <td style="padding: 4px 0; font-weight: 600; width: 220px;">Runs this period</td>
            <td style="padding: 4px 0;">${cronSummary.runs}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Successful runs</td>
            <td style="padding: 4px 0;">${cronSummary.successes}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Failed runs</td>
            <td style="padding: 4px 0;">${cronSummary.failures}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Emails sent (free)</td>
            <td style="padding: 4px 0;">${cronSummary.emailsSentFree}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Emails sent (premium)</td>
            <td style="padding: 4px 0;">${cronSummary.emailsSentPremium}</td>
          </tr>
        </table>

        <h2 style="margin: 12px 0 8px 0; font-size: 16px; font-weight: 600;">Top signup sources (UTM)</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 8px;">
          <thead>
            <tr>
              <th align="left" style="padding: 4px 8px; border-bottom: 1px solid #16375a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.8;">utm_source</th>
              <th align="left" style="padding: 4px 8px; border-bottom: 1px solid #16375a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.8;">New signups</th>
            </tr>
          </thead>
          <tbody>
            ${utmRows}
          </tbody>
        </table>

        <p style="margin: 8px 0 0 0; font-size: 12px; color: #9fb3c8;">
          Note: UTM breakdown comes from subscriber signups and is a proxy for GA/GSC traffic sources.
        </p>
      </div>
    </div>
  </body>
</html>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      subject,
      html,
      tags: [
        { name: 'type', value: 'internal-notification' },
        { name: 'category', value: 'engagement-digest' },
      ],
    });

    console.log(
      `✅ Engagement digest notification sent to admin for ${periodStart} → ${periodEnd}`
    );
  } catch (error) {
    console.error('❌ Failed to send engagement digest notification:', error);
  }
}

