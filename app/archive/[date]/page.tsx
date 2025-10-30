'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TrendingUp, Calendar, Share2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BlurredPremium } from '@/components/blurred-premium'
import { PremiumBadge } from '@/components/premium-badge'
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

        {/* Brief Content - Matching Email Design */}
        <div className="space-y-6 mb-12">
          {/* TL;DR Section */}
          <div className="bg-[#1a3a52] border-l-4 border-[#00ff88] rounded-lg p-6">
            <h2 className="text-[#00ff88] text-xl font-semibold mb-4">🎯 TL;DR</h2>
            {brief.tldr && (
              <p className="text-gray-300 leading-relaxed">{brief.tldr}</p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#1a3a52] to-transparent"></div>

          {/* Stock Cards */}
          <div>
            <h2 className="text-[#00ff88] text-2xl font-semibold mb-6">📊 Today&apos;s Stocks at a Glance</h2>

            {brief.stocks.map((stock, index) => (
              <div
                key={index}
                className="bg-[#1a3a52] border border-[#2a4a62] rounded-xl p-6 mb-6"
              >
                {/* Stock Header */}
                <div className="mb-5">
                  <h3 className="text-[#00ff88] text-2xl font-bold font-mono mb-1">
                    🔹 {stock.ticker}
                  </h3>
                  <p className="text-gray-400 text-sm font-medium">{stock.sector}</p>
                </div>

                {/* What it does */}
                <div className="mb-4">
                  <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-1">What it does</p>
                  <p className="text-gray-200">{stock.summary}</p>
                </div>

                {/* Why it matters */}
                <div className="mb-5">
                  <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-1">Why it matters today</p>
                  <p className="text-gray-200">{stock.whyMatters}</p>
                </div>

                {/* Price Info Box */}
                <div className="bg-[#0B1E32] border border-[#1a3a52] rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-r border-[#1a3a52] pr-4">
                      <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-1">Price</p>
                      <p className="text-white text-xl font-bold font-mono">${stock.entryPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-1">Action</p>
                      <p className={`text-lg font-semibold ${
                        stock.action === 'BUY' ? 'text-green-400' :
                        stock.action === 'WATCH' ? 'text-yellow-400' :
                        stock.action === 'HOLD' ? 'text-blue-400' :
                        'text-red-400'
                      }`}>
                        {stock.action}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stop Loss & Profit Target */}
                {(stock.stopLoss || stock.profitTarget) && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-[#2a1a1f] border-2 border-[#ff3366] rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-[#ffb3c6] text-xs uppercase font-semibold tracking-wider">Stop Loss</p>
                        <PremiumBadge size="sm" />
                      </div>
                      <p className="text-[#ff3366] text-xl font-bold font-mono">
                        <BlurredPremium content={`$${stock.stopLoss?.toFixed(2)}`} tooltip="Upgrade to see stop-loss levels" />
                      </p>
                    </div>
                    <div className="bg-[#0a2a1a] border-2 border-[#00ff88] rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-[#b3ffdd] text-xs uppercase font-semibold tracking-wider">Profit Target</p>
                        <PremiumBadge size="sm" />
                      </div>
                      <p className="text-[#00ff88] text-xl font-bold font-mono">
                        <BlurredPremium content={`$${stock.profitTarget?.toFixed(2)}`} tooltip="Upgrade to see profit targets" />
                      </p>
                    </div>
                  </div>
                )}

                {/* Risk/Reward Ratio */}
                {(stock.stopLoss && stock.profitTarget) && (
                  <div className="bg-[#1a3a52] border border-[#2a4a62] rounded-md p-2 mb-4 text-center">
                    <p className="text-gray-400 text-xs">
                      Risk/Reward Ratio: <strong className="text-[#00ff88] text-sm font-bold">
                        1:{((stock.profitTarget - stock.entryPrice) / (stock.entryPrice - stock.stopLoss)).toFixed(1)}
                      </strong>
                    </p>
                  </div>
                )}

                {/* What to Do - CTA */}
                <div className="bg-gradient-to-r from-[#00ff88] to-[#00dd77] rounded-lg p-4 mb-4 shadow-lg shadow-[#00ff88]/20">
                  <p className="text-[#0B1E32] font-bold">
                    <span className="text-lg mr-2">🧭</span>
                    What to Do: <span className="font-semibold">{stock.actionableInsight}</span>
                  </p>
                </div>

                {/* Why this matters to you */}
                <div className="mb-4">
                  <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-1">Why this matters to you</p>
                  <p className="text-gray-200">{stock.momentumCheck}</p>
                </div>

                {/* Meta Info */}
                <div className="pt-3 border-t border-[#2a4a62]">
                  <p className="text-gray-400 text-sm flex items-center gap-2 flex-wrap">
                    <span><strong>Risk level:</strong> {stock.riskLevel}</span>
                    <span className="text-gray-600">•</span>
                    <span className="flex items-center gap-1">
                      <strong>Confidence:</strong>
                      <PremiumBadge size="sm" />
                      <BlurredPremium content={`${stock.confidence}%`} />
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Upgrade CTA */}
        <div className="mt-12 p-8 bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border-2 border-[#00ff88]/40 rounded-2xl text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            Unlock Full Analysis
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Upgrade to Premium to see confidence scores, stop-loss levels, profit targets, and complete position sizing recommendations
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/#pricing">
              <Button className="bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] font-bold px-8">
                Upgrade to Premium
              </Button>
            </Link>
            <p className="text-sm text-gray-400">
              $8/month or $96/year • 60 picks/month
            </p>
          </div>
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
