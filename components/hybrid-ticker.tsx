"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import HyperText from "@/components/ui/hyper-text"
import NumberTicker from "@/components/ui/number-ticker"
import { BorderBeam } from "@/components/ui/border-beam"

interface MarketIndex {
  symbol: string
  price: number
  change: number
  changePercent: number
}

interface DailyPick {
  ticker: string
  sector: string
  entryPrice: number
  confidence: number
  summary: string
  action: string
  riskLevel: string
}

export function HybridTicker() {
  const [marketData, setMarketData] = useState<MarketIndex[]>([
    { symbol: "S&P 500", price: 4782.40, change: 38.26, changePercent: 0.8 },
    { symbol: "NASDAQ", price: 15631.20, change: 185.14, changePercent: 1.2 },
    { symbol: "DOW", price: 38240.10, change: 114.72, changePercent: 0.3 },
  ])

  const [dailyPicks, setDailyPicks] = useState<DailyPick[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPickIndex, setCurrentPickIndex] = useState(0)
  const [isLive, setIsLive] = useState(false)

  // Fetch live market indices data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('/api/market-indices')
        const data = await response.json()

        if (data.success && data.data) {
          setMarketData(data.data)
          setIsLive(true)
        }
      } catch (error) {
        console.error("Failed to fetch market indices:", error)
        setIsLive(false)
      }
    }

    fetchMarketData()
    // Refresh every 60 seconds for live updates
    const interval = setInterval(fetchMarketData, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch today's actual brief data
  useEffect(() => {
    const fetchTodaysBrief = async () => {
      try {
        // Try fetching briefs going back up to 7 days to cover weekends
        const today = new Date()
        let foundData = false

        for (let daysBack = 0; daysBack <= 7; daysBack++) {
          const targetDate = new Date(today)
          targetDate.setDate(today.getDate() - daysBack)
          const dateStr = targetDate.toISOString().split('T')[0]

          const response = await fetch(`/api/archive/${dateStr}`)
          const data = await response.json()

          if (data.success && data.data?.stocks) {
            // Found a brief! Use it
            if (daysBack > 0) {
              console.log(`Using brief from ${daysBack} day(s) ago (${dateStr})`)
            }
            setDailyPicks(data.data.stocks)
            foundData = true
            break
          }
        }

        if (!foundData) {
          console.log("No briefs found in the last 7 days")
        }

        // Always set loading to false, whether we found data or not
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch brief:", error)
        setLoading(false)
      }
    }

    fetchTodaysBrief()
    // Refresh every 5 minutes
    const interval = setInterval(fetchTodaysBrief, 300000)
    return () => clearInterval(interval)
  }, [])

  // Auto-cycle through daily picks every 5 seconds
  useEffect(() => {
    if (dailyPicks.length === 0) return

    const interval = setInterval(() => {
      setCurrentPickIndex((prevIndex) => (prevIndex + 1) % dailyPicks.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [dailyPicks.length])

  // Format today's date
  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const todayDateString = today.toISOString().split('T')[0] // YYYY-MM-DD for archive URL

  const topPick = dailyPicks[currentPickIndex]

  // Show loading state or fallback
  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-4">
        <div className="text-center">
          <p className="text-sm font-mono text-gray-400 uppercase tracking-wider">
            {formattedDate}
          </p>
        </div>
        <div className="bg-[#0a1929] border-2 border-[#1a3a52] rounded-xl overflow-hidden shadow-2xl p-12">
          <p className="text-center text-gray-400">Loading today&apos;s picks...</p>
        </div>
      </div>
    )
  }

  // Show empty state if no picks available
  if (!topPick) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-4">
        <div className="text-center">
          <p className="text-sm font-mono text-gray-400 uppercase tracking-wider">
            {formattedDate}
          </p>
        </div>
        <div className="bg-[#0a1929] border-2 border-[#1a3a52] rounded-xl overflow-hidden shadow-2xl p-12 text-center">
          <p className="text-gray-300 mb-2">Today&apos;s picks haven&apos;t been published yet.</p>
          <p className="text-sm text-gray-400">Check back soon or view the <a href="/archive" className="text-[#00ff88] hover:text-[#00dd77] underline">archive</a>.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Date Header */}
      <div className="text-center">
        <p className="text-sm font-mono text-gray-400 uppercase tracking-wider">
          {formattedDate}
        </p>
      </div>

      <div className="relative rounded-xl overflow-hidden shadow-2xl bg-[#0a1929] border border-[#1a3a52]">
        {/* Animated border beam */}
        <BorderBeam size={300} duration={12} borderWidth={1.5} colorFrom="#00ff88" colorTo="#1a3a52" />

        {/* Content */}
        <div className="relative">
          {/* Desktop Layout: 40/60 Market Pulse / Daily Picks */}
          <div className="hidden lg:grid lg:grid-cols-[2fr,3fr] divide-x divide-[#1a3a52]">
          {/* Left: Market Pulse */}
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-mono text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <span>📊</span> Market Pulse
              </h3>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75 animate-ping"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
                </span>
                <span className="text-xs font-mono text-gray-200">LIVE</span>
              </div>
            </div>

            <div className="space-y-3">
              {marketData.map((index, idx) => (
                <div key={index.symbol} className="flex items-center justify-between py-2 border-b border-[#1a3a52]/50 last:border-0">
                  <div className="flex flex-col">
                    <span className="text-sm font-mono text-gray-200">{index.symbol}</span>
                    <span className="text-xs font-mono text-gray-400">
                      <NumberTicker value={index.price} delay={idx * 0.1} decimalPlaces={2} />
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-lg font-mono font-bold flex items-center gap-1",
                      index.changePercent >= 0 ? "text-[#00ff88]" : "text-[#ff4444]"
                    )}>
                      {index.changePercent >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {index.changePercent >= 0 ? "+" : ""}
                      <NumberTicker value={index.changePercent} delay={idx * 0.1} decimalPlaces={1} />%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Today's Free Picks (Cycling) */}
          <div className="p-5 space-y-3 bg-gradient-to-br from-[#1a3a52]/20 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-mono text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <span>🎯</span> Today&apos;s Free Picks
              </h3>
              <div className="flex gap-1.5">
                {dailyPicks.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPickIndex(index)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      index === currentPickIndex
                        ? "w-6 bg-[#00ff88]"
                        : "w-1.5 bg-gray-600 hover:bg-gray-500"
                    )}
                    aria-label={`View pick ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div key={currentPickIndex} className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {topPick.ticker}
                  </div>
                  <div className="text-sm text-gray-300 mt-1">{topPick.sector}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-mono font-bold text-white">${topPick.entryPrice.toFixed(2)}</div>
                  <div className={cn(
                    "text-sm font-mono font-bold flex items-center gap-1 justify-end mt-1",
                    "text-[#00ff88]"
                  )}>
                    <TrendingUp className="h-3 w-3" />
                    {topPick.action}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">{topPick.summary}</p>

              <div className="flex items-center gap-2 text-xs">
                <span className={cn(
                  "px-2 py-1 rounded-full font-mono font-semibold",
                  topPick.riskLevel === "Low" ? "bg-[#00ff88]/10 text-[#00ff88]" :
                  topPick.riskLevel === "Medium" ? "bg-yellow-500/10 text-yellow-400" :
                  "bg-red-500/10 text-red-400"
                )}>
                  {topPick.riskLevel} Risk
                </span>
              </div>

              <div className="flex justify-end">
                <a
                  href={`/archive/${todayDateString}`}
                  className="inline-flex items-center text-sm font-semibold text-[#00ff88] hover:text-[#00dd77] transition-colors group"
                >
                  See Full Analysis
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout: Stacked */}
        <div className="lg:hidden divide-y divide-[#1a3a52]">
          {/* Market Pulse */}
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-mono text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <span>📊</span> Market Pulse
              </h3>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75 animate-ping"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
                </span>
                <span className="text-xs font-mono text-gray-200">LIVE</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {marketData.map((index, idx) => (
                <div key={index.symbol} className="text-center space-y-1">
                  <div className="text-xs font-mono text-gray-400">{index.symbol}</div>
                  <div className={cn(
                    "text-sm font-mono font-bold",
                    index.changePercent >= 0 ? "text-[#00ff88]" : "text-[#ff4444]"
                  )}>
                    {index.changePercent >= 0 ? "+" : ""}
                    <NumberTicker value={index.changePercent} delay={idx * 0.1} decimalPlaces={1} />%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Free Picks (Cycling) - Mobile */}
          <div className="p-5 space-y-3 bg-gradient-to-br from-[#1a3a52]/20 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-mono text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <span>🎯</span> Today&apos;s Free Picks
              </h3>
              <div className="flex gap-1.5">
                {dailyPicks.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPickIndex(index)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      index === currentPickIndex
                        ? "w-6 bg-[#00ff88]"
                        : "w-1.5 bg-gray-600 hover:bg-gray-500"
                    )}
                    aria-label={`View pick ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div key={currentPickIndex} className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {topPick.ticker}
                  </div>
                  <div className="text-sm text-gray-300 mt-1">{topPick.sector}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-mono font-bold text-white">${topPick.entryPrice.toFixed(2)}</div>
                  <div className={cn(
                    "text-sm font-mono font-bold flex items-center gap-1 justify-end mt-1",
                    "text-[#00ff88]"
                  )}>
                    <TrendingUp className="h-3 w-3" />
                    {topPick.action}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">{topPick.summary}</p>

              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className={cn(
                  "px-2 py-1 rounded-full font-mono font-semibold",
                  topPick.riskLevel === "Low" ? "bg-[#00ff88]/10 text-[#00ff88]" :
                  topPick.riskLevel === "Medium" ? "bg-yellow-500/10 text-yellow-400" :
                  "bg-red-500/10 text-red-400"
                )}>
                  {topPick.riskLevel} Risk
                </span>
              </div>

              <div className="flex justify-end">
                <a
                  href={`/archive/${todayDateString}`}
                  className="inline-flex items-center text-sm font-semibold text-[#00ff88] hover:text-[#00dd77] transition-colors group"
                >
                  See Full Analysis
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
