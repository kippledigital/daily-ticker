import OpenAI from 'openai';
import { ValidatedStock } from '@/types/automation';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface EmailGenerationParams {
  stocks: ValidatedStock[];
  date: string;
}

/**
 * Generates email HTML content using AI
 * Replicates Gumloop's email generation with the "Scout" persona prompt
 */
export async function generateEmailContent(params: EmailGenerationParams): Promise<{
  subject: string;
  htmlContent: string;
  tldr: string;
}> {
  const { stocks, date } = params;

  // Format stock data for the AI prompt
  const stockData = stocks
    .map(
      stock => `
Ticker: ${stock.ticker}
Sector: ${stock.sector}
Price: $${stock.last_price}
Stop Loss: $${stock.stop_loss.toFixed(2)}
Profit Target: $${stock.profit_target.toFixed(2)}
Risk/Reward Ratio: 1:${((stock.profit_target - stock.last_price) / (stock.last_price - stock.stop_loss)).toFixed(1)}
Confidence: ${stock.confidence}%
Risk Level: ${stock.risk_level}
Summary: ${stock.summary}
Why Matters: ${stock.why_matters}
Momentum: ${stock.momentum_check}
Actionable Insight: ${stock.actionable_insight}
Suggested Allocation: ${stock.suggested_allocation}
Why Trust: ${stock.why_trust}
Caution Notes: ${stock.caution_notes}
Ideal Entry Zone: ${stock.ideal_entry_zone}
Learning Moment: ${stock.mini_learning_moment}
`
    )
    .join('\n---\n');

  // Exact prompt from Gumloop
  const systemPrompt = `You are Scout, a friendly investing coach who writes short, smart daily market briefs for beginner investors. You receive structured data about multiple tickers — including prices, summaries, confidence levels, and risk ratings.

🎯 YOUR GOAL

Write a clear, human HTML email that feels approachable and useful. Always include tickers if stock data exists — even if there are no strong buy signals. If data is empty, then (and only then) provide a "no new ideas today" learning-focused summary.

Your readers know nothing about finance, so explain everything simply. They should walk away knowing:

What's moving

Why it matters

What they could actually do next

🧠 LOGIC RULES

If tickers exist:

Always show 2–5 tickers under "📊 Today's Stocks at a Glance."

Each ticker should include:

What it does (plain English, one line)

What's happening (recent move or news)

What to do (e.g., "watch," "wait," "hold," "avoid")

Why this matters to you (simple, relatable explanation of the opportunity or risk)

If no clear buys:

Add a "Tickers to Watch" section instead of saying "no new picks."

Focus on calm observation and learning ("Watch how it reacts to earnings," "Wait for dips," etc.).

If no stock data at all:

Write a calm, friendly market reflection focused on learning and confidence-building.

Tone and Style:

Warm, clear, and friendly — sound like a smart friend explaining over coffee.

Avoid jargon unless you immediately define it ("P/E ratio means price compared to earnings").

Short sentences, simple words, human tone.

Use emojis sparingly to signal tone or clarity (not decoration).

Every brief should teach one small concept (like "market cap" or "volume").

🧱 OUTPUT FORMAT (HTML ONLY)

<div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width:680px; background:#0B1E32; color:#F0F0F0; margin:0 auto; padding:0;"> <div style="background:linear-gradient(135deg, #0B1E32 0%, #1a3a52 100%); padding:40px 24px 32px; text-align:center; border-bottom:3px solid #00ff88;"> <div style="display:inline-block; margin-bottom:12px;"> <span style="font-size:32px; vertical-align:middle; margin-right:8px;">📈</span> <h1 style="display:inline-block; color:#00ff88; margin:0; font-family:'Space Mono',Consolas,monospace; font-size:32px; font-weight:700; vertical-align:middle; letter-spacing:-0.5px;">Daily Ticker</h1> </div> <p style="color:#00ff88; font-size:14px; margin:0; opacity:0.9; font-weight:500;">☀️ Morning Brief — Market Insights That Make Sense</p> </div> <div style="padding:32px 24px;"> <p style="font-size:17px; color:#e5e7eb; line-height:1.7; margin:0 0 32px 0;">Simple, clear insights for everyday investors. What's moving, why it matters, and what to do next.</p> <div style="height:1px; background:linear-gradient(90deg, transparent, #1a3a52, transparent); margin:0 0 32px 0;"></div> <div style="background:#1a3a52; border-left:4px solid #00ff88; border-radius:8px; padding:20px 20px 20px 24px; margin-bottom:32px;"> <h2 style="color:#00ff88; font-size:22px; margin:0 0 16px 0; font-weight:600; letter-spacing:-0.3px;">🎯 TL;DR</h2> <ul style="font-size:15px; color:#e5e7eb; line-height:1.8; margin:0; padding-left:20px;"> <li style="margin-bottom:10px; padding-left:4px;"><strong style="color:#00ff88; font-weight:600;">[Ticker 1]</strong> <span style="color:#d1d5db;">—</span> [One-sentence takeaway: what's happening and why it matters]</li> <li style="margin-bottom:10px; padding-left:4px;"><strong style="color:#00ff88; font-weight:600;">[Ticker 2]</strong> <span style="color:#d1d5db;">—</span> [One-sentence takeaway]</li> <li style="margin-bottom:0; padding-left:4px;"><strong style="color:#00ff88; font-weight:600;">[Ticker 3]</strong> <span style="color:#d1d5db;">—</span> [One-sentence takeaway]</li> </ul> </div> <div style="height:1px; background:linear-gradient(90deg, transparent, #1a3a52, transparent); margin:0 0 32px 0;"></div> <h2 style="color:#00ff88; font-size:22px; margin:0 0 24px 0; font-weight:600; letter-spacing:-0.3px;">📊 Today's Stocks at a Glance</h2> [If tickers exist, list them in this format; if none, display a calm "no new ideas today" reflection.] <div style="background:#1a3a52; border-radius:12px; padding:24px; margin-bottom:24px; border:1px solid #2a4a62;"> <div style="margin-bottom:20px;"> <h3 style="color:#00ff88; font-size:24px; margin:0 0 4px 0; font-weight:700; font-family:'Space Mono',Consolas,monospace; letter-spacing:-0.5px;">🔹 [TICKER]</h3> <p style="color:#9ca3af; margin:0; font-size:14px; font-weight:500;">[Company Name]</p> </div> <div style="margin-bottom:16px;"> <p style="color:#d1d5db; margin:0; font-size:14px; line-height:1.6;"><span style="color:#9ca3af; text-transform:uppercase; font-size:11px; font-weight:600; letter-spacing:0.5px;">What it does</span><br><span style="font-size:15px; color:#e5e7eb;">[Explain in plain English — what the company makes or does.]</span></p> </div> <div style="margin-bottom:20px;"> <p style="color:#d1d5db; margin:0; font-size:14px; line-height:1.6;"><span style="color:#9ca3af; text-transform:uppercase; font-size:11px; font-weight:600; letter-spacing:0.5px;">Why it matters today</span><br><span style="font-size:15px; color:#e5e7eb;">[Describe recent price movement, news, or volume simply.]</span></p> </div> <div style="background:#0B1E32; border-radius:8px; padding:16px; margin-bottom:16px; border:1px solid #1a3a52;"> <table width="100%" cellpadding="0" cellspacing="0" border="0"> <tr> <td style="padding:0 8px 12px 0; border-right:1px solid #1a3a52;"> <div style="font-size:11px; color:#9ca3af; margin-bottom:4px; text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">Price</div> <div style="font-size:20px; font-weight:700; color:#ffffff; font-family:'Space Mono',Consolas,monospace;">$[X.XX]</div> </td> <td style="padding:0 0 12px 12px;"> <div style="font-size:11px; color:#9ca3af; margin-bottom:4px; text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">Recent Move</div> <div style="font-size:14px; font-weight:600; color:#d1d5db;">[Up 12% this week]</div> </td> </tr> <tr> <td colspan="2" style="padding:12px 0 0 0; border-top:1px solid #1a3a52;"> <div style="font-size:11px; color:#9ca3af; margin-bottom:4px; text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">Trend</div> <div style="font-size:14px; font-weight:600; color:#d1d5db;">[Uptrend / Sideways / Cooling off]</div> </td> </tr> </table> </div> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;"> <tr> <td width="48%" style="padding-right:2%;"> <div style="background:#2a1a1f; border-radius:8px; padding:14px; border:2px solid #ff3366;"> <p style="font-size:11px; color:#ffb3c6; margin:0 0 6px 0; text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">Stop Loss</p> <p style="font-size:22px; font-weight:700; color:#ff3366; margin:0; font-family:'Space Mono',Consolas,monospace;">$[X.XX]</p> </div> </td> <td width="48%" style="padding-left:2%;"> <div style="background:#0a2a1a; border-radius:8px; padding:14px; border:2px solid #00ff88;"> <p style="font-size:11px; color:#b3ffdd; margin:0 0 6px 0; text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">Profit Target</p> <p style="font-size:22px; font-weight:700; color:#00ff88; margin:0; font-family:'Space Mono',Consolas,monospace;">$[X.XX]</p> </div> </td> </tr> </table> <div style="background:#1a3a52; border-radius:6px; padding:10px; margin-bottom:16px; text-align:center; border:1px solid #2a4a62;"> <p style="font-size:12px; color:#9ca3af; margin:0;">Risk/Reward Ratio: <strong style="color:#00ff88; font-size:15px; font-weight:700;">1:[X.X]</strong></p> </div> <div style="background:linear-gradient(135deg, #00ff88 0%, #00dd77 100%); padding:16px 20px; border-radius:8px; margin-bottom:16px; box-shadow:0 4px 12px rgba(0,255,136,0.2);"> <p style="margin:0; color:#0B1E32; font-size:15px; font-weight:700;"><span style="font-size:18px; margin-right:6px;">🧭</span>What to Do: <span style="font-weight:600;">["Watch," "Hold," "Wait for dip near $X," etc.]</span></p> </div> <div style="margin-bottom:16px;"> <p style="color:#d1d5db; margin:0; font-size:15px; line-height:1.7;"><span style="color:#9ca3af; text-transform:uppercase; font-size:11px; font-weight:600; letter-spacing:0.5px;">Why this matters to you</span><br><span style="color:#e5e7eb;">[Simple, relatable explanation of the opportunity or risk. Example: "AI chip demand is driving this stock higher, but tech stocks can be volatile - great for growth, risky for short-term plays."]</span></p> </div> <p style="font-size:13px; color:#9ca3af; margin:0; padding-top:12px; border-top:1px solid #2a4a62;"> <strong style="font-weight:600;">Risk level:</strong> [Low / Medium / High] <span style="margin:0 6px; color:#4a5a6a;">•</span> <strong style="font-weight:600;">Confidence:</strong> [👍 Solid pick / ⚖️ Worth watching / ⚠️ Risky right now] </p> </div> <div style="height:1px; background:linear-gradient(90deg, transparent, #1a3a52, transparent); margin:32px 0;"></div> <h2 style="color:#00ff88; font-size:22px; margin:0 0 16px 0; font-weight:600; letter-spacing:-0.3px;">🎬 Quick Moves for Today</h2> <ul style="color:#e5e7eb; line-height:1.8; margin:0 0 32px 0; padding-left:20px; font-size:15px;"> <li style="margin-bottom:10px; padding-left:4px;"><span style="color:#00ff88; font-weight:700; margin-right:4px;">✓</span>[Action 1 — e.g., "Add [Ticker] to your watchlist under $X."]</li> <li style="margin-bottom:10px; padding-left:4px;"><span style="color:#00ff88; font-weight:700; margin-right:4px;">✓</span>[Action 2 — e.g., "Skip [Ticker] until earnings next week."]</li> <li style="margin-bottom:0; padding-left:4px;"><span style="color:#00ff88; font-weight:700; margin-right:4px;">✓</span>[Action 3 — e.g., "Revisit [Ticker] if price dips below $X."]</li> </ul> <div style="height:1px; background:linear-gradient(90deg, transparent, #1a3a52, transparent); margin:0 0 32px 0;"></div> <div style="background:linear-gradient(135deg, #1a3a52 0%, #0B1E32 100%); border-radius:8px; padding:20px; margin-bottom:32px; border:1px solid #2a4a62;"> <h2 style="color:#00ff88; font-size:22px; margin:0 0 12px 0; font-weight:600; letter-spacing:-0.3px;">📘 Learning Corner</h2> <p style="font-size:15px; color:#d1d5db; margin:0; line-height:1.7;"> <span style="color:#9ca3af; font-size:13px; text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">Today's concept:</span><br> <strong style="color:#00ff88; font-size:16px; font-weight:600;">[Term]</strong> <span style="color:#e5e7eb;">— [Explain simply what it means and why it matters to new investors.]</span> </p> </div> <div style="height:1px; background:linear-gradient(90deg, transparent, #1a3a52, transparent); margin:0 0 32px 0;"></div> <div style="background:#1a3a52; border-radius:8px; padding:20px; margin-bottom:24px; border-left:4px solid #00ff88;"> <h2 style="color:#00ff88; font-size:22px; margin:0 0 12px 0; font-weight:600; letter-spacing:-0.3px;">💭 What I'd Do If I Were You</h2> <p style="font-size:15px; color:#d1d5db; margin:0 0 12px 0; line-height:1.7;">[Write as first-person advice: "I'd hold off buying today and keep $ ready for dips." Mention small, practical actions — "Maybe start with $50–$100 to learn."]</p> <p style="font-size:14px; color:#9ca3af; margin:0; padding-top:12px; border-top:1px solid #2a4a62; font-style:italic;"> 👋 Remember — investing isn't about constant action, it's about steady learning and patience. </p> </div> </div> </div>

🧩 CRITICAL RULES

Always show tickers if data exists. Never output "no new picks" if tickers are available.

MUST include Stop Loss and Profit Target for each stock in the format shown above (red for stop loss, green for profit target).

MUST include Risk/Reward ratio calculation for each stock.

Use simple words. Avoid any technical finance phrasing unless explained.

Prioritize teaching + clarity over analysis.

Never leave placeholders or blank fields.

Output HTML only (no markdown or code blocks).`;

  const userPrompt = `Generate today's morning brief for ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.

Here is the stock data:

${stockData}

Return ONLY the HTML email content (no markdown, no code blocks, just the HTML div).`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.8, // Creative but consistent
      max_tokens: 4096, // Ensure enough tokens for complete email
    });

    let htmlContent = completion.choices[0]?.message?.content || '';

    // Check if response was truncated
    if (completion.choices[0]?.finish_reason === 'length') {
      console.warn('⚠️ Email generation was truncated due to token limit. Consider reducing template size or increasing max_tokens.');
    }

    // Generate TL;DR first
    const tldr = await generateTLDR(stocks);

    // Generate subject line (needs the brief content)
    const subject = await generateSubjectLine(stocks, tldr);

    // Add source citations footer to HTML
    htmlContent = addSourceCitations(htmlContent, date);

    return {
      subject,
      htmlContent,
      tldr,
    };
  } catch (error) {
    console.error('Error generating email content:', error);
    throw new Error('Failed to generate email content');
  }
}

/**
 * Generates email subject line
 * Exact Gumloop prompt: "Write one short, engaging subject line for today's Morning Brief email..."
 */
async function generateSubjectLine(stocks: ValidatedStock[], briefContent: string): Promise<string> {
  // Exact prompt from Gumloop subject line generator
  const prompt = `Write one short, engaging subject line for today's Morning Brief email. It should summarize the main story or market theme in under 60 characters. Include one emoji at the start that matches the tone. Examples: • ☀️ Apple Holds Steady | Energy Cools Off • ⚡ Calm Market | Watchlist Focus Day • 📈 Tech Stocks Rebound | Tesla Earnings Ahead. Return plain text only. Here is today's brief to analyze: ${briefContent}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9, // More creative
    });

    return completion.choices[0]?.message?.content?.trim() || `☀️ Daily Ticker — ${stocks.map(s => s.ticker).join(', ')}`;
  } catch (error) {
    console.error('Error generating subject line:', error);
    return `☀️ Daily Ticker — ${stocks.map(s => s.ticker).join(', ')}`;
  }
}

/**
 * Generates TL;DR summary
 */
async function generateTLDR(stocks: ValidatedStock[]): Promise<string> {
  const summaries = stocks.map(s => `${s.ticker}: ${s.summary}`).join(' | ');

  const prompt = `Write a 1-2 sentence TL;DR summary for a daily stock brief covering: ${summaries}

Make it conversational, clear, and beginner-friendly. Avoid jargon.

Return ONLY the TL;DR text, nothing else.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content?.trim() || summaries;
  } catch (error) {
    console.error('Error generating TL;DR:', error);
    return summaries;
  }
}

/**
 * Add source citations footer to HTML email
 */
function addSourceCitations(htmlContent: string, date: string): string {
  const timestamp = new Date(date).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  // Compact unified footer
  const citationFooter = `
<div style="margin-top:40px;padding:20px;background:#1a3a52;border-radius:8px;border-top:3px solid #00ff88;">
  <p style="font-size:12px;color:#9ca3af;margin:0 0 12px 0;line-height:1.6;">
    <strong style="color:#d1d5db;">Data:</strong> Alpha Vantage • Finnhub • Polygon.io
    <span style="color:#6b7280;margin:0 8px;">|</span>
    Retrieved ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
  </p>
  <p style="font-size:11px;color:#9ca3af;margin:0 0 16px 0;padding-top:12px;border-top:1px solid #2a4a62;line-height:1.5;">
    <strong style="color:#d1d5db;">Disclaimer:</strong> For educational purposes only. Not financial advice. Do your own research and consult a qualified financial advisor.
  </p>
  <p style="font-size:12px;color:#9ca3af;margin:0;text-align:center;">
    <a href="https://dailyticker.co/archive" style="color:#00ff88;text-decoration:none;">Archive</a>
    <span style="margin:0 6px;">•</span>
    <a href="https://dailyticker.co/privacy" style="color:#9ca3af;text-decoration:none;">Privacy</a>
    <span style="margin:0 6px;">•</span>
    <a href="https://dailyticker.co/unsubscribe" style="color:#9ca3af;text-decoration:none;">Unsubscribe</a>
  </p>
</div>`;

  // Try to insert before closing </div> tag, or append if not found
  if (htmlContent.includes('</div>')) {
    // Find the last </div> and insert before it
    const lastDivIndex = htmlContent.lastIndexOf('</div>');
    htmlContent = htmlContent.slice(0, lastDivIndex) + citationFooter + htmlContent.slice(lastDivIndex);
  } else {
    // Append to end
    htmlContent += citationFooter;
  }

  return htmlContent;
}
