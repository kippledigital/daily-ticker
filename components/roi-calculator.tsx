"use client"

import { useState } from "react"
import { TrendingUp, DollarSign, Shield, Target } from "lucide-react"

const portfolioOptions = [
  { value: 10000, label: "$10,000" },
  { value: 25000, label: "$25,000" },
  { value: 50000, label: "$50,000" },
  { value: 100000, label: "$100,000" },
  { value: 250000, label: "$250,000" },
  { value: 500000, label: "$500,000" },
]

export function ROICalculator() {
  const [portfolioSize, setPortfolioSize] = useState(25000)

  // Calculation logic based on PM spec
  const extraGainProfit = portfolioSize * 0.10 // 10% gain on 1 pick
  const lossAvoidedSavings = portfolioSize * 0.15 // 15% loss avoided on 1 pick
  const betterEntries = portfolioSize * 0.03 // 3% improvement on entries

  const totalValue = extraGainProfit + lossAvoidedSavings + betterEntries
  const premiumCost = 96
  const roi = ((totalValue - premiumCost) / premiumCost * 100).toFixed(0)

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-[#1a3a52]/40 to-[#0B1E32] border-2 border-[#00ff88]/20 rounded-2xl p-8 md:p-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20">
            <DollarSign className="h-4 w-4 text-[#00ff88]" />
            <span className="text-sm font-semibold text-[#00ff88]">ROI Calculator</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-white">See Your Potential Returns</h3>
          <p className="text-gray-300 text-lg">Calculate what Daily Ticker Premium could be worth to you</p>
        </div>

        {/* Portfolio Size Selector */}
        <div className="space-y-4">
          <label htmlFor="portfolio-size" className="block text-sm font-semibold text-gray-200 uppercase tracking-wide">
            Your Portfolio Size
          </label>
          <select
            id="portfolio-size"
            value={portfolioSize}
            onChange={(e) => setPortfolioSize(Number(e.target.value))}
            className="w-full px-4 py-3 bg-[#1a3a52] border-2 border-[#2a4a62] text-white rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:border-[#00ff88] transition-all cursor-pointer"
          >
            {portfolioOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Calculations */}
        <div className="space-y-4 py-6 border-y border-[#1a3a52]">
          <p className="text-gray-200 font-semibold mb-4">If Daily Ticker Premium helps you:</p>

          <div className="grid gap-4">
            {/* Extra Gain */}
            <div className="flex items-start gap-4 p-4 bg-[#00ff88]/5 rounded-lg border border-[#00ff88]/10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#00ff88]/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[#00ff88]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <span className="text-gray-200">Catch just 1 extra 10% gain</span>
                  <span className="text-xl font-bold text-[#00ff88] font-mono">
                    +${extraGainProfit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Loss Avoided */}
            <div className="flex items-start gap-4 p-4 bg-[#00ff88]/5 rounded-lg border border-[#00ff88]/10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#00ff88]/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-[#00ff88]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <span className="text-gray-200">Avoid just 1 bad 15% loss</span>
                  <span className="text-xl font-bold text-[#00ff88] font-mono">
                    +${lossAvoidedSavings.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Better Entries */}
            <div className="flex items-start gap-4 p-4 bg-[#00ff88]/5 rounded-lg border border-[#00ff88]/10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#00ff88]/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-[#00ff88]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <span className="text-gray-200">Improve entry timing by 3%</span>
                  <span className="text-xl font-bold text-[#00ff88] font-mono">
                    +${betterEntries.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4 text-center">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-400 uppercase tracking-wide">Total Annual Value</div>
              <div className="text-3xl font-bold text-white font-mono">${totalValue.toLocaleString()}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-400 uppercase tracking-wide">Premium Cost</div>
              <div className="text-3xl font-bold text-white font-mono">${premiumCost}</div>
              <div className="text-xs text-gray-400">per year</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-400 uppercase tracking-wide">Your ROI</div>
              <div className="text-4xl font-bold text-[#00ff88] font-mono flex items-center justify-center gap-2">
                {roi.toLocaleString()}%
                <span className="text-2xl">🚀</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-6">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] font-bold rounded-lg transition-all shadow-lg shadow-[#00ff88]/30 hover:shadow-[#00ff88]/50 text-lg"
            >
              Join Waitlist - 50% Off First Year
              <span className="text-xl">→</span>
            </a>
            <p className="text-xs text-gray-400 mt-3">
              Early subscribers get 50% off ($48 first year, then $96/year)
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Calculations are illustrative examples based on conservative estimates. Past performance does not guarantee future results.
            Daily Ticker is for educational purposes only and does not provide financial advice.
          </p>
        </div>
      </div>
    </div>
  )
}
