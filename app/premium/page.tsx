'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, CheckCircle2, Sparkles, ArrowLeft, Loader2 } from 'lucide-react'

export default function PremiumPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceType: 'earlyBird', // $48/year early bird pricing
        }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to create checkout session')
        setLoading(false)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
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

      <div className="container mx-auto px-4 py-16 max-w-2xl">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#00ff88]/10 border-2 border-[#00ff88]/30 mb-6">
            <Sparkles className="h-8 w-8 text-[#00ff88]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Upgrade to Pro
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Get the complete trading toolkit for <strong className="text-white">$96/year</strong>
          </p>
          <p className="text-sm text-gray-400">
            or $10/month · billed monthly
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border border-[#1a3a52] rounded-xl p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Pro includes:</h2>
          <ul className="space-y-4">
            {[
              { title: 'AI Confidence Scores', desc: '0-100 rating for each pick' },
              { title: 'Precise Entry Zones', desc: 'Save 3-5% on entries with optimal pricing' },
              { title: 'Stop-Loss Levels', desc: 'Protect your capital automatically' },
              { title: 'Profit Targets', desc: '2:1 reward-to-risk targets' },
              { title: 'Portfolio Allocation %', desc: 'Optimal position sizing for each trade' },
              { title: 'Full Risk Breakdown', desc: 'Complete caution notes and warnings' },
              { title: 'Daily Learning Moments', desc: 'Investing education with every brief' },
            ].map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#00ff88] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">{benefit.title}</span>
                  <span className="text-gray-300"> — {benefit.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing Card */}
        <div className="bg-[#1a3a52]/30 border-2 border-[#00ff88]/40 rounded-xl p-8 mb-8">
          <div className="text-center mb-6">
            <div className="mb-2">
              <span className="text-5xl font-bold text-white">$96</span>
              <span className="text-xl text-gray-300">/year</span>
            </div>
            <p className="text-sm text-gray-400">or $10/month · billed monthly</p>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full px-6 py-4 bg-[#00ff88] text-[#0B1E32] font-bold rounded-lg hover:bg-[#00dd77] transition-colors shadow-lg shadow-[#00ff88]/30 hover:shadow-[#00ff88]/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading checkout...
              </>
            ) : (
              'Subscribe Now'
            )}
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
            Secure payment via Stripe • Cancel anytime • 60-day money-back guarantee
          </p>
        </div>

        {/* FAQ / Additional Info */}
        <div className="bg-[#1a3a52]/20 border border-[#1a3a52] rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">What happens next?</h3>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#00ff88] font-bold">1.</span>
              <span>Click &quot;Subscribe Now&quot; to go to secure Stripe checkout</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00ff88] font-bold">2.</span>
              <span>Complete your payment with card or other payment methods</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00ff88] font-bold">3.</span>
              <span>Receive premium briefs starting tomorrow at 8 AM EST</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00ff88] font-bold">4.</span>
              <span>Access the full archive with unblurred premium features</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
