import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Upgrade to Pro | Daily Ticker',
  description: 'Get Daily Ticker Pro with AI confidence scores, stop-loss levels, profit targets, and portfolio allocation guidance. $96/year or $10/month.',
  alternates: {
    canonical: 'https://dailyticker.co/premium',
  },
  openGraph: {
    title: 'Upgrade to Pro | Daily Ticker',
    description: 'Get Daily Ticker Pro with confidence scores, stop-loss levels, and profit targets. $96/year or $10/month.',
    type: 'website',
    url: 'https://dailyticker.co/premium',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Upgrade to Pro | Daily Ticker',
    description: 'Get Daily Ticker Pro with complete trading toolkit. $96/year or $10/month.',
  },
}

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
