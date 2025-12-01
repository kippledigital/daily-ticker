import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Resend Webhook Endpoint
 *
 * Used to track real email engagement metrics (opens and clicks) in Supabase.
 * This keeps `emails_opened`, `emails_clicked`, and `email_events` in sync
 * with what Resend actually sees.
 *
 * NOTE: This endpoint currently does not verify Resend signatures.
 * You should keep the URL secret in the Resend dashboard. We can
 * tighten this later with signature verification if needed.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const eventType = body?.type as string | undefined;
    if (!eventType) {
      console.warn('⚠️  Resend webhook missing type field');
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // We only care about engagement events for now
    const isOpenEvent = eventType === 'email.opened';
    const isClickEvent = eventType === 'email.clicked';

    if (!isOpenEvent && !isClickEvent) {
      // Acknowledge other events without doing anything
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Resend webhook payloads include email details under data.email
    // or data.object.email depending on version – be defensive here.
    const emailPayload =
      body?.data?.email ||
      body?.data?.object?.email ||
      body?.data ||
      null;

    if (!emailPayload) {
      console.warn('⚠️  Resend webhook missing email payload:', body);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const emailId: string | undefined =
      emailPayload.id || body?.data?.id || body?.id;

    const toField = emailPayload.to;
    let recipients: string[] = [];

    if (Array.isArray(toField)) {
      recipients = toField;
    } else if (typeof toField === 'string') {
      recipients = [toField];
    }

    if (!recipients.length) {
      console.warn('⚠️  Resend webhook has no recipients in "to" field:', body);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const occurredAt: string =
      body?.created_at ||
      emailPayload?.created_at ||
      new Date().toISOString();

    const linkClicked: string | null =
      body?.data?.url ||
      body?.data?.link ||
      emailPayload?.url ||
      null;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Load matching subscribers (and current engagement counts)
    const { data: subscribers, error: subError } = await supabase
      .from('subscribers')
      .select('id, email, emails_opened, emails_clicked')
      .in('email', recipients);

    if (subError) {
      console.error('❌ Error fetching subscribers for Resend webhook:', subError);
      return NextResponse.json({ received: false }, { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      console.warn('⚠️  Resend webhook for unknown recipients:', recipients);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const now = new Date().toISOString();

    // Update engagement counters per subscriber
    for (const sub of subscribers) {
      if (isOpenEvent) {
        const openedCount = (sub.emails_opened || 0) + 1;
        const { error: updateError } = await supabase
          .from('subscribers')
          .update({
            emails_opened: openedCount,
            last_opened_at: now,
          })
          .eq('id', sub.id);

        if (updateError) {
          console.error(
            `❌ Failed to update emails_opened for ${sub.email}:`,
            updateError
          );
        }
      }

      if (isClickEvent) {
        const clickedCount = (sub.emails_clicked || 0) + 1;
        const { error: updateError } = await supabase
          .from('subscribers')
          .update({
            emails_clicked: clickedCount,
            last_clicked_at: now,
          })
          .eq('id', sub.id);

        if (updateError) {
          console.error(
            `❌ Failed to update emails_clicked for ${sub.email}:`,
            updateError
          );
        }
      }
    }

    // Insert detailed event rows for auditing
    const eventTypeLabel = isOpenEvent ? 'opened' : 'clicked';

    const emailEventsPayload = subscribers.map((sub) => ({
      subscriber_id: sub.id,
      email_id: emailId || 'unknown',
      event_type: eventTypeLabel,
      occurred_at: occurredAt,
      link_clicked: isClickEvent ? linkClicked : null,
      metadata: body,
    }));

    const { error: eventsError } = await supabase
      .from('email_events')
      .insert(emailEventsPayload);

    if (eventsError) {
      console.error('❌ Failed to insert email_events row(s):', eventsError);
      // Do not fail webhook – we already updated aggregate counters
    }

    console.log(
      `✅ Processed Resend webhook engagement event (${eventType}) for ${recipients.length} recipient(s)`
    );

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Error in Resend webhook handler:', error);
    return NextResponse.json(
      {
        received: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


