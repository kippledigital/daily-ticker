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
      <div className="bg-gradient-to-br from-[#1a3a52]/40 to-[#0B1E32] border-2 border-[#00ff88]/20 rounded-2xl p-8 md:p-10 lg:p-12">

        {/* Header Section - Improved hierarchy and spacing */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20">
            <DollarSign className="h-4 w-4 text-[#00ff88]" />
            <span className="text-sm font-medium text-[#00ff88] uppercase tracking-wider">Value Calculator</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            See Your Potential Returns
          </h3>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto">
            Calculate what Daily Ticker Premium could be worth to your portfolio
          </p>
        </div>

        {/* Portfolio Size Selector - Enhanced visual treatment */}
        <div className="space-y-3 mb-10">
          <label
            htmlFor="portfolio-size"
            className="block text-xs font-bold text-gray-300 uppercase tracking-wider"
          >
            Your Portfolio Size
          </label>
          <select
            id="portfolio-size"
            value={portfolioSize}
            onChange={(e) => setPortfolioSize(Number(e.target.value))}
            className="w-full px-5 py-4 bg-[#0B1E32] border-2 border-[#1a3a52] text-white rounded-xl text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:border-[#00ff88] transition-all cursor-pointer hover:border-[#00ff88]/40"
          >
            {portfolioOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Benefit Cards Section - Improved alignment and spacing */}
        <div className="space-y-6 mb-12">
          <p className="text-sm font-bold text-gray-300 uppercase tracking-wider">
            If Daily Ticker Premium helps you:
          </p>

          <div className="space-y-4">
            {/* Extra Gain Card */}
            <div className="group flex items-center gap-5 p-5 bg-[#00ff88]/5 rounded-xl border border-[#00ff88]/10 hover:bg-[#00ff88]/10 hover:border-[#00ff88]/30 transition-all duration-200">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#00ff88]/10 flex items-center justify-center group-hover:bg-[#00ff88]/20 transition-colors">
                <TrendingUp className="h-6 w-6 text-[#00ff88]" />
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between gap-6">
                <span className="text-gray-200 text-base md:text-lg">
                  Catch just 1 extra 10% gain
                </span>
                <span className="text-2xl md:text-3xl font-bold text-[#00ff88] font-mono whitespace-nowrap">
                  +${extraGainProfit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Loss Avoided Card */}
            <div className="group flex items-center gap-5 p-5 bg-[#00ff88]/5 rounded-xl border border-[#00ff88]/10 hover:bg-[#00ff88]/10 hover:border-[#00ff88]/30 transition-all duration-200">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#00ff88]/10 flex items-center justify-center group-hover:bg-[#00ff88]/20 transition-colors">
                <Shield className="h-6 w-6 text-[#00ff88]" />
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between gap-6">
                <span className="text-gray-200 text-base md:text-lg">
                  Avoid just 1 bad 15% loss
                </span>
                <span className="text-2xl md:text-3xl font-bold text-[#00ff88] font-mono whitespace-nowrap">
                  +${lossAvoidedSavings.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Better Entries Card */}
            <div className="group flex items-center gap-5 p-5 bg-[#00ff88]/5 rounded-xl border border-[#00ff88]/10 hover:bg-[#00ff88]/10 hover:border-[#00ff88]/30 transition-all duration-200">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#00ff88]/10 flex items-center justify-center group-hover:bg-[#00ff88]/20 transition-colors">
                <Target className="h-6 w-6 text-[#00ff88]" />
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between gap-6">
                <span className="text-gray-200 text-base md:text-lg">
                  Improve entry timing by 3%
                </span>
                <span className="text-2xl md:text-3xl font-bold text-[#00ff88] font-mono whitespace-nowrap">
                  +${betterEntries.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section - Enhanced visual hierarchy */}
        <div className="bg-[#0B1E32]/60 rounded-2xl p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">

            {/* Total Value */}
            <div className="text-center space-y-3">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total Annual Value
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white font-mono">
                ${totalValue.toLocaleString()}
              </div>
            </div>

            {/* Premium Cost */}
            <div className="text-center space-y-3">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Premium Cost
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white font-mono">
                ${premiumCost}
              </div>
              <div className="text-sm text-gray-400 font-medium">
                per year
              </div>
            </div>

            {/* ROI - Most prominent */}
            <div className="text-center space-y-3 md:col-span-1 md:border-l-2 md:border-[#00ff88]/20">
              <div className="text-xs font-bold text-[#00ff88]/80 uppercase tracking-wider">
                Your ROI
              </div>
              <div className="text-5xl md:text-6xl font-bold text-[#00ff88] font-mono leading-none">
                {roi.toLocaleString()}%
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center space-y-4">
            <a
              href="#pricing"
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#00ff88]/30 hover:shadow-xl hover:shadow-[#00ff88]/50 hover:scale-[1.02] text-lg md:text-xl"
            >
              Join Waitlist - 50% Off First Year
              <span className="text-2xl leading-none">→</span>
            </a>
            <p className="text-sm text-gray-400 font-medium">
              Early subscribers get 50% off ($48 first year, then $96/year)
            </p>
          </div>
        </div>

        {/* Disclaimer - Subtle but readable */}
        <div className="text-center pt-4 border-t border-[#1a3a52]/50">
          <p className="text-xs text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Calculations are illustrative examples based on conservative estimates. Past performance does not guarantee future results.
            Daily Ticker is for educational purposes only and does not provide financial advice.
          </p>
        </div>

      </div>
    </div>
  )
}
