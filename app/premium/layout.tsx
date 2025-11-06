import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Upgrade to Premium | Daily Ticker',
  description: 'Get 50% off Daily Ticker Premium with AI confidence scores, stop-loss levels, profit targets, and portfolio allocation guidance. $48/year early bird pricing.',
  openGraph: {
    title: 'Upgrade to Premium | Daily Ticker',
    description: 'Get 50% off Daily Ticker Premium with confidence scores, stop-loss levels, and profit targets. Early bird pricing: $48/year.',
    type: 'website',
    url: 'https://dailyticker.co/premium',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Upgrade to Premium | Daily Ticker',
    description: 'Get 50% off Daily Ticker Premium with complete trading toolkit. $48/year early bird pricing.',
  },
}

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
