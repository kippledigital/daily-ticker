import { Resend } from 'resend';
import { generateFreeWelcomeEmail, generatePremiumWelcomeEmail } from './welcome-email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendWelcomeEmailParams {
  email: string;
  tier: 'free' | 'premium';
}

export interface SendWelcomeEmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

/**
 * Sends welcome email to new subscribers
 * Matches the branding and style of daily briefs
 */
export async function sendWelcomeEmail(
  params: SendWelcomeEmailParams
): Promise<SendWelcomeEmailResult> {
  const { email, tier } = params;

  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not configured! Cannot send welcome email.');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    // Generate email content based on tier
    const emailContent =
      tier === 'premium'
        ? generatePremiumWelcomeEmail({ email, tier })
        : generateFreeWelcomeEmail({ email, tier });

    // Determine from address
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'brief@dailyticker.co';
    
    console.log(`📧 Attempting to send welcome email to ${email} (${tier} tier) from ${fromAddress}`);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject: emailContent.subject,
      html: emailContent.htmlContent,
      tags: [
        {
          name: 'campaign',
          value: 'welcome-email',
        },
        {
          name: 'tier',
          value: tier,
        },
        {
          name: 'type',
          value: 'transactional',
        },
      ],
    });

    if (error) {
      console.error('❌ Error sending welcome email via Resend:', JSON.stringify(error, null, 2));
      return {
        success: false,
        error: error.message || 'Failed to send welcome email',
      };
    }

    console.log(`✅ Welcome email sent successfully to ${email} (${tier} tier):`, data?.id);
    return {
      success: true,
      emailId: data?.id,
    };
  } catch (error) {
    console.error('❌ Exception in sendWelcomeEmail:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred',
    };
  }
}

