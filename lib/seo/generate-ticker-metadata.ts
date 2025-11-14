import type { Metadata } from 'next';

interface TickerMetrics {
  totalPicks: number;
  winRate: number;
  avgReturn: number;
  bestPick: number | null;
  worstPick: number | null;
}

/**
 * Generate SEO metadata for ticker page
 */
export function generateTickerMetadata(
  ticker: string,
  metrics: TickerMetrics
): Metadata {
  const title = `${ticker} Stock Newsletter | Daily Picks & Analysis | Daily Ticker`;
  
  let description = `Get ${ticker} stock picks delivered daily. `;
  if (metrics.totalPicks > 0) {
    description += `See our track record: ${metrics.totalPicks} pick${metrics.totalPicks > 1 ? 's' : ''}, ${metrics.winRate}% win rate`;
    if (metrics.avgReturn > 0) {
      description += `, +${metrics.avgReturn.toFixed(1)}% avg return`;
    }
  } else {
    description += `Daily stock analysis and picks.`;
  }
  description += ` Free newsletter signup.`;

  const url = `https://dailyticker.co/stocks/${ticker}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'Daily Ticker',
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: `${ticker} Stock Newsletter | Daily Ticker`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@GetDailyTicker',
      images: ['/opengraph-image'],
    },
    keywords: [
      ticker,
      `${ticker} stock`,
      `${ticker} newsletter`,
      `${ticker} stock picks`,
      `${ticker} daily picks`,
      'stock newsletter',
      'daily stock picks',
      'free stock picks',
    ],
  };
}

