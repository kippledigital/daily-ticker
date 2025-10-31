'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, CheckCircle2, Sparkles, ArrowLeft } from 'lucide-react'

export default function PremiumWaitlistPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [joined, setJoined] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/premium/join-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setJoined(true)
        setEmail('')
        setName('')
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
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

        {!joined ? (
          <>
            {/* Hero */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#00ff88]/10 border-2 border-[#00ff88]/30 mb-6">
                <Sparkles className="h-8 w-8 text-[#00ff88]" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Join the Premium Waitlist
              </h1>
              <p className="text-xl text-gray-300">
                Be the first to know when Premium launches in <strong className="text-white">Q1 2026</strong>
              </p>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border border-[#1a3a52] rounded-xl p-8 mb-8">
              <h2 className="text-xl font-bold text-white mb-6">What you&apos;ll get with Premium:</h2>
              <ul className="space-y-4">
                {[
                  { title: 'AI Confidence Scores', desc: '0-100 rating for each pick' },
                  { title: 'Precise Entry Zones', desc: 'Save 3-5% on entries with optimal pricing' },
                  { title: 'Stop-Loss Levels', desc: 'Protect your capital automatically' },
                  { title: 'Profit Targets', desc: '2:1 reward-to-risk targets' },
                  { title: 'Portfolio Allocation %', desc: 'Optimal position sizing for each trade' },
                  { title: 'Full Risk Breakdown', desc: 'Complete caution notes and warnings' },
                  { title: 'Early Bird Discount', desc: '50% off first year ($48 instead of $96)' },
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

            {/* Form */}
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-[#0B1E32] border border-[#1a3a52] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 bg-[#0B1E32] border border-[#1a3a52] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:border-transparent"
                  />
                </div>

                {message && (
                  <div
                    className={`p-4 rounded-lg ${
                      message.type === 'success'
                        ? 'bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88]'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 bg-[#00ff88] text-[#0B1E32] font-bold rounded-lg hover:bg-[#00dd77] transition-colors shadow-lg shadow-[#00ff88]/30 hover:shadow-[#00ff88]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Joining...' : 'Join the Waitlist'}
                </button>
              </form>

              <p className="text-sm text-gray-400 text-center mt-4">
                No spam. We&apos;ll only email you when Premium launches.
              </p>
            </div>
          </>
        ) : (
          // Success state
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-[#00ff88]/10 border-2 border-[#00ff88]/30 mb-6">
              <CheckCircle2 className="h-10 w-10 text-[#00ff88]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">You&apos;re on the list!</h2>
            <p className="text-xl text-gray-300 mb-8">
              We&apos;ll notify you as soon as Premium launches in Q1 2026.
              <br />
              Plus, you&apos;ll get the <strong className="text-[#00ff88]">50% early bird discount</strong>.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a3a52] text-white font-semibold rounded-lg hover:bg-[#244a62] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
