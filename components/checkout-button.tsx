'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface CheckoutButtonProps {
  className?: string
  children: React.ReactNode
  priceType?: 'standard' | 'monthly' | 'earlyBird' // Defaults to 'standard' (yearly)
  onClick?: () => void // Optional callback for when button is clicked (e.g., to close dropdown)
}

export function CheckoutButton({ className, children, priceType = 'standard', onClick }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    
    // Call optional onClick callback (e.g., to close dropdown)
    if (onClick) {
      onClick()
    }

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceType, // Use the prop value
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.url) {
        // Validate URL before redirecting
        try {
          new URL(data.url)
          // Redirect to Stripe Checkout
          window.location.href = data.url
        } catch (urlError) {
          throw new Error('Invalid checkout URL received from server')
        }
      } else {
        throw new Error(data.error || 'Failed to create checkout session. Please try again.')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      console.error('[CheckoutButton] Error:', err)
      alert(errorMessage)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  )
}
