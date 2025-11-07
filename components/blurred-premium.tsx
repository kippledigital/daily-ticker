import Link from 'next/link'

interface BlurredPremiumProps {
  children: React.ReactNode
  tier: 'free' | 'premium'
  feature?: string // e.g., "Confidence Score", "Stop Loss", "Profit Target"
  showCTA?: boolean // Show "Upgrade to Pro" button
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

  // Free users see nothing (badge already indicates Pro feature)
  return (
    <>
      {showCTA && (
        <Link
          href="/#pricing"
          className="text-[#00ff88] hover:text-[#00dd77] transition-colors underline text-sm"
        >
          Upgrade
        </Link>
      )}
    </>
  )
}

// Convenience wrapper for premium sections
export function BlurredPremiumSection({
  children,
  tier,
  title = 'Pro Feature'
}: {
  children: React.ReactNode
  tier: 'free' | 'premium'
  title?: string
}) {
  if (tier === 'premium') {
    return <>{children}</>
  }

  return (
    <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-4 text-center">
      <p className="text-sm text-gray-400 mb-2">{title}</p>
      <Link
        href="/#pricing"
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] text-sm font-semibold rounded-lg transition-colors"
      >
        Upgrade to Pro
      </Link>
    </div>
  )
}
