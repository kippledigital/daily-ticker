"use client"

import { HybridTicker } from "@/components/hybrid-ticker"
import { SubscribeForm } from "@/components/subscribe-form"
import { EmailPreview } from "@/components/email-preview"
import { ROICalculator } from "@/components/roi-calculator"
import { SectionDivider } from "@/components/section-divider"
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
      <section id="subscribe" className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-5xl mx-auto text-center space-y-6">
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
              Get up to 3 actionable stock picks daily — FREE
            </p>
            <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Premium tier launching Q1 2026 with confidence scores, stop-loss levels, and profit targets to maximize your trades.
            </p>
          </div>

          {/* Subscribe Form */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <SubscribeForm variant="large" />
          </div>
        </div>
      </section>

      {/* Live Ticker - MOVED ABOVE THE FOLD: Market Pulse + Cycling Free Picks */}
      <section className="container mx-auto px-4 py-6">
        <HybridTicker />
      </section>

      <SectionDivider />

      {/* Features Section - REDESIGNED with specific value props */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">How Daily Ticker Works</h3>
            <p className="text-gray-300 text-lg">Everything you need to make informed decisions, delivered daily</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-[#00ff88]/10 to-transparent border border-[#00ff88]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {/* Pulsing rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute h-5 w-5 rounded-full border-2 border-[#00ff88]/40 animate-ping" />
                    <div className="absolute h-4 w-4 rounded-full border-2 border-[#00ff88]/60 animate-pulse" />
                  </div>
                  {/* Center dot */}
                  <div className="relative h-1.5 w-1.5 rounded-full bg-[#00ff88] shadow-lg shadow-[#00ff88]/50" />
                  {/* Crosshair lines */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-[#00ff88]/40 to-transparent" />
                    <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/40 to-transparent" />
                  </div>
                </div>
                <h4 className="text-xl font-bold text-white">Actionable Stock Picks</h4>
              </div>
              <p className="text-gray-300 leading-relaxed text-sm">
                Not just &ldquo;what moved&rdquo; but <strong>when to enter</strong>, <strong>how much to allocate</strong>, and <strong>why it matters</strong>. Every pick includes entry zones and risk levels.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-[#00ff88]/10 to-transparent border border-[#00ff88]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {/* Clock face */}
                  <div className="relative h-8 w-8 rounded-full border-2 border-[#00ff88]/40 flex items-center justify-center">
                    {/* Clock markers */}
                    <div className="absolute inset-0">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-[1px] bg-[#00ff88]/60" />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-[1px] bg-[#00ff88]/60" />
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-[1px] bg-[#00ff88]/60" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-[1px] bg-[#00ff88]/60" />
                    </div>
                    {/* Minute hand (animated) */}
                    <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 h-3 w-[1px] bg-[#00ff88] origin-bottom -translate-y-full rounded-full" />
                    </div>
                    {/* Hour hand */}
                    <div className="absolute inset-0 rotate-90">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 h-2 w-[1px] bg-[#00ff88]/60 origin-bottom -translate-y-full rounded-full" />
                    </div>
                    {/* Center dot */}
                    <div className="absolute h-1 w-1 rounded-full bg-[#00ff88] shadow-lg shadow-[#00ff88]/50" />
                  </div>
                  {/* Speed lines */}
                  <Zap className="absolute h-3 w-3 text-[#00ff88]/30 -right-0.5 -top-0.5 animate-pulse" />
                </div>
                <h4 className="text-xl font-bold text-white">5-Minute Read, Zero Fluff</h4>
              </div>
              <p className="text-gray-300 leading-relaxed text-sm">
                Your time is valuable. We cut through the noise and deliver <strong>only what you need</strong> to make decisions. No 50-page reports, just clear insights.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-[#00ff88]/10 to-transparent border border-[#00ff88]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {/* Stacked book pages */}
                  <div className="relative">
                    {/* Page 3 (back) */}
                    <div className="absolute -right-0.5 top-0.5 h-6 w-5 bg-[#00ff88]/10 rounded-sm border border-[#00ff88]/20 transform rotate-6" />
                    {/* Page 2 (middle) */}
                    <div className="absolute -right-0.5 top-0.5 h-6 w-5 bg-[#00ff88]/15 rounded-sm border border-[#00ff88]/30 transform rotate-3" />
                    {/* Page 1 (front) - animated flip */}
                    <div className="relative h-6 w-5 bg-gradient-to-br from-[#00ff88]/20 to-[#00ff88]/10 rounded-sm border border-[#00ff88]/40 flex flex-col items-center justify-center gap-0.5 animate-pulse">
                      {/* Text lines */}
                      <div className="h-[1px] w-2.5 bg-[#00ff88]/60 rounded-full" />
                      <div className="h-[1px] w-3 bg-[#00ff88]/50 rounded-full" />
                      <div className="h-[1px] w-2.5 bg-[#00ff88]/40 rounded-full" />
                      <div className="h-[1px] w-2 bg-[#00ff88]/30 rounded-full" />
                    </div>
                  </div>
                  {/* Sparkle/learning icon */}
                  <div className="absolute top-0.5 right-0.5">
                    <div className="relative h-2 w-2">
                      <div className="absolute inset-0 bg-[#00ff88] rounded-full animate-ping opacity-40" />
                      <div className="absolute inset-0.5 bg-[#00ff88] rounded-full shadow-lg shadow-[#00ff88]/50" />
                    </div>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-white">Learn While You Earn</h4>
              </div>
              <p className="text-gray-300 leading-relaxed text-sm">
                Premium subscribers get <strong>daily learning moments</strong> — investing concepts explained in plain English so you get smarter over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Email Preview - NEW: See what you'll get */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
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

      <SectionDivider />

      {/* Pricing Section - REDESIGNED per PM spec */}
      <section className="container mx-auto px-4 py-16" id="pricing">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Choose Your Investment Edge</h3>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Both tiers get the same daily stock picks (1-3 depending on market opportunities).
              <br />
              <strong className="text-white">Premium unlocks the data that turns picks into profits.</strong>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-2xl p-8 space-y-6">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-[#1a3a52] text-gray-300 text-xs font-semibold mb-3">
                  Available Now
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">Free</h4>
                <p className="text-gray-300">See what&apos;s moving</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-gray-300">/month</span>
                </div>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span><strong>1-3 stock picks daily</strong> (based on market opportunities)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span>Entry prices & sector analysis</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span>Why it matters & momentum checks</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span>Basic risk assessment</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span>7-day archive access</span>
                </li>
                <li className="flex items-start gap-3 text-gray-500 italic text-sm">
                  <span className="text-gray-600 mt-1">✕</span>
                  <span>Confidence scores (blurred)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-500 italic text-sm">
                  <span className="text-gray-600 mt-1">✕</span>
                  <span>Stop-loss & profit targets</span>
                </li>
                <li className="flex items-start gap-3 text-gray-500 italic text-sm">
                  <span className="text-gray-600 mt-1">✕</span>
                  <span>Portfolio allocation %</span>
                </li>
                <li className="flex items-start gap-3 text-gray-500 italic text-sm">
                  <span className="text-gray-600 mt-1">✕</span>
                  <span>Precise entry zones</span>
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
                <p className="text-gray-300">Trade with precision</p>
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
                  <span className="font-semibold">Same 1-3 daily picks + the secret sauce:</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span><strong>AI confidence scores</strong> (0-100 rating for conviction)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span><strong>Precise entry zones</strong> (save 3-5% on entries)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span><strong>Stop-loss levels</strong> (protect against losses)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span><strong>Profit targets</strong> (2:1 reward-to-risk ratio)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span><strong>Portfolio allocation %</strong> (optimize position sizing)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span><strong>Full risk breakdown</strong> (all caution notes)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span>Unlimited archive + performance tracking</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-gray-400 mt-1">✓</span>
                  <span>Daily learning moments (investing education)</span>
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

        </div>
      </section>

      {/* ROI Calculator - Moved after pricing for better flow */}
      <section className="container mx-auto px-4 py-12">
        <ROICalculator />
      </section>

      <SectionDivider />

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
