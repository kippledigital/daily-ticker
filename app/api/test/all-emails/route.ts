import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/emails/send-welcome-email';
import { sendMorningBrief } from '@/lib/automation/email-sender';
import { sendErrorNotification, sendSuccessNotification } from '@/lib/automation/error-notifier';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Test endpoint to verify all email types are working
 * 
 * Usage: GET /api/test/all-emails?email=test@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        {
          error: 'Missing email parameter',
          usage: '/api/test/all-emails?email=test@example.com',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    console.log(`🧪 Testing all email types for ${email}...`);

    const results: Record<string, any> = {};

    // Test 1: Free Welcome Email
    console.log('Testing free welcome email...');
    const freeWelcome = await sendWelcomeEmail({ email, tier: 'free' });
    results.freeWelcomeEmail = {
      success: freeWelcome.success,
      emailId: freeWelcome.emailId,
      error: freeWelcome.error,
    };

    // Test 2: Premium Welcome Email
    console.log('Testing premium welcome email...');
    const premiumWelcome = await sendWelcomeEmail({ email, tier: 'premium' });
    results.premiumWelcomeEmail = {
      success: premiumWelcome.success,
      emailId: premiumWelcome.emailId,
      error: premiumWelcome.error,
    };

    // Test 3: Daily Brief Email (to specific email)
    console.log('Testing daily brief email...');
    const briefSent = await sendMorningBrief({
      subject: '[TEST] Daily Ticker Brief Test',
      htmlContent: '<h1>Test Brief</h1><p>This is a test of the daily brief email system.</p>',
      to: [email],
    });
    results.dailyBriefEmail = {
      success: briefSent,
    };

    // Test 4: Error Notification Email
    console.log('Testing error notification email...');
    try {
      await sendErrorNotification({
        step: 'Test Step',
        message: 'This is a test error notification',
        details: { test: true },
        timestamp: new Date(),
      });
      results.errorNotificationEmail = {
        success: true,
        note: 'Check admin email inbox',
      };
    } catch (err) {
      results.errorNotificationEmail = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }

    // Test 5: Success Notification Email (only if enabled)
    if (process.env.SEND_SUCCESS_NOTIFICATIONS) {
      console.log('Testing success notification email...');
      try {
        await sendSuccessNotification({
          stocksDiscovered: 3,
          stocksValidated: 3,
          emailsSent: 1,
          archiveStored: true,
          executionTime: 1.5,
          tickers: ['TEST', 'TEST2', 'TEST3'],
        });
        results.successNotificationEmail = {
          success: true,
          note: 'Check admin email inbox (only sent if SEND_SUCCESS_NOTIFICATIONS is set)',
        };
      } catch (err) {
        results.successNotificationEmail = {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
      }
    } else {
      results.successNotificationEmail = {
        success: true,
        skipped: true,
        note: 'SEND_SUCCESS_NOTIFICATIONS not enabled (this is normal)',
      };
    }

    // Summary
    const allSuccess = Object.values(results).every((r: any) => r.success !== false);
    const successCount = Object.values(results).filter((r: any) => r.success === true).length;
    const totalCount = Object.keys(results).length;

    return NextResponse.json({
      success: allSuccess,
      summary: {
        totalTests: totalCount,
        passed: successCount,
        failed: totalCount - successCount,
      },
      results,
      environment: {
        RESEND_API_KEY: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 7)}...` : 'NOT SET',
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'NOT SET',
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'NOT SET',
        SEND_SUCCESS_NOTIFICATIONS: process.env.SEND_SUCCESS_NOTIFICATIONS || 'NOT SET',
      },
      message: allSuccess
        ? `All ${successCount}/${totalCount} email types tested successfully!`
        : `Some email tests failed. Check results above.`,
    });
  } catch (error) {
    console.error('Error in all emails test:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

