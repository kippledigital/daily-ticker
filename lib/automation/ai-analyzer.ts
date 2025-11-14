import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { StockAnalysis } from '@/types/automation';
import { AggregatedStockData } from './data-aggregator';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AnalyzeStockParams {
  ticker: string;
  financialData: string;
  historicalWatchlist: string;
  aggregatedData?: AggregatedStockData; // For validation
}

/**
 * Validates AI-generated analysis against real aggregated data
 * Prevents hallucination and adjusts confidence based on data quality
 */
function validateAnalysisAgainstRealData(
  analysis: StockAnalysis,
  realData: AggregatedStockData
): StockAnalysis {
  const warnings: string[] = [];
  let adjustedConfidence = analysis.confidence;

  // 1. Validate price (2% tolerance for timing differences)
  const priceDiscrepancy = Math.abs(analysis.last_price - realData.price) / realData.price;
  if (priceDiscrepancy > 0.02) {
    console.warn(
      `Price discrepancy for ${analysis.ticker}: AI=$${analysis.last_price}, Real=$${realData.price.toFixed(2)}`
    );
    warnings.push('AI price differs from verified price');
    // Use real verified price
    analysis.last_price = realData.price;
    // Reduce confidence slightly
    adjustedConfidence = Math.max(adjustedConfidence - 5, 0);
  }

  // 2. Validate volume
  if (realData.volume > 0 && analysis.avg_volume > 0) {
    const volumeDiscrepancy = Math.abs(analysis.avg_volume - realData.volume) / realData.volume;
    if (volumeDiscrepancy > 0.5) {
      // 50% tolerance for volume
      console.warn(
        `Volume discrepancy for ${analysis.ticker}: AI=${analysis.avg_volume}, Real=${realData.volume}`
      );
      // Use real volume
      analysis.avg_volume = realData.volume;
    }
  }

  // 3. Validate sector
  if (realData.sector !== 'Unknown' && analysis.sector !== realData.sector) {
    console.warn(`Sector mismatch for ${analysis.ticker}: AI=${analysis.sector}, Real=${realData.sector}`);
    // Use real sector if it's a valid sector type
    const validSectors = [
      'Technology',
      'Healthcare',
      'Energy',
      'Finance',
      'Consumer',
      'Industrial',
      'Materials',
      'Real Estate',
      'Utilities',
      'Communication',
      'Other',
    ];
    if (validSectors.includes(realData.sector)) {
      analysis.sector = realData.sector as StockAnalysis['sector'];
    }
  }

  // 4. Adjust confidence based on data quality score
  const dataQualityScore = realData.dataQuality.overallScore;
  if (dataQualityScore < 70) {
    // Low data quality = cap confidence at 75
    adjustedConfidence = Math.min(adjustedConfidence, 75);
    warnings.push(`Low data quality (${dataQualityScore}/100) - confidence capped at 75`);
  } else if (dataQualityScore < 50) {
    // Very low data quality = cap confidence at 60
    adjustedConfidence = Math.min(adjustedConfidence, 60);
    warnings.push(`Very low data quality (${dataQualityScore}/100) - confidence capped at 60`);
  }

  // 5. Check for price verification
  if (!realData.priceVerified) {
    adjustedConfidence = Math.max(adjustedConfidence - 10, 0);
    warnings.push('Price not verified across sources');
  }

  // 6. Validate P/E ratio reasonableness (if we have fundamentals)
  if (realData.peRatio > 0) {
    // P/E ratio should be between 0.1 and 500 (extreme but possible)
    if (realData.peRatio < 0.1 || realData.peRatio > 500) {
      warnings.push('Unusual P/E ratio detected - verify fundamentals');
      adjustedConfidence = Math.max(adjustedConfidence - 5, 0);
    }
  }

  // 7. Check market cap reasonableness
  if (realData.marketCap > 0 && realData.marketCap < 100_000_000) {
    // Market cap < $100M is micro-cap (very risky)
    if (analysis.risk_level === 'Low') {
      analysis.risk_level = 'Medium'; // Upgrade risk level
    }
    warnings.push('Micro-cap stock (<$100M) - risk adjusted');
  }

  // 8. Incorporate social sentiment into why_trust if available
  if (realData.socialSentiment && realData.socialSentiment.totalMentions > 100) {
    const sentimentNote =
      realData.socialSentiment.score > 0.3
        ? 'Strong bullish social sentiment'
        : realData.socialSentiment.score < -0.3
          ? 'Strong bearish social sentiment'
          : 'Mixed social sentiment';

    // Append to why_trust if not already mentioned
    if (!analysis.why_trust.toLowerCase().includes('social')) {
      analysis.why_trust += ` ${sentimentNote} on Reddit/Twitter (${realData.socialSentiment.totalMentions} mentions).`;
    }
  }

  // 9. Incorporate analyst recommendations if available
  if (realData.analystRatings) {
    const consensus = realData.analystRatings.consensus;
    if (!analysis.why_trust.toLowerCase().includes('analyst')) {
      analysis.why_trust += ` Analyst consensus: ${consensus}.`;
    }
  }

  // 10. Add insider trading signal to caution_notes if relevant
  if (realData.insiderActivity && realData.insiderActivity.netActivity === 'selling') {
    if (realData.insiderActivity.recentSells > realData.insiderActivity.recentBuys * 2) {
      if (!analysis.caution_notes.toLowerCase().includes('insider')) {
        analysis.caution_notes += ` Insiders selling (${realData.insiderActivity.recentSells} sells vs ${realData.insiderActivity.recentBuys} buys in last 30 days).`;
      }
    }
  }

  // Apply adjusted confidence
  analysis.confidence = adjustedConfidence;

  // Log warnings
  if (warnings.length > 0) {
    console.log(`Validation warnings for ${analysis.ticker}:`, warnings);
  }

  // Log data quality metrics
  console.log(`${analysis.ticker} - Data Quality: ${dataQualityScore}/100, Final Confidence: ${adjustedConfidence}`);

  return analysis;
}

/**
 * Analyzes a stock using Claude (Anthropic) as backup when OpenAI fails
 * Uses the same prompt format for consistency
 */
async function analyzeStockWithClaude(params: AnalyzeStockParams): Promise<StockAnalysis | null> {
  const { ticker, financialData, historicalWatchlist, aggregatedData } = params;

  // Same prompt as OpenAI for consistency
  const prompt = `HISTORICAL WATCHLIST DATA (Last 30 Days): ${historicalWatchlist}

Use this to: 1) Avoid repeating stocks analyzed recently 2) Build on previous insights if re-analyzing 3) Reference past performance trends

Output your analysis as valid JSON with these fields: ticker, confidence (number 0-100), risk_level (Low/Medium/High), last_price (number), avg_volume (number), sector, summary, why_matters, momentum_check, actionable_insight, suggested_allocation, why_trust, caution_notes, ideal_entry_zone, mini_learning_moment, stop_loss, profit_target. You are analyzing stock ticker: ${ticker} Using this financial data: ${financialData} Return ONLY valid JSON (no markdown, no extra text) with this structure: { "ticker": "", "confidence": 85, "risk_level": "Medium", "last_price": 150.25, "avg_volume": 5000000, "sector": "Technology", "summary": "2-3 sentences about the company and stock", "why_matters": "Why this stock is significant", "momentum_check": "Recent price action and performance", "actionable_insight": "Worth watching / Potential buy / Hold steady / Caution", "suggested_allocation": "Recommended portfolio percentage or position size", "why_trust": "Key reasons to trust this analysis", "caution_notes": "Specific risks or red flags", "ideal_entry_zone": "Suggested price range or conditions for entry", "mini_learning_moment": "One educational insight related to this stock", "stop_loss": 142.50, "profit_target": 165.50 } CRITICAL RULES: - ALWAYS use the exact ticker provided above - NEVER write UNKNOWN or N/A for any field - confidence must be a number between 0-100 - risk_level must be exactly: Low, Medium, or High - last_price and avg_volume must be numbers - sector must be one of: Technology, Healthcare, Energy, Finance, Consumer, Industrial, Materials, Real Estate, Utilities, Communication, or Other - stop_loss: Calculate using one of these methods: (1) Support level: Recent swing low or key support, (2) ATR method: last_price - (2 × ATR), (3) Percentage: last_price × 0.92 (8% stop). Choose based on volatility. Must be BELOW last_price. Return as number. - profit_target: Calculate as last_price + (2 × (last_price - stop_loss)) for 2:1 reward-to-risk ratio. Adjust if exceeds technical resistance. Must be ABOVE last_price. Return as number. - Ensure: stop_loss < last_price < profit_target - If data is limited, make reasonable estimates - Return ONLY the JSON object, nothing else`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `You are a financial analyst providing stock analysis in strict JSON format. Return only valid JSON with no markdown formatting or additional text.\n\n${prompt}`,
        },
      ],
    });

    const response = message.content[0];
    if (response.type !== 'text') {
      console.error('Claude response was not text');
      return null;
    }

    // Parse JSON response
    let analysis = JSON.parse(response.text) as StockAnalysis;

    // Validate AI output against real aggregated data
    if (aggregatedData) {
      analysis = validateAnalysisAgainstRealData(analysis, aggregatedData);
    }

    // Validate stop_loss and profit_target (same logic as OpenAI)
    if (analysis.stop_loss && analysis.profit_target && analysis.last_price) {
      if (analysis.stop_loss >= analysis.last_price) {
        console.warn(
          `Invalid stop_loss for ${analysis.ticker}: $${analysis.stop_loss} >= $${analysis.last_price}. Adjusting to 8% below entry.`
        );
        analysis.stop_loss = analysis.last_price * 0.92;
      }

      if (analysis.profit_target <= analysis.last_price) {
        console.warn(
          `Invalid profit_target for ${analysis.ticker}: $${analysis.profit_target} <= $${analysis.last_price}. Adjusting to 2:1 R/R.`
        );
        const risk = analysis.last_price - analysis.stop_loss;
        analysis.profit_target = analysis.last_price + (2 * risk);
      }

      const risk = analysis.last_price - analysis.stop_loss;
      const reward = analysis.profit_target - analysis.last_price;
      const rrRatio = reward / risk;

      if (rrRatio < 1.5 || rrRatio > 3.0) {
        console.warn(
          `Risk/Reward ratio for ${analysis.ticker} is ${rrRatio.toFixed(2)}:1 (outside 1.5-3.0 range). Adjusting to 2:1.`
        );
        analysis.profit_target = analysis.last_price + (2 * risk);
      }
    }

    console.log(`✅ ${ticker}: Claude analysis successful (OpenAI fallback)`);
    return analysis;
  } catch (error) {
    console.error('Error in Claude stock analysis:', error);
    return null;
  }
}

/**
 * Analyzes a stock using AI with the exact Gumloop prompt
 * Replicates the "Ask AI" node from Gumloop automation
 *
 * FALLBACK LOGIC: Tries OpenAI first, falls back to Claude if OpenAI fails
 * This ensures emails ALWAYS go out even if one AI provider has quota issues
 */
export async function analyzeStock(params: AnalyzeStockParams): Promise<StockAnalysis | null> {
  const { ticker, financialData, historicalWatchlist, aggregatedData } = params;

  // Exact prompt from Gumloop "Ask AI" node
  const prompt = `HISTORICAL WATCHLIST DATA (Last 30 Days): ${historicalWatchlist}

Use this to: 1) Avoid repeating stocks analyzed recently 2) Build on previous insights if re-analyzing 3) Reference past performance trends

Output your analysis as valid JSON with these fields: ticker, confidence (number 0-100), risk_level (Low/Medium/High), last_price (number), avg_volume (number), sector, summary, why_matters, momentum_check, actionable_insight, suggested_allocation, why_trust, caution_notes, ideal_entry_zone, mini_learning_moment, stop_loss, profit_target. You are analyzing stock ticker: ${ticker} Using this financial data: ${financialData} Return ONLY valid JSON (no markdown, no extra text) with this structure: { "ticker": "", "confidence": 85, "risk_level": "Medium", "last_price": 150.25, "avg_volume": 5000000, "sector": "Technology", "summary": "2-3 sentences about the company and stock", "why_matters": "Why this stock is significant", "momentum_check": "Recent price action and performance", "actionable_insight": "Worth watching / Potential buy / Hold steady / Caution", "suggested_allocation": "Recommended portfolio percentage or position size", "why_trust": "Key reasons to trust this analysis", "caution_notes": "Specific risks or red flags", "ideal_entry_zone": "Suggested price range or conditions for entry", "mini_learning_moment": "One educational insight related to this stock", "stop_loss": 142.50, "profit_target": 165.50 } CRITICAL RULES: - ALWAYS use the exact ticker provided above - NEVER write UNKNOWN or N/A for any field - confidence must be a number between 0-100 - risk_level must be exactly: Low, Medium, or High - last_price and avg_volume must be numbers - sector must be one of: Technology, Healthcare, Energy, Finance, Consumer, Industrial, Materials, Real Estate, Utilities, Communication, or Other - stop_loss: Calculate using one of these methods: (1) Support level: Recent swing low or key support, (2) ATR method: last_price - (2 × ATR), (3) Percentage: last_price × 0.92 (8% stop). Choose based on volatility. Must be BELOW last_price. Return as number. - profit_target: Calculate as last_price + (2 × (last_price - stop_loss)) for 2:1 reward-to-risk ratio. Adjust if exceeds technical resistance. Must be ABOVE last_price. Return as number. - Ensure: stop_loss < last_price < profit_target - If data is limited, make reasonable estimates - Return ONLY the JSON object, nothing else`;

  try {
    // TRY OPENAI FIRST (Primary AI provider)
    console.log(`🤖 Analyzing ${ticker} with OpenAI GPT-4o...`);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Updated to current GPT-4o model
      messages: [
        {
          role: 'system',
          content: 'You are a financial analyst providing stock analysis in strict JSON format. Return only valid JSON with no markdown formatting or additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }, // Force JSON output
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      console.warn(`⚠️ No response from OpenAI for ${ticker}, trying Claude fallback...`);
      return analyzeStockWithClaude(params);
    }

    // Parse JSON response
    let analysis = JSON.parse(response) as StockAnalysis;

    // Validate AI output against real aggregated data
    if (aggregatedData) {
      analysis = validateAnalysisAgainstRealData(analysis, aggregatedData);
    }

    // Validate stop_loss and profit_target
    if (analysis.stop_loss && analysis.profit_target && analysis.last_price) {
      // Ensure logical ordering: stop_loss < last_price < profit_target
      if (analysis.stop_loss >= analysis.last_price) {
        console.warn(
          `Invalid stop_loss for ${analysis.ticker}: $${analysis.stop_loss} >= $${analysis.last_price}. Adjusting to 8% below entry.`
        );
        analysis.stop_loss = analysis.last_price * 0.92;
      }

      if (analysis.profit_target <= analysis.last_price) {
        console.warn(
          `Invalid profit_target for ${analysis.ticker}: $${analysis.profit_target} <= $${analysis.last_price}. Adjusting to 2:1 R/R.`
        );
        const risk = analysis.last_price - analysis.stop_loss;
        analysis.profit_target = analysis.last_price + (2 * risk);
      }

      // Validate risk/reward ratio (should be between 1.5:1 and 3:1)
      const risk = analysis.last_price - analysis.stop_loss;
      const reward = analysis.profit_target - analysis.last_price;
      const rrRatio = reward / risk;

      if (rrRatio < 1.5 || rrRatio > 3.0) {
        console.warn(
          `Risk/Reward ratio for ${analysis.ticker} is ${rrRatio.toFixed(2)}:1 (outside 1.5-3.0 range). Adjusting to 2:1.`
        );
        analysis.profit_target = analysis.last_price + (2 * risk);
      }
    }

    console.log(`✅ ${ticker}: OpenAI analysis successful`);
    return analysis;
  } catch (error: any) {
    // FALLBACK TO CLAUDE if OpenAI fails
    console.error(`❌ OpenAI error for ${ticker}:`, error.message || error);

    // Check if it's a rate limit or quota error
    if (error.status === 429 || error.type === 'insufficient_quota' || error.code === 'insufficient_quota') {
      console.warn(`⚠️ OpenAI quota exceeded for ${ticker}, falling back to Claude...`);
    } else {
      console.warn(`⚠️ OpenAI failed for ${ticker}, trying Claude fallback...`);
    }

    return analyzeStockWithClaude(params);
  }
}

/**
 * Analyzes multiple stocks in parallel
 */
export async function analyzeStocks(
  stocks: { ticker: string; financialData: string }[],
  historicalWatchlist: string
): Promise<(StockAnalysis | null)[]> {
  const promises = stocks.map(stock =>
    analyzeStock({
      ticker: stock.ticker,
      financialData: stock.financialData,
      historicalWatchlist,
    })
  );

  return Promise.all(promises);
}
