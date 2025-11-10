'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Mail, BookOpen, Loader2 } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { trackCheckoutComplete } from '@/lib/analytics'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = searchParams.get('session_id')
    const priceType = searchParams.get('price_type') as 'monthly' | 'standard' | null
    
    if (id) {
      setSessionId(id)
      // Track checkout completion
      trackCheckoutComplete(id, priceType || 'standard')
    }
    
    setLoading(false)
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1E32] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#00ff88]" />
          <div className="text-[#00ff88] text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1E32]">
      <SiteHeader />

      {/* Success Content */}
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border-2 border-[#00ff88]/40 rounded-2xl p-8 md:p-12 text-center shadow-lg shadow-[#00ff88]/10">
          {/* Success Icon with Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="bg-[#00ff88]/10 rounded-full p-6 animate-in zoom-in duration-500">
                <CheckCircle className="h-16 w-16 text-[#00ff88]" />
              </div>
              {/* Pulsing ring effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full border-2 border-[#00ff88]/30 animate-ping" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Welcome to Premium! 🎉
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Your payment was successful! You now have access to:
          </p>

          {/* Features List */}
          <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-xl p-6 mb-8 text-left space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-[#00ff88] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">AI Confidence Scores</p>
                <p className="text-sm text-gray-400">0-100 rating for conviction on every pick</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-[#00ff88] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">Precise Entry Zones</p>
                <p className="text-sm text-gray-400">Save 3-5% on entries with exact price ranges</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-[#00ff88] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">Stop-Loss Levels</p>
                <p className="text-sm text-gray-400">Protect your capital with clear exit points</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-[#00ff88] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">Profit Targets</p>
                <p className="text-sm text-gray-400">2:1 reward-to-risk ratio on every trade</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-[#00ff88] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">Portfolio Allocation %</p>
                <p className="text-sm text-gray-400">Optimize position sizing for each pick</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-[#00ff88] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">Full Archive Access</p>
                <p className="text-sm text-gray-400">Browse all past briefs with complete data</p>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border border-[#00ff88]/20 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#00ff88]/10 rounded-lg p-2">
                <Mail className="h-5 w-5 text-[#00ff88]" />
              </div>
              <p className="text-white font-semibold text-lg">What&apos;s Next?</p>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Your first premium brief will arrive tomorrow morning at <strong className="text-[#00ff88]">8 AM EST</strong>.
              In the meantime, explore the archive to see how we analyze stocks.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/archive"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] font-bold rounded-lg transition-colors shadow-lg shadow-[#00ff88]/30 hover:shadow-[#00ff88]/50"
            >
              <BookOpen className="h-4 w-4" />
              Browse Archive
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-3 bg-[#1a3a52] hover:bg-[#244a62] text-white font-semibold rounded-lg transition-colors border border-[#00ff88]/20"
            >
              Back to Home
            </Link>
          </div>

          {/* Session ID for reference */}
          {sessionId && (
            <p className="text-xs text-gray-500 mt-8 font-mono">
              Session ID: {sessionId}
            </p>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Questions? Email us at{' '}
            <a href="mailto:brief@dailyticker.co" className="text-[#00ff88] hover:text-[#00dd77] transition-colors">
              brief@dailyticker.co
            </a>
          </p>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
