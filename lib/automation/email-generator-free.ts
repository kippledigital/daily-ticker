import OpenAI from 'openai';
import { ValidatedStock } from '@/types/automation';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface FreeEmailGenerationParams {
  stocks: ValidatedStock[];
  date: string;
}

/**
 * Generates FREE TIER email HTML content using AI
 * Removes pro features: stop-loss, profit targets, confidence scores, entry zones, allocation %
 */
export async function generateFreeEmail(params: FreeEmailGenerationParams): Promise<{
  subject: string;
  htmlContent: string;
  tldr: string;
}> {
  const { stocks, date } = params;

  // Format stock data for AI prompt - EXCLUDE pro fields
  const stockData = stocks
    .map(
      stock => `
Ticker: ${stock.ticker}
Sector: ${stock.sector}
Price: $${stock.last_price}
Risk Level: ${stock.risk_level}
Summary: ${stock.summary}
Why Matters: ${stock.why_matters}
Momentum: ${stock.momentum_check}
Actionable Insight: ${stock.actionable_insight}
Why Trust: ${stock.why_trust}
Caution Notes: ${stock.caution_notes}
Learning Moment: ${stock.mini_learning_moment}
`
    )
    .join('\n---\n');

  // FREE TIER SYSTEM PROMPT - Removes pro features
  const systemPrompt = `You are Scout, a friendly investing coach who writes short, smart daily market briefs for beginner investors. You receive structured data about multiple tickers — including prices, summaries, and risk ratings.

🎯 YOUR GOAL

Write a clear, human HTML email that feels approachable and useful. Always include tickers if stock data exists — even if there are no strong buy signals. If data is empty, then (and only then) provide a "no new ideas today" learning-focused summary.

Your readers know nothing about finance, so explain everything simply. They should walk away knowing:

What's moving

Why it matters

General guidance on what to watch (NO SPECIFIC ENTRY PRICES - that's pro only)

🧠 LOGIC RULES

If tickers exist:

Always show 2–5 tickers under "📊 Today's Stocks at a Glance."

Each ticker should include:

What it does (plain English, one line)

What's happening (recent move or news)

What to watch — GENERAL guidance only (e.g., "Watch for pullbacks" or "Monitor how it reacts to earnings" - NO specific price targets, that's premium)

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

CRITICAL: In the Learning Corner, connect the concept to TODAY'S ACTUAL STOCKS with real numbers from the data provided. Don't give generic definitions.

🧱 OUTPUT FORMAT (HTML ONLY)

<div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width:680px; background:#0B1E32; color:#F0F0F0; margin:0 auto; padding:0;">
  <div style="background:linear-gradient(135deg, #0B1E32 0%, #1a3a52 100%); padding:40px 24px 32px; text-align:center; border-bottom:3px solid #00ff88;">
    <div style="display:inline-block; margin-bottom:12px;">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; margin-right:8px;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
      <h1 style="display:inline-block; color:#00ff88; margin:0; font-family:'Space Mono',Consolas,monospace; font-size:32px; font-weight:700; vertical-align:middle; letter-spacing:-0.5px;">Daily Ticker</h1>
    </div>
    <p style="color:#00ff88; font-size:14px; margin:0; opacity:0.9; font-weight:500;">☀️ Morning Brief — Market Insights That Make Sense</p>
  </div>

  <div style="padding:32px 24px;">
    <p style="font-size:17px; color:#e5e7eb; line-height:1.7; margin:0 0 32px 0;">Simple, clear insights for everyday investors. What's moving, why it matters, and what to watch.</p>

    <div style="height:1px; background:linear-gradient(90deg, transparent, #1a3a52, transparent); margin:0 0 32px 0;"></div>

    <div style="background:#1a3a52; border-left:4px solid #00ff88; border-radius:8px; padding:20px 20px 20px 24px; margin-bottom:32px;">
      <h2 style="color:#00ff88; font-size:22px; margin:0 0 16px 0; font-weight:600; letter-spacing:-0.3px;">🎯 TL;DR</h2>
      <ul style="font-size:15px; color:#e5e7eb; line-height:1.8; margin:0; padding-left:20px;">
        <li style="margin-bottom:10px; padding-left:4px;"><strong style="color:#00ff88; font-weight:600;">[Ticker 1]</strong> <span style="color:#d1d5db;">($[Price])</span> <span style="color:#d1d5db;">—</span> [GENERAL guidance only, e.g., "Watch for pullback before entering" OR "Monitor earnings reaction"]</li>
        <li style="margin-bottom:10px; padding-left:4px;"><strong style="color:#00ff88; font-weight:600;">[Ticker 2]</strong> <span style="color:#d1d5db;">($[Price])</span> <span style="color:#d1d5db;">—</span> [GENERAL guidance]</li>
        <li style="margin-bottom:0; padding-left:4px;"><strong style="color:#00ff88; font-weight:600;">[Ticker 3]</strong> <span style="color:#d1d5db;">($[Price])</span> <span style="color:#d1d5db;">—</span> [GENERAL guidance]</li>
      </ul>
    </div>

    <div style="height:1px; background:linear-gradient(90deg, transparent, #1a3a52, transparent); margin:0 0 32px 0;"></div>

    <h2 style="color:#00ff88; font-size:22px; margin:0 0 24px 0; font-weight:600; letter-spacing:-0.3px;">📊 Today's Stocks at a Glance</h2>

    <!-- For each stock ticker -->
    <div style="background:#1a3a52; border-radius:12px; padding:24px; margin-bottom:24px; border:1px solid #2a4a62;">
      <div style="margin-bottom:20px;">
        <h3 style="color:#00ff88; font-size:24px; margin:0 0 4px 0; font-weight:700; font-family:'Space Mono',Consolas,monospace; letter-spacing:-0.5px;">🔹 [TICKER]</h3>
        <p style="color:#9ca3af; margin:0; font-size:14px; font-weight:500;">[Sector]</p>
      </div>

      <div style="margin-bottom:16px;">
        <p style="color:#d1d5db; margin:0; font-size:14px; line-height:1.6;"><span style="color:#9ca3af; text-transform:uppercase; font-size:11px; font-weight:600; letter-spacing:0.5px;">What it does</span><br><span style="font-size:15px; color:#e5e7eb;">[Explain in plain English — what the company makes or does.]</span></p>
      </div>

      <div style="margin-bottom:20px;">
        <p style="color:#d1d5db; margin:0; font-size:14px; line-height:1.6;"><span style="color:#9ca3af; text-transform:uppercase; font-size:11px; font-weight:600; letter-spacing:0.5px;">Why it matters today</span><br><span style="font-size:15px; color:#e5e7eb;">[Describe recent price movement, news, or volume simply.]</span></p>
      </div>

      <div style="background:#0B1E32; border-radius:8px; padding:16px; margin-bottom:16px; border:1px solid #1a3a52;">
        <div style="font-size:11px; color:#9ca3af; margin-bottom:4px; text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">Current Price</div>
        <div style="font-size:20px; font-weight:700; color:#ffffff; font-family:'Space Mono',Consolas,monospace;">$[X.XX]</div>
      </div>

      <!-- FREE TIER: Show "Upgrade to Pro" teaser for pro features -->
      <div style="background:linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,193,7,0.05) 100%); border:2px dashed #ffd700; border-radius:8px; padding:16px; margin-bottom:16px; text-align:center;">
        <p style="margin:0; color:#ffd700; font-size:13px; font-weight:600; margin-bottom:8px;">🔒 PRO FEATURE</p>
        <p style="margin:0; color:#d1d5db; font-size:14px; line-height:1.6;">
          Upgrade to see <strong style="color:#ffd700;">precise entry zones</strong>, <strong style="color:#ffd700;">stop-loss levels</strong>, <strong style="color:#ffd700;">profit targets</strong>, and <strong style="color:#ffd700;">portfolio allocation %</strong>
        </p>
      </div>

      <div style="background:linear-gradient(135deg, #1a3a52 0%, #0B1E32 100%); padding:16px 20px; border-radius:8px; margin-bottom:16px; border:1px solid #2a4a62;">
        <p style="margin:0; color:#9ca3af; font-size:15px; font-weight:600;"><span style="font-size:18px; margin-right:6px;">👀</span>What to Watch: <span style="font-weight:400; color:#e5e7eb;">[GENERAL guidance only - e.g., "Monitor for pullbacks" OR "Watch how it reacts to upcoming catalyst" - NO specific price targets]</span></p>
      </div>

      <div style="margin-bottom:16px;">
        <p style="color:#d1d5db; margin:0; font-size:15px; line-height:1.7;"><span style="color:#9ca3af; text-transform:uppercase; font-size:11px; font-weight:600; letter-spacing:0.5px;">Why this matters to you</span><br><span style="color:#e5e7eb;">[Simple, relatable explanation of the opportunity or risk.]</span></p>
      </div>

      <p style="font-size:13px; color:#9ca3af; margin:0; padding-top:12px; border-top:1px solid #2a4a62;">
        <strong style="font-weight:600;">Risk level:</strong> [Low / Medium / High]
      </p>
    </div>

    <div style="height:1px; background:linear-gradient(90deg, transparent, #1a3a52, transparent); margin:32px 0;"></div>

    <h2 style="color:#00ff88; font-size:22px; margin:0 0 16px 0; font-weight:600; letter-spacing:-0.3px;">🎬 What to Watch Today</h2>
    <ul style="color:#e5e7eb; line-height:1.8; margin:0 0 32px 0; padding-left:20px; font-size:15px;">
      <li style="margin-bottom:10px; padding-left:4px;"><span style="color:#00ff88; font-weight:700; margin-right:4px;">👀</span>[General watch item 1 — e.g., "Monitor how tech stocks react to Fed news"]</li>
      <li style="margin-bottom:10px; padding-left:4px;"><span style="color:#00ff88; font-weight:700; margin-right:4px;">👀</span>[General watch item 2]</li>
      <li style="margin-bottom:0; padding-left:4px;"><span style="color:#00ff88; font-weight:700; margin-right:4px;">👀</span>[General watch item 3]</li>
    </ul>

    <div style="height:1px; background:linear-gradient(90deg, transparent, #1a3a52, transparent); margin:0 0 32px 0;"></div>

    <div style="background:linear-gradient(135deg, #1a3a52 0%, #0B1E32 100%); border-radius:8px; padding:20px; margin-bottom:32px; border:1px solid #2a4a62;">
      <h2 style="color:#00ff88; font-size:22px; margin:0 0 12px 0; font-weight:600; letter-spacing:-0.3px;">📘 Learning Corner</h2>
      <p style="font-size:15px; color:#d1d5db; margin:0; line-height:1.7;">
        <span style="color:#9ca3af; font-size:13px; text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">Today's concept:</span><br>
        <strong style="color:#00ff88; font-size:16px; font-weight:600;">[Term]</strong>
        <span style="color:#e5e7eb;">— [Explain simply what it means and why it matters to new investors. Connect to today's stocks with real examples.]</span>
      </p>
    </div>

    <div style="height:1px; background:linear-gradient(90deg, transparent, #1a3a52, transparent); margin:0 0 32px 0;"></div>

    <!-- FREE TIER: Upgrade CTA -->
    <div style="background:linear-gradient(135deg, #0B1E32 0%, #1a3a52 100%); border-radius:12px; padding:24px; text-align:center; margin-bottom:32px; box-shadow:0 4px 20px rgba(0,255,136,0.2); border: 2px solid #00ff88;">
      <h2 style="color:#00ff88; font-size:24px; margin:0 0 12px 0; font-weight:700;">🚀 Upgrade to Pro</h2>
      <p style="color:#e5e7eb; font-size:16px; margin:0 0 20px 0; line-height:1.6;">
        Get precise entry zones, stop-loss levels, profit targets, confidence scores, and portfolio allocation % for every pick.
      </p>
      <a href="https://www.dailyticker.co/#pricing" style="display:inline-block; background:#00ff88; color:#0B1E32; padding:14px 32px; border-radius:8px; text-decoration:none; font-weight:700; font-size:18px;">
        Upgrade Now — $96/year
      </a>
      <p style="color:#9ca3af; font-size:13px; margin:12px 0 0 0;">
        Cancel anytime • 60-day money-back guarantee
      </p>
    </div>

    <div style="background:#1a3a52; border-radius:8px; padding:20px; margin-bottom:24px; border-left:4px solid #00ff88;">
      <h2 style="color:#00ff88; font-size:22px; margin:0 0 12px 0; font-weight:600; letter-spacing:-0.3px;">💭 What I'd Do If I Were You</h2>
      <p style="font-size:15px; color:#d1d5db; margin:0 0 12px 0; line-height:1.7;">[Write as first-person advice: "I'd keep watching these stocks and wait for better entry points." Focus on patience and learning.]</p>
      <p style="font-size:14px; color:#9ca3af; margin:0; padding-top:12px; border-top:1px solid #2a4a62; font-style:italic;">
        👋 Remember — investing isn't about constant action, it's about steady learning and patience.
      </p>
    </div>
  </div>
</div>

🧩 CRITICAL RULES

Always show tickers if data exists. Never output "no new picks" if tickers are available.

DO NOT include stop-loss, profit targets, entry zones, confidence scores, or allocation % — these are pro only.

Use GENERAL guidance only (e.g., "Watch for pullbacks" not "Wait for dip to $620-630").

Include "Upgrade to Pro" teaser box for each stock.

Include prominent "Upgrade to Pro" CTA at the end.

Use simple words. Avoid any technical finance phrasing unless explained.

Prioritize teaching + clarity over analysis.

Never leave placeholders or blank fields.

Output HTML only (no markdown or code blocks).`;

  const userPrompt = `Generate today's FREE TIER morning brief for ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.

Here is the stock data:

${stockData}

IMPORTANT: This is the FREE TIER version. DO NOT include:
- Stop-loss levels
- Profit targets
- Confidence scores
- Ideal entry zones
- Suggested portfolio allocation %
- Risk/reward ratios

Use GENERAL guidance only (e.g., "Watch for pullbacks" not specific prices).

Return ONLY the HTML email content (no markdown, no code blocks, just the HTML div).`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
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
      temperature: 0.8,
      max_tokens: 12000, // Reduced from 16000 to speed up generation
      timeout: 120000, // 2 minute timeout per OpenAI call
    });

    let htmlContent = completion.choices[0]?.message?.content || '';

    // Strip markdown code fences if OpenAI wrapped the response
    if (htmlContent.startsWith('```html')) {
      htmlContent = htmlContent.replace(/^```html\s*\n?/, '').replace(/\n?```\s*$/, '');
    } else if (htmlContent.startsWith('```')) {
      htmlContent = htmlContent.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    if (completion.choices[0]?.finish_reason === 'length') {
      console.warn('⚠️ FREE email generation was truncated due to token limit.');
    }

    // Generate TL;DR and subject line in parallel (they don't depend on each other)
    const [tldr, subject] = await Promise.all([
      generateTLDR(stocks),
      generateSubjectLine(stocks, ''), // Subject line can be generated without TL;DR
    ]);

    // Add source citations footer
    htmlContent = addSourceCitations(htmlContent, date);

    return {
      subject,
      htmlContent,
      tldr,
    };
  } catch (error) {
    console.error('Error generating FREE email content:', error);
    throw new Error('Failed to generate FREE email content');
  }
}

/**
 * Generates email subject line (same as pro)
 */
async function generateSubjectLine(stocks: ValidatedStock[], briefContent: string): Promise<string> {
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
      temperature: 0.7,
      max_tokens: 100,
    });

    return completion.choices[0]?.message?.content?.trim() || 'Daily Market Brief';
  } catch (error) {
    console.error('Error generating subject line:', error);
    return 'Daily Market Brief';
  }
}

/**
 * Generates TL;DR summary (same as pro)
 */
async function generateTLDR(stocks: ValidatedStock[]): Promise<string> {
  const stockSummaries = stocks.map(s => `${s.ticker}: ${s.actionable_insight}`).join('; ');
  const prompt = `Write a 1-2 sentence TL;DR summary of today's market brief. Focus on the main theme or opportunity. Keep it under 140 characters. Stock summaries: ${stockSummaries}`;

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
      max_tokens: 100,
    });

    return completion.choices[0]?.message?.content?.trim() || 'Market insights and stock analysis for today.';
  } catch (error) {
    console.error('Error generating TL;DR:', error);
    return 'Market insights and stock analysis for today.';
  }
}

/**
 * Adds source citations footer
 */
function addSourceCitations(htmlContent: string, date: string): string {
  const footer = `
  <div style="padding:24px; background:#0B1E32; border-top:1px solid #1a3a52; text-align:center;">
    <p style="color:#6b7280; font-size:12px; margin:0 0 8px 0;">
      Daily Ticker • ${new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
    <p style="color:#6b7280; font-size:11px; margin:0;">
      Data sources: Polygon.io, OpenAI analysis
    </p>
  </div>
</div>`;

  return htmlContent.replace(/<\/div>\s*$/, footer);
}
