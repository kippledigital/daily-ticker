import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join Premium Waitlist | Daily Ticker',
  description: 'Be the first to know when Daily Ticker Premium launches in Q1 2026. Get 50% off your first year with AI confidence scores, stop-loss levels, profit targets, and portfolio allocation guidance.',
  openGraph: {
    title: 'Join Premium Waitlist | Daily Ticker',
    description: 'Get 50% off Daily Ticker Premium - launching Q1 2026 with confidence scores, stop-loss levels, and profit targets.',
    type: 'website',
    url: 'https://dailyticker.co/premium',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join Premium Waitlist | Daily Ticker',
    description: 'Get 50% off Daily Ticker Premium - launching Q1 2026 with trading toolkit',
  },
}

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
