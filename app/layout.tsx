import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Ticker — Plain-English Market Briefs for Busy Investors",
  description: "A daily, plain-English market brief for people who want to be in the action but don't have time to do the research. Sent Mon–Fri at 8 AM.",
  keywords: ["stock market", "market brief", "investing", "daily newsletter", "market insights"],
  authors: [{ name: "Daily Ticker" }],
  creator: "Daily Ticker",
  publisher: "Daily Ticker",
  metadataBase: new URL('https://dailyticker.co'),
  openGraph: {
    title: "Daily Ticker — Plain-English Market Briefs",
    description: "A daily, plain-English market brief for people who want to be in the action but don't have time to do the research.",
    url: 'https://dailyticker.co',
    siteName: 'Daily Ticker',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Daily Ticker',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily Ticker — Plain-English Market Briefs',
    description: 'Daily market insights for busy investors. Sent Mon–Fri at 8 AM.',
    creator: '@GetDailyTicker',
    images: ['/og.png'],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
