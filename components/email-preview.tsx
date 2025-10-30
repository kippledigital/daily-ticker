"use client"

import { Mail, Clock, ArrowRight } from "lucide-react"
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
                  <span className="text-lg">📈</span>
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
                  <span className="text-lg">📊</span>
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
                  <span className="text-lg">💼</span>
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
                <span className="text-2xl">📈</span>
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

                <div className="bg-gradient-to-r from-[#00ff88]/10 to-transparent border-l-2 border-[#00ff88] p-3 rounded">
                  <p className="text-sm font-bold text-white mb-1">🎯 What to Do</p>
                  <p className="text-sm text-gray-300">
                    Consider scaling in on pullbacks to $510-515 range. Watch tomorrow's broader tech sector
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
                    The AI chip market is expanding beyond NVIDIA's dominance. AMD's competitive pricing and strong
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

                <div className="bg-gradient-to-r from-[#00ff88]/10 to-transparent border-l-2 border-[#00ff88] p-3 rounded">
                  <p className="text-sm font-bold text-white mb-1">🎯 What to Do</p>
                  <p className="text-sm text-gray-300">
                    Core long-term hold. Add on any pullback to $375-380 support level. Watch quarterly
                    Azure growth numbers closely.
                  </p>
                </div>
              </div>
            </div>

            {/* Premium Picks (Blurred/Locked) */}
            <div className="relative">
              <div className="absolute inset-0 backdrop-blur-sm bg-[#1a3a52]/50 rounded-lg z-10 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#00ff88]/10 border-2 border-[#00ff88]/20 mb-4">
                    <span className="text-3xl">🔒</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">2 More Premium Picks</h4>
                  <p className="text-sm text-gray-300 mb-4">
                    Upgrade to Premium for 5 total picks daily with confidence scores, allocation %, and risk analysis
                  </p>
                  <a
                    href="#pricing"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#00ff88] text-[#0B1E32] text-sm font-semibold rounded-lg hover:bg-[#00dd77] transition-colors"
                  >
                    View Premium Plans
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Blurred content underneath */}
              <div className="opacity-30 space-y-4">
                <div className="border-l-2 border-gray-600 pl-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-mono font-bold text-gray-400">TSLA</h3>
                      <p className="text-sm text-gray-500">Tesla Inc</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-mono font-bold text-gray-400">$242.84</p>
                      <p className="text-sm font-mono font-bold text-gray-500">+2.1%</p>
                    </div>
                  </div>
                  <div className="h-24 bg-gray-800/30 rounded"></div>
                </div>

                <div className="border-l-2 border-gray-600 pl-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-mono font-bold text-gray-400">GOOGL</h3>
                      <p className="text-sm text-gray-500">Alphabet Inc</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-mono font-bold text-gray-400">$141.23</p>
                      <p className="text-sm font-mono font-bold text-gray-500">+1.5%</p>
                    </div>
                  </div>
                  <div className="h-24 bg-gray-800/30 rounded"></div>
                </div>
              </div>
            </div>

            {/* Learning Corner */}
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-4">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span>📚</span> Learning Corner
              </h3>
              <h4 className="text-sm font-semibold text-white mb-2">What is a "Stop Loss"?</h4>
              <p className="text-sm text-gray-300 leading-relaxed mb-3">
                A stop loss is a predetermined price level where you'll exit a position to limit losses. Think of it
                as a safety net - if the stock drops to this price, you automatically sell to prevent bigger losses.
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">
                <strong className="text-white">Example:</strong> You buy NVDA at $520. You set a stop loss at $480.
                If NVDA drops to $480, you sell automatically, limiting your loss to about 8%. This protects your
                capital for other opportunities.
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
