import type { BriefData } from '@/app/api/archive/store/route';

interface ArticleSchemaProps {
  brief: BriefData;
}

/**
 * Article schema markup component for archive pages
 * Implements NewsArticle schema for better search visibility
 */
export function ArticleSchema({ brief }: ArticleSchemaProps) {
  const formattedDate = new Date(brief.date + 'T00:00:00').toISOString();
  
  // Generate article body summary
  const articleBody = brief.stocks
    .map(stock => `${stock.ticker} (${stock.sector}): ${stock.summary}`)
    .join(' ');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: `Stock Picks for ${brief.date}`,
    datePublished: formattedDate,
    dateModified: formattedDate,
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
        url: 'https://dailyticker.co/logo.png',
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://dailyticker.co/archive/${brief.date}`,
    },
    description: brief.tldr || `Daily stock picks for ${brief.date}`,
    articleBody: articleBody.substring(0, 5000), // Limit length
    keywords: brief.stocks.map(s => s.ticker).join(', '),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

