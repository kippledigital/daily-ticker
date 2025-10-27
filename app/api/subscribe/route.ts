import { NextRequest, NextResponse } from 'next/server';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254; // RFC 5321

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email format
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Trim and lowercase email
    const normalizedEmail = email.trim().toLowerCase();

    // Check length
    if (normalizedEmail.length > MAX_EMAIL_LENGTH) {
      return NextResponse.json(
        { error: 'Email address is too long.' },
        { status: 400 }
      );
    }

    // Check format with regex
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Beehiiv integration
    const beehiivApiKey = process.env.BEEHIIV_API_KEY;
    const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

    if (!beehiivApiKey || !publicationId) {
      console.error('Beehiiv credentials not configured');
      return NextResponse.json(
        { error: 'Subscription service not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${beehiivApiKey}`,
        },
        body: JSON.stringify({
          email: normalizedEmail,
          reactivate_existing: false,
          send_welcome_email: true,
          utm_source: 'website',
          utm_medium: 'organic',
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Beehiiv API error:', data);
      throw new Error(data.message || 'Failed to subscribe to newsletter');
    }

    console.log('New subscription successful:', normalizedEmail);

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed!'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
