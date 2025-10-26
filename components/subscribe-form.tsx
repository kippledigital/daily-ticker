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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call - replace with actual Beehiiv/ConvertKit integration
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    setIsSuccess(true)
    setEmail("")

    setTimeout(() => setIsSuccess(false), 3000)
  }

  const isLarge = variant === "large"

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col sm:flex-row gap-3 w-full", isLarge ? "max-w-xl mx-auto" : "max-w-md mx-auto")}
    >
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isLoading || isSuccess}
        className={cn(
          "flex-1 bg-[#1a3a52] border-[#2a4a62] text-white placeholder:text-gray-200 focus-visible:ring-[#00ff88] focus-visible:border-[#00ff88]",
          isLarge && "h-12 text-base",
        )}
      />
      <Button
        type="submit"
        disabled={isLoading || isSuccess}
        className={cn(
          "bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] font-semibold shadow-lg shadow-[#00ff88]/30 hover:shadow-[#00ff88]/50 transition-all",
          isLarge && "h-12 px-8 text-base"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Subscribing...
          </>
        ) : isSuccess ? (
          "Subscribed! ✓"
        ) : (
          <>
            Join the Brief
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  )
}
