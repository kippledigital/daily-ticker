"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubscribeFormProps {
  variant?: "default" | "large"
}

export function SubscribeForm({ variant = "default" }: SubscribeFormProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      setIsSuccess(true)
      setEmail("")
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isLarge = variant === "large"

  return (
    <div className={cn("w-full", isLarge ? "max-w-xl mx-auto" : "max-w-md mx-auto")}>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 w-full"
      >
        <div className="w-full sm:w-[60%] sm:min-w-0">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading || isSuccess}
            className={cn(
              "w-full bg-[#1a3a52] border-[#2a4a62] text-white placeholder:text-gray-200 focus-visible:ring-[#00ff88] focus-visible:border-[#00ff88]",
              isLarge ? "h-14 text-base px-5 py-3" : "h-12 text-sm px-4 py-3",
            )}
            style={isLarge ? { height: '56px', fontSize: '16px' } : { height: '48px', fontSize: '14px' }}
          />
        </div>
        <div className="w-full sm:w-[40%] sm:flex-shrink-0">
          <Button
            type="submit"
            disabled={isLoading || isSuccess}
            className={cn(
              "w-full bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] font-semibold shadow-lg shadow-[#00ff88]/30 hover:shadow-[#00ff88]/50 transition-all whitespace-nowrap",
              isLarge ? "h-14 px-4 text-base" : "h-12 px-4 text-sm"
            )}
          >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Subscribing...
            </>
          ) : (
            <>
              Get Free Daily Picks
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
          </Button>
        </div>
      </form>

      {/* Success and error messages below the form */}
      {isSuccess && (
        <p className="text-sm text-[#00ff88] mt-3 text-center font-medium">
          ✓ Subscribed successfully! Check your inbox.
        </p>
      )}
      {error && (
        <p className="text-sm text-[#ff4444] mt-3 text-center">{error}</p>
      )}
    </div>
  )
}
