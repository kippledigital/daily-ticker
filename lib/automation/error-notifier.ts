import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends error notification email to admin
 * Notifies you when daily automation fails
 */
export async function sendErrorNotification(error: {
  step: string;
  message: string;
  details?: any;
  timestamp: Date;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'nikki.kipple@gmail.com';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'brief@dailyticker.co';

  try {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #ff3366; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">⚠️ Daily Ticker Automation Failed</h1>
  </div>

  <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 16px;">
      <h2 style="margin: 0 0 12px 0; color: #ff3366; font-size: 18px;">Error Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 120px;">Failed Step:</td>
          <td style="padding: 8px 0;">${error.step}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Error Message:</td>
          <td style="padding: 8px 0; color: #ff3366;">${error.message}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Timestamp:</td>
          <td style="padding: 8px 0;">${error.timestamp.toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'long',
            timeZone: 'America/Los_Angeles'
          })}</td>
        </tr>
      </table>
    </div>

    ${error.details ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 16px;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px;">Additional Details</h3>
      <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 13px;">${JSON.stringify(error.details, null, 2)}</pre>
    </div>
    ` : ''}

    <div style="background: white; padding: 20px; border-radius: 8px;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px;">Next Steps</h3>
      <ol style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Check Vercel logs for detailed error trace</li>
        <li style="margin-bottom: 8px;">Verify all API keys are valid (Alpha Vantage, Finnhub, Polygon, OpenAI)</li>
        <li style="margin-bottom: 8px;">Check API rate limits and quotas</li>
        <li style="margin-bottom: 8px;">Manually trigger automation: <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px;">curl https://daily-ticker.vercel.app/api/cron/daily-brief</code></li>
      </ol>
    </div>

    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 13px;">
      <p style="margin: 0;">Daily Ticker Automation System</p>
      <p style="margin: 4px 0 0 0;"><a href="https://daily-ticker.vercel.app" style="color: #00ff88; text-decoration: none;">View Dashboard</a> • <a href="https://vercel.com/nikkikipple-gmailcoms-projects/daily-ticker" style="color: #00ff88; text-decoration: none;">Vercel Logs</a></p>
    </div>
  </div>
</body>
</html>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `🚨 Daily Ticker Automation Failed - ${error.step}`,
      html,
    });

    console.log(`✅ Error notification sent to ${adminEmail}`);
  } catch (notificationError) {
    console.error('❌ Failed to send error notification:', notificationError);
    // Don't throw - we don't want notification failures to crash the system
  }
}

/**
 * Sends success notification with stats
 * Notifies you when automation completes successfully
 */
export async function sendSuccessNotification(stats: {
  stocksDiscovered: number;
  stocksValidated: number;
  emailsSent: number;
  archiveStored: boolean;
  executionTime: number;
  tickers: string[];
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'nikki.kipple@gmail.com';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'brief@dailyticker.co';

  // Only send success notifications if explicitly enabled
  if (!process.env.SEND_SUCCESS_NOTIFICATIONS) {
    return;
  }

  try {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #00ff88; color: #0B1E32; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">✅ Daily Brief Sent Successfully</h1>
  </div>

  <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
    <div style="background: white; padding: 20px; border-radius: 8px;">
      <h2 style="margin: 0 0 12px 0; font-size: 18px;">Automation Stats</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 180px;">Stocks Discovered:</td>
          <td style="padding: 8px 0;">${stats.stocksDiscovered}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Stocks Validated:</td>
          <td style="padding: 8px 0; color: ${stats.stocksValidated >= 3 ? '#00ff88' : '#ff9800'};">${stats.stocksValidated}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Tickers:</td>
          <td style="padding: 8px 0; font-family: monospace;">${stats.tickers.join(', ')}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Emails Sent:</td>
          <td style="padding: 8px 0;">${stats.emailsSent}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Archive Stored:</td>
          <td style="padding: 8px 0;">${stats.archiveStored ? '✅ Yes' : '❌ No'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Execution Time:</td>
          <td style="padding: 8px 0;">${stats.executionTime.toFixed(2)}s</td>
        </tr>
      </table>
    </div>
  </div>
</body>
</html>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `✅ Daily Ticker Brief Sent - ${stats.tickers.join(', ')}`,
      html,
    });

    console.log(`✅ Success notification sent to ${adminEmail}`);
  } catch (notificationError) {
    console.error('❌ Failed to send success notification:', notificationError);
  }
}
