import OpenAI from 'openai';
import { StockAnalysis } from '@/types/automation';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AnalyzeStockParams {
  ticker: string;
  financialData: string;
  historicalWatchlist: string;
}

/**
 * Analyzes a stock using AI with the exact Gumloop prompt
 * Replicates the "Ask AI" node from Gumloop automation
 */
export async function analyzeStock(params: AnalyzeStockParams): Promise<StockAnalysis | null> {
  const { ticker, financialData, historicalWatchlist } = params;

  // Exact prompt from Gumloop "Ask AI" node
  const prompt = `HISTORICAL WATCHLIST DATA (Last 30 Days): ${historicalWatchlist}

Use this to: 1) Avoid repeating stocks analyzed recently 2) Build on previous insights if re-analyzing 3) Reference past performance trends

Output your analysis as valid JSON with these fields: ticker, confidence (number 0-100), risk_level (Low/Medium/High), last_price (number), avg_volume (number), sector, summary, why_matters, momentum_check, actionable_insight, suggested_allocation, why_trust, caution_notes, ideal_entry_zone, mini_learning_moment. You are analyzing stock ticker: ${ticker} Using this financial data: ${financialData} Return ONLY valid JSON (no markdown, no extra text) with this structure: { "ticker": "", "confidence": 85, "risk_level": "Medium", "last_price": 150.25, "avg_volume": 5000000, "sector": "Technology", "summary": "2-3 sentences about the company and stock", "why_matters": "Why this stock is significant", "momentum_check": "Recent price action and performance", "actionable_insight": "Worth watching / Potential buy / Hold steady / Caution", "suggested_allocation": "Recommended portfolio percentage or position size", "why_trust": "Key reasons to trust this analysis", "caution_notes": "Specific risks or red flags", "ideal_entry_zone": "Suggested price range or conditions for entry", "mini_learning_moment": "One educational insight related to this stock" } CRITICAL RULES: - ALWAYS use the exact ticker provided above - NEVER write UNKNOWN or N/A for any field - confidence must be a number between 0-100 - risk_level must be exactly: Low, Medium, or High - last_price and avg_volume must be numbers - sector must be one of: Technology, Healthcare, Energy, Finance, Consumer, Industrial, Materials, Real Estate, Utilities, Communication, or Other - If data is limited, make reasonable estimates - Return ONLY the JSON object, nothing else`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // Matches Gumloop's GPT-4
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
      console.error('No response from OpenAI');
      return null;
    }

    // Parse JSON response
    const analysis = JSON.parse(response) as StockAnalysis;

    return analysis;
  } catch (error) {
    console.error('Error in AI stock analysis:', error);
    return null;
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
