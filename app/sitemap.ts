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

      return [...baseUrls, ...archiveUrls];
    }
  } catch (error) {
    console.error('Error fetching archive dates for sitemap:', error);
    // Return base URLs if archive fetch fails
  }

  return baseUrls;
}
