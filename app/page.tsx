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
    description: "Daily Ticker delivers clear, actionable stock insights in plain English — no hype, no jargon.",
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
          <nav className="hidden md:flex items-center gap-6">
            <a href="#about" className="text-sm text-gray-300 hover:text-white transition-colors">
              About
            </a>
            <a href="#archive" className="text-sm text-gray-300 hover:text-white transition-colors">
              Archive
            </a>
            <a
              href="mailto:brief@dailyticker.co"
              className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1"
            >
              <Mail className="h-4 w-4" />
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
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
            A daily, plain-English market brief for people who want to be in the action but don&apos;t have time to do the
            research.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <SubscribeForm />
          </div>

          <p className="text-sm text-gray-400">Join 1,000+ investors getting smarter every morning</p>
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
            <h4 className="text-xl font-bold text-white">Plain English</h4>
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
            Join thousands of investors who trust Daily Ticker for clear, actionable market insights.
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
              <p className="text-sm text-gray-400 leading-relaxed">Market insights that make sense. Delivered daily.</p>
            </div>

            <div className="space-y-4">
              <h5 className="font-semibold text-white">Connect</h5>
              <div className="space-y-2">
                <a
                  href="https://twitter.com/GetDailyTicker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-gray-400 hover:text-[#00ff88] transition-colors"
                >
                  Twitter
                </a>
                <a
                  href="mailto:brief@dailyticker.co"
                  className="block text-sm text-gray-400 hover:text-[#00ff88] transition-colors"
                >
                  Email Us
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="font-semibold text-white">Legal</h5>
              <div className="space-y-2">
                <a href="/privacy" className="block text-sm text-gray-400 hover:text-[#00ff88] transition-colors">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-[#1a3a52]">
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong>Disclaimer:</strong> Daily Ticker is for educational purposes only and does not provide financial
              advice. All content is for informational purposes. Always consult with a qualified financial advisor
              before making investment decisions.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              © {new Date().getFullYear()} Daily Ticker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
