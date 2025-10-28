import { NextRequest, NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/automation/email-sender';

/**
 * Test endpoint for email sending with Resend
 *
 * Usage:
 * GET /api/test/send-email?email=your@email.com
 *
 * Sends a simple test email to verify Resend configuration
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testEmail = searchParams.get('email');

    if (!testEmail) {
      return NextResponse.json(
        {
          error: 'Missing email parameter',
          usage: '/api/test/send-email?email=your@email.com',
          note: 'Make sure you have verified your sending domain in Resend first!',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    console.log(`Sending test email to ${testEmail}...`);

    // Send simple test email
    const result = await sendTestEmail({
      testEmail,
      subject: '📈 Daily Ticker Test Email',
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 30px;
    }
    .content {
      background: #f8f9fa;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .success-badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      margin: 10px 0;
    }
    .info-box {
      background: white;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      margin-top: 30px;
    }
    code {
      background: #e5e7eb;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 28px;">📈 Daily Ticker</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Email System Test</p>
  </div>

  <div class="content">
    <div class="success-badge">✅ Test Successful</div>

    <h2 style="margin-top: 20px; color: #1a1a1a;">Your email system is working!</h2>

    <p>This test email confirms that:</p>

    <div class="info-box">
      <strong>✓ Resend API:</strong> Connected and authenticated
    </div>

    <div class="info-box">
      <strong>✓ Domain Verification:</strong> <code>dailyticker.co</code> is verified
    </div>

    <div class="info-box">
      <strong>✓ Email Delivery:</strong> Working correctly
    </div>

    <div class="info-box">
      <strong>✓ Automation System:</strong> Ready to send daily briefs
    </div>

    <h3 style="margin-top: 30px; color: #1a1a1a;">Next Steps:</h3>
    <ol style="line-height: 1.8;">
      <li>Run the full automation to generate a complete brief</li>
      <li>Test with real stock data (AAPL, NVDA, MSFT)</li>
      <li>Deploy to Vercel for production use</li>
      <li>Set up cron schedule (M-F 8 AM EST)</li>
    </ol>

    <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
      <strong>Note:</strong> This is a test email. Your automated daily briefs will include:
      real-time stock analysis, AI-validated data, social sentiment, and actionable insights.
    </p>
  </div>

  <div class="footer">
    <p>Powered by <strong>Daily Ticker</strong> automation system</p>
    <p style="font-size: 12px; margin-top: 10px;">
      Built with OpenAI • Alpha Vantage • Finnhub • Polygon.io • Resend
    </p>
  </div>
</body>
</html>
      `,
    });

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: `Test email sent successfully to ${testEmail}`,
          emailId: result.emailId,
          nextSteps: [
            'Check your inbox (including spam folder)',
            'Verify the email looks good',
            'Test the full automation with: /api/test/full-pipeline',
            'Deploy to production when ready',
          ],
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send email',
          errorDetails: result.errorDetails,
          possibleReasons: [
            'Resend API key is invalid',
            'Sending domain (dailyticker.co) is not verified in Resend',
            'Recipient email is invalid or blocked',
            'Resend account has not been activated',
            'Resend account is in sandbox mode (verify recipient or request production access)',
          ],
          howToFix: [
            '1. Go to https://resend.com/domains',
            '2. Verify dailyticker.co is showing as "Active"',
            '3. Check if account is in sandbox mode',
            '4. If sandbox mode: Request production access at https://resend.com/settings',
            '5. Try sending test email again',
          ],
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in email test:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
