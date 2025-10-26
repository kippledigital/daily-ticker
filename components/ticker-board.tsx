"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TickerItem {
  symbol: string
  price: number
  change: number
  changePercent: number
}

const mockTickers: TickerItem[] = [
  { symbol: "AAPL", price: 178.45, change: 2.34, changePercent: 1.33 },
  { symbol: "TSLA", price: 242.18, change: -5.67, changePercent: -2.29 },
  { symbol: "NVDA", price: 495.22, change: 12.45, changePercent: 2.58 },
  { symbol: "MSFT", price: 378.91, change: 4.23, changePercent: 1.13 },
  { symbol: "GOOGL", price: 142.65, change: -1.89, changePercent: -1.31 },
  { symbol: "AMZN", price: 178.35, change: 3.12, changePercent: 1.78 },
  { symbol: "META", price: 512.78, change: 8.45, changePercent: 1.67 },
  { symbol: "AMD", price: 165.43, change: -2.34, changePercent: -1.39 },
]

export function TickerBoard() {
  const [tickers, setTickers] = useState<TickerItem[]>(mockTickers)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch real-time stock data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch('/api/stocks');

        if (!response.ok) {
          throw new Error('Failed to fetch stock data');
        }

        const result = await response.json();

        if (result.success && result.data) {
          setTickers(result.data);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        // Keep using mock data on error
      }
    };

    // Fetch immediately
    fetchStockData();

    // Refresh every 60 seconds
    const interval = setInterval(fetchStockData, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % tickers.length)
        setIsAnimating(false)
      }, 300)
    }, 3000)

    return () => clearInterval(interval)
  }, [tickers])

  const currentTicker = tickers[currentIndex]

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-[#0a1929] border-2 border-[#1a3a52] rounded-xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-mono text-gray-200 uppercase tracking-wider">Live Market Feed</h3>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75",
                error ? "bg-yellow-500 animate-ping" : "bg-[#00ff88] animate-ping"
              )}></span>
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                error ? "bg-yellow-500" : "bg-[#00ff88]"
              )}></span>
            </span>
            <span className="text-xs font-mono text-gray-200">{error ? 'SAMPLE' : 'LIVE'}</span>
          </div>
        </div>

        <div className={cn("transition-all duration-300", isAnimating && "opacity-0 translate-y-2")}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="text-xs font-mono text-gray-300 uppercase">Symbol</div>
              <div className="text-3xl md:text-4xl font-mono font-bold text-white tracking-wider">
                {currentTicker.symbol}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono text-gray-300 uppercase">Price</div>
              <div className="text-3xl md:text-4xl font-mono font-bold text-white">${currentTicker.price.toFixed(2)}</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono text-gray-300 uppercase">Change</div>
              <div
                className={cn(
                  "text-3xl md:text-4xl font-mono font-bold",
                  currentTicker.change >= 0 ? "text-[#00ff88]" : "text-[#ff4444]",
                )}
              >
                {currentTicker.change >= 0 ? '+' : ''}{currentTicker.change.toFixed(2)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono text-gray-300 uppercase">Change %</div>
              <div
                className={cn(
                  "text-3xl md:text-4xl font-mono font-bold",
                  currentTicker.changePercent >= 0 ? "text-[#00ff88]" : "text-[#ff4444]",
                )}
              >
                {currentTicker.changePercent >= 0 ? '+' : ''}{currentTicker.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Scrolling ticker tape */}
        <div className="mt-8 pt-6 border-t border-[#1a3a52] overflow-hidden">
          <div className="flex animate-scroll gap-8">
            {[...mockTickers, ...mockTickers].map((ticker, idx) => (
              <div key={idx} className="flex items-center gap-3 whitespace-nowrap">
                <span className="font-mono text-sm text-gray-200">{ticker.symbol}</span>
                <span className="font-mono text-sm text-white">${ticker.price.toFixed(2)}</span>
                <span className={cn("font-mono text-sm", ticker.changePercent >= 0 ? "text-[#00ff88]" : "text-[#ff4444]")}>
                  {ticker.changePercent >= 0 ? '+' : ''}{ticker.changePercent.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
