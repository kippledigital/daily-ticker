'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Mail } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

// Note: Metadata is exported from metadata.ts since this is a client component

function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');

  const [email, setEmail] = useState(emailParam || '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Auto-unsubscribe if email is in URL
  useEffect(() => {
    if (emailParam) {
      handleUnsubscribe(emailParam);
    }
  }, [emailParam]);

  const handleUnsubscribe = async (emailToUnsubscribe: string) => {
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToUnsubscribe }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Successfully unsubscribed!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to unsubscribe. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to unsubscribe. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      handleUnsubscribe(email);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1E32]">
      <SiteHeader />
      
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="max-w-md w-full bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border border-[#1a3a52] rounded-2xl shadow-xl p-8">
        {status === 'success' ? (
          // Success state
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-[#00ff88]/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-[#00ff88]" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Unsubscribed Successfully</h1>
            <p className="text-gray-300 mb-6">{message}</p>
            <p className="text-sm text-gray-400 mb-6">
              You won&apos;t receive any more emails from Daily Ticker.
            </p>
            <div className="space-y-4">
              <a
                href="/"
                className="block w-full bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-[#00ff88]/30"
              >
                Return to Homepage
              </a>
              <button
                onClick={() => {
                  setStatus('idle');
                  setEmail('');
                  setMessage('');
                }}
                className="block w-full bg-[#1a3a52] hover:bg-[#244a62] text-white font-semibold py-3 px-6 rounded-lg transition-colors border border-[#00ff88]/20"
              >
                Changed your mind? Resubscribe
              </button>
            </div>
          </div>
        ) : (
          // Unsubscribe form
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00ff88]/10 border-2 border-[#00ff88] rounded-full mb-4">
                <Mail className="h-8 w-8 text-[#00ff88]" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Unsubscribe</h1>
              <p className="text-gray-300">
                We&apos;re sorry to see you go. Enter your email to unsubscribe from Daily Ticker.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 bg-[#0B1E32] border border-[#2a4a62] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:border-transparent"
                />
              </div>

              {status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !email}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-[#1a3a52] disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {status === 'loading' ? 'Unsubscribing...' : 'Unsubscribe'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="/" className="text-sm text-gray-400 hover:text-[#00ff88] transition-colors">
                ← Return to homepage
              </a>
            </div>
          </div>
        )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B1E32] flex items-center justify-center">
        <div className="text-[#00ff88]">Loading...</div>
      </div>
    }>
      <UnsubscribeForm />
    </Suspense>
  );
}
