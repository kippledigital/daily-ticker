"use client"

import { useState, lazy, Suspense, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HybridTicker } from "@/components/hybrid-ticker"
import { SubscribeForm } from "@/components/subscribe-form"
import { ROICalculatorModal } from "@/components/roi-calculator-modal"
import { CheckoutButton } from "@/components/checkout-button"
import { SectionDivider } from "@/components/section-divider"
import { TrendingUp, Target, Zap, BookOpen, Plus } from "lucide-react"
import { trackPerformanceDashboardView } from "@/lib/analytics"

// Lazy load below-fold components  
const PerformanceDashboard = lazy(() => import("@/components/performance-dashboard").then(mod => ({ default: mod.PerformanceDashboard })))
const EmailPreview = lazy(() => import("@/components/email-preview").then(mod => ({ default: mod.EmailPreview })))

// Skeleton loaders
function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 h-24" />
        ))}
      </div>
      <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 h-96" />
    </div>
  )
}

function EmailPreviewSkeleton() {
  return (
    <div className="animate-pulse bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-8 h-96" />
  )
}

// Wrapper component to track performance dashboard views
function PerformanceDashboardWithTracking() {
  useEffect(() => {
    trackPerformanceDashboardView()
  }, [])
  
  return <PerformanceDashboard />
}

export default function Home() {
  const [isYearly, setIsYearly] = useState(true) // Default to yearly
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Daily Ticker",
    url: "https://dailyticker.co",
    logo: "https://dailyticker.co/logo.png",
    description: "A daily, clear & actionable market brief for people who want to be in the action but don't have time to do the research. Get up to 3 actionable stock picks daily — FREE.",
    sameAs: [
      "https://twitter.com/GetDailyTicker"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "brief@dailyticker.co",
      contactType: "Customer Service"
    },
    offers: {
      "@type": "Offer",
      name: "Daily Ticker Pro",
      description: "Get AI confidence scores, stop-loss levels, profit targets, and portfolio allocation guidance",
      price: "10",
      priceCurrency: "USD",
      priceValidUntil: "2026-12-31",
      availability: "https://schema.org/InStock",
      url: "https://dailyticker.co/premium"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Daily Ticker Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Free Daily Stock Picks",
            description: "Get 1-3 actionable stock picks daily with entry prices, sector analysis, and market context",
            provider: {
              "@type": "Organization",
              name: "Daily Ticker"
            }
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Daily Ticker Pro",
            description: "Premium service with AI confidence scores, stop-loss levels, profit targets, and portfolio allocation guidance",
            provider: {
              "@type": "Organization",
              name: "Daily Ticker"
            }
          }
        }
      ]
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1E32]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* Skip links for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#00ff88] focus:text-[#0B1E32] focus:font-bold focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      <SiteHeader />

      {/* Hero Section - REDESIGNED */}
      <main id="main-content">
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
              Upgrade to Pro for confidence scores, stop-loss levels, and profit targets that give you an edge on every trade.
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

      {/* Performance Dashboard - Proof our picks work */}
      <section id="performance" className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-sm text-[#00ff88]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
                </span>
                Live Performance
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Our Picks, Your Proof</h3>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              We track every pick we make. See our real win rate, average returns, and how our picks perform over time.
            </p>
          </div>

          <Suspense fallback={<DashboardSkeleton />}>
            <PerformanceDashboardWithTracking />
          </Suspense>
        </div>
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
                pro subscribers get <strong>daily learning moments</strong> — investing concepts explained in plain English so you get smarter over time.
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

          <Suspense fallback={<EmailPreviewSkeleton />}>
            <EmailPreview />
          </Suspense>
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
              <strong className="text-white">Pro unlocks the data that turns picks into profits.</strong>
            </p>
          </div>

          {/* Billing Toggle - Only show for Pro tier */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isYearly}
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:ring-offset-2 focus:ring-offset-[#0B1E32] ${
                isYearly ? 'bg-[#00ff88]' : 'bg-[#1a3a52]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-white' : 'text-gray-400'}`}>
              Yearly
            </span>
            {isYearly && (
              <span className="px-2 py-1 text-xs font-semibold text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-full">
                Save 20%
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-2xl p-8 space-y-6">
              <div>
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
                <li className="flex items-start gap-3 text-gray-500">
                  <span className="text-gray-600 mt-1">✕</span>
                  <span>Confidence scores</span>
                </li>
                <li className="flex items-start gap-3 text-gray-500">
                  <span className="text-gray-600 mt-1">✕</span>
                  <span>Stop-loss & profit targets</span>
                </li>
                <li className="flex items-start gap-3 text-gray-500">
                  <span className="text-gray-600 mt-1">✕</span>
                  <span>Portfolio allocation %</span>
                </li>
                <li className="flex items-start gap-3 text-gray-500">
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

            {/* Pro Tier - UPDATED per PM spec */}
            <div className="bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border-2 border-[#00ff88]/40 rounded-2xl p-8 space-y-6 relative">
              {/* Most Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1.5 bg-[#00ff88] text-[#0B1E32] text-xs font-bold rounded-full shadow-lg">
                  Most Popular
                </span>
              </div>

              <div>
                <h4 className="text-2xl font-bold text-white mb-2">Pro</h4>
                <p className="text-gray-300">Trade with precision</p>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      {isYearly ? '$96' : '$10'}
                    </span>
                    <span className="text-gray-300">
                      {isYearly ? '/year' : '/month'}
                    </span>
                  </div>
                  {isYearly && (
                    <div className="mt-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-md">
                        <span className="text-xs font-semibold text-[#00ff88]">
                          Save $24/year
                        </span>
                      </div>
                    </div>
                  )}
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

              {/* Prominent Guarantee */}
              <div className="bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="text-xl">🛡️</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">
                      60-Day Money-Back Guarantee
                    </p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Not satisfied? Get a full refund, no questions asked. We&apos;re that confident in our picks.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Option */}
              <CheckoutButton 
                priceType={isYearly ? 'standard' : 'monthly'}
                className="block w-full px-6 py-3 bg-[#00ff88] text-[#0B1E32] font-bold rounded-lg hover:bg-[#00dd77] transition-colors shadow-lg shadow-[#00ff88]/30 hover:shadow-[#00ff88]/50 text-center"
              >
                {isYearly ? '$96/year (Save 20%)' : '$10/month'}
              </CheckoutButton>

              <ROICalculatorModal
                triggerText="See Value Calculator"
                triggerClassName="flex items-center justify-center gap-2 w-full text-sm text-gray-300 hover:text-[#00ff88] transition-colors mt-3"
                showIcon={true}
              />

              <p className="text-xs text-center text-gray-300 mt-4">
                Cancel anytime
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-8 border-t border-[#1a3a52]">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <svg className="h-4 w-4 text-[#00ff88]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <svg className="h-4 w-4 text-[#00ff88]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="text-[#00ff88]">🛡️</span>
              <span>60-Day Guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="text-[#00ff88]">✓</span>
              <span>Cancel Anytime</span>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
              Frequently Asked Questions
            </h3>
            
            <div className="space-y-4">
              <details className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 group">
                <summary className="cursor-pointer text-white font-semibold text-lg flex items-center justify-between">
                  <span>What&apos;s the difference between Free and Pro?</span>
                  <Plus className="h-5 w-5 text-[#00ff88] transition-transform duration-200 group-open:rotate-45 flex-shrink-0" />
                </summary>
                <p className="text-gray-300 mt-4 leading-relaxed">
                  Both tiers get the same 1-3 daily stock picks with entry prices, sector analysis, and market context. 
                  Pro adds AI confidence scores, precise entry zones, stop-loss levels, profit targets, portfolio allocation percentages, 
                  and full risk breakdowns. Think of Free as &quot;what to buy&quot; and Pro as &quot;exactly how to buy it.&quot;
                </p>
              </details>

              <details className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 group">
                <summary className="cursor-pointer text-white font-semibold text-lg flex items-center justify-between">
                  <span>How do I know if Daily Ticker is worth it?</span>
                  <Plus className="h-5 w-5 text-[#00ff88] transition-transform duration-200 group-open:rotate-45 flex-shrink-0" />
                </summary>
                <p className="text-gray-300 mt-4 leading-relaxed">
                  Check out our <a href="#performance" className="text-[#00ff88] hover:underline">Performance Dashboard</a> to see our 
                  real track record. We track every pick we make, including win rate, average returns, and individual stock performance. 
                  Plus, with our 60-day money-back guarantee, you can try Pro risk-free and see if it works for you.
                </p>
              </details>

              <details className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 group">
                <summary className="cursor-pointer text-white font-semibold text-lg flex items-center justify-between">
                  <span>Can I cancel anytime?</span>
                  <Plus className="h-5 w-5 text-[#00ff88] transition-transform duration-200 group-open:rotate-45 flex-shrink-0" />
                </summary>
                <p className="text-gray-300 mt-4 leading-relaxed">
                  Yes! You can cancel your Pro subscription at any time. If you cancel, you&apos;ll continue to have access until the 
                  end of your billing period, then you&apos;ll automatically move to the Free tier. No questions asked, no hassle.
                </p>
              </details>

              <details className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 group">
                <summary className="cursor-pointer text-white font-semibold text-lg flex items-center justify-between">
                  <span>What if I&apos;m not satisfied?</span>
                  <Plus className="h-5 w-5 text-[#00ff88] transition-transform duration-200 group-open:rotate-45 flex-shrink-0" />
                </summary>
                <p className="text-gray-300 mt-4 leading-relaxed">
                  We offer a 60-day money-back guarantee. If you&apos;re not satisfied with Daily Ticker Pro for any reason within 
                  60 days of your purchase, just email us at <a href="mailto:brief@dailyticker.co" className="text-[#00ff88] hover:underline">brief@dailyticker.co</a> 
                  and we&apos;ll refund your full payment, no questions asked.
                </p>
              </details>

              <details className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 group">
                <summary className="cursor-pointer text-white font-semibold text-lg flex items-center justify-between">
                  <span>When will I receive my daily brief?</span>
                  <Plus className="h-5 w-5 text-[#00ff88] transition-transform duration-200 group-open:rotate-45 flex-shrink-0" />
                </summary>
                <p className="text-gray-300 mt-4 leading-relaxed">
                  Daily briefs are delivered every weekday (Monday-Friday) at 8 AM EST. You&apos;ll receive your first brief the 
                  morning after you subscribe. If you subscribe on a weekend, you&apos;ll get your first brief on Monday morning.
                </p>
              </details>

              <details className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 group">
                <summary className="cursor-pointer text-white font-semibold text-lg flex items-center justify-between">
                  <span>Is Daily Ticker financial advice?</span>
                  <Plus className="h-5 w-5 text-[#00ff88] transition-transform duration-200 group-open:rotate-45 flex-shrink-0" />
                </summary>
                <p className="text-gray-300 mt-4 leading-relaxed">
                  No. Daily Ticker is for educational purposes only and does not provide financial, investment, tax, or legal advice. 
                  All content is for informational purposes. You should always consult with a qualified financial advisor before making 
                  any investment decisions. Past performance does not guarantee future results.
                </p>
              </details>
            </div>
          </div>

        </div>
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
          <p className="text-sm text-gray-300">
            No credit card required • Unsubscribe anytime
          </p>
        </div>
      </section>
      </main>

      <SiteFooter />
    </div>
  )
}
