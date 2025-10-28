import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254; // RFC 5321

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

    // Get client info for tracking
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Parse UTM parameters from referer if available
    const referer = request.headers.get('referer') || '';
    const url = new URL(referer || request.url);
    const utmSource = url.searchParams.get('utm_source') || 'website';
    const utmMedium = url.searchParams.get('utm_medium') || 'organic';
    const utmCampaign = url.searchParams.get('utm_campaign') || null;

    // Insert into Supabase
    const { data, error } = await supabase
      .from('subscribers')
      .insert({
        email: normalizedEmail,
        status: 'active',
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (error) {
      // Check if email already exists
      if (error.code === '23505') { // Unique constraint violation
        // Check if they're already subscribed or unsubscribed
        const { data: existingSub } = await supabase
          .from('subscribers')
          .select('status')
          .eq('email', normalizedEmail)
          .single();

        if (existingSub?.status === 'active') {
          return NextResponse.json(
            { error: 'This email is already subscribed!' },
            { status: 400 }
          );
        } else if (existingSub?.status === 'unsubscribed') {
          // Reactivate subscription
          const { error: updateError } = await supabase
            .from('subscribers')
            .update({
              status: 'active',
              unsubscribed_at: null,
              subscribed_at: new Date().toISOString()
            })
            .eq('email', normalizedEmail);

          if (updateError) {
            throw updateError;
          }

          console.log('Reactivated subscription:', normalizedEmail);
          return NextResponse.json(
            {
              success: true,
              message: 'Welcome back! Successfully resubscribed!'
            },
            { status: 200 }
          );
        }
      }

      console.error('Supabase error:', error);
      throw error;
    }

    console.log('New subscription successful:', normalizedEmail);

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed! Check your email.'
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
