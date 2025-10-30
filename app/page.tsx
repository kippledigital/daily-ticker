"use client"

import { HybridTicker } from "@/components/hybrid-ticker"
import { SubscribeForm } from "@/components/subscribe-form"
import { EmailPreview } from "@/components/email-preview"
import { ROICalculator } from "@/components/roi-calculator"
import { Mail, TrendingUp, Target, Zap, BookOpen } from "lucide-react"

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: "Daily Ticker - Market Insights That Make Sense",
    description: "Get 3 actionable stock picks daily — FREE. Premium tier launching Q1 2026 with 5 picks, portfolio allocation, and unlimited archive.",
    publisher: {
      "@type": "Organization",
      name: "Daily Ticker",
      logo: {
        "@type": "ImageObject",
        url: "https://dailyticker.co/logo.png",
      },
    },
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: "Daily Ticker",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://dailyticker.co",
    },
  }

  return (
    <div className="min-h-screen bg-[#0B1E32]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* Header */}
      <header className="border-b border-[#1a3a52] bg-[#0B1E32]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-[#00ff88]" />
            <h1 className="text-xl font-bold text-white font-mono">Daily Ticker</h1>
          </div>
          <nav className="flex items-center gap-4 md:gap-6">
            <a href="#pricing" className="hidden md:block text-sm text-gray-300 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="/archive" className="hidden md:block text-sm text-gray-300 hover:text-white transition-colors">
              Archive
            </a>
            <a
              href="mailto:brief@dailyticker.co"
              className="hidden md:flex text-sm text-gray-300 hover:text-white transition-colors items-center gap-1"
            >
              <Mail className="h-4 w-4" />
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section - REDESIGNED */}
      <section id="subscribe" className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Live Indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a3a52]/50 border border-[#00ff88]/20 text-sm text-[#00ff88] mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
            </span>
            Delivered daily at 8 AM EST
          </div>

          {/* Headline - Updated per PM spec */}
          <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight text-balance">
            Market insights that make sense
          </h2>

          {/* Subtext - NEW: Clear value prop per PM spec */}
          <div className="space-y-3">
            <p className="text-xl md:text-2xl text-white font-semibold">
              Get 3 actionable stock picks daily — FREE
            </p>
            <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Premium tier launching Q1 2026 with 5 picks, portfolio allocation, and unlimited archive.
            </p>
          </div>

          {/* Subscribe Form */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <SubscribeForm variant="large" />
          </div>
        </div>
      </section>

      {/* Live Ticker - MOVED ABOVE THE FOLD: Market Pulse + Cycling Free Picks */}
      <section className="container mx-auto px-4 py-12">
        <HybridTicker />
      </section>

      {/* Features Section - REDESIGNED with specific value props */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">How Daily Ticker Works</h3>
            <p className="text-gray-300 text-lg">Everything you need to make informed decisions, delivered daily</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white">Actionable Stock Picks</h4>
              <p className="text-gray-300 leading-relaxed text-sm">
                Not just &ldquo;what moved&rdquo; but <strong>when to enter</strong>, <strong>how much to allocate</strong>, and <strong>why it matters</strong>. Every pick includes entry zones and risk levels.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white">5-Minute Read, Zero Fluff</h4>
              <p className="text-gray-300 leading-relaxed text-sm">
                Your time is valuable. We cut through the noise and deliver <strong>only what you need</strong> to make decisions. No 50-page reports, just clear insights.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white">Learn While You Earn</h4>
              <p className="text-gray-300 leading-relaxed text-sm">
                Premium subscribers get <strong>daily learning moments</strong> — investing concepts explained in plain English so you get smarter over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Email Preview - NEW: See what you'll get */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-b from-transparent to-[#0a1929]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-sm text-[#00ff88] mb-4">
              <span>📧</span> Live Preview
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">See what you&apos;ll get</h3>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Every morning, you&apos;ll receive a concise brief with the day&apos;s most important market moves and why they matter.
            </p>
          </div>

          <EmailPreview />
        </div>
      </section>

      {/* ROI Calculator - NEW per PM spec */}
      <section className="container mx-auto px-4 py-16">
        <ROICalculator />
      </section>

      {/* Pricing Section - REDESIGNED per PM spec */}
      <section className="container mx-auto px-4 py-16" id="pricing">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Choose Your Plan</h3>
            <p className="text-gray-300 text-lg">Start free, upgrade when you&apos;re ready for advanced insights</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-2xl p-8 space-y-6">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-[#1a3a52] text-gray-300 text-xs font-semibold mb-3">
                  Available Now
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">Free</h4>
                <p className="text-gray-300">Core market insights</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-gray-300">/month</span>
                </div>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span><strong>3 stock picks</strong> daily</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span>Entry prices & ideal entry zones</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span>Sector analysis & market context</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span>Why it matters & momentum checks</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span>7-day archive access</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-gray-600 mt-1">✕</span>
                  <span>Confidence scores (blurred)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-gray-600 mt-1">✕</span>
                  <span>Stop-loss levels & profit targets</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-gray-600 mt-1">✕</span>
                  <span>Portfolio allocation guidance</span>
                </li>
              </ul>

              <a
                href="#subscribe"
                className="block w-full text-center px-6 py-3 bg-[#1a3a52] text-white font-semibold rounded-lg hover:bg-[#244a62] transition-colors border border-[#00ff88]/20"
              >
                Get Started Free
              </a>
            </div>

            {/* Premium Tier - UPDATED per PM spec */}
            <div className="bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border-2 border-[#00ff88]/40 rounded-2xl p-8 space-y-6 relative">
              {/* Launching Soon Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-block px-4 py-1 bg-gradient-to-r from-[#00ff88] to-[#00dd77] text-[#0B1E32] text-sm font-bold rounded-full shadow-lg">
                  LAUNCHING Q1 2026 🔜
                </span>
              </div>

              <div className="pt-4">
                <div className="inline-block px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold mb-3 border border-yellow-500/30">
                  Early Bird: 50% Off First Year
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">Premium</h4>
                <p className="text-gray-300">Complete trading toolkit</p>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">$96</span>
                    <span className="text-gray-300">/year</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="text-sm text-gray-400">
                      or $10/month · billed monthly
                    </div>
                    <div className="text-sm text-yellow-400 font-semibold">
                      Early subscribers: $48 first year (then $96/year)
                    </div>
                  </div>
                </div>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span className="font-semibold">Everything in Free, plus:</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span><strong>5 stock picks</strong> daily (+2 more opportunities)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span><strong>AI confidence scores</strong> (0-100 rating)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span><strong>Portfolio allocation %</strong> for each pick</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span><strong>Stop-loss levels</strong> for risk management</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span><strong>Profit targets</strong> (2:1 reward-to-risk)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span>Unlimited archive + performance tracking</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span>Daily learning moments (trading education)</span>
                </li>
              </ul>

              <button className="w-full px-6 py-3 bg-[#00ff88] text-[#0B1E32] font-bold rounded-lg hover:bg-[#00dd77] transition-colors shadow-lg shadow-[#00ff88]/30 hover:shadow-[#00ff88]/50">
                Join Premium Waitlist
              </button>
              <p className="text-xs text-center text-gray-400">
                Be first to know when premium launches • Lock in 50% off
              </p>
            </div>
          </div>

          {/* ROI Comparison - REPOSITIONED (was at bottom) */}
          <div className="mt-12 text-center">
            <div className="inline-block px-6 py-4 bg-[#1a3a52]/30 border border-[#1a3a52] rounded-xl">
              <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Compare to services like Motley Fool ($199/year for 2 picks/month). Daily Ticker delivers{" "}
                <strong className="text-white">60 picks/month</strong> for just $96/year — that&apos;s{" "}
                <strong className="text-[#00ff88]">30x more value</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border border-[#00ff88]/20 rounded-2xl p-8 md:p-12 text-center space-y-6">
          <h3 className="text-2xl md:text-3xl font-bold text-white text-balance">Start your mornings smarter</h3>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto text-pretty">
            Join thousands of investors getting clear, actionable market insights delivered at 8 AM EST.
          </p>
          <SubscribeForm variant="large" />
          <p className="text-sm text-gray-400">
            No credit card required • Unsubscribe anytime • Early subscribers get 50% off premium
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a3a52] bg-[#0B1E32] mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#00ff88]" />
                <span className="font-bold text-white font-mono">Daily Ticker</span>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">
                Market insights that make sense. Delivered daily at 8 AM EST.
              </p>
            </div>

            <div className="space-y-4">
              <h5 className="font-semibold text-white">Connect</h5>
              <div className="space-y-2">
                <a
                  href="https://twitter.com/GetDailyTicker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-gray-200 hover:text-[#00ff88] transition-colors"
                >
                  Twitter
                </a>
                <a
                  href="mailto:brief@dailyticker.co"
                  className="block text-sm text-gray-200 hover:text-[#00ff88] transition-colors"
                >
                  Email Us
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="font-semibold text-white">Legal</h5>
              <div className="space-y-2">
                <a href="/privacy" className="block text-sm text-gray-200 hover:text-[#00ff88] transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="block text-sm text-gray-200 hover:text-[#00ff88] transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-[#1a3a52]">
            <p className="text-xs text-gray-300 leading-relaxed">
              <strong>Disclaimer:</strong> Daily Ticker is for educational purposes only and does not provide financial
              advice. All content is for informational purposes. Always consult with a qualified financial advisor
              before making investment decisions.
            </p>
            <p className="text-xs text-gray-300 mt-4">
              © {new Date().getFullYear()} Daily Ticker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
