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
    <div className="grid md:grid-cols-3 gap-4">
      {mockMoves.map((move) => (
        <div
          key={move.symbol}
          className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-4 hover:border-[#2a4a62] transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {move.isPositive ? (
                <TrendingUp className="h-4 w-4 text-[#00ff88]" />
              ) : (
                <TrendingDown className="h-4 w-4 text-[#ff4444]" />
              )}
              <h4 className="text-lg font-bold text-white font-mono">{move.symbol}</h4>
            </div>
            <span
              className={cn(
                "text-sm font-mono font-bold",
                move.isPositive ? "text-[#00ff88]" : "text-[#ff4444]",
              )}
            >
              {move.changePercent}
            </span>
          </div>

          <p className="text-sm text-gray-200 mb-2">{move.company}</p>
          <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">{move.insight}</p>
        </div>
      ))}
    </div>
  )
}
