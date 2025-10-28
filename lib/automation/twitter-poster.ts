import { TwitterApi } from 'twitter-api-v2';
import { ValidatedStock } from '@/types/automation';

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

/**
 * Posts daily watchlist to Twitter
 * Based on the "Show & Tell" framework from Twitter strategy docs
 */
export async function postDailyWatchlist(stocks: ValidatedStock[], date: string): Promise<boolean> {
  try {
    const tweet = generateTweet(stocks, date);

    const result = await twitterClient.v2.tweet(tweet);

    console.log('Tweet posted successfully:', result.data.id);
    return true;
  } catch (error) {
    console.error('Error posting to Twitter:', error);
    return false;
  }
}

/**
 * Generates tweet content using "The Daily 3" format
 * Shows tickers + action + confidence + brief summary
 * Withholds entry prices, full analysis (drives clicks to site)
 */
function generateTweet(stocks: ValidatedStock[], date: string): string {
  const dateStr = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Format each stock
  const stockLines = stocks.slice(0, 3).map((stock, index) => {
    const emoji = stock.trend_symbol || '📊';
    const action = getActionFromInsight(stock.actionable_insight);
    const summary = getTweetSummary(stock);

    return `${emoji} ${stock.ticker} • ${action} • ${stock.confidence}/100\n${summary}`;
  });

  // Build tweet
  const tweet = `📊 Daily 3 (${dateStr})

${stockLines.join('\n\n')}

Full analysis + entry zones: https://dailyticker.co`;

  // Ensure under 280 characters - if over, use compact format
  if (tweet.length > 280) {
    return generateCompactTweet(stocks, dateStr);
  }

  return tweet;
}

/**
 * Compact format if regular tweet is too long
 */
function generateCompactTweet(stocks: ValidatedStock[], dateStr: string): string {
  const stockLines = stocks.slice(0, 3).map(stock => {
    const emoji = stock.trend_symbol || '📊';
    const action = getActionFromInsight(stock.actionable_insight);
    return `${emoji} ${stock.ticker} • ${action} • ${stock.confidence}/100`;
  });

  return `📊 Daily 3 (${dateStr})

${stockLines.join('\n')}

Full analysis: dailyticker.co`;
}

/**
 * Extracts action (BUY/WATCH/HOLD) from actionable insight
 */
function getActionFromInsight(insight: string): string {
  const lower = insight.toLowerCase();

  if (lower.includes('buy') || lower.includes('potential buy')) return 'BUY';
  if (lower.includes('watch') || lower.includes('worth watching')) return 'WATCH';
  if (lower.includes('hold') || lower.includes('hold steady')) return 'HOLD';
  if (lower.includes('avoid') || lower.includes('caution')) return 'AVOID';

  return 'WATCH';
}

/**
 * Generates 5-7 word summary for tweet
 * Uses why_matters or summary field, truncated
 */
function getTweetSummary(stock: ValidatedStock): string {
  // Use the mini_learning_moment or why_matters for brevity
  const source = stock.mini_learning_moment || stock.why_matters || stock.summary;

  // Truncate to ~40 chars (5-7 words)
  const words = source.split(' ').slice(0, 7);
  let summary = words.join(' ');

  if (source.split(' ').length > 7) {
    summary += '...';
  }

  return summary;
}

/**
 * Alternative format: "Focus Pick" - highlights one stock
 * Use for A/B testing
 */
export async function postFocusPick(stock: ValidatedStock, date: string): Promise<boolean> {
  try {
    const dateStr = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const emoji = stock.trend_symbol || '📊';
    const action = getActionFromInsight(stock.actionable_insight);

    const tweet = `${emoji} Focus Pick (${dateStr})

${stock.ticker} | ${stock.sector}
Action: ${action}
Confidence: ${stock.confidence}/100

${stock.why_matters}

See entry zones + full analysis: https://dailyticker.co`;

    // If over 280 chars, truncate why_matters
    let finalTweet = tweet;
    if (tweet.length > 280) {
      const truncatedWhy = stock.why_matters.substring(0, 100) + '...';
      finalTweet = `${emoji} Focus Pick (${dateStr})

${stock.ticker} | ${stock.sector}
Action: ${action} • Confidence: ${stock.confidence}/100

${truncatedWhy}

Full analysis: dailyticker.co`;
    }

    const result = await twitterClient.v2.tweet(finalTweet);
    console.log('Focus pick tweet posted:', result.data.id);
    return true;
  } catch (error) {
    console.error('Error posting focus pick:', error);
    return false;
  }
}

/**
 * Posts performance update (weekly/monthly)
 */
export async function postPerformanceUpdate(text: string): Promise<boolean> {
  try {
    const result = await twitterClient.v2.tweet(text);
    console.log('Performance update posted:', result.data.id);
    return true;
  } catch (error) {
    console.error('Error posting performance update:', error);
    return false;
  }
}
