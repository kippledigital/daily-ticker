'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, CheckCircle, Mail, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = searchParams.get('session_id')
    if (id) {
      setSessionId(id)
      setLoading(false)
    } else {
      // No session ID, redirect to home
      setTimeout(() => router.push('/'), 3000)
    }
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1E32] flex items-center justify-center">
        <div className="text-[#00ff88]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1E32]">
      {/* Header */}
      <header className="border-b border-[#1a3a52] bg-[#0B1E32]/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <TrendingUp className="h-6 w-6 text-[#00ff88]" />
            <h1 className="text-xl font-bold text-white font-mono">Daily Ticker</h1>
          </Link>
        </div>
      </header>

      {/* Success Content */}
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-[#1a3a52] border-2 border-[#00ff88] rounded-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#00ff88]/10 rounded-full p-6">
              <CheckCircle className="h-16 w-16 text-[#00ff88]" />
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
          <div className="bg-[#0B1E32] rounded-xl p-6 mb-8 text-left space-y-4">
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
          <div className="bg-gradient-to-r from-[#00ff88]/10 to-[#00dd77]/10 border border-[#00ff88]/30 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5 text-[#00ff88]" />
              <p className="text-white font-semibold">What's Next?</p>
            </div>
            <p className="text-sm text-gray-300">
              Your first premium brief will arrive tomorrow morning at 8 AM EST.
              In the meantime, explore the archive to see how we analyze stocks.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/archive">
              <Button className="w-full sm:w-auto bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] font-bold px-8">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Archive
              </Button>
            </Link>
            <Link href="/">
              <Button className="w-full sm:w-auto bg-[#1a3a52] hover:bg-[#2a4a62] text-white border border-[#2a4a62] px-8">
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Session ID for reference */}
          {sessionId && (
            <p className="text-xs text-gray-500 mt-8">
              Session ID: {sessionId}
            </p>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Questions? Email us at{' '}
            <a href="mailto:brief@dailyticker.co" className="text-[#00ff88] hover:underline">
              brief@dailyticker.co
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
