import { Lock } from 'lucide-react'

export function PremiumBadge({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses} bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-600/30 rounded-md text-yellow-400`}>
      <Lock className="h-3 w-3" />
      <span className="font-semibold">Pro</span>
    </span>
  )
}
