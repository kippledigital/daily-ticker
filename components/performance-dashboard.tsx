"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Target, Award, BarChart3, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import NumberTicker from "@/components/ui/number-ticker"

interface PerformanceSummary {
  total_closed_picks: number
  total_open_picks: number
  total_wins: number
  total_losses: number
  win_rate_percent: number
  avg_return_percent: number
  avg_win_percent: number
  avg_loss_percent: number
  avg_holding_days: number
  best_pick_percent: number
  worst_pick_percent: number
}

interface StockPick {
  id: string
  entry_date: string
  entry_price: number
  exit_date: string | null
  exit_price: number | null
  exit_reason: string | null
  return_percent: number | null
  return_dollars: number | null
  holding_days: number | null
  outcome: 'win' | 'loss' | 'open'
  stocks: {
    ticker: string
    sector: string
    stop_loss: number
    profit_target: number
    confidence: number
    entry_price: number
  }
}

interface PerformanceData {
  summary: PerformanceSummary
  picks: StockPick[]
}

export function PerformanceDashboard() {
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'win' | 'loss' | 'open'>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/performance?limit=10&status=${filter}`)
        const result = await response.json()

        if (result.success) {
          setData(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch performance data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filter])

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8 text-center">
        <p className="text-gray-400">Loading performance data...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8 text-center">
        <p className="text-gray-300">No performance data available yet.</p>
        <p className="text-sm text-gray-400 mt-2">Check back after the first picks are closed.</p>
      </div>
    )
  }

  const { summary, picks } = data

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Win Rate */}
        <div className="bg-[#0a1929] border border-[#1a3a52] rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#00ff88]/10 rounded-lg">
              <Award className="h-5 w-5 text-[#00ff88]" />
            </div>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Win Rate</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-mono font-bold text-white">
              <NumberTicker value={summary.win_rate_percent || 0} decimalPlaces={0} />%
            </p>
            <p className="text-xs text-gray-400">
              {summary.total_wins} wins / {summary.total_closed_picks} closed
            </p>
          </div>
        </div>

        {/* Average Return */}
        <div className="bg-[#0a1929] border border-[#1a3a52] rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#00ff88]/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-[#00ff88]" />
            </div>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Avg Return</span>
          </div>
          <div className="space-y-1">
            <p className={cn(
              "text-3xl font-mono font-bold flex items-center gap-1",
              (summary.avg_return_percent || 0) >= 0 ? "text-[#00ff88]" : "text-[#ff4444]"
            )}>
              {(summary.avg_return_percent || 0) >= 0 ? "+" : ""}
              <NumberTicker value={summary.avg_return_percent || 0} decimalPlaces={1} />%
            </p>
            <p className="text-xs text-gray-400">
              Across all closed positions
            </p>
          </div>
        </div>

        {/* Best Pick */}
        <div className="bg-[#0a1929] border border-[#1a3a52] rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#00ff88]/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-[#00ff88]" />
            </div>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Best Pick</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-mono font-bold text-[#00ff88]">
              +<NumberTicker value={summary.best_pick_percent || 0} decimalPlaces={1} />%
            </p>
            <p className="text-xs text-gray-400">
              Highest single return
            </p>
          </div>
        </div>

        {/* Avg Hold Time */}
        <div className="bg-[#0a1929] border border-[#1a3a52] rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#00ff88]/10 rounded-lg">
              <Calendar className="h-5 w-5 text-[#00ff88]" />
            </div>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Avg Hold</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-mono font-bold text-white">
              <NumberTicker value={summary.avg_holding_days || 0} decimalPlaces={0} />d
            </p>
            <p className="text-xs text-gray-400">
              Average holding period
            </p>
          </div>
        </div>
      </div>

      {/* Recent Picks Table */}
      <div className="bg-[#0a1929] border border-[#1a3a52] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#1a3a52]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-mono font-bold text-white">Recent Picks</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  "px-3 py-1 text-xs font-mono rounded-lg transition-colors",
                  filter === 'all'
                    ? "bg-[#00ff88] text-[#0a1929] font-bold"
                    : "bg-[#1a3a52] text-gray-400 hover:text-gray-300"
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilter('win')}
                className={cn(
                  "px-3 py-1 text-xs font-mono rounded-lg transition-colors",
                  filter === 'win'
                    ? "bg-[#00ff88] text-[#0a1929] font-bold"
                    : "bg-[#1a3a52] text-gray-400 hover:text-gray-300"
                )}
              >
                Wins
              </button>
              <button
                onClick={() => setFilter('loss')}
                className={cn(
                  "px-3 py-1 text-xs font-mono rounded-lg transition-colors",
                  filter === 'loss'
                    ? "bg-[#00ff88] text-[#0a1929] font-bold"
                    : "bg-[#1a3a52] text-gray-400 hover:text-gray-300"
                )}
              >
                Losses
              </button>
              <button
                onClick={() => setFilter('open')}
                className={cn(
                  "px-3 py-1 text-xs font-mono rounded-lg transition-colors",
                  filter === 'open'
                    ? "bg-[#00ff88] text-[#0a1929] font-bold"
                    : "bg-[#1a3a52] text-gray-400 hover:text-gray-300"
                )}
              >
                Open
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a3a52]">
                <th className="text-left p-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="text-left p-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Entry</th>
                <th className="text-left p-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Exit</th>
                <th className="text-left p-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Return</th>
                <th className="text-left p-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Days</th>
                <th className="text-left p-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {picks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    No {filter !== 'all' ? filter : ''} picks found
                  </td>
                </tr>
              ) : (
                picks.map((pick) => (
                  <tr key={pick.id} className="border-b border-[#1a3a52]/50 last:border-0 hover:bg-[#1a3a52]/20 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-mono font-bold text-white">{pick.stocks.ticker}</p>
                        <p className="text-xs text-gray-400">{pick.stocks.sector}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-mono text-gray-300">${pick.entry_price.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">{new Date(pick.entry_date).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {pick.exit_price ? (
                        <div>
                          <p className="text-sm font-mono text-gray-300">${pick.exit_price.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">{pick.exit_date ? new Date(pick.exit_date).toLocaleDateString() : '-'}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Open</p>
                      )}
                    </td>
                    <td className="p-4">
                      {pick.return_percent !== null ? (
                        <div className="flex items-center gap-1">
                          {pick.return_percent >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-[#00ff88]" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-[#ff4444]" />
                          )}
                          <p className={cn(
                            "text-sm font-mono font-bold",
                            pick.return_percent >= 0 ? "text-[#00ff88]" : "text-[#ff4444]"
                          )}>
                            {pick.return_percent >= 0 ? '+' : ''}{pick.return_percent.toFixed(2)}%
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">-</p>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-mono text-gray-300">
                        {pick.holding_days !== null ? `${pick.holding_days}d` : '-'}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-1 text-xs font-mono rounded-full font-semibold",
                        pick.outcome === 'win' ? "bg-[#00ff88]/10 text-[#00ff88]" :
                        pick.outcome === 'loss' ? "bg-[#ff4444]/10 text-[#ff4444]" :
                        "bg-gray-500/10 text-gray-400"
                      )}>
                        {pick.outcome === 'win' ? '✓ Win' : pick.outcome === 'loss' ? '✗ Loss' : '• Open'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
