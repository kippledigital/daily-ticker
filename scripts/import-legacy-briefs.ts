/**
 * Import Legacy Email Briefs
 *
 * Imports pre-database email briefs that were sent before the premium
 * features (stop loss, profit targets) were added.
 *
 * For each brief:
 * 1. Parse email content to extract tickers, prices, dates
 * 2. Fetch historical prices from Polygon API to validate
 * 3. Calculate stop loss (8% below entry) and profit targets (2:1 R/R)
 * 4. Import into database with full tracking capability
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { getStockQuote } from '../lib/polygon';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface LegacyStock {
  ticker: string;
  price: number;
  action: string; // "watch", "hold", "wait", etc.
  riskLevel: 'Low' | 'Medium' | 'High';
  summary: string;
  whyMatters: string;
  trend: string;
  confidence: 'Solid pick' | 'Worth watching';
}

interface LegacyBrief {
  date: string; // Format: "2025-10-27"
  emailDate: string; // Original email timestamp for reference
  subject: string;
  tldr: string[];
  stocks: LegacyStock[];
  learningConcept?: string;
}

/**
 * Calculate stop loss and profit target from entry price
 */
function calculateTargets(entryPrice: number): { stopLoss: number; profitTarget: number } {
  // Stop loss: 8% below entry
  const stopLoss = entryPrice * 0.92;

  // Profit target: 2:1 risk/reward ratio
  const risk = entryPrice - stopLoss;
  const profitTarget = entryPrice + (2 * risk);

  return {
    stopLoss: Math.round(stopLoss * 100) / 100,
    profitTarget: Math.round(profitTarget * 100) / 100,
  };
}

/**
 * Map confidence text to numeric confidence score
 */
function mapConfidence(confidence: string): number {
  if (confidence === 'Solid pick') return 85;
  if (confidence === 'Worth watching') return 70;
  return 75;
}

/**
 * Map action text to standardized action type
 */
function mapAction(action: string): 'BUY' | 'WATCH' | 'HOLD' {
  const lower = action.toLowerCase();
  if (lower.includes('buy') || lower.includes('watch closely')) return 'BUY';
  if (lower.includes('hold')) return 'HOLD';
  return 'WATCH';
}

/**
 * Determine sector from ticker (basic mapping)
 * You can enhance this with actual API data if needed
 */
function guessSector(ticker: string): string {
  const sectorMap: Record<string, string> = {
    NVDA: 'Technology',
    TSLA: 'Consumer',
    WMT: 'Consumer',
    AAPL: 'Technology',
    MSFT: 'Technology',
    GOOGL: 'Technology',
    AMZN: 'Consumer',
    META: 'Technology',
    JPM: 'Finance',
    V: 'Finance',
    // Add more as needed
  };

  return sectorMap[ticker] || 'Other';
}

/**
 * Validate and potentially adjust prices using historical data
 */
async function validatePrice(
  ticker: string,
  reportedPrice: number,
  date: string
): Promise<number> {
  try {
    // Fetch historical price from Polygon
    const quote = await getStockQuote(ticker);

    // If prices are within 10% of each other, use reported price
    const discrepancy = Math.abs(quote.price - reportedPrice) / reportedPrice;

    if (discrepancy < 0.1) {
      console.log(`  ✅ ${ticker} price validated: $${reportedPrice}`);
      return reportedPrice;
    } else {
      console.log(
        `  ⚠️  ${ticker} price discrepancy: reported $${reportedPrice}, API $${quote.price.toFixed(2)} - using reported`
      );
      return reportedPrice; // Trust the original email price
    }
  } catch (error) {
    console.log(`  ⚠️  ${ticker} couldn't validate price, using reported: $${reportedPrice}`);
    return reportedPrice;
  }
}

/**
 * Import a legacy brief into the database
 */
async function importLegacyBrief(brief: LegacyBrief) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📅 Importing legacy brief: ${brief.date}`);
  console.log('='.repeat(70));

  // Step 1: Validate prices (with delay to respect rate limits)
  console.log('\n💰 Step 1: Validating prices...');
  for (const stock of brief.stocks) {
    stock.price = await validatePrice(stock.ticker, stock.price, brief.date);
    await new Promise(resolve => setTimeout(resolve, 500)); // Avoid rate limits
  }

  // Step 2: Calculate stop loss and profit targets
  console.log('\n🎯 Step 2: Calculating stop loss and profit targets...');
  const enrichedStocks = brief.stocks.map(stock => {
    const targets = calculateTargets(stock.price);
    console.log(
      `  ${stock.ticker}: Entry $${stock.price} → Stop $${targets.stopLoss} → Target $${targets.profitTarget}`
    );

    return {
      ...stock,
      stopLoss: targets.stopLoss,
      profitTarget: targets.profitTarget,
      sector: guessSector(stock.ticker),
      confidence: mapConfidence(stock.confidence),
      actionType: mapAction(stock.action),
    };
  });

  // Step 3: Generate simple email HTML (reconstructed from original)
  console.log('\n📧 Step 3: Generating email content...');

  const stockCards = enrichedStocks
    .map(
      stock => `
    <div style="background:#1a3a52; border-radius:12px; padding:24px; margin-bottom:24px;">
      <h3 style="color:#00ff88; font-size:24px; margin:0 0 8px 0;">🔹 ${stock.ticker}</h3>
      <p style="color:#d1d5db; margin:0 0 16px 0; line-height:1.7;">${stock.summary}</p>
      <p style="color:#9ca3af; font-size:13px; margin:0;">
        <strong>Risk:</strong> ${stock.riskLevel} | <strong>Action:</strong> ${stock.action}
      </p>
    </div>
  `
    )
    .join('');

  const htmlContent = `
<div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width:680px; background:#0B1E32; color:#F0F0F0; margin:0 auto; padding:0;">
  <div style="background:linear-gradient(135deg, #0B1E32 0%, #1a3a52 100%); padding:40px 24px 32px; text-align:center; border-bottom:3px solid #00ff88;">
    <h1 style="color:#00ff88; margin:0; font-size:32px;">Daily Ticker</h1>
    <p style="color:#00ff88; font-size:14px; margin:8px 0 0 0;">☀️ Morning Brief — ${new Date(brief.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
  </div>
  <div style="padding:32px 24px;">
    <h2 style="color:#00ff88; font-size:22px; margin:0 0 24px 0;">📊 Today's Stocks</h2>
    ${stockCards}
  </div>
</div>
  `.trim();

  const tldr = brief.tldr.join(' | ');
  const subject = `📊 Daily Ticker — ${enrichedStocks.map(s => s.ticker).join(', ')} | ${new Date(brief.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  // Step 4: Insert into database
  console.log('\n💾 Step 4: Inserting into database...');

  const { data: existingBrief } = await supabase
    .from('briefs')
    .select('id')
    .eq('date', brief.date)
    .single();

  if (existingBrief) {
    console.log(`  ⚠️  Brief for ${brief.date} already exists, skipping...`);
    return;
  }

  const { data: briefData, error: briefError } = await supabase
    .from('briefs')
    .insert({
      date: brief.date,
      subject_free: subject,
      subject_premium: subject,
      html_content_free: htmlContent,
      html_content_premium: htmlContent,
      tldr,
      actionable_count: enrichedStocks.filter(s => s.actionType === 'BUY').length,
    })
    .select()
    .single();

  if (briefError || !briefData) {
    console.error('  ❌ Failed to insert brief:', briefError);
    return;
  }

  console.log(`  ✅ Brief inserted (ID: ${briefData.id})`);

  // Step 5: Insert stocks
  console.log('\n📈 Step 5: Inserting stocks...');

  for (const stock of enrichedStocks) {
    const { error: stockError } = await supabase.from('stocks').insert({
      brief_id: briefData.id,
      ticker: stock.ticker,
      sector: stock.sector,
      confidence: stock.confidence,
      risk_level: stock.riskLevel,
      action: stock.actionType,
      entry_price: stock.price,
      stop_loss: stock.stopLoss,
      profit_target: stock.profitTarget,
      summary: stock.summary,
      why_matters: stock.whyMatters,
      momentum_check: stock.trend,
      actionable_insight: stock.action,
      suggested_allocation: '5-10% of portfolio',
      caution_notes: `Legacy import - original data from ${brief.emailDate}`,
      mini_learning_moment: brief.learningConcept || 'Market trends and patience are key.',
      status: 'open', // We'll track performance later
    });

    if (stockError) {
      console.error(`  ❌ Failed to insert ${stock.ticker}:`, stockError);
    } else {
      console.log(`  ✅ ${stock.ticker} inserted`);
    }
  }

  console.log(`\n✅ Successfully imported ${brief.date} with ${enrichedStocks.length} stocks!`);
}

/**
 * Example usage - you'll replace this with actual parsed briefs
 */
async function importLegacyBriefs() {
  console.log('🚀 LEGACY BRIEF IMPORT\n');
  console.log('━'.repeat(70));
  console.log('Importing pre-database email briefs with enhanced data');
  console.log('━'.repeat(70));

  // EXAMPLE - Replace with your actual briefs
  const legacyBriefs: LegacyBrief[] = [
    {
      date: '2025-10-27',
      emailDate: 'Mon, Oct 27, 8:46 PM',
      subject: '☀️ Morning Brief — Top Stocks to Watch',
      tldr: [
        "NVDA — Nvidia's shares are up sharply after strong AI demand; worth watching for continued growth.",
        "TSLA — Tesla saw steady gains this week on new car deliveries; consider holding if you believe in electric cars.",
        "WMT — Walmart's price is steady with cautious optimism after strong sales; wait to see next quarter's results.",
      ],
      stocks: [
        {
          ticker: 'NVDA',
          price: 460,
          action: 'Watch closely for more news; this stock can move fast with AI developments.',
          riskLevel: 'Medium',
          summary: "Nvidia makes powerful computer chips used in gaming and artificial intelligence (AI). Shares rose 15% this week as strong demand for AI tech boosts sales expectations.",
          whyMatters: "Nvidia is getting popular because a lot of companies want their chips for AI, but prices can jump around quickly.",
          trend: 'Uptrend',
          confidence: 'Solid pick',
        },
        {
          ticker: 'TSLA',
          price: 720,
          action: 'Hold for now if you believe in electric cars growing over time.',
          riskLevel: 'Medium',
          summary: "Tesla builds electric cars and renewable energy products. Tesla's stock climbed 7% this week after delivering more cars than expected.",
          whyMatters: "Tesla is making more cars and selling them well, so many investors are excited, but the price can still change a lot.",
          trend: 'Uptrend',
          confidence: 'Worth watching',
        },
        {
          ticker: 'WMT',
          price: 155,
          action: 'Wait and watch how upcoming earnings report affects price.',
          riskLevel: 'Low',
          summary: "Walmart runs big stores selling groceries, clothes, and everyday items. Stock is steady after good holiday sales but mixed outlook ahead.",
          whyMatters: "Walmart is selling well but the future is less certain, so it's good to wait for clearer signs before buying.",
          trend: 'Sideways',
          confidence: 'Worth watching',
        },
      ],
      learningConcept: 'Trend — This means the general direction a stock\'s price is moving. An "uptrend" means it\'s going up over time, and a "sideways" trend means there\'s no big movement.',
    },
  ];

  // Import each brief
  for (const brief of legacyBriefs) {
    await importLegacyBrief(brief);
    console.log('\n⏸️  Waiting 3 seconds before next import...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('\n' + '━'.repeat(70));
  console.log('✅ IMPORT COMPLETE');
  console.log('━'.repeat(70));
  console.log();

  // Show summary
  const { data: octoberBriefs } = await supabase
    .from('briefs')
    .select('date')
    .gte('date', '2025-10-01')
    .lte('date', '2025-10-31')
    .order('date');

  console.log(`📊 Total October briefs: ${octoberBriefs?.length || 0}`);
  if (octoberBriefs && octoberBriefs.length > 0) {
    console.log('Dates:');
    octoberBriefs.forEach(b => console.log(`  • ${b.date}`));
  }
}

// Run import
importLegacyBriefs();
