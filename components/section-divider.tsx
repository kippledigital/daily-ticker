export function SectionDivider() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative flex items-center justify-center">
        {/* Left dot */}
        <div className="absolute left-0 h-1.5 w-1.5 rounded-full bg-[#00ff88]/40 animate-pulse" />

        {/* Gradient line */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/30 to-transparent" />

        {/* Center dot with glow */}
        <div className="absolute">
          <div className="relative h-2 w-2">
            <div className="absolute inset-0 bg-[#00ff88] rounded-full animate-ping opacity-40" />
            <div className="absolute inset-0 bg-[#00ff88] rounded-full shadow-lg shadow-[#00ff88]/50" />
          </div>
        </div>

        {/* Right dot */}
        <div className="absolute right-0 h-1.5 w-1.5 rounded-full bg-[#00ff88]/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
    </div>
  )
}
