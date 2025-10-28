import { ValidatedStock } from '@/types/automation';

export interface EmailTemplateData {
  subject: string;
  tldr: string;
  stocks: ValidatedStock[];
  date: string;
}

/**
 * Generates HTML email content for Daily Ticker morning brief
 * Matches the format expected by your archive system
 */
export function generateEmailHTML(data: EmailTemplateData): string {
  const { subject, tldr, stocks, date } = data;

  const stocksHTML = stocks
    .map(
      (stock, index) => `
    <div style="margin-bottom: 40px; padding: 24px; background: #f8f9fa; border-left: 4px solid ${getTrendColor(stock.trend_symbol)}; border-radius: 8px;">
      <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <h2 style="margin: 0; color: #0B1E32; font-size: 24px; font-weight: 700;">
          ${stock.trend_symbol || ''} ${stock.ticker} <span style="color: #666; font-size: 18px; font-weight: 400;">| ${stock.sector}</span>
        </h2>
      </div>

      <div style="display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;">
        <div style="background: white; padding: 12px 20px; border-radius: 6px; border: 1px solid #e0e0e0;">
          <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Action</div>
          <div style="font-size: 18px; font-weight: 700; color: ${getActionColor(stock.actionable_insight)};">${getAction(stock.actionable_insight)}</div>
        </div>

        <div style="background: white; padding: 12px 20px; border-radius: 6px; border: 1px solid #e0e0e0;">
          <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Confidence</div>
          <div style="font-size: 18px; font-weight: 700; color: ${getConfidenceColor(stock.confidence)};">${stock.confidence}%</div>
        </div>

        <div style="background: white; padding: 12px 20px; border-radius: 6px; border: 1px solid #e0e0e0;">
          <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Risk Level</div>
          <div style="font-size: 18px; font-weight: 700; color: ${getRiskColor(stock.risk_level)};">${stock.risk_level}</div>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 16px; font-weight: 600; color: #0B1E32; margin-bottom: 8px;">Summary</h3>
        <p style="color: #333; line-height: 1.6; margin: 0;">${stock.summary}</p>
      </div>

      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 16px; font-weight: 600; color: #0B1E32; margin-bottom: 8px;">Why It Matters</h3>
        <p style="color: #333; line-height: 1.6; margin: 0;">${stock.why_matters}</p>
      </div>

      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 16px; font-weight: 600; color: #0B1E32; margin-bottom: 8px;">📊 Momentum Check</h3>
        <p style="color: #333; line-height: 1.6; margin: 0;">${stock.momentum_check}</p>
      </div>

      <div style="background: #e8f5e9; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
        <h3 style="font-size: 16px; font-weight: 600; color: #0B1E32; margin-bottom: 8px;">💡 Actionable Insight</h3>
        <p style="color: #2e7d32; line-height: 1.6; margin: 0; font-weight: 500;">${stock.actionable_insight}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <div>
          <h4 style="font-size: 14px; font-weight: 600; color: #666; margin-bottom: 8px;">Suggested Allocation</h4>
          <p style="color: #333; margin: 0;">${stock.suggested_allocation}</p>
        </div>
        <div>
          <h4 style="font-size: 14px; font-weight: 600; color: #666; margin-bottom: 8px;">Ideal Entry Zone</h4>
          <p style="color: #333; margin: 0;">${stock.ideal_entry_zone}</p>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="font-size: 14px; font-weight: 600; color: #666; margin-bottom: 8px;">⚠️ Caution Notes</h4>
        <p style="color: #d32f2f; line-height: 1.6; margin: 0;">${stock.caution_notes}</p>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="font-size: 14px; font-weight: 600; color: #666; margin-bottom: 8px;">Why Trust This Analysis</h4>
        <p style="color: #333; line-height: 1.6; margin: 0;">${stock.why_trust}</p>
      </div>

      <div style="background: #fff3e0; padding: 16px; border-radius: 6px;">
        <h4 style="font-size: 14px; font-weight: 600; color: #e65100; margin-bottom: 8px;">📚 Learning Moment</h4>
        <p style="color: #e65100; line-height: 1.6; margin: 0;">${stock.mini_learning_moment}</p>
      </div>
    </div>
  `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
  <div style="max-width: 680px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #0B1E32; font-size: 32px; font-weight: 700; margin: 0 0 16px 0; letter-spacing: -0.5px;">
        Daily Ticker
      </h1>
      <p style="color: #666; font-size: 14px; margin: 0;">
        ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>

    <!-- Subject -->
    <h2 style="color: #0B1E32; font-size: 28px; font-weight: 700; margin: 0 0 24px 0; line-height: 1.3;">
      ${subject}
    </h2>

    <!-- TL;DR -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; margin-bottom: 40px;">
      <h3 style="color: white; font-size: 18px; font-weight: 700; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">
        TL;DR
      </h3>
      <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0;">
        ${tldr}
      </p>
    </div>

    <!-- Stocks -->
    <div style="margin-bottom: 40px;">
      <h3 style="color: #0B1E32; font-size: 20px; font-weight: 700; margin: 0 0 24px 0; padding-bottom: 12px; border-bottom: 2px solid #e0e0e0;">
        Today's Picks (${stocks.length})
      </h3>
      ${stocksHTML}
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 32px 0; border-top: 2px solid #e0e0e0;">
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
        📈 Visit <a href="https://dailyticker.co" style="color: #667eea; text-decoration: none; font-weight: 600;">dailyticker.co</a> for the full archive
      </p>
      <p style="color: #999; font-size: 12px; margin: 0;">
        Daily Ticker is for educational purposes only and does not provide financial advice.<br>
        <a href="https://dailyticker.co/privacy" style="color: #999; text-decoration: none;">Privacy Policy</a> |
        <a href="https://dailyticker.co/terms" style="color: #999; text-decoration: none;">Terms</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

  return html.trim();
}

// Helper functions for colors
function getTrendColor(symbol?: string): string {
  switch (symbol) {
    case '📈':
      return '#4caf50'; // Green
    case '📉':
      return '#f44336'; // Red
    case '→':
      return '#ff9800'; // Orange
    default:
      return '#9e9e9e'; // Gray
  }
}

function getActionColor(insight: string): string {
  const lower = insight.toLowerCase();
  if (lower.includes('buy') || lower.includes('potential')) return '#4caf50';
  if (lower.includes('watch') || lower.includes('worth')) return '#ff9800';
  if (lower.includes('caution') || lower.includes('avoid')) return '#f44336';
  return '#2196f3';
}

function getAction(insight: string): string {
  const lower = insight.toLowerCase();
  if (lower.includes('buy') || lower.includes('potential buy')) return 'BUY';
  if (lower.includes('watch') || lower.includes('worth watching')) return 'WATCH';
  if (lower.includes('hold') || lower.includes('hold steady')) return 'HOLD';
  if (lower.includes('caution') || lower.includes('avoid')) return 'CAUTION';
  return 'WATCH';
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return '#4caf50'; // High confidence - green
  if (confidence >= 60) return '#ff9800'; // Medium confidence - orange
  return '#f44336'; // Low confidence - red
}

function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'Low':
      return '#4caf50'; // Green
    case 'Medium':
      return '#ff9800'; // Orange
    case 'High':
      return '#f44336'; // Red
    default:
      return '#9e9e9e'; // Gray
  }
}
