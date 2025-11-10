import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';

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
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.unsubscribe);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMITS.unsubscribe.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    return await unsubscribeUser(email, rateLimitResult);
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
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.unsubscribe);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMITS.unsubscribe.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    return await unsubscribeUser(email, rateLimitResult);
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
 * SECURITY: Always returns same success message to prevent email enumeration
 */
async function unsubscribeUser(email: string, rateLimitResult: { remaining: number; resetTime: number }): Promise<NextResponse> {
  const normalizedEmail = email.trim().toLowerCase();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    // Return generic success message even for invalid format (prevents enumeration)
    const response = NextResponse.json({
      success: true,
      message: 'If this email was subscribed, it has been unsubscribed.'
    });
    response.headers.set('X-RateLimit-Limit', RATE_LIMITS.unsubscribe.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
    return response;
  }

  // Attempt to unsubscribe (silently handle errors to prevent enumeration)
  const { error } = await supabase
    .from('subscribers')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
    })
    .eq('email', normalizedEmail);

  // Log for internal tracking (not exposed to user)
  if (error) {
    if (error.code === 'PGRST116') {
      // Email not found - log but don't reveal to user
      console.log(`Unsubscribe attempted for non-existent email: ${normalizedEmail}`);
    } else {
      console.error('Error unsubscribing user:', error);
    }
  } else {
    console.log(`User unsubscribed: ${normalizedEmail}`);
  }

  // Always return same success message regardless of email existence (prevents enumeration)
  const response = NextResponse.json({
    success: true,
    message: 'If this email was subscribed, it has been unsubscribed.'
  });

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', RATE_LIMITS.unsubscribe.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

  return response;
}
