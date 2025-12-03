'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Share2, ArrowLeft, Mail, Sparkles, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BlurredPremium } from '@/components/blurred-premium'
import { PremiumBadge } from '@/components/premium-badge'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { createClient } from '@/lib/supabase-auth'
import { ArchiveNavigation } from './archive-navigation'
import { PerformanceSummary } from './performance-summary'
import { LoginModal } from '@/components/login-modal'
import type { BriefData } from '@/app/api/archive/store/route'
import { formatArchiveDate } from '@/lib/seo/generate-archive-metadata'

interface ArchivePageClientProps {
  brief: BriefData
}

export function ArchivePageClient({ brief }: ArchivePageClientProps) {
  const [userTier, setUserTier] = useState<'free' | 'premium'>('free')
  const supabase = createClient()

  // Fetch user tier from Supabase session
  useEffect(() => {
    async function getUserTier() {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user?.email) {
        // Query subscribers table to get user's tier
        const { data: subscriber, error } = await supabase
          .from('subscribers')
          .select('tier')
          .eq('email', session.user.email)
          .single()

        if (!error && subscriber) {
          setUserTier(subscriber.tier as 'free' | 'premium')
        }
      }
    }

    getUserTier()
  }, [supabase])

  const formattedDate = formatArchiveDate(brief.date)
  const shareUrl = `https://dailyticker.co/archive/${brief.date}`
  const shareText = `${brief.subject} — Daily Ticker`

  return (
    <div className="min-h-screen bg-[#0B1E32]">
      <SiteHeader />

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
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[#00ff88] text-2xl font-bold font-mono mb-1">
                        🔹 {stock.ticker}
                      </h3>
                      <p className="text-gray-400 text-sm font-medium">{stock.sector}</p>
                    </div>
                    <Link
                      href={`/stocks/${stock.ticker}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 hover:border-[#00ff88] rounded-lg text-sm font-medium text-[#00ff88] transition-all"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Track Record
                    </Link>
                  </div>
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
                        {userTier === 'free' && <PremiumBadge size="sm" />}
                      </div>
                      <p className="text-[#ff3366] text-xl font-bold font-mono">
                        <BlurredPremium tier={userTier} feature="Stop Loss">
                          ${stock.stopLoss?.toFixed(2)}
                        </BlurredPremium>
                      </p>
                    </div>
                    <div className="bg-[#0a2a1a] border-2 border-[#00ff88] rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-[#b3ffdd] text-xs uppercase font-semibold tracking-wider">Profit Target</p>
                        {userTier === 'free' && <PremiumBadge size="sm" />}
                      </div>
                      <p className="text-[#00ff88] text-xl font-bold font-mono">
                        <BlurredPremium tier={userTier} feature="Profit Target">
                          ${stock.profitTarget?.toFixed(2)}
                        </BlurredPremium>
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
                      {userTier === 'free' && <PremiumBadge size="sm" />}
                      <BlurredPremium tier={userTier} feature="Confidence Score">
                        {stock.confidence}%
                      </BlurredPremium>
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <PerformanceSummary brief={brief} />

        {/* Archive Navigation */}
        <ArchiveNavigation currentDate={brief.date} />

        {/* Pro Upgrade / Sign-In CTA */}
        <div className="mt-16 p-8 md:p-12 bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border-2 border-[#00ff88]/40 rounded-2xl">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[#00ff88]" />
              <span className="text-sm font-semibold text-[#00ff88] uppercase tracking-wider">Pro Features</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
              Unlock Full Analysis
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-center">
              Free readers see a limited version of this brief. Pro members unlock confidence scores, stop-loss levels,
              profit targets, and complete position sizing recommendations across the full archive.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link href="/#pricing">
                <Button className="bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] font-bold px-8 py-6 text-lg">
                  Upgrade to Pro
                </Button>
              </Link>
              <LoginModal
                triggerText="Pro member? Sign in"
                triggerClassName="px-8 py-3 border border-[#00ff88]/60 text-[#00ff88] hover:bg-[#00ff88]/10 text-lg rounded-lg font-medium transition-colors"
              />
            </div>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <span>Starting at $8/month</span>
              <span>•</span>
              <span>60-day guarantee</span>
            </div>
          </div>
        </div>

        {/* Share & Subscribe Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {/* Share Section */}
          <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="h-5 w-5 text-[#00ff88]" />
              <h3 className="text-lg font-semibold text-white">Share this brief</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Help others discover Daily Ticker
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a52] hover:bg-[#2a4a62] border border-[#2a4a62] rounded-lg text-white transition-colors text-sm"
              >
                <Share2 className="h-4 w-4" />
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a52] hover:bg-[#2a4a62] border border-[#2a4a62] rounded-lg text-white transition-colors text-sm"
              >
                <Share2 className="h-4 w-4" />
                LinkedIn
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl)
                  alert('Link copied to clipboard!')
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a52] hover:bg-[#2a4a62] border border-[#2a4a62] rounded-lg text-white transition-colors text-sm"
              >
                <Share2 className="h-4 w-4" />
                Copy
              </button>
            </div>
          </div>

          {/* Subscribe CTA */}
          <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-[#00ff88]" />
              <h3 className="text-lg font-semibold text-white">Get daily briefs</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Receive market insights every morning at 8 AM EST
            </p>
            <Link href="/#subscribe">
              <Button className="w-full bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] font-semibold">
                Subscribe Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}

