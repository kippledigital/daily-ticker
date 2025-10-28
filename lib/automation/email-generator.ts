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

Beginner-friendly explanation ("This means…" or "In plain terms…")

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

<div style="font-family: Inter, Arial, sans-serif; max-width:720px; color:#222; line-height:1.6; margin:auto;"> <h1 style="color:#2c3e50;">☀️ Morning Brief — Top Stocks to Watch</h1> <p style="font-size:16px;">Simple, clear insights for everyday investors. What's moving, why it matters, and what to do next.</p> <hr style="border:0;border-top:1px solid #ddd;margin:20px 0;"> <h2 style="color:#1a5276;">🎯 TL;DR</h2> <ul style="font-size:16px;"> <li><strong>[Ticker 1]</strong> — [One-sentence takeaway: what's happening and why it matters]</li> <li><strong>[Ticker 2]</strong> — [One-sentence takeaway]</li> <li><strong>[Ticker 3]</strong> — [One-sentence takeaway]</li> </ul> <hr style="border:0;border-top:1px solid #ddd;margin:20px 0;"> <h2 style="color:#145a32;">📊 Today's Stocks at a Glance</h2> [If tickers exist, list them in this format; if none, display a calm "no new ideas today" reflection.] <div style="margin-bottom:30px;"> <h3 style="color:#2471a3;">🔹 [TICKER] — [Company Name]</h3> <p><strong>What it does:</strong> [Explain in plain English — what the company makes or does.]</p> <p><strong>Why it matters today:</strong> [Describe recent price movement, news, or volume simply.]</p> <ul style="padding-left:18px;"> <li><strong>Price:</strong> $[X]</li> <li><strong>Recent move:</strong> [E.g., "Up 12% this week after strong earnings."]</li> <li><strong>Trend:</strong> [Uptrend / Sideways / Cooling off]</li> </ul> <p style="background:#f8f9fa;padding:12px;border-left:4px solid #3498db;"> <strong>🧭 What to Do:</strong> ["Watch," "Hold," "Wait for dip near $X," etc.] </p> <p style="font-size:15px;color:#444;"> <strong>💡 In Plain English:</strong> [Explain what this means for a beginner. Example: "This stock is popular right now because of AI news, but prices can swing a lot."] </p> <p style="font-size:14px;color:#555;"> <strong>Risk level:</strong> [Low / Medium / High] | <strong>Confidence:</strong> [👍 Solid pick / ⚖️ Worth watching / ⚠️ Risky right now] </p> </div> <hr style="border:0;border-top:1px solid #ddd;margin:20px 0;"> <h2 style="color:#76448a;">🎬 Quick Moves for Today</h2> <ul> <li>✓ [Action 1 — e.g., "Add [Ticker] to your watchlist under $X."]</li> <li>✓ [Action 2 — e.g., "Skip [Ticker] until earnings next week."]</li> <li>✓ [Action 3 — e.g., "Revisit [Ticker] if price dips below $X."]</li> </ul> <hr style="border:0;border-top:1px solid #ddd;margin:20px 0;"> <h2 style="color:#d35400;">📘 Learning Corner</h2> <p style="font-size:15px;">Today's concept: <strong>[Term]</strong> — [Explain simply what it means and why it matters to new investors.]</p> <hr style="border:0;border-top:1px solid #ddd;margin:20px 0;"> <h2 style="color:#117a65;">💭 What I'd Do If I Were You</h2> <p style="font-size:15px;">[Write as first-person advice: "I'd hold off buying today and keep $ ready for dips." Mention small, practical actions — "Maybe start with $50–$100 to learn."]</p> <p style="font-size:14px;color:#666;margin-top:20px;"> 👋 Remember — investing isn't about constant action, it's about steady learning and patience. </p> <p style="font-size:12px;color:#999;margin-top:20px;"><strong>Sources:</strong> Yahoo Finance, Google Finance, Perplexity, Market news feeds</p> </div>

🧩 CRITICAL RULES

Always show tickers if data exists. Never output "no new picks" if tickers are available.

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
    });

    const htmlContent = completion.choices[0]?.message?.content || '';

    // Generate TL;DR first
    const tldr = await generateTLDR(stocks);

    // Generate subject line (needs the brief content)
    const subject = await generateSubjectLine(stocks, tldr);

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
