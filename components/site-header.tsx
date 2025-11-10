'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Menu, X } from 'lucide-react'

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-[#1a3a52] bg-[#0B1E32]/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="Daily Ticker home">
          <TrendingUp className="h-6 w-6 text-[#00ff88]" aria-hidden="true" />
          <h1 className="text-xl font-bold text-white font-mono">Daily Ticker</h1>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 md:gap-6">
          <a href="/#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
            Pricing
          </a>
          <Link href="/archive" className="text-sm text-gray-300 hover:text-white transition-colors">
            Archive
          </Link>
          <a
            href="/#pricing"
            className="px-4 py-2 bg-[#00ff88] text-[#0B1E32] font-bold text-sm rounded-lg hover:bg-[#00dd77] transition-colors shadow-lg shadow-[#00ff88]/20 hover:shadow-[#00ff88]/40"
          >
            Go Pro
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1a3a52] bg-[#0B1E32]" role="navigation" aria-label="Mobile navigation">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <a
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-gray-300 hover:text-white transition-colors py-2"
            >
              Pricing
            </a>
            <Link
              href="/archive"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-gray-300 hover:text-white transition-colors py-2"
            >
              Archive
            </Link>
            <a
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 bg-[#00ff88] text-[#0B1E32] font-bold text-sm rounded-lg hover:bg-[#00dd77] transition-colors shadow-lg shadow-[#00ff88]/20 text-center"
            >
              Go Pro
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
