import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Unsubscribe endpoint
 *
 * Usage:
 * POST /api/unsubscribe
 * Body: { "email": "user@example.com" }
 *
 * Or via GET for email links:
 * GET /api/unsubscribe?email=user@example.com
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    return await unsubscribeUser(email);
  } catch (error) {
    console.error('Error in unsubscribe POST:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for one-click unsubscribe links in emails
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    return await unsubscribeUser(email);
  } catch (error) {
    console.error('Error in unsubscribe GET:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Unsubscribe user from email list
 */
async function unsubscribeUser(email: string): Promise<NextResponse> {
  const normalizedEmail = email.trim().toLowerCase();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return NextResponse.json(
      { error: 'Invalid email format' },
      { status: 400 }
    );
  }

  // Update subscriber status to unsubscribed
  const { data, error } = await supabase
    .from('subscribers')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
    })
    .eq('email', normalizedEmail)
    .select()
    .single();

  if (error) {
    // Check if email doesn't exist
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Email not found in subscriber list' },
        { status: 404 }
      );
    }

    console.error('Error unsubscribing user:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe. Please try again.' },
      { status: 500 }
    );
  }

  console.log(`User unsubscribed: ${normalizedEmail}`);

  return NextResponse.json({
    success: true,
    message: 'Successfully unsubscribed. We\'re sorry to see you go!',
    email: normalizedEmail,
  });
}
