import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailParams {
  subject: string;
  htmlContent: string;
  to?: string[]; // Optional override, defaults to subscriber list
}

/**
 * Sends email using Resend API
 * Replaces Gumloop's Gmail sender
 */
export async function sendMorningBrief(params: SendEmailParams): Promise<boolean> {
  const { subject, htmlContent, to } = params;

  try {
    // Get recipient list from Beehiiv or use manual list
    const recipients = to || await getSubscriberEmails();

    if (recipients.length === 0) {
      console.warn('No recipients to send email to');
      return false;
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Daily Ticker <brief@dailyticker.co>',
      to: recipients,
      subject: subject,
      html: htmlContent,
      // Optional: Add tags for tracking
      tags: [
        {
          name: 'campaign',
          value: 'morning-brief',
        },
      ],
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
      return false;
    }

    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in sendMorningBrief:', error);
    return false;
  }
}

/**
 * Gets subscriber email list from Beehiiv
 * Falls back to test email if Beehiiv is not configured
 */
async function getSubscriberEmails(): Promise<string[]> {
  // Option 1: Use Beehiiv API to get active subscribers
  if (process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUBLICATION_ID) {
    try {
      const response = await fetch(
        `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
        {
          headers: {
            Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Beehiiv subscribers');
      }

      const data = await response.json();

      // Extract emails from active subscribers
      const emails = data.data
        .filter((sub: any) => sub.status === 'active')
        .map((sub: any) => sub.email);

      return emails;
    } catch (error) {
      console.error('Error fetching Beehiiv subscribers:', error);
    }
  }

  // Option 2: Use test email for development
  if (process.env.TEST_EMAIL) {
    return [process.env.TEST_EMAIL];
  }

  // Option 3: Fallback (configure in production)
  console.warn('No subscriber source configured. Set BEEHIIV_API_KEY or TEST_EMAIL');
  return [];
}

/**
 * Sends test email to specific address
 */
export async function sendTestEmail(params: SendEmailParams & { testEmail: string }): Promise<boolean> {
  const { testEmail, subject, htmlContent } = params;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Daily Ticker <brief@dailyticker.co>',
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
      console.error('Error sending test email:', error);
      return false;
    }

    console.log('Test email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in sendTestEmail:', error);
    return false;
  }
}
