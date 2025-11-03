"use client"

import { Mail, Clock, ArrowRight, TrendingUp, BarChart3, Briefcase } from "lucide-react"
import Link from "next/link"

export function EmailPreview() {
  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-[380px,1fr] gap-6">
        {/* Left: Inbox Preview */}
        <div className="bg-[#0a1929] border-2 border-[#1a3a52] rounded-xl overflow-hidden">
          <div className="bg-[#1a3a52]/30 border-b border-[#1a3a52] px-4 py-3 flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-semibold text-white">Inbox</span>
          </div>

          <div className="divide-y divide-[#1a3a52]/50">
            {/* Today's Email (Selected/Active) */}
            <div className="px-4 py-4 bg-[#1a3a52]/20 border-l-2 border-[#00ff88]">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-[#00ff88]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-white truncate">Daily Ticker</p>
                    <span className="text-xs text-gray-400 ml-2">8:00 AM</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">brief@dailyticker.co</p>
                  <p className="text-sm text-white font-medium mb-1 line-clamp-1">
                    🚀 NVDA Surges | Tech Leads Market Rally
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    3 actionable picks + market context. NVDA up 5.2% on AI chip demand...
                  </p>
                </div>
              </div>
            </div>

            {/* Previous Email */}
            <div className="px-4 py-4 hover:bg-[#1a3a52]/10 transition-colors cursor-pointer opacity-60">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-700/30 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-300 truncate">Daily Ticker</p>
                    <span className="text-xs text-gray-500 ml-2">Yesterday</span>
                  </div>
                  <p className="text-sm text-gray-400 font-medium mb-1 line-clamp-1">
                    Energy Sector Surges on Supply Concerns
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    XOM leads with 4.8% gain, META strong...
                  </p>
                </div>
              </div>
            </div>

            {/* Older Email */}
            <div className="px-4 py-4 hover:bg-[#1a3a52]/10 transition-colors cursor-pointer opacity-40">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-700/30 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-300 truncate">Daily Ticker</p>
                    <span className="text-xs text-gray-500 ml-2">2 days ago</span>
                  </div>
                  <p className="text-sm text-gray-400 font-medium mb-1 line-clamp-1">
                    Banking Sector Stabilizes After Volatility
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    JPM up 2.1% on strong earnings...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Email Content (Scrollable) */}
        <div className="bg-[#0a1929] border-2 border-[#1a3a52] rounded-xl overflow-hidden flex flex-col max-h-[700px]">
          {/* Email Header */}
          <div className="bg-[#1a3a52]/30 border-b-2 border-[#1a3a52] px-6 py-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-white">
                🚀 NVDA Surges | Tech Leads Market Rally
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                <span>Today 8:00 AM</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="font-semibold text-white">Daily Ticker</span>
              <span>&lt;brief@dailyticker.co&gt;</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              To: you@email.com
            </div>
          </div>

          {/* Scrollable Email Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Header with logo */}
            <div className="text-center border-b-2 border-[#00ff88]/20 pb-4">
              <div className="inline-flex items-center gap-2 mb-2">
                <TrendingUp className="h-6 w-6 text-[#00ff88]" />
                <h1 className="text-2xl font-bold font-mono text-white" style={{ letterSpacing: '-0.05em' }}>
                  Daily Ticker
                </h1>
              </div>
              <p className="text-sm text-gray-400">Your morning market brief</p>
            </div>

            {/* TL;DR Section */}
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-4">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span>⚡</span> TL;DR
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Tech sector rallying on strong AI chip demand. NVDA leading gains at 5.2% on record data center revenue.
                Energy sector showing strength with crude oil up 2.1%. Watch for Fed commentary tomorrow on rate policy.
              </p>
            </div>

            {/* Stock 1: NVDA */}
            <div className="border-l-2 border-[#00ff88] pl-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-mono font-bold text-white">NVDA</h3>
                  <p className="text-sm text-gray-400">NVIDIA Corporation</p>
                  {/* Premium: Confidence Score */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="px-2 py-1 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded">
                      <span className="text-xs font-mono font-bold text-[#00ff88]">87% Confidence</span>
                    </div>
                    <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded">
                      <span className="text-xs font-mono font-bold text-blue-400">Allocate 8%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-mono font-bold text-white">$521.45</p>
                  <p className="text-sm font-mono font-bold text-[#00ff88]">+5.2%</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">📊 What Happened</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    NVIDIA surged 5.2% after announcing record Q4 data center revenue of $18.4B, beating estimates by 12%.
                    CEO Jensen Huang highlighted accelerating enterprise AI adoption.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white mb-1">💡 Why This Matters</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    This confirms the AI infrastructure buildout is accelerating, not slowing. Major cloud providers
                    are still capacity-constrained, creating sustained demand for H100/H200 chips through 2025.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#2a1a1f] border border-[#FF3366]/20 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Stop Loss</p>
                    <p className="text-lg font-mono font-bold text-[#FF3366]">$480.00</p>
                  </div>
                  <div className="bg-[#0a2a1a] border border-[#00ff88]/20 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Profit Target</p>
                    <p className="text-lg font-mono font-bold text-[#00ff88]">$604.00</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border-2 border-[#00ff88] rounded-lg p-3">
                  <p className="text-xs text-[#00ff88] uppercase tracking-wide font-semibold mb-1">💰 Ideal Entry Zone</p>
                  <p className="text-lg font-mono font-bold text-white">$510-$515</p>
                </div>

                <div className="bg-gradient-to-r from-[#00ff88]/10 to-transparent border-l-2 border-[#00ff88] p-3 rounded">
                  <p className="text-sm font-bold text-white mb-1">🎯 What to Do</p>
                  <p className="text-sm text-gray-300">
                    Consider scaling in on pullbacks to $510-515 range. Watch tomorrow&apos;s broader tech sector
                    performance for confirmation of trend strength.
                  </p>
                </div>
              </div>
            </div>

            {/* Stock 2: AMD */}
            <div className="border-l-2 border-[#00ff88] pl-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-mono font-bold text-white">AMD</h3>
                  <p className="text-sm text-gray-400">Advanced Micro Devices</p>
                  {/* Premium: Confidence Score */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="px-2 py-1 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded">
                      <span className="text-xs font-mono font-bold text-[#00ff88]">82% Confidence</span>
                    </div>
                    <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded">
                      <span className="text-xs font-mono font-bold text-blue-400">Allocate 6%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-mono font-bold text-white">$147.32</p>
                  <p className="text-sm font-mono font-bold text-[#00ff88]">+3.4%</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">📊 What Happened</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    AMD gained 3.4% following strong MI300X sales data. New enterprise AI partnerships with Oracle
                    and ServiceNow signal market share gains against NVIDIA.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white mb-1">💡 Why This Matters</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    The AI chip market is expanding beyond NVIDIA&apos;s dominance. AMD&apos;s competitive pricing and strong
                    software ecosystem make it a compelling alternative for cost-conscious enterprises.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#2a1a1f] border border-[#FF3366]/20 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Stop Loss</p>
                    <p className="text-lg font-mono font-bold text-[#FF3366]">$135.50</p>
                  </div>
                  <div className="bg-[#0a2a1a] border border-[#00ff88]/20 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Profit Target</p>
                    <p className="text-lg font-mono font-bold text-[#00ff88]">$171.00</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border-2 border-[#00ff88] rounded-lg p-3">
                  <p className="text-xs text-[#00ff88] uppercase tracking-wide font-semibold mb-1">💰 Ideal Entry Zone</p>
                  <p className="text-lg font-mono font-bold text-white">$142-$145</p>
                </div>

                <div className="bg-gradient-to-r from-[#00ff88]/10 to-transparent border-l-2 border-[#00ff88] p-3 rounded">
                  <p className="text-sm font-bold text-white mb-1">🎯 What to Do</p>
                  <p className="text-sm text-gray-300">
                    Good entry opportunity on any dip below $145. Set alerts for MI300X shipment updates
                    as a momentum catalyst.
                  </p>
                </div>
              </div>
            </div>

            {/* Stock 3: MSFT */}
            <div className="border-l-2 border-[#00ff88] pl-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-mono font-bold text-white">MSFT</h3>
                  <p className="text-sm text-gray-400">Microsoft Corporation</p>
                  {/* Premium: Confidence Score */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="px-2 py-1 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded">
                      <span className="text-xs font-mono font-bold text-[#00ff88]">91% Confidence</span>
                    </div>
                    <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded">
                      <span className="text-xs font-mono font-bold text-blue-400">Allocate 10%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-mono font-bold text-white">$385.67</p>
                  <p className="text-sm font-mono font-bold text-[#00ff88]">+1.8%</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">📊 What Happened</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Microsoft rose 1.8% on Azure cloud growth acceleration to 31% YoY. GitHub Copilot now has
                    1.3M paid subscribers, validating AI monetization strategy.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white mb-1">💡 Why This Matters</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Microsoft is successfully converting AI investments into revenue. The enterprise AI stack
                    (Azure + Copilot + OpenAI partnership) creates a powerful moat.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#2a1a1f] border border-[#FF3366]/20 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Stop Loss</p>
                    <p className="text-lg font-mono font-bold text-[#FF3366]">$355.00</p>
                  </div>
                  <div className="bg-[#0a2a1a] border border-[#00ff88]/20 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Profit Target</p>
                    <p className="text-lg font-mono font-bold text-[#00ff88]">$447.00</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border-2 border-[#00ff88] rounded-lg p-3">
                  <p className="text-xs text-[#00ff88] uppercase tracking-wide font-semibold mb-1">💰 Ideal Entry Zone</p>
                  <p className="text-lg font-mono font-bold text-white">$375-$380</p>
                </div>

                <div className="bg-gradient-to-r from-[#00ff88]/10 to-transparent border-l-2 border-[#00ff88] p-3 rounded">
                  <p className="text-sm font-bold text-white mb-1">🎯 What to Do</p>
                  <p className="text-sm text-gray-300">
                    Core long-term hold. Add on any pullback to $375-380 support level. Watch quarterly
                    Azure growth numbers closely.
                  </p>
                </div>
              </div>
            </div>

            {/* Premium Preview Callout */}
            <div className="bg-gradient-to-br from-[#00ff88]/5 to-transparent border-2 border-[#00ff88]/20 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#00ff88]/10 border-2 border-[#00ff88]/30">
                    <span className="text-2xl">✨</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-white mb-2">
                    This is what Premium looks like
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed mb-4">
                    You just saw a full premium email with confidence scores, portfolio allocation %, stop-loss levels,
                    and profit targets. Free users get the same picks but <strong className="text-white">without the trading toolkit</strong> that
                    turns analysis into action.
                  </p>
                  <a
                    href="/premium"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00ff88] text-[#0B1E32] text-sm font-semibold rounded-lg hover:bg-[#00dd77] transition-colors"
                  >
                    Join Premium Waitlist
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Learning Corner */}
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-4">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span>📚</span> Learning Corner
              </h3>
              <h4 className="text-sm font-semibold text-white mb-2">Today&apos;s Concept: Stop Loss</h4>
              <p className="text-sm text-gray-300 leading-relaxed mb-3">
                A stop loss is a predetermined price level where you&apos;ll exit a position to limit losses. Think of it
                as a safety net - if the stock drops to this price, you automatically sell to prevent bigger losses.
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">
                <strong className="text-white">Real Example from Today:</strong> NVDA is trading at $521. The stop loss
                is set at $480. If NVDA drops to $480, you sell automatically, limiting your loss to about 8% ($41 per share).
                With today&apos;s profit target at $604, that&apos;s a 2:1 reward-to-risk ratio - you stand to make $83 per share
                while risking only $41. This protects your capital for other opportunities.
              </p>
            </div>

            {/* Footer CTA */}
            <div className="text-center py-4 border-t border-[#1a3a52]">
              <Link
                href="/archive"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#00ff88] hover:text-[#00dd77] transition-colors group"
              >
                View Full Archive
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
