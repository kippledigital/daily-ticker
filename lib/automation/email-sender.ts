import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface SendEmailParams {
  subject: string;
  htmlContent: string;
  to?: string[]; // Optional override, defaults to subscriber list
}

/**
 * Sends email using Resend API
 * Fetches subscribers from Supabase (replaces Beehiiv)
 */
export async function sendMorningBrief(params: SendEmailParams): Promise<boolean> {
  const { subject, htmlContent, to } = params;

  try {
    // Get recipient list from Supabase or use manual list
    const recipients = to || await getSubscriberEmails();

    if (recipients.length === 0) {
      console.warn('No recipients to send email to');
      return false;
    }

    console.log(`Sending to ${recipients.length} subscribers...`);

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
      console.error('Error sending email via Resend:', error);
      return false;
    }

    console.log('Email sent successfully:', data);

    // Update email sent count for all subscribers
    await updateEmailSentCount(recipients);

    return true;
  } catch (error) {
    console.error('Error in sendMorningBrief:', error);
    return false;
  }
}

/**
 * Gets subscriber email list from Supabase
 * Only returns active subscribers
 */
async function getSubscriberEmails(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('email')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching Supabase subscribers:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('No active subscribers found in Supabase');
      return [];
    }

    const emails = data.map((sub) => sub.email);
    console.log(`Found ${emails.length} active subscribers`);

    return emails;
  } catch (error) {
    console.error('Error fetching subscribers:', error);
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
