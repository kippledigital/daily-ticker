import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TrendingUp, Calendar, Share2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BriefData } from '@/app/api/archive/store/route'

interface BriefPageProps {
  params: {
    date: string
  }
}

async function getBrief(date: string): Promise<BriefData | null> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const response = await fetch(`${baseUrl}/api/archive/${date}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error(`Error fetching brief for ${date}:`, error)
    return null
  }
}

export async function generateMetadata({ params }: BriefPageProps): Promise<Metadata> {
  const brief = await getBrief(params.date)

  if (!brief) {
    return {
      title: 'Brief Not Found — Daily Ticker',
    }
  }

  const formattedDate = new Date(brief.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return {
    title: `${brief.subject} — Daily Ticker`,
    description: brief.tldr || `Market brief for ${formattedDate}. ${brief.stocks.length} stocks analyzed.`,
    keywords: [...brief.stocks.map(s => `${s.ticker} stock`), 'stock brief', 'market analysis'],
    openGraph: {
      title: brief.subject,
      description: brief.tldr || `${brief.stocks.length} stocks analyzed on ${formattedDate}`,
      images: ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title: brief.subject,
      description: brief.tldr || `${brief.stocks.length} stocks analyzed`,
    },
  }
}

export default async function BriefPage({ params }: BriefPageProps) {
  const brief = await getBrief(params.date)

  if (!brief) {
    notFound()
  }

  const formattedDate = new Date(brief.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const shareUrl = `https://dailyticker.co/archive/${brief.date}`
  const shareText = `${brief.subject} — Daily Ticker`

  return (
    <div className="min-h-screen bg-[#0B1E32]">
      {/* Header */}
      <header className="border-b border-[#1a3a52] bg-[#0B1E32]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <TrendingUp className="h-6 w-6 text-[#00ff88]" />
            <h1 className="text-xl font-bold text-white font-mono">Daily Ticker</h1>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/archive"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00ff88] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Archive
        </Link>

        {/* Brief Header */}
        <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-8 mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
            <Calendar className="h-4 w-4" />
            <span className="font-mono">{formattedDate}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-6">
            {brief.subject}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm mb-6">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="font-semibold text-white">{brief.stocks.length}</span>
              <span>stocks analyzed</span>
            </div>
            {brief.actionableCount > 0 && (
              <div className="flex items-center gap-2 text-gray-400">
                <span className="font-semibold text-[#00ff88]">{brief.actionableCount}</span>
                <span>actionable recommendations</span>
              </div>
            )}
          </div>

          {/* Share Buttons */}
          <div className="flex flex-wrap gap-3 pt-6 border-t border-[#1a3a52]">
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share:
            </span>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-[#00ff88] transition-colors"
            >
              Twitter
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-[#00ff88] transition-colors"
            >
              LinkedIn
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="text-sm text-gray-400 hover:text-[#00ff88] transition-colors"
            >
              Copy Link
            </button>
          </div>
        </div>

        {/* Brief Content */}
        <div
          className="prose prose-invert max-w-none bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-8"
          dangerouslySetInnerHTML={{ __html: brief.htmlContent }}
        />

        {/* Stock Summary Cards */}
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold text-white">Stocks Analyzed</h2>
          <div className="grid gap-4">
            {brief.stocks.map((stock) => (
              <div
                key={stock.ticker}
                className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white font-mono">{stock.ticker}</h3>
                    <p className="text-sm text-gray-400">{stock.sector}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">${stock.entryPrice.toFixed(2)}</div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          stock.action === 'BUY'
                            ? 'bg-[#00ff88]/20 text-[#00ff88]'
                            : stock.action === 'WATCH'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : stock.action === 'HOLD'
                                ? 'bg-blue-500/20 text-blue-500'
                                : 'bg-red-500/20 text-red-500'
                        }`}
                      >
                        {stock.action}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          stock.riskLevel === 'Low'
                            ? 'bg-green-500/20 text-green-500'
                            : stock.riskLevel === 'Medium'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-red-500/20 text-red-500'
                        }`}
                      >
                        {stock.riskLevel} Risk
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-1">Summary</h4>
                    <p className="text-gray-300 leading-relaxed">{stock.summary}</p>
                  </div>

                  {stock.actionableInsight && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-1">Actionable Insight</h4>
                      <p className="text-[#00ff88] leading-relaxed">{stock.actionableInsight}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Confidence: </span>
                      <span className="text-white font-semibold">{stock.confidence}%</span>
                    </div>
                    {stock.entryZoneLow && stock.entryZoneHigh && (
                      <div>
                        <span className="text-gray-400">Entry Zone: </span>
                        <span className="text-white font-mono">
                          ${stock.entryZoneLow.toFixed(2)} - ${stock.entryZoneHigh.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border border-[#00ff88]/20 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Get Daily Briefs Like This</h3>
          <p className="text-gray-300 mb-6">
            Subscribe to Daily Ticker and receive morning market briefs every Mon-Fri at 8 AM.
          </p>
          <Link href="/#subscribe">
            <Button className="bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] font-semibold px-8 py-6 text-lg">
              Subscribe for Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
