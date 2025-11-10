import type { BriefData } from '@/app/api/archive/store/route';
import type { Metadata } from 'next';

/**
 * Format archive date for display
 */
export function formatArchiveDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generate optimized title tag for archive page
 * Format: "Stock Picks [DATE] | [TICKER1], [TICKER2], [TICKER3] | Daily Ticker"
 */
export function generateArchiveTitle(brief: BriefData): string {
  const formattedDate = formatArchiveDate(brief.date);
  const tickers = brief.stocks
    .slice(0, 3)
    .map(s => s.ticker)
    .join(', ');
  
  const title = `Stock Picks ${formattedDate} | ${tickers} | Daily Ticker`;
  
  // Ensure title is under 70 characters (prefer under 60)
  if (title.length > 70) {
    // Try with 2 tickers instead
    const twoTickers = brief.stocks
      .slice(0, 2)
      .map(s => s.ticker)
      .join(', ');
    const shorterTitle = `Stock Picks ${formattedDate} | ${twoTickers} | Daily Ticker`;
    
    if (shorterTitle.length <= 70) {
      return shorterTitle;
    }
    
    // Fallback to just date if still too long
    return `Stock Picks ${formattedDate} | Daily Ticker`;
  }
  
  return title;
}

/**
 * Generate optimized meta description for archive page
 * Format: "[DATE] stock picks: [TICKER1] $[PRICE], [TICKER2] $[PRICE], [TICKER3] $[PRICE]. See full analysis..."
 */
export function generateArchiveDescription(brief: BriefData): string {
  const formattedDate = formatArchiveDate(brief.date);
  const topStocks = brief.stocks.slice(0, 3);
  
  let desc = `${formattedDate} stock picks: `;
  topStocks.forEach((stock, i) => {
    desc += `${stock.ticker} $${stock.entryPrice.toFixed(2)}`;
    if (i < topStocks.length - 1) desc += ', ';
  });
  
  // Add value proposition
  if (brief.tldr) {
    desc += `. ${brief.tldr.substring(0, 60)}`;
  } else {
    desc += `. See full analysis, performance data, and why these stocks moved.`;
  }
  
  desc += ` Get tomorrow's picks free.`;
  
  // Truncate to 155 characters (keep under 160)
  if (desc.length > 155) {
    desc = desc.substring(0, 152) + '...';
  }
  
  return desc;
}

/**
 * Generate complete metadata object for archive page
 */
export function generateArchiveMetadata(brief: BriefData): Metadata {
  const title = generateArchiveTitle(brief);
  const description = generateArchiveDescription(brief);
  const url = `https://dailyticker.co/archive/${brief.date}`;
  
  // Format date for OpenGraph
  const [year, month, day] = brief.date.split('-').map(Number);
  const publishedDate = new Date(year, month - 1, day).toISOString();
  
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
      type: 'article',
      publishedTime: publishedDate,
      modifiedTime: publishedDate,
      authors: ['Daily Ticker'],
      siteName: 'Daily Ticker',
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: title,
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
  };
}

