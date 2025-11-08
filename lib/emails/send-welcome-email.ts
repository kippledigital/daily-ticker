import { Resend } from 'resend';
import { generateFreeWelcomeEmail, generatePremiumWelcomeEmail } from './welcome-email-templates';

// Initialize Resend client (same pattern as other email modules)
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
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY is not configured! Cannot send welcome email.');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  // Validate API key format
  if (!apiKey.startsWith('re_')) {
    console.error('❌ RESEND_API_KEY format appears invalid (should start with re_)');
    return {
      success: false,
      error: 'Invalid API key format',
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
    console.log(`🔑 API Key present: ${apiKey.substring(0, 7)}...`);

    // Send email via Resend with retry logic
    let lastError: any = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
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
          lastError = error;
          console.error(`❌ Error sending welcome email via Resend (attempt ${attempt}/2):`, JSON.stringify(error, null, 2));
          
          // If it's a network error and we have retries left, wait and retry
          if (attempt < 2 && (error.name === 'application_error' || error.statusCode === null)) {
            console.log(`⏳ Retrying in 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          
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
      } catch (networkError: any) {
        lastError = networkError;
        console.error(`❌ Network error sending email (attempt ${attempt}/2):`, networkError?.message);
        
        if (attempt < 2) {
          console.log(`⏳ Retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
      }
    }

    // If we get here, all retries failed
    console.error('❌ All retry attempts failed. Last error:', lastError);
    return {
      success: false,
      error: lastError?.message || 'Failed to send welcome email after retries',
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

