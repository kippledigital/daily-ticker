"use client"
import { TickerBoard } from "@/components/ticker-board"
import { SubscribeForm } from "@/components/subscribe-form"
import { TopMoves } from "@/components/top-moves"
import { ArchivePreview } from "@/components/archive-preview"
import { Mail, TrendingUp } from "lucide-react"

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: "Daily Ticker - Market Insights That Make Sense",
    description: "Daily Ticker delivers clear, actionable stock insights — no hype, no jargon.",
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
            <a href="#about" className="hidden md:block text-sm text-gray-300 hover:text-white transition-colors">
              About
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
            <a
              href="#subscribe"
              className="px-4 py-2 bg-[#00ff88] text-[#0B1E32] text-sm font-semibold rounded-lg hover:bg-[#00dd77] transition-colors"
            >
              Subscribe
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="subscribe" className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a3a52]/50 border border-[#00ff88]/20 text-sm text-[#00ff88] mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
            </span>
            Delivered daily at 8 AM EST
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight text-balance">
            Market insights that make sense
          </h2>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed text-pretty">
            A daily, clear & actionable market brief for people who want to be in the action but don&apos;t have time to do the
            research.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <SubscribeForm />
          </div>

          <p className="text-sm text-gray-200">
            Start free • Entry prices, sector analysis, and market context
          </p>
          <p className="text-xs text-gray-400">
            Upgrade for stop-loss levels, profit targets, and allocation percentages
          </p>
        </div>
      </section>

      {/* Animated Ticker Board */}
      <section className="container mx-auto px-4 py-12">
        <TickerBoard />
      </section>

      {/* Today's Top Moves */}
      <section className="container mx-auto px-4 py-16" id="about">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Today&apos;s Top Moves</h3>
            <p className="text-gray-300 text-lg">Real insights, zero jargon</p>
          </div>

          <TopMoves />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 space-y-4">
            <div className="h-12 w-12 rounded-lg bg-[#00ff88]/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-[#00ff88]" />
            </div>
            <h4 className="text-xl font-bold text-white">Clear & Actionable</h4>
            <p className="text-gray-300 leading-relaxed">
              No Wall Street jargon. Just clear, actionable insights you can understand in minutes.
            </p>
          </div>

          <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 space-y-4">
            <div className="h-12 w-12 rounded-lg bg-[#00ff88]/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-[#00ff88]" />
            </div>
            <h4 className="text-xl font-bold text-white">Daily Delivery</h4>
            <p className="text-gray-300 leading-relaxed">
              Arrives in your inbox at 8 AM EST, Monday through Friday. Start your day informed.
            </p>
          </div>

          <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 space-y-4">
            <div className="h-12 w-12 rounded-lg bg-[#ff4444]/10 flex items-center justify-center">
              <svg className="h-6 w-6 text-[#ff4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-white">No Hype</h4>
            <p className="text-gray-300 leading-relaxed">
              Transparent, credible analysis. We tell you why moves happen, not just what moved.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Comparison Section */}
      <section className="container mx-auto px-4 py-16" id="pricing">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Level</h3>
            <p className="text-gray-300 text-lg">Start free, upgrade when you&apos;re ready for advanced insights</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-2xl p-8 space-y-6">
              <div>
                <h4 className="text-2xl font-bold text-white mb-2">Free</h4>
                <p className="text-gray-300">Core market insights</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-gray-300">/month</span>
                </div>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-[#00ff88] mt-1">✓</span>
                  <span>Daily stock picks (2-3 per day)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-[#00ff88] mt-1">✓</span>
                  <span>Entry prices & ideal entry zones</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-[#00ff88] mt-1">✓</span>
                  <span>Sector analysis & market context</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-[#00ff88] mt-1">✓</span>
                  <span>Why it matters & momentum checks</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-[#00ff88] mt-1">✓</span>
                  <span>7-day archive access</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-gray-600 mt-1">✕</span>
                  <span>Confidence scores (blurred)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-gray-600 mt-1">✕</span>
                  <span>Stop-loss levels</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-gray-600 mt-1">✕</span>
                  <span>Profit targets</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-gray-600 mt-1">✕</span>
                  <span>Position sizing recommendations</span>
                </li>
              </ul>

              <a
                href="#subscribe"
                className="block w-full text-center px-6 py-3 bg-[#1a3a52] text-white font-semibold rounded-lg hover:bg-[#244a62] transition-colors border border-[#00ff88]/20"
              >
                Get Started Free
              </a>
            </div>

            {/* Premium Tier */}
            <div className="bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border-2 border-[#00ff88]/40 rounded-2xl p-8 space-y-6 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-block px-4 py-1 bg-[#00ff88] text-[#0B1E32] text-sm font-bold rounded-full">
                  BEST VALUE
                </span>
              </div>

              <div>
                <h4 className="text-2xl font-bold text-white mb-2">Premium</h4>
                <p className="text-gray-300">Complete trading toolkit</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">$8</span>
                  <span className="text-gray-300">/month</span>
                  <span className="block text-sm text-gray-400 mt-1">or $96/year (save 17%)</span>
                </div>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-[#00ff88] mt-1">✓</span>
                  <span className="font-semibold">Everything in Free, plus:</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-[#00ff88] mt-1">✓</span>
                  <span><strong>AI confidence scores</strong> (0-100 rating)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-[#00ff88] mt-1">✓</span>
                  <span><strong>Stop-loss levels</strong> for risk management</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-[#00ff88] mt-1">✓</span>
                  <span><strong>Profit targets</strong> (2:1 reward-to-risk)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-[#00ff88] mt-1">✓</span>
                  <span><strong>Position sizing</strong> recommendations (% allocation)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-[#00ff88] mt-1">✓</span>
                  <span>Full caution notes & risk warnings</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-[#00ff88] mt-1">✓</span>
                  <span>Unlimited archive access</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <span className="text-[#00ff88] mt-1">✓</span>
                  <span>Mini learning moments (trading education)</span>
                </li>
              </ul>

              <button className="w-full px-6 py-3 bg-[#00ff88] text-[#0B1E32] font-bold rounded-lg hover:bg-[#00dd77] transition-colors">
                Upgrade to Premium
              </button>
              <p className="text-xs text-center text-gray-400">
                60 picks/month • ~$1.60 per pick • Cancel anytime
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-300 max-w-2xl mx-auto">
              Compare to services like Motley Fool ($199/year for 2 picks/month). Daily Ticker delivers <strong className="text-white">60 picks/month</strong> for just $96/year — that&apos;s <strong className="text-[#00ff88]">30x more value</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Archive Preview Section */}
      <section className="container mx-auto px-4 py-16" id="archive">
        <div className="max-w-6xl mx-auto">
          <ArchivePreview />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border border-[#00ff88]/20 rounded-2xl p-8 md:p-12 text-center space-y-6">
          <h3 className="text-3xl md:text-4xl font-bold text-white text-balance">Start your mornings smarter</h3>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto text-pretty">
            Get clear, actionable market insights delivered to your inbox every morning.
          </p>
          <SubscribeForm variant="large" />
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
              <p className="text-sm text-gray-200 leading-relaxed">Market insights that make sense. Delivered daily.</p>
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
