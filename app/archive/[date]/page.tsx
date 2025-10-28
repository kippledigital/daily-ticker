'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TrendingUp, Calendar, Share2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BriefData } from '@/app/api/archive/store/route'

interface BriefPageProps {
  params: {
    date: string
  }
}

export default function BriefPage({ params }: BriefPageProps) {
  const [brief, setBrief] = useState<BriefData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchBrief() {
      try {
        const response = await fetch(`/api/archive/${params.date}`)
        const data = await response.json()

        if (data.success && data.data) {
          setBrief(data.data)
        } else {
          router.push('/archive')
        }
      } catch (error) {
        console.error('Error fetching brief:', error)
        router.push('/archive')
      } finally {
        setLoading(false)
      }
    }

    fetchBrief()
  }, [params.date, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1E32] flex items-center justify-center">
        <div className="text-[#00ff88]">Loading...</div>
      </div>
    )
  }

  if (!brief) {
    return null
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
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Calendar className="h-4 w-4" />
            <span className="font-mono">{formattedDate}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {brief.subject}
          </h1>
          {brief.tldr && (
            <p className="text-lg text-gray-300 leading-relaxed">
              {brief.tldr}
            </p>
          )}
        </div>

        {/* Brief Content */}
        <div
          className="prose prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: brief.htmlContent }}
        />

        {/* Stock Recommendations */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white">Stock Analysis</h2>

          {brief.stocks.map((stock, index) => (
            <div
              key={index}
              className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6"
            >
              {/* Stock Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-white font-mono">
                      {stock.ticker}
                    </h3>
                    <span className="px-3 py-1 bg-[#0B1E32] border border-[#1a3a52] rounded-md text-sm text-gray-300">
                      {stock.sector}
                    </span>
                  </div>
                  <p className="text-gray-300">{stock.summary}</p>
                </div>
              </div>

              {/* Stock Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Confidence</div>
                  <div className="text-lg font-semibold text-[#00ff88]">
                    {stock.confidence}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Risk Level</div>
                  <div className={`text-lg font-semibold ${
                    stock.riskLevel === 'Low' ? 'text-green-400' :
                    stock.riskLevel === 'Medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {stock.riskLevel}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Action</div>
                  <div className={`text-lg font-semibold ${
                    stock.action === 'BUY' ? 'text-green-400' :
                    stock.action === 'WATCH' ? 'text-yellow-400' :
                    stock.action === 'HOLD' ? 'text-blue-400' :
                    'text-red-400'
                  }`}>
                    {stock.action}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Entry Price</div>
                  <div className="text-lg font-semibold text-white">
                    ${stock.entryPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Stock Details */}
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-gray-400 mb-1">Why It Matters</div>
                  <p className="text-gray-300">{stock.whyMatters}</p>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-400 mb-1">Momentum Check</div>
                  <p className="text-gray-300">{stock.momentumCheck}</p>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-400 mb-1">Actionable Insight</div>
                  <p className="text-[#00ff88]">{stock.actionableInsight}</p>
                </div>

                {stock.allocation && (
                  <div>
                    <div className="text-sm font-semibold text-gray-400 mb-1">Suggested Allocation</div>
                    <p className="text-gray-300">{stock.allocation}</p>
                  </div>
                )}

                {stock.cautionNotes && (
                  <div>
                    <div className="text-sm font-semibold text-gray-400 mb-1">Caution Notes</div>
                    <p className="text-yellow-400">{stock.cautionNotes}</p>
                  </div>
                )}

                {stock.learningMoment && (
                  <div>
                    <div className="text-sm font-semibold text-gray-400 mb-1">Learning Moment</div>
                    <p className="text-blue-400">{stock.learningMoment}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Share Section */}
        <div className="mt-12 pt-8 border-t border-[#1a3a52]">
          <h3 className="text-lg font-semibold text-white mb-4">Share this brief</h3>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a52] hover:bg-[#2a4a62] border border-[#2a4a62] rounded-lg text-white transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share on Twitter
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a52] hover:bg-[#2a4a62] border border-[#2a4a62] rounded-lg text-white transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share on LinkedIn
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl)
                alert('Link copied to clipboard!')
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a52] hover:bg-[#2a4a62] border border-[#2a4a62] rounded-lg text-white transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Copy Link
            </button>
          </div>
        </div>

        {/* Subscribe CTA */}
        <div className="mt-12 p-8 bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            Get Daily Briefs Like This
          </h3>
          <p className="text-gray-300 mb-6">
            Subscribe to receive market insights and stock analysis every morning
          </p>
          <Link href="/#subscribe">
            <Button className="bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] font-semibold px-8">
              Subscribe Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
