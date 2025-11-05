import { Lock } from 'lucide-react'
import Link from 'next/link'

interface BlurredPremiumProps {
  children: React.ReactNode
  tier: 'free' | 'premium'
  feature?: string // e.g., "Confidence Score", "Stop Loss", "Profit Target"
  showCTA?: boolean // Show "Upgrade to Premium" button
}

export function BlurredPremium({
  children,
  tier,
  feature = 'premium feature',
  showCTA = false
}: BlurredPremiumProps) {
  // If user is premium, show content unblurred
  if (tier === 'premium') {
    return <>{children}</>
  }

  // Free users see blurred content with lock overlay
  return (
    <div className="relative inline-block group">
      {/* Blurred content */}
      <div className="blur-sm select-none pointer-events-none">
        {children}
      </div>

      {/* Lock icon overlay */}
      <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-yellow-400 z-10" />

      {/* Hover tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
        <div className="bg-[#1a3a52] border border-yellow-600/30 px-3 py-2 rounded text-xs text-gray-200 whitespace-nowrap">
          <Lock className="inline h-3 w-3 mr-1" />
          Premium: {feature}
        </div>
      </div>

      {/* Optional CTA button below blurred content */}
      {showCTA && (
        <div className="mt-2">
          <Link
            href="/premium"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white text-sm font-medium rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all"
          >
            <Lock className="h-4 w-4" />
            Upgrade to Premium
          </Link>
        </div>
      )}
    </div>
  )
}

// Convenience wrapper for blurring entire sections
export function BlurredPremiumSection({
  children,
  tier,
  title = 'Premium Feature'
}: {
  children: React.ReactNode
  tier: 'free' | 'premium'
  title?: string
}) {
  if (tier === 'premium') {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {/* Blurred section */}
      <div className="blur-md select-none pointer-events-none opacity-60">
        {children}
      </div>

      {/* Centered overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-[#1a3a52]/90 border border-yellow-600/30 px-6 py-4 rounded-lg text-center">
          <Lock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-gray-200 font-medium mb-1">{title}</p>
          <p className="text-gray-400 text-sm mb-3">Unlock premium data to see this</p>
          <Link
            href="/premium"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white text-sm font-medium rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all"
          >
            <Lock className="h-4 w-4" />
            Upgrade to Premium
          </Link>
        </div>
      </div>
    </div>
  )
}
