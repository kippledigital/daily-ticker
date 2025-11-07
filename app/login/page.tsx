'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase-auth'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
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

  return (
    <div className="min-h-screen bg-[#0B1E32] flex flex-col">
      <SiteHeader />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {/* Back Link */}
          <Link
            href="/archive"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00ff88] transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Archive
          </Link>

          {/* Login Card */}
          <div className="bg-[#1a3a52] border border-[#2a4a62] rounded-2xl p-8">
            {!sent ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00ff88]/10 border-2 border-[#00ff88] rounded-full mb-4">
                    <Mail className="h-8 w-8 text-[#00ff88]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                  <p className="text-gray-400">
                    Enter your email to receive a magic link
                  </p>
                </div>

                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
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
                        <Loader2 className="h-5 w-5 animate-spin" />
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

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400">
                    No password needed. We&apos;ll send you a secure login link.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00ff88]/10 border-2 border-[#00ff88] rounded-full mb-4">
                    <Mail className="h-8 w-8 text-[#00ff88]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                  <p className="text-gray-300 mb-6">
                    We sent a magic link to <strong className="text-[#00ff88]">{email}</strong>
                  </p>

                  <div className="bg-[#0B1E32] border border-[#2a4a62] rounded-lg p-4 mb-6 text-left">
                    <h3 className="text-white font-medium mb-2">Next Steps:</h3>
                    <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
                      <li>Open the email from Daily Ticker</li>
                      <li>Click the magic link button</li>
                      <li>You&apos;ll be automatically logged in</li>
                    </ol>
                  </div>

                  <p className="text-sm text-gray-400 mb-4">
                    Link expires in 15 minutes
                  </p>

                  <button
                    onClick={() => {
                      setSent(false)
                      setEmail('')
                    }}
                    className="text-[#00ff88] hover:text-[#00dd77] text-sm font-medium transition-colors"
                  >
                    Try a different email
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/#pricing" className="text-[#00ff88] hover:text-[#00dd77] font-medium">
                Subscribe to Daily Ticker
              </Link>
            </p>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
