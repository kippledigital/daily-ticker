import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brief Archive | Daily Ticker',
  description: 'Browse past Daily Ticker market briefs with stock picks, analysis, and actionable insights. Track our performance and see what you missed.',
  alternates: {
    canonical: 'https://dailyticker.co/archive',
  },
  openGraph: {
    title: 'Brief Archive | Daily Ticker',
    description: 'Browse past market briefs with stock picks and analysis',
    type: 'website',
    url: 'https://dailyticker.co/archive',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brief Archive | Daily Ticker',
    description: 'Browse past market briefs with stock picks and analysis',
  },
}

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
