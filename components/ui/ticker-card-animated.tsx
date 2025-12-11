"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface DailyPick {
  ticker: string
  sector: string
  entryPrice: number
  confidence: number
  summary: string
  action: string
  riskLevel: string
}

interface TickerCardAnimatedProps {
  pick: DailyPick
  pickIndex: number
  todayDateString: string
  animationStyle?: "split-flap" | "scramble-up"
}

// Scramble animation component with enhanced ticker-style effect
function ScrambleText({
  text,
  className,
  delay = 0
}: {
  text: string
  className?: string
  delay?: number
}) {
  const [displayText, setDisplayText] = useState(text)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$@#%&*"

  useEffect(() => {
    let iteration = 0
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " "
            if (index < iteration) return text[index]
            // More dramatic scrambling with varied characters
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join("")
      )

      if (iteration >= text.length) {
        clearInterval(interval)
      }
      iteration += 1 / 3
    }, 30)

    return () => clearInterval(interval)
  }, [text])

  return <span className={className}>{displayText}</span>
}

export function TickerCardAnimated({
  pick,
  pickIndex,
  todayDateString,
  animationStyle = "split-flap"
}: TickerCardAnimatedProps) {

  if (animationStyle === "scramble-up") {
    // Line-by-line slide up animation with scramble effect
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={pickIndex}
          className="space-y-3"
        >
          {/* Ticker and Price Row */}
          <motion.div
            className="flex items-start justify-between overflow-hidden"
            initial={{ opacity: 0, y: 30, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -30, height: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
              delay: 0
            }}
          >
            <div>
              <div className="text-2xl font-mono font-bold text-white">
                <ScrambleText text={pick.ticker} />
              </div>
              <div className="text-sm text-gray-300 mt-1">{pick.sector}</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-mono font-bold text-white">
                ${pick.entryPrice.toFixed(2)}
              </div>
              <div className={cn(
                "text-sm font-mono font-bold flex items-center gap-1 justify-end mt-1",
                "text-[#00ff88]"
              )}>
                <TrendingUp className="h-3 w-3" aria-hidden="true" />
                {pick.action}
              </div>
            </div>
          </motion.div>

          {/* Summary Line */}
          <motion.p
            className="text-sm text-gray-300 leading-relaxed overflow-hidden"
            initial={{ opacity: 0, y: 30, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -30, height: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.1
            }}
          >
            {pick.summary}
          </motion.p>

          {/* Risk Badge Line */}
          <motion.div
            className="flex items-center gap-2 text-xs overflow-hidden"
            initial={{ opacity: 0, y: 30, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -30, height: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.2
            }}
          >
            <span className={cn(
              "px-2 py-1 rounded-full font-mono font-semibold",
              pick.riskLevel === "Low" ? "bg-[#00ff88]/10 text-[#00ff88]" :
              pick.riskLevel === "Medium" ? "bg-yellow-500/10 text-yellow-400" :
              "bg-red-500/10 text-red-400"
            )}>
              {pick.riskLevel} Risk
            </span>
          </motion.div>

          {/* CTA Link Line */}
          <motion.div
            className="flex justify-end overflow-hidden"
            initial={{ opacity: 0, y: 30, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -30, height: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.3
            }}
          >
            <a
              href={`/archive/${todayDateString}`}
              className="inline-flex items-center text-sm font-semibold text-[#00ff88] hover:text-[#00dd77] transition-colors group"
            >
              See Full Analysis
              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Split-flap ticker style animation
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pickIndex}
        initial={{ rotateX: -90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        exit={{ rotateX: 90, opacity: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1]
        }}
        style={{
          transformPerspective: 1000,
          transformStyle: "preserve-3d"
        }}
        className="space-y-3"
      >
        <div className="flex items-start justify-between">
          <div>
            <motion.div
              className="text-2xl font-mono font-bold text-white overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {pick.ticker.split('').map((char, i) => (
                <motion.span
                  key={`${char}-${i}`}
                  initial={{ rotateX: -90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  transition={{
                    delay: 0.2 + (i * 0.05),
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                  style={{
                    display: 'inline-block',
                    transformOrigin: 'center',
                    transformStyle: "preserve-3d"
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
            <motion.div
              className="text-sm text-gray-300 mt-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {pick.sector}
            </motion.div>
          </div>
          <motion.div
            className="text-right"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <div className="text-xl font-mono font-bold text-white">
              ${pick.entryPrice.toFixed(2)}
            </div>
            <div className={cn(
              "text-sm font-mono font-bold flex items-center gap-1 justify-end mt-1",
              "text-[#00ff88]"
            )}>
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
              {pick.action}
            </div>
          </motion.div>
        </div>

        <motion.p
          className="text-sm text-gray-300 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {pick.summary}
        </motion.p>

        <motion.div
          className="flex items-center gap-2 text-xs"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span className={cn(
            "px-2 py-1 rounded-full font-mono font-semibold",
            pick.riskLevel === "Low" ? "bg-[#00ff88]/10 text-[#00ff88]" :
            pick.riskLevel === "Medium" ? "bg-yellow-500/10 text-yellow-400" :
            "bg-red-500/10 text-red-400"
          )}>
            {pick.riskLevel} Risk
          </span>
        </motion.div>

        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <a
            href={`/archive/${todayDateString}`}
            className="inline-flex items-center text-sm font-semibold text-[#00ff88] hover:text-[#00dd77] transition-colors group"
          >
            See Full Analysis
            <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
