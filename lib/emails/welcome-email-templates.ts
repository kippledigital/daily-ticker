/**
 * Welcome Email Templates
 * Branded to match Daily Ticker's dark theme and style
 */

export interface WelcomeEmailParams {
  email: string;
  tier: 'free' | 'premium';
}

/**
 * Generates welcome email HTML for free tier subscribers
 */
export function generateFreeWelcomeEmail(params: WelcomeEmailParams): {
  subject: string;
  htmlContent: string;
} {
  const { email } = params;

  const subject = '🎉 Welcome to Daily Ticker — Your first brief arrives tomorrow!';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Daily Ticker</title>
</head>
<body style="margin:0; padding:0; background-color:#0B1E32; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
  <div style="max-width:680px; margin:0 auto; background:#0B1E32; color:#F0F0F0; padding:0;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg, #0B1E32 0%, #1a3a52 100%); padding:40px 24px 32px; text-align:center; border-bottom:3px solid #00ff88;">
      <div style="display:inline-block; margin-bottom:12px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; margin-right:8px;">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline points="17 6 23 6 23 12"></polyline>
        </svg>
        <h1 style="display:inline-block; color:#00ff88; margin:0; font-family:'Space Mono',Consolas,monospace; font-size:32px; font-weight:700; vertical-align:middle; letter-spacing:-0.5px;">Daily Ticker</h1>
      </div>
      <p style="color:#00ff88; font-size:14px; margin:0; opacity:0.9; font-weight:500;">Welcome aboard! 🎉</p>
    </div>

    <!-- Main Content -->
    <div style="padding:32px 24px;">
      
      <h2 style="color:#00ff88; font-size:28px; margin:0 0 16px 0; font-weight:600; letter-spacing:-0.3px;">
        You're all set!
      </h2>
      
      <p style="font-size:17px; color:#e5e7eb; line-height:1.7; margin:0 0 24px 0;">
        Thanks for joining Daily Ticker. Starting tomorrow at 8 AM EST, you'll receive your first daily brief with actionable stock picks and market insights.
      </p>

      <div style="height:1px; background:linear-gradient(90deg, transparent, #1a3a52, transparent); margin:24px 0;"></div>

      <!-- What You'll Get -->
      <div style="background:#1a3a52; border-radius:12px; padding:24px; margin-bottom:24px; border:1px solid #2a4a62;">
        <h3 style="color:#00ff88; font-size:22px; margin:0 0 20px 0; font-weight:600; letter-spacing:-0.3px;">
          📊 What You'll Get (Free Tier)
        </h3>
        
        <ul style="color:#e5e7eb; line-height:1.8; margin:0; padding-left:20px; font-size:15px;">
          <li style="margin-bottom:12px; padding-left:4px;">
            <strong style="color:#00ff88;">1-3 stock picks daily</strong> — based on market opportunities
          </li>
          <li style="margin-bottom:12px; padding-left:4px;">
            <strong style="color:#00ff88;">Entry prices & sector analysis</strong> — understand what's moving and why
          </li>
          <li style="margin-bottom:12px; padding-left:4px;">
            <strong style="color:#00ff88;">Momentum checks & risk assessment</strong> — make informed decisions
          </li>
          <li style="margin-bottom:12px; padding-left:4px;">
            <strong style="color:#00ff88;">7-day archive access</strong> — review past picks anytime
          </li>
          <li style="margin-bottom:0; padding-left:4px;">
            <strong style="color:#00ff88;">5-minute read, zero fluff</strong> — clear insights that respect your time
          </li>
        </ul>
      </div>

      <!-- Upgrade CTA -->
      <div style="background:linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(0,255,136,0.05) 100%); border:2px solid rgba(0,255,136,0.3); border-radius:12px; padding:24px; margin-bottom:24px;">
        <h3 style="color:#00ff88; font-size:20px; margin:0 0 12px 0; font-weight:600;">
          ✨ Want More? Upgrade to Pro
        </h3>
        <p style="font-size:15px; color:#d1d5db; margin:0 0 16px 0; line-height:1.7;">
          Pro subscribers get <strong style="color:#00ff88;">confidence scores</strong>, <strong style="color:#00ff88;">stop-loss levels</strong>, <strong style="color:#00ff88;">profit targets</strong>, and <strong style="color:#00ff88;">portfolio allocation guidance</strong> that turn analysis into action.
        </p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://daily-ticker.vercel.app'}/#pricing" style="display:inline-block; background:linear-gradient(135deg, #00ff88 0%, #00dd77 100%); color:#0B1E32; font-weight:700; font-size:15px; padding:14px 28px; border-radius:8px; text-decoration:none; box-shadow:0 4px 12px rgba(0,255,136,0.3); transition:all 0.2s;">
          View Pro Pricing →
        </a>
      </div>

      <div style="height:1px; background:linear-gradient(90deg, transparent, #1a3a52, transparent); margin:24px 0;"></div>

      <!-- Next Steps -->
      <div style="background:#1a3a52; border-left:4px solid #00ff88; border-radius:8px; padding:20px 20px 20px 24px; margin-bottom:24px;">
        <h3 style="color:#00ff88; font-size:20px; margin:0 0 12px 0; font-weight:600;">
          🎯 What Happens Next?
        </h3>
        <p style="font-size:15px; color:#d1d5db; margin:0; line-height:1.7;">
          Your first daily brief will arrive in your inbox tomorrow at <strong style="color:#00ff88;">8:00 AM EST</strong>. 
          We'll send you 1-3 actionable stock picks with clear explanations of what's moving and why it matters.
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align:center; padding-top:24px; border-top:1px solid #1a3a52;">
        <p style="font-size:14px; color:#9ca3af; margin:0 0 12px 0;">
          Questions? Just reply to this email — we read every message.
        </p>
        <p style="font-size:13px; color:#6b7280; margin:0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://daily-ticker.vercel.app'}/archive" style="color:#00ff88; text-decoration:none;">View Archive</a>
          <span style="margin:0 8px; color:#4a5a6a;">•</span>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://daily-ticker.vercel.app'}/privacy" style="color:#00ff88; text-decoration:none;">Privacy Policy</a>
          <span style="margin:0 8px; color:#4a5a6a;">•</span>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://daily-ticker.vercel.app'}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#00ff88; text-decoration:none;">Unsubscribe</a>
        </p>
        <p style="font-size:12px; color:#6b7280; margin:16px 0 0 0;">
          Daily Ticker — Market insights that make sense. Delivered daily at 8 AM EST.
        </p>
      </div>

    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, htmlContent };
}

/**
 * Generates welcome email HTML for premium tier subscribers
 */
export function generatePremiumWelcomeEmail(params: WelcomeEmailParams): {
  subject: string;
  htmlContent: string;
} {
  const { email } = params;

  const subject = '🚀 Welcome to Daily Ticker Pro — You now have the full toolkit!';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Daily Ticker Pro</title>
</head>
<body style="margin:0; padding:0; background-color:#0B1E32; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
  <div style="max-width:680px; margin:0 auto; background:#0B1E32; color:#F0F0F0; padding:0;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg, #0B1E32 0%, #1a3a52 100%); padding:40px 24px 32px; text-align:center; border-bottom:3px solid #00ff88;">
      <div style="display:inline-block; margin-bottom:12px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; margin-right:8px;">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline points="17 6 23 6 23 12"></polyline>
        </svg>
        <h1 style="display:inline-block; color:#00ff88; margin:0; font-family:'Space Mono',Consolas,monospace; font-size:32px; font-weight:700; vertical-align:middle; letter-spacing:-0.5px;">Daily Ticker</h1>
        <span style="display:inline-block; background:linear-gradient(135deg, #00ff88 0%, #00dd77 100%); color:#0B1E32; font-size:12px; font-weight:700; padding:4px 10px; border-radius:12px; margin-left:8px; vertical-align:middle;">PRO</span>
      </div>
      <p style="color:#00ff88; font-size:14px; margin:0; opacity:0.9; font-weight:500;">Welcome to Pro! 🚀</p>
    </div>

    <!-- Main Content -->
    <div style="padding:32px 24px;">
      
      <h2 style="color:#00ff88; font-size:28px; margin:0 0 16px 0; font-weight:600; letter-spacing:-0.3px;">
        You're now a Pro member!
      </h2>
      
      <p style="font-size:17px; color:#e5e7eb; line-height:1.7; margin:0 0 24px 0;">
        Thanks for upgrading to Daily Ticker Pro. Starting tomorrow at 8 AM EST, you'll receive premium briefs with everything you need to trade with precision.
      </p>

      <div style="height:1px; background:linear-gradient(90deg, transparent, #1a3a52, transparent); margin:24px 0;"></div>

      <!-- Pro Features -->
      <div style="background:linear-gradient(135deg, #1a3a52 0%, #0B1E32 100%); border:2px solid #00ff88; border-radius:12px; padding:24px; margin-bottom:24px;">
        <h3 style="color:#00ff88; font-size:22px; margin:0 0 20px 0; font-weight:600; letter-spacing:-0.3px;">
          ✨ Your Pro Toolkit
        </h3>
        
        <ul style="color:#e5e7eb; line-height:1.8; margin:0; padding-left:20px; font-size:15px;">
          <li style="margin-bottom:12px; padding-left:4px;">
            <strong style="color:#00ff88;">AI Confidence Scores</strong> (0-100%) — know which picks have the highest conviction
          </li>
          <li style="margin-bottom:12px; padding-left:4px;">
            <strong style="color:#00ff88;">Precise Entry Zones</strong> — save 3-5% on entries with exact price ranges
          </li>
          <li style="margin-bottom:12px; padding-left:4px;">
            <strong style="color:#00ff88;">Stop-Loss Levels</strong> — protect your capital with automatic exit points
          </li>
          <li style="margin-bottom:12px; padding-left:4px;">
            <strong style="color:#00ff88;">Profit Targets</strong> — 2:1 reward-to-risk ratios for every pick
          </li>
          <li style="margin-bottom:12px; padding-left:4px;">
            <strong style="color:#00ff88;">Portfolio Allocation %</strong> — optimize position sizing for each pick
          </li>
          <li style="margin-bottom:12px; padding-left:4px;">
            <strong style="color:#00ff88;">Full Risk Breakdown</strong> — all caution notes and risk factors
          </li>
          <li style="margin-bottom:12px; padding-left:4px;">
            <strong style="color:#00ff88;">Unlimited Archive Access</strong> — review all past picks and performance
          </li>
          <li style="margin-bottom:0; padding-left:4px;">
            <strong style="color:#00ff88;">Daily Learning Moments</strong> — investing concepts explained in plain English
          </li>
        </ul>
      </div>

      <!-- Example Preview -->
      <div style="background:#1a3a52; border-radius:12px; padding:20px; margin-bottom:24px; border:1px solid #2a4a62;">
        <h3 style="color:#00ff88; font-size:20px; margin:0 0 16px 0; font-weight:600;">
          📊 Here's What Your Pro Briefs Look Like
        </h3>
        <div style="background:#0B1E32; border-radius:8px; padding:16px; margin-bottom:12px; border:1px solid #2a4a62;">
          <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <div>
              <div style="font-size:20px; font-weight:700; color:#ffffff; font-family:'Space Mono',Consolas,monospace; margin-bottom:4px;">NVDA</div>
              <div style="font-size:12px; color:#9ca3af;">87% Confidence • Allocate 8%</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:18px; font-weight:700; color:#ffffff; font-family:'Space Mono',Consolas,monospace;">$521.45</div>
              <div style="font-size:14px; font-weight:600; color:#00ff88;">+5.2%</div>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
            <div style="background:#2a1a1f; border:2px solid #ff3366; border-radius:8px; padding:12px; text-align:center;">
              <div style="font-size:11px; color:#ffb3c6; margin-bottom:4px; text-transform:uppercase; font-weight:600;">Stop Loss</div>
              <div style="font-size:18px; font-weight:700; color:#ff3366; font-family:'Space Mono',Consolas,monospace;">$480.00</div>
            </div>
            <div style="background:#0a2a1a; border:2px solid #00ff88; border-radius:8px; padding:12px; text-align:center;">
              <div style="font-size:11px; color:#b3ffdd; margin-bottom:4px; text-transform:uppercase; font-weight:600;">Profit Target</div>
              <div style="font-size:18px; font-weight:700; color:#00ff88; font-family:'Space Mono',Consolas,monospace;">$604.00</div>
            </div>
          </div>
          <div style="background:linear-gradient(135deg, #1a3a52 0%, #0B1E32 100%); border:2px solid #00ff88; border-radius:8px; padding:12px; text-align:center;">
            <div style="font-size:11px; color:#00ff88; margin-bottom:4px; text-transform:uppercase; font-weight:600;">💰 Ideal Entry Zone</div>
            <div style="font-size:16px; font-weight:700; color:#ffffff; font-family:'Space Mono',Consolas,monospace;">$510-$515</div>
          </div>
        </div>
        <p style="font-size:13px; color:#9ca3af; margin:0; line-height:1.6;">
          Every pick includes these precision tools. This is what turns analysis into action.
        </p>
      </div>

      <div style="height:1px; background:linear-gradient(90deg, transparent, #1a3a52, transparent); margin:24px 0;"></div>

      <!-- Next Steps -->
      <div style="background:#1a3a52; border-left:4px solid #00ff88; border-radius:8px; padding:20px 20px 20px 24px; margin-bottom:24px;">
        <h3 style="color:#00ff88; font-size:20px; margin:0 0 12px 0; font-weight:600;">
          🎯 What Happens Next?
        </h3>
        <p style="font-size:15px; color:#d1d5db; margin:0 0 12px 0; line-height:1.7;">
          Your first <strong style="color:#00ff88;">Pro brief</strong> will arrive tomorrow at <strong style="color:#00ff88;">8:00 AM EST</strong> with full confidence scores, stop-losses, profit targets, and allocation guidance.
        </p>
        <p style="font-size:15px; color:#d1d5db; margin:0; line-height:1.7;">
          You'll also get <strong style="color:#00ff88;">daily learning moments</strong> that explain investing concepts using real examples from that day's picks.
        </p>
      </div>

      <!-- Money-Back Guarantee -->
      <div style="background:linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(0,255,136,0.05) 100%); border:2px solid rgba(0,255,136,0.3); border-radius:12px; padding:20px; margin-bottom:24px;">
        <h3 style="color:#00ff88; font-size:18px; margin:0 0 8px 0; font-weight:600;">
          💯 60-Day Money-Back Guarantee
        </h3>
        <p style="font-size:14px; color:#d1d5db; margin:0; line-height:1.7;">
          If confidence scores, stop-losses, profit targets, or allocation guidance don't add value to your trading, reply to this email within 60 days and we'll refund you. No questions asked.
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align:center; padding-top:24px; border-top:1px solid #1a3a52;">
        <p style="font-size:14px; color:#9ca3af; margin:0 0 12px 0;">
          Questions? Just reply to this email — we read every message.
        </p>
        <p style="font-size:13px; color:#6b7280; margin:0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://daily-ticker.vercel.app'}/archive" style="color:#00ff88; text-decoration:none;">View Archive</a>
          <span style="margin:0 8px; color:#4a5a6a;">•</span>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://daily-ticker.vercel.app'}/privacy" style="color:#00ff88; text-decoration:none;">Privacy Policy</a>
          <span style="margin:0 8px; color:#4a5a6a;">•</span>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://daily-ticker.vercel.app'}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#00ff88; text-decoration:none;">Unsubscribe</a>
        </p>
        <p style="font-size:12px; color:#6b7280; margin:16px 0 0 0;">
          Daily Ticker Pro — Trade with precision. Delivered daily at 8 AM EST.
        </p>
      </div>

    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, htmlContent };
}

