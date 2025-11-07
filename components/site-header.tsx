'use client'

import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
import { CheckoutButton } from '@/components/checkout-button'

export function SiteHeader() {
  return (
    <header className="border-b border-[#1a3a52] bg-[#0B1E32]/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-[#00ff88]" />
          <h1 className="text-xl font-bold text-white font-mono">Daily Ticker</h1>
        </Link>
        <nav className="flex items-center gap-4 md:gap-6">
          <a href="/#pricing" className="hidden md:block text-sm text-gray-300 hover:text-white transition-colors">
            Pricing
          </a>
          <Link href="/archive" className="hidden md:block text-sm text-gray-300 hover:text-white transition-colors">
            Archive
          </Link>
          <CheckoutButton className="px-4 py-2 bg-[#00ff88] text-[#0B1E32] font-bold text-sm rounded-lg hover:bg-[#00dd77] transition-colors shadow-lg shadow-[#00ff88]/20 hover:shadow-[#00ff88]/40">
            Go Pro
          </CheckoutButton>
        </nav>
      </div>
    </header>
  )
}
