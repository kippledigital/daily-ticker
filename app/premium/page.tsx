'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react'

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
          priceType: 'standard', // $96/year standard pricing
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

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Main Grid - Two Column Layout */}
        <div className="grid lg:grid-cols-[1fr,400px] gap-8 items-start">

          {/* Left Column - Benefits */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Upgrade to Pro
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Get the complete trading toolkit for <strong className="text-white">$96/year</strong> or $10/month
            </p>

            {/* Benefits List - Compact */}
            <div className="bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border border-[#1a3a52] rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Pro includes:</h2>
              <ul className="space-y-3">
                {[
                  { title: 'AI Confidence Scores', desc: '0-100 rating for each pick' },
                  { title: 'Precise Entry Zones', desc: 'Save 3-5% on entries' },
                  { title: 'Stop-Loss Levels', desc: 'Protect your capital' },
                  { title: 'Profit Targets', desc: '2:1 reward-to-risk targets' },
                  { title: 'Portfolio Allocation %', desc: 'Optimal position sizing' },
                  { title: 'Full Risk Breakdown', desc: 'Complete caution notes' },
                  { title: 'Unlimited Archive Access', desc: 'Full performance tracking' },
                ].map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#00ff88] flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <span className="font-semibold text-white">{benefit.title}</span>
                      <span className="text-gray-400"> — {benefit.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Pricing Card (Sticky) */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border-2 border-[#00ff88]/40 rounded-xl p-6">

              {/* Pricing */}
              <div className="text-center mb-6">
                <div className="mb-2">
                  <span className="text-5xl font-bold text-white">$96</span>
                  <span className="text-xl text-gray-300">/year</span>
                </div>
                <p className="text-sm text-gray-400">or $10/month · billed monthly</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Subscribe Button */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full px-6 py-3 bg-[#00ff88] text-[#0B1E32] font-bold rounded-lg hover:bg-[#00dd77] transition-colors shadow-lg shadow-[#00ff88]/30 hover:shadow-[#00ff88]/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

              {/* Trust Indicators */}
              <p className="text-xs text-gray-400 text-center mt-4">
                Secure payment via Stripe • Cancel anytime<br />
                60-day money-back guarantee
              </p>

              {/* Divider */}
              <div className="border-t border-[#1a3a52] my-6"></div>

              {/* What happens next */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">What happens next:</h3>
                <ul className="space-y-2 text-xs text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-[#00ff88] font-bold">1.</span>
                    <span>Secure checkout via Stripe</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00ff88] font-bold">2.</span>
                    <span>Premium briefs start tomorrow 8 AM EST</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00ff88] font-bold">3.</span>
                    <span>Full archive access instantly</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
