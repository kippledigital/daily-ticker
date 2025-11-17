import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URLs (static pages)
  const baseUrls: MetadataRoute.Sitemap = [
    {
      url: 'https://dailyticker.co',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://dailyticker.co/privacy',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://dailyticker.co/terms',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://dailyticker.co/premium',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://dailyticker.co/archive',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://dailyticker.co/unsubscribe',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  let allUrls = [...baseUrls];

  // Fetch archive dates from database
  try {
    const { data: briefs } = await supabase
      .from('briefs')
      .select('date')
      .order('date', { ascending: false })
      .limit(365); // Last 365 days (1 year)

    if (briefs && briefs.length > 0) {
      const archiveUrls: MetadataRoute.Sitemap = briefs.map((brief) => ({
        url: `https://dailyticker.co/archive/${brief.date}`,
        lastModified: new Date(brief.date),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));

      allUrls = [...allUrls, ...archiveUrls];
    }
  } catch (error) {
    console.error('Error fetching archive dates for sitemap:', error);
  }

  // Add ticker pages (only tickers with 3+ picks for quality)
  try {
    // Fetch all unique tickers that have at least 3 picks (minimum for credibility)
    const { data: tickerData } = await supabase
      .from('stocks')
      .select('ticker')
      .order('ticker', { ascending: true });

    if (tickerData && tickerData.length > 0) {
      // Count picks per ticker
      const tickerCounts = tickerData.reduce((acc, { ticker }) => {
        acc[ticker] = (acc[ticker] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Only include tickers with 3+ picks
      const qualifiedTickers = Object.entries(tickerCounts)
        .filter(([, count]) => count >= 3)
        .map(([ticker]) => ticker);

      const tickerUrls: MetadataRoute.Sitemap = qualifiedTickers.map((ticker) => ({
        url: `https://dailyticker.co/stocks/${ticker}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));

      allUrls = [...allUrls, ...tickerUrls];

      console.log(`[Sitemap] Added ${tickerUrls.length} ticker pages to sitemap (3+ picks minimum)`);
    }
  } catch (error) {
    console.error('Error fetching ticker pages for sitemap:', error);
  }

  return allUrls;
}
