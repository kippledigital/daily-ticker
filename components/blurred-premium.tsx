import { Lock } from 'lucide-react'

interface BlurredPremiumProps {
  content: string | number
  tooltip?: string
}

export function BlurredPremium({ content, tooltip = 'Upgrade to Premium to unlock' }: BlurredPremiumProps) {
  return (
    <div className="relative inline-block group">
      <span className="blur-sm select-none">{content}</span>
      <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-yellow-400" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
        <div className="bg-[#1a3a52] border border-yellow-600/30 px-3 py-2 rounded text-xs text-gray-200 whitespace-nowrap">
          {tooltip}
        </div>
      </div>
    </div>
  )
}
