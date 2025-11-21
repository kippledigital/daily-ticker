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
 * Optimized for better CTR and keyword targeting
 */
export function generateTickerMetadata(
  ticker: string,
  metrics: TickerMetrics
): Metadata {
  const title = `${ticker} Stock Newsletter | Daily Picks & Analysis | Daily Ticker`;
  
  // Build compelling meta description (max 160 chars for optimal display)
  let description = '';
  
  if (metrics.totalPicks > 0) {
    // Include key metrics for credibility
    const winRateText = metrics.winRate > 0 ? `${metrics.winRate}% win rate` : '';
    const returnText = metrics.avgReturn > 0 ? `+${metrics.avgReturn.toFixed(1)}% avg return` : '';
    const picksText = `${metrics.totalPicks} ${ticker} pick${metrics.totalPicks !== 1 ? 's' : ''}`;
    
    // Build description with priority: picks → win rate → return → CTA
    description = `Get free ${ticker} stock picks delivered daily. `;
    description += `Track record: ${picksText}`;
    
    if (winRateText) {
      description += `, ${winRateText}`;
    }
    
    if (returnText && description.length < 120) {
      description += `, ${returnText}`;
    }
    
    description += `. Free newsletter signup.`;
    
    // Ensure description is under 160 characters (optimal for SERP display)
    if (description.length > 160) {
      // Fallback: shorter version
      description = `Free ${ticker} stock picks daily. ${picksText}${winRateText ? `, ${winRateText}` : ''}. Track record & analysis.`;
    }
  } else {
    description = `Get free ${ticker} stock picks delivered daily. Daily stock analysis, entry prices, and performance tracking. Free newsletter signup.`;
  }

  const url = `https://dailyticker.co/stocks/${ticker}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
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

