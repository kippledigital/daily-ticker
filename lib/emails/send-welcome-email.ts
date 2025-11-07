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

  try {
    // Generate email content based on tier
    const emailContent =
      tier === 'premium'
        ? generatePremiumWelcomeEmail({ email, tier })
        : generateFreeWelcomeEmail({ email, tier });

    // Determine from address
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'brief@dailyticker.co';

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
      console.error('Error sending welcome email via Resend:', error);
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
    console.error('Exception in sendWelcomeEmail:', error);
    if (error instanceof Error) {
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

