'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, X } from 'lucide-react'
import { createClient } from '@/lib/supabase-auth'

interface LoginModalProps {
  triggerText?: string
  triggerClassName?: string
}

export function LoginModal({
  triggerText = 'Sign in',
  triggerClassName = 'text-sm text-gray-300 hover:text-white transition-colors',
}: LoginModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleMagicLink(e: any) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const normalizedEmail = email.trim().toLowerCase()

      // Only allow Pro subscribers to sign in
      const { data: subscriber, error: lookupError } = await supabase
        .from('subscribers')
        .select('tier, subscription_status')
        .eq('email', normalizedEmail)
        .single()

      const isPremium =
        !lookupError &&
        subscriber &&
        subscriber.tier === 'premium' &&
        subscriber.subscription_status !== 'canceled'

      if (!isPremium) {
        setError(
          "This email isn't on a Pro plan yet. Use the email you used at checkout, or upgrade to Pro first."
        )
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setIsOpen(false)
    setEmail('')
    setSent(false)
    setError(null)
  }

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={triggerClassName}
      >
        {triggerText}
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#061426]/80 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="relative w-full max-w-md bg-[#0B1E32] border border-[#2a4a62] rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white hover:bg-[#1a3a52] rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-6 md:p-8">
                {!sent ? (
                  <>
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00ff88]/10 border-2 border-[#00ff88] rounded-full mb-4">
                        <Mail className="h-8 w-8 text-[#00ff88]" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">Sign in to Pro</h2>
                      <p className="text-gray-400">
                        Use the same email you used at checkout to unlock Pro features in the archive.
                      </p>
                    </div>

                    <form onSubmit={handleMagicLink} className="space-y-4">
                      <div>
                        <label htmlFor="login-email-modal" className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address
                        </label>
                        <input
                          id="login-email-modal"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="w-full px-4 py-3 bg-[#0B1E32] border border-[#2a4a62] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:border-transparent"
                          disabled={loading}
                        />
                      </div>

                      {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-red-400 text-sm">{error}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading || !email}
                        className="w-full px-6 py-3 bg-gradient-to-r from-[#00ff88] to-[#00dd77] text-[#0B1E32] font-bold rounded-lg hover:from-[#00dd77] hover:to-[#00bb66] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Mail className="h-5 w-5 animate-pulse" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="h-5 w-5" />
                            Send Magic Link
                          </>
                        )}
                      </button>
                    </form>

                    <p className="mt-4 text-xs text-gray-500 text-center">
                      No password needed. We&apos;ll send you a secure login link.
                    </p>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00ff88]/10 border-2 border-[#00ff88] rounded-full mb-4">
                      <Mail className="h-8 w-8 text-[#00ff88]" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                    <p className="text-gray-300 mb-4">
                      We sent a magic link to <strong className="text-[#00ff88]">{email}</strong>
                    </p>
                    <p className="text-sm text-gray-400 mb-4">Link expires in 15 minutes.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSent(false)
                        setEmail('')
                      }}
                      className="text-[#00ff88] hover:text-[#00dd77] text-sm font-medium transition-colors"
                    >
                      Try a different email
                    </button>
                  </div>
                )}

                <div className="mt-6 text-center text-sm text-gray-400">
                  Not on Pro yet?{' '}
                  <Link href="/#pricing" className="text-[#00ff88] hover:text-[#00dd77] font-medium">
                    See Pro pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
