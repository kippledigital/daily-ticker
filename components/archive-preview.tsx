"use client"

import { Calendar, TrendingUp, TrendingDown } from "lucide-react"

interface BriefCard {
  date: string
  headline: string
  topMoves: Array<{
    symbol: string
    change: number
    reason: string
  }>
}

const exampleBriefs: BriefCard[] = [
  {
    date: "March 15, 2024",
    headline: "Tech Rally Continues as Fed Signals Rate Pause",
    topMoves: [
      { symbol: "NVDA", change: 7.2, reason: "Strong AI chip demand" },
      { symbol: "TSLA", change: -3.1, reason: "Production concerns" },
      { symbol: "AAPL", change: 2.4, reason: "iPhone sales beat estimates" },
    ],
  },
  {
    date: "March 14, 2024",
    headline: "Energy Sector Surges on Supply Concerns",
    topMoves: [
      { symbol: "XOM", change: 4.8, reason: "Oil prices jump" },
      { symbol: "META", change: 3.2, reason: "Ad revenue growth" },
      { symbol: "DIS", change: -2.7, reason: "Streaming subscriber miss" },
    ],
  },
  {
    date: "March 13, 2024",
    headline: "Banking Sector Stabilizes After Volatility",
    topMoves: [
      { symbol: "JPM", change: 2.1, reason: "Strong earnings report" },
      { symbol: "GOOGL", change: 1.8, reason: "Cloud growth accelerates" },
      { symbol: "NFLX", change: -1.4, reason: "Content cost concerns" },
    ],
  },
]

export function ArchivePreview() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h3 className="text-3xl md:text-4xl font-bold text-white">See what you&apos;ll get</h3>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto text-pretty">
          Every morning, you&apos;ll receive a concise brief with the day&apos;s most important market moves and why they matter.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {exampleBriefs.map((brief, index) => (
          <div
            key={index}
            className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg overflow-hidden hover:border-[#00ff88]/30 transition-all duration-300 group"
          >
            {/* Brief Header */}
            <div className="bg-[#0B1E32]/50 border-b border-[#1a3a52] p-4">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Calendar className="h-4 w-4" />
                <span className="font-mono">{brief.date}</span>
              </div>
              <h4 className="text-white font-semibold leading-snug text-balance">{brief.headline}</h4>
            </div>

            {/* Brief Content */}
            <div className="p-4 space-y-3">
              <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Top Moves</div>
              {brief.topMoves.map((move, moveIndex) => (
                <div key={moveIndex} className="flex items-start gap-3 pb-3 border-b border-[#1a3a52]/50 last:border-0">
                  <div className="flex-shrink-0 w-16">
                    <div className="font-mono text-sm font-bold text-white">{move.symbol}</div>
                    <div
                      className={`font-mono text-sm font-bold flex items-center gap-1 ${
                        move.change > 0 ? "text-[#00ff88]" : "text-[#ff4444]"
                      }`}
                    >
                      {move.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {move.change > 0 ? "+" : ""}
                      {move.change}%
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 leading-relaxed">{move.reason}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Brief Footer */}
            <div className="bg-[#0B1E32]/50 border-t border-[#1a3a52] p-3 text-center">
              <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Example Brief</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-gray-400">
          Each brief includes market context, key moves, and plain-English explanations
        </p>
      </div>
    </div>
  )
}
