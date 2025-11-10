import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/emails/send-welcome-email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Test endpoint to send a welcome email
 * 
 * Usage: GET /api/test/welcome-email?email=test@example.com&tier=free
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const tier = (searchParams.get('tier') || 'free') as 'free' | 'premium';

    if (!email) {
      return NextResponse.json(
        {
          error: 'Missing email parameter',
          usage: '/api/test/welcome-email?email=test@example.com&tier=free',
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

    console.log(`🧪 Testing welcome email send to ${email} (${tier} tier)...`);

    // Check environment variables
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'brief@dailyticker.co';

    const envCheck = {
      RESEND_API_KEY: apiKey ? `${apiKey.substring(0, 7)}...` : 'NOT SET',
      RESEND_FROM_EMAIL: fromEmail,
      NODE_ENV: process.env.NODE_ENV,
    };

    console.log('Environment check:', envCheck);

    // Send welcome email
    const result = await sendWelcomeEmail({ email, tier });

    return NextResponse.json({
      success: result.success,
      emailId: result.emailId,
      error: result.error,
      environment: envCheck,
      message: result.success
        ? `Welcome email sent successfully to ${email}`
        : `Failed to send welcome email: ${result.error}`,
    });
  } catch (error) {
    console.error('Error in test welcome email endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

