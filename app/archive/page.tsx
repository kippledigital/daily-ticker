'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, Calendar, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface BriefMetadata {
  date: string
  subject: string
  tldr?: string
  actionableCount: number
  stockCount: number
  tickers: string[]
  sectors: string[]
}

interface ArchiveListResponse {
  success: boolean
  data: BriefMetadata[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export default function ArchivePage() {
  const [briefs, setBriefs] = useState<BriefMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchTicker, setSearchTicker] = useState('')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  const limit = 10

  const fetchBriefs = async (newOffset: number = 0, ticker?: string) => {
    try {
      if (newOffset === 0) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: newOffset.toString(),
      })

      if (ticker) {
        params.append('ticker', ticker)
      }

      const response = await fetch(`/api/archive/list?${params}`)
      const data: ArchiveListResponse = await response.json()

      if (data.success) {
        if (newOffset === 0) {
          setBriefs(data.data)
        } else {
          setBriefs(prev => [...prev, ...data.data])
        }
        setHasMore(data.hasMore)
        setTotal(data.total)
        setOffset(newOffset)
      }
    } catch (error) {
      console.error('Error fetching briefs:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchBriefs(0)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setOffset(0)
    fetchBriefs(0, searchTicker.toUpperCase() || undefined)
  }

  const handleLoadMore = () => {
    fetchBriefs(offset + limit, searchTicker.toUpperCase() || undefined)
  }

  const formatDate = (dateStr: string) => {
    // Parse date string as YYYY-MM-DD and treat it as local date (not UTC)
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-[#0B1E32]">
      {/* Header */}
      <header className="border-b border-[#1a3a52] bg-[#0B1E32]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <TrendingUp className="h-6 w-6 text-[#00ff88]" />
            <h1 className="text-xl font-bold text-white font-mono">Daily Ticker</h1>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Page Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Brief Archive</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Browse past Daily Ticker briefs and see our historical stock recommendations
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by ticker (e.g., AAPL)"
                value={searchTicker}
                onChange={(e) => setSearchTicker(e.target.value)}
                className="pl-10 bg-[#1a3a52] border-[#2a4a62] text-white placeholder:text-gray-400 focus-visible:ring-[#00ff88] focus-visible:border-[#00ff88]"
              />
            </div>
            <Button
              type="submit"
              className="bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] font-semibold px-6"
            >
              Search
            </Button>
          </div>
          {searchTicker && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => {
                  setSearchTicker('')
                  fetchBriefs(0)
                }}
                className="text-sm text-gray-400 hover:text-[#00ff88] transition-colors"
              >
                Clear search
              </button>
            </div>
          )}
        </form>

        {/* Results Count */}
        {!loading && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-400">
              Showing {briefs.length} of {total} brief{total !== 1 ? 's' : ''}
              {searchTicker && ` for ${searchTicker}`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#00ff88]" />
          </div>
        )}

        {/* No Results */}
        {!loading && briefs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              {searchTicker
                ? `No briefs found for ${searchTicker}`
                : 'No briefs available yet. Check back soon!'}
            </p>
            <Link href="/" className="inline-block mt-6">
              <Button className="bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] font-semibold">
                Subscribe to Daily Ticker
              </Button>
            </Link>
          </div>
        )}

        {/* Brief Cards Grid */}
        {!loading && briefs.length > 0 && (
          <div className="grid gap-6 max-w-4xl mx-auto">
            {briefs.map((brief) => (
              <Link
                key={brief.date}
                href={`/archive/${brief.date}`}
                className="block bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg overflow-hidden hover:border-[#00ff88]/30 transition-all duration-300 group"
              >
                {/* Brief Header */}
                <div className="bg-[#0B1E32]/50 border-b border-[#1a3a52] p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                    <Calendar className="h-4 w-4" />
                    <span className="font-mono">{formatDate(brief.date)}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white leading-snug group-hover:text-[#00ff88] transition-colors">
                    {brief.subject}
                  </h3>
                </div>

                {/* Brief Content */}
                <div className="p-6 space-y-4">
                  {brief.tldr && (
                    <p className="text-gray-300 leading-relaxed line-clamp-2">{brief.tldr}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="font-semibold text-white">{brief.stockCount}</span>
                      <span>stocks analyzed</span>
                    </div>
                    {brief.actionableCount > 0 && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="font-semibold text-[#00ff88]">{brief.actionableCount}</span>
                        <span>actionable</span>
                      </div>
                    )}
                  </div>

                  {/* Ticker Badges */}
                  <div className="flex flex-wrap gap-2">
                    {brief.tickers.map((ticker) => (
                      <span
                        key={ticker}
                        className="px-3 py-1 bg-[#0B1E32] border border-[#1a3a52] rounded-md text-sm font-mono text-white"
                      >
                        {ticker}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Brief Footer */}
                <div className="bg-[#0B1E32]/50 border-t border-[#1a3a52] p-4 text-center">
                  <span className="text-sm text-gray-400 group-hover:text-[#00ff88] transition-colors">
                    Read full brief →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!loading && hasMore && (
          <div className="text-center mt-12">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-[#1a3a52] hover:bg-[#2a4a62] text-white border border-[#2a4a62] px-8"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
