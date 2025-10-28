import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Gathers comprehensive financial data and news for a stock
 * Replicates Gumloop's "Gather Financial Data & News" node (Perplexity AI web search)
 *
 * Search Query: "Comprehensive financial analysis for {ticker} stock including current price,
 * market cap, P/E ratio, 52-week high/low, recent earnings, revenue, latest news,
 * partnerships, product launches, analyst ratings, and insider trading activity"
 */
export async function gatherFinancialData(ticker: string): Promise<string> {
  const searchQuery = `Comprehensive financial analysis for ${ticker} stock including current price, market cap, P/E ratio, 52-week high/low, recent earnings, revenue, latest news, partnerships, product launches, analyst ratings, and insider trading activity`;

  try {
    // Use GPT-4 with web search instructions to simulate Perplexity
    // Note: In production, you may want to use Tavily API or Perplexity API directly
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a financial research assistant. Provide comprehensive, up-to-date financial data and analysis based on the latest available information. Include specific numbers, dates, and sources when possible. Format the response as a detailed summary covering all requested topics.`,
        },
        {
          role: 'user',
          content: searchQuery,
        },
      ],
      temperature: 0.3, // Lower temperature for factual accuracy
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      console.error(`No financial data gathered for ${ticker}`);
      return `Limited data available for ${ticker}. Stock ticker: ${ticker}`;
    }

    return response;
  } catch (error) {
    console.error(`Error gathering financial data for ${ticker}:`, error);
    return `Error gathering data for ${ticker}. Stock ticker: ${ticker}`;
  }
}

/**
 * Gathers financial data for multiple stocks in parallel
 */
export async function gatherFinancialDataBatch(tickers: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  const promises = tickers.map(async ticker => {
    const data = await gatherFinancialData(ticker);
    return { ticker, data };
  });

  const completed = await Promise.all(promises);

  for (const { ticker, data } of completed) {
    results[ticker] = data;
  }

  return results;
}

/**
 * Alternative: Use Tavily API for web search (better than GPT-4 for real-time data)
 * Uncomment and use this if you have a Tavily API key
 */
/*
import { tavily } from '@tavily/core';

const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

export async function gatherFinancialDataWithTavily(ticker: string): Promise<string> {
  const searchQuery = `Comprehensive financial analysis for ${ticker} stock including current price, market cap, P/E ratio, 52-week high/low, recent earnings, revenue, latest news, partnerships, product launches, analyst ratings, and insider trading activity`;

  try {
    const response = await tavilyClient.search(searchQuery, {
      search_depth: 'advanced',
      max_results: 5,
    });

    // Combine results into a comprehensive summary
    const summary = response.results
      .map(result => `${result.title}\n${result.content}`)
      .join('\n\n');

    return summary;
  } catch (error) {
    console.error(`Error with Tavily search for ${ticker}:`, error);
    return `Error gathering data for ${ticker}. Stock ticker: ${ticker}`;
  }
}
*/
