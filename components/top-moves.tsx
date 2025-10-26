"use client"

import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Move {
  symbol: string
  company: string
  change: string
  changePercent: string
  isPositive: boolean
  insight: string
  risk: "low" | "medium" | "high"
}

const mockMoves: Move[] = [
  {
    symbol: "NVDA",
    company: "NVIDIA",
    change: "+12.45",
    changePercent: "+2.58%",
    isPositive: true,
    insight: "Strong earnings beat driven by AI chip demand. Data center revenue up 41% YoY.",
    risk: "medium",
  },
  {
    symbol: "TSLA",
    company: "Tesla",
    change: "-5.67",
    changePercent: "-2.29%",
    isPositive: false,
    insight: "Delivery numbers missed expectations. Production challenges in Shanghai facility.",
    risk: "high",
  },
  {
    symbol: "AAPL",
    company: "Apple",
    change: "+2.34",
    changePercent: "+1.33%",
    isPositive: true,
    insight: "iPhone 16 pre-orders exceed analyst estimates. Services revenue remains strong.",
    risk: "low",
  },
]

const riskColors = {
  low: "text-[#00ff88] bg-[#00ff88]/10",
  medium: "text-yellow-400 bg-yellow-400/10",
  high: "text-[#ff4444] bg-[#ff4444]/10",
}

export function TopMoves() {
  return (
    <div className="grid gap-6">
      {mockMoves.map((move) => (
        <div
          key={move.symbol}
          className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 hover:border-[#2a4a62] transition-colors"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0",
                  move.isPositive ? "bg-[#00ff88]/10" : "bg-[#ff4444]/10",
                )}
              >
                {move.isPositive ? (
                  <TrendingUp className="h-6 w-6 text-[#00ff88]" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-[#ff4444]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-xl font-bold text-white font-mono">{move.symbol}</h4>
                  <span className="text-sm text-gray-400">{move.company}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-2xl font-mono font-bold",
                      move.isPositive ? "text-[#00ff88]" : "text-[#ff4444]",
                    )}
                  >
                    {move.change}
                  </span>
                  <span className={cn("text-lg font-mono", move.isPositive ? "text-[#00ff88]" : "text-[#ff4444]")}>
                    {move.changePercent}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                riskColors[move.risk],
              )}
            >
              <AlertCircle className="h-3 w-3" />
              {move.risk} risk
            </div>
          </div>

          <p className="text-gray-300 leading-relaxed">{move.insight}</p>
        </div>
      ))}
    </div>
  )
}
