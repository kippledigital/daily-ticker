'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowRight, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface StockMetrics {
  ticker: string;
  sector: string;
  pickCount: number;
}

export function FeaturedStocks() {
  const [stocks, setStocks] = useState<StockMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopStocks() {
      try {
        // Get top 5 most-picked stocks
        const { data, error } = await supabase
          .from('stocks')
          .select('ticker, sector')
          .order('created_at', { ascending: false })
          .limit(100); // Get recent picks

        if (error) throw error;

        if (data) {
          // Count picks per ticker
          const tickerCounts = data.reduce((acc, stock) => {
            const ticker = stock.ticker;
            if (!acc[ticker]) {
              acc[ticker] = {
                ticker,
                sector: stock.sector,
                pickCount: 0,
              };
            }
            acc[ticker].pickCount++;
            return acc;
          }, {} as Record<string, StockMetrics>);

          // Convert to array and sort by pick count
          const sortedStocks = Object.values(tickerCounts)
            .sort((a, b) => b.pickCount - a.pickCount)
            .slice(0, 6); // Top 6 stocks

          setStocks(sortedStocks);
        }
      } catch (error) {
        console.error('Error fetching featured stocks:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopStocks();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-[#1a3a52]/30 rounded w-48 mb-8" />
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#1a3a52]/30 rounded-lg h-32" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (stocks.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Most Active Stocks
            </h2>
            <p className="text-gray-400">
              Our most frequently covered stocks with transparent track records
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {stocks.map((stock) => (
            <Link
              key={stock.ticker}
              href={`/stocks/${stock.ticker}`}
              className="group bg-[#1a3a52] border border-[#1a3a52] hover:border-[#00ff88] rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-[#00ff88]/20"
            >
              {/* Ticker Badge */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border-2 border-[#00ff88]/30 group-hover:border-[#00ff88] rounded-xl flex items-center justify-center transition-colors">
                  <span className="text-xl font-bold text-[#00ff88] font-mono">{stock.ticker}</span>
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-white group-hover:text-[#00ff88] transition-colors">
                    {stock.ticker}
                  </div>
                  <div className="text-sm text-gray-400">{stock.sector}</div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-[#00ff88] transition-colors" />
              </div>

              {/* Stats */}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <BarChart3 className="w-4 h-4" />
                <span>{stock.pickCount} pick{stock.pickCount !== 1 ? 's' : ''}</span>
              </div>

              {/* CTA */}
              <div className="mt-4 text-sm text-[#00ff88] group-hover:underline">
                View track record →
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-8 text-center">
          <Link
            href="/archive"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00ff88] transition-colors"
          >
            <span>Browse all picks in the archive</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
