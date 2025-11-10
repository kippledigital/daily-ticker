'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Award, BarChart3 } from 'lucide-react'
import type { BriefData } from '@/app/api/archive/store/route'

interface PerformanceSummaryProps {
  brief: BriefData;
}

/**
 * Performance summary component for archive pages
 * Shows brief performance metrics if available
 */
export function PerformanceSummary({ brief }: PerformanceSummaryProps) {
  const [performanceData, setPerformanceData] = useState<{
    winRate?: number;
    avgReturn?: number;
    totalPicks?: number;
  } | null>(null);

  // TODO: Fetch performance data from API if available
  // For now, show basic stats
  useEffect(() => {
    // This would fetch from /api/performance/[date] if endpoint exists
    // For now, just show basic info
    setPerformanceData({
      totalPicks: brief.stocks.length,
    });
  }, [brief]);

  if (!performanceData) {
    return null;
  }

  return (
    <div className="mt-12 p-6 bg-[#1a3a52]/30 border border-[#1a3a52] rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-[#00ff88]" />
        Brief Summary
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {performanceData.totalPicks || brief.stocks.length}
          </div>
          <div className="text-sm text-gray-400">Stocks Analyzed</div>
        </div>
        
        {brief.actionableCount > 0 && (
          <div className="text-center">
            <div className="text-2xl font-bold text-[#00ff88] mb-1 flex items-center justify-center gap-1">
              <TrendingUp className="h-5 w-5" />
              {brief.actionableCount}
            </div>
            <div className="text-sm text-gray-400">Actionable Picks</div>
          </div>
        )}
        
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {brief.stocks.map(s => s.sector).filter((v, i, a) => a.indexOf(v) === i).length}
          </div>
          <div className="text-sm text-gray-400">Sectors Covered</div>
        </div>
      </div>
      
      {/* Ticker Links */}
      <div className="mt-6 pt-6 border-t border-[#1a3a52]">
        <p className="text-sm text-gray-400 mb-3">Stocks covered:</p>
        <div className="flex flex-wrap gap-2">
          {brief.stocks.map((stock) => (
            <a
              key={stock.ticker}
              href={`/stocks/${stock.ticker}`}
              className="px-3 py-1 bg-[#0B1E32] border border-[#1a3a52] rounded-md text-sm font-mono text-[#00ff88] hover:border-[#00ff88] transition-colors"
            >
              {stock.ticker}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

