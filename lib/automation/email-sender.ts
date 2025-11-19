import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase client with SERVICE ROLE KEY for server-side operations
// This bypasses RLS and allows reading from subscribers table
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SendEmailParams {
  subject: string;
  htmlContent: string;
  to?: string[]; // Optional override, defaults to subscriber list
  tier?: 'free' | 'premium'; // Filter by tier
}

export interface SendEmailResult {
  success: boolean;
  sentCount: number;
  recipientCount: number;
  error?: string;
}

/**
 * Sends email using Resend API
 * Fetches subscribers from Supabase (replaces Beehiiv)
 * NOW RETURNS DETAILED RESULTS
 */
export async function sendMorningBrief(params: SendEmailParams): Promise<SendEmailResult> {
  const { subject, htmlContent, to, tier } = params;

  try {
    // Get recipient list from Supabase or use manual list
    const recipients = to || await getSubscriberEmails(tier);

    if (recipients.length === 0) {
      const tierLabel = tier ? `${tier} tier` : 'specified';
      console.warn(`⚠️  No recipients to send ${tierLabel} email to`);
      console.warn(`   Subject: ${subject}`);
      return {
        success: false,
        sentCount: 0,
        recipientCount: 0,
        error: `No ${tierLabel} subscribers found`,
      };
    }

    const tierLabel = tier ? `${tier} tier` : 'custom';
    console.log(`📧 Sending ${tierLabel} email to ${recipients.length} subscriber(s):`, recipients);
    console.log(`   Subject: ${subject}`);

    // Determine from address
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    // Send email via Resend (Resend sends email analytics to your dashboard automatically!)
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: recipients,
      subject: subject,
      html: htmlContent,
      // Tags for tracking in Resend dashboard and analytics
      tags: [
        {
          name: 'campaign',
          value: 'morning-brief',
        },
        {
          name: 'date',
          value: new Date().toISOString().split('T')[0],
        },
        {
          name: 'subscriber_count',
          value: recipients.length.toString(),
        },
        {
          name: 'automation',
          value: 'daily-ticker',
        },
      ],
      // Enable tracking for opens and clicks
      // Resend automatically tracks these and shows in your dashboard!
    });

    if (error) {
      console.error('❌ Error sending email via Resend:', error);
      console.error('   Error details:', JSON.stringify(error, null, 2));
      console.error('   Recipients:', recipients);
      console.error('   From address:', fromAddress);
      console.error('   Resend API key present:', !!process.env.RESEND_API_KEY);
      console.error('   Resend API key length:', process.env.RESEND_API_KEY?.length || 0);
      
      // More detailed error message
      const errorMessage = error.message || 'Resend API error';
      const errorDetails = error.name ? `${error.name}: ${errorMessage}` : errorMessage;
      
      return {
        success: false,
        sentCount: 0,
        recipientCount: recipients.length,
        error: `Resend API error: ${errorDetails}`,
      };
    }

    console.log('Email sent successfully:', data);

    // Update email sent count for all subscribers
    await updateEmailSentCount(recipients);

    return {
      success: true,
      sentCount: recipients.length,
      recipientCount: recipients.length,
    };
  } catch (error) {
    console.error('Error in sendMorningBrief:', error);
    return {
      success: false,
      sentCount: 0,
      recipientCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Gets subscriber email list from Supabase by tier
 * Only returns active subscribers
 */
async function getSubscriberEmails(tier?: 'free' | 'premium'): Promise<string[]> {
  try {
    console.log(`🔍 Fetching ${tier || 'all'} subscribers from Supabase...`);
    
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Supabase not configured! Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      throw new Error('Supabase configuration missing');
    }

    let query = supabase
      .from('subscribers')
      .select('email, tier, status')
      .eq('status', 'active');

    // Filter by tier if specified
    if (tier) {
      query = query.eq('tier', tier);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching Supabase subscribers:', error);
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);
      console.error('   Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    if (!data || data.length === 0) {
      const tierLabel = tier ? `${tier} tier` : 'all tiers';
      console.warn(`⚠️  No active ${tierLabel} subscribers found in Supabase`);
      console.warn('   This could mean:');
      console.warn('   1. No subscribers have signed up yet');
      console.warn('   2. All subscribers are unsubscribed/bounced');
      console.warn('   3. Database query issue');
      return [];
    }

    const emails = data.map((sub) => sub.email);
    const tierLabel = tier ? `${tier} tier` : 'all tiers';
    console.log(`✅ Found ${emails.length} active ${tierLabel} subscribers:`, emails);

    return emails;
  } catch (error) {
    console.error('❌ Error fetching subscribers:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
    return [];
  }
}

/**
 * Updates email sent count for subscribers
 */
async function updateEmailSentCount(emails: string[]): Promise<void> {
  try {
    // Increment emails_sent counter for all recipients
    const { error } = await supabase.rpc('increment_emails_sent', {
      email_list: emails,
    });

    if (error) {
      console.error('Error updating email sent count:', error);
    } else {
      console.log(`Updated email_sent count for ${emails.length} subscribers`);
    }
  } catch (error) {
    console.error('Error in updateEmailSentCount:', error);
  }
}

/**
 * Sends test email to specific address
 */
export interface SendTestEmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
  errorDetails?: any;
}

export async function sendTestEmail(params: SendEmailParams & { testEmail: string }): Promise<SendTestEmailResult> {
  const { testEmail, subject, htmlContent } = params;

  try {
    // Use Resend's test address if domain not verified, otherwise use custom domain
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [testEmail],
      subject: `[TEST] ${subject}`,
      html: htmlContent,
      tags: [
        {
          name: 'campaign',
          value: 'test-brief',
        },
      ],
    });

    if (error) {
      console.error('❌ Resend API error sending test email:');
      console.error('Error object:', JSON.stringify(error, null, 2));
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      return {
        success: false,
        error: error.message,
        errorDetails: error,
      };
    }

    console.log('✅ Test email sent successfully:', data);
    return {
      success: true,
      emailId: data?.id,
    };
  } catch (error) {
    console.error('❌ Exception in sendTestEmail:', error);
    if (error instanceof Error) {
      console.error('Exception message:', error.message);
      console.error('Exception stack:', error.stack);
      return {
        success: false,
        error: error.message,
        errorDetails: {
          stack: error.stack,
        },
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred',
    };
  }
}
