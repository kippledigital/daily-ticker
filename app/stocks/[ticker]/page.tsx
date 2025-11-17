import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateTickerMetadata } from '@/lib/seo/generate-ticker-metadata';
import { getTickerPicks, calculateTickerMetrics, getRelatedTickersWithMetrics } from '@/lib/data/get-ticker-data';
import { TickerPageClient } from '@/components/stocks/ticker-page-client';
import type { TickerPick, TickerMetrics } from '@/lib/data/get-ticker-data';

interface TickerPageProps {
  params: {
    ticker: string;
  };
}

/**
 * Generate SEO metadata for ticker page
 */
export async function generateMetadata({ params }: TickerPageProps): Promise<Metadata> {
  const ticker = params.ticker.toUpperCase();

  // Fetch picks to calculate metrics
  const picks = await getTickerPicks(ticker);
  const metrics = calculateTickerMetrics(picks);

  const metadata = generateTickerMetadata(ticker, {
    totalPicks: metrics.totalPicks,
    winRate: metrics.winRate,
    avgReturn: metrics.avgReturn,
    bestPick: metrics.bestPick?.returnPercent || null,
    worstPick: metrics.worstPick?.returnPercent || null,
  });

  return metadata;
}

/**
 * Ticker page - shows all picks for a specific stock
 */
export default async function TickerPage({ params }: TickerPageProps) {
  const ticker = params.ticker.toUpperCase();

  // Validate ticker format (basic check)
  if (!/^[A-Z]{1,5}$/.test(ticker)) {
    notFound();
  }

  // Fetch all picks for this ticker
  const picks = await getTickerPicks(ticker);

  // If no picks found, show 404
  if (picks.length === 0) {
    notFound();
  }

  // Calculate metrics
  const metrics = calculateTickerMetrics(picks);

  // Get sector from first pick
  const sector = picks[0]?.sector || '';

  // Get related tickers with metrics (win rate, pick count)
  const relatedTickers = await getRelatedTickersWithMetrics(ticker, sector, 5);

  // Generate JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: `${ticker} Stock Newsletter - Daily Picks & Analysis`,
    description: `Track record: ${metrics.totalPicks} picks, ${metrics.winRate}% win rate, ${metrics.avgReturn > 0 ? '+' : ''}${metrics.avgReturn}% avg return`,
    author: {
      '@type': 'Organization',
      name: 'Daily Ticker',
      url: 'https://dailyticker.co',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Daily Ticker',
      logo: {
        '@type': 'ImageObject',
        url: 'https://dailyticker.co/icon.png',
      },
    },
    datePublished: picks[0]?.briefDate || new Date().toISOString().split('T')[0],
    dateModified: new Date().toISOString().split('T')[0],
    ...(metrics.totalPicks > 0 && metrics.totalWins + metrics.totalLosses > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: (metrics.winRate / 20).toFixed(1), // Convert to 5-star scale
        bestRating: '5',
        worstRating: '0',
        ratingCount: metrics.totalWins + metrics.totalLosses,
      },
    }),
  };

  return (
    <>
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TickerPageClient
        ticker={ticker}
        picks={picks}
        metrics={metrics}
        sector={sector}
        relatedTickers={relatedTickers}
      />
    </>
  );
}

