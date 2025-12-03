'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, TrendingDown, CheckCircle2, XCircle, Clock, BarChart3, Target, ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubscribeForm } from '@/components/subscribe-form';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { createClient } from '@/lib/supabase-auth';
import { PremiumBadge } from '@/components/premium-badge';
import type { TickerPick, TickerMetrics, RelatedTickerWithMetrics } from '@/lib/data/get-ticker-data';

interface TickerPageClientProps {
  ticker: string;
  picks: TickerPick[];
  metrics: TickerMetrics;
  sector: string;
  relatedTickers: RelatedTickerWithMetrics[];
}

export function TickerPageClient({
  ticker,
  picks,
  metrics,
  sector,
  relatedTickers,
}: TickerPageClientProps) {
  const [showAllPicks, setShowAllPicks] = useState(false);
  const displayedPicks = showAllPicks ? picks : picks.slice(0, 5);
  const [userTier, setUserTier] = useState<'free' | 'premium'>('free');

  // Fetch user tier to gate Pro-only metrics like confidence scores
  useEffect(() => {
    const supabase = createClient();

    async function getUserTier() {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.email) {
        const { data: subscriber, error } = await supabase
          .from('subscribers')
          .select('tier')
          .eq('email', session.user.email)
          .single();

        if (!error && subscriber) {
          setUserTier(subscriber.tier === 'premium' ? 'premium' : 'free');
        }
      }
    }

    getUserTier();
  }, []);

  const formatDate = (dateStr: string) => {
    // Debug logging
    if (!dateStr || dateStr.trim() === '') {
      return 'Date TBD';
    }
    
    try {
      // Handle various date formats
      let dateOnly = dateStr;
      
      // If it's already a Date object string representation, extract the date part
      if (dateStr.includes('T')) {
        dateOnly = dateStr.split('T')[0];
      } else if (dateStr.includes(' ')) {
        dateOnly = dateStr.split(' ')[0];
      }
      
      // Try parsing as YYYY-MM-DD
      const parts = dateOnly.split('-');
      
      if (parts.length === 3) {
        const [year, month, day] = parts.map(Number);
        
        // Basic validation
        if (!isNaN(year) && !isNaN(month) && !isNaN(day) && year > 2000 && year < 2100) {
          const date = new Date(year, month - 1, day);
          
          // Check if date is valid
          if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
            return date.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
          }
        }
      }
      
      // Fallback: try parsing as a Date object
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      
      console.warn('[formatDate] Could not parse date:', dateStr, 'type:', typeof dateStr);
      return 'N/A';
    } catch (error) {
      console.error('[formatDate] Error formatting date:', dateStr, error);
      return 'N/A';
    }
  };

  const formatReturn = (returnPercent: number | null) => {
    if (returnPercent === null) return 'N/A';
    const sign = returnPercent >= 0 ? '+' : '';
    return `${sign}${returnPercent.toFixed(1)}%`;
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'win':
        return <CheckCircle2 className="w-5 h-5 text-[#00ff88]" />;
      case 'loss':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'open':
        return <Clock className="w-5 h-5 text-blue-400" />;
      default:
        return null;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'win':
        return 'text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/30';
      case 'loss':
        return 'text-red-400 bg-red-400/10 border border-red-400/30';
      case 'open':
        return 'text-blue-400 bg-blue-400/10 border border-blue-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border border-gray-400/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1E32]">
      <SiteHeader />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-12">
          <Link href="/" className="hover:text-[#00ff88] transition-colors flex items-center gap-1">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-500">Stocks</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white font-medium">{ticker}</span>
        </nav>

        {/* Hero Section - REDESIGNED with improved visual hierarchy */}
        <section className="mb-12">
          <div className="text-center">
            {/* Ticker Symbol Badge */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border-2 border-[#00ff88]/30 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-[#00ff88] font-mono">{ticker}</span>
              </div>
            </div>

            {/* Performance Badge */}
            {metrics.winRate >= 70 && metrics.totalPicks >= 5 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00ff88]/20 border border-[#00ff88]/40 rounded-full text-sm font-bold text-[#00ff88] mb-4">
                ⭐ High Win Rate - {metrics.winRate}%
              </div>
            )}

            {/* H1 Headline */}
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Daily {ticker} Stock Picks with Proven Results
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Get data-driven {ticker} analysis delivered free every trading day
            </p>

            {/* Stats Row - Social Proof */}
            {metrics.totalPicks > 0 && (
              <div className="flex items-center justify-center gap-6 mb-10 text-sm text-gray-400 flex-wrap">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#00ff88]" />
                  <span>{metrics.totalPicks} pick{metrics.totalPicks !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#00ff88]" />
                  <span>{metrics.winRate}% win rate</span>
                </div>
                {metrics.avgReturn !== 0 && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#00ff88]" />
                    <span>{formatReturn(metrics.avgReturn)} avg return</span>
                  </div>
                )}
              </div>
            )}

            {/* PRIMARY CTA - Subscribe Form with 60/40 layout matching homepage */}
            <div className="max-w-2xl mx-auto mb-6">
              <SubscribeForm
                variant="large"
                placeholder={`Get ${ticker} picks delivered daily`}
                buttonText="Get Free Picks"
              />
            </div>

            {/* Trust Indicators - MOVED BELOW FORM for better hierarchy */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
                <span>Daily Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
                <span>Unsubscribe Anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* Track Record Section */}
        {metrics.totalPicks > 0 && (
          <section className="mb-12" itemScope itemType="https://schema.org/FinancialProduct">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white" id="track-record">
                Our {ticker} Track Record
              </h2>
              <div className="text-xs text-gray-500">
                Updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            
            {/* Descriptive text for SEO */}
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              We&apos;ve been tracking {ticker} stock picks and providing daily analysis to help investors make informed decisions. 
              Our {ticker} newsletter delivers free stock picks with entry prices, exit targets, and performance tracking. 
              {metrics.totalPicks > 3 && ` See our complete ${ticker} track record below with ${metrics.totalPicks} picks and ${metrics.winRate}% win rate.`}
            </p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#1a3a52] border border-[#1a3a52] rounded-lg p-6">
                <div className="text-sm text-gray-400 mb-1">Total Picks</div>
                <div className="text-2xl font-bold text-white">{metrics.totalPicks}</div>
              </div>
              <div className="bg-[#1a3a52] border border-[#1a3a52] rounded-lg p-6">
                <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                <div className="text-2xl font-bold text-[#00ff88]">{metrics.winRate}%</div>
              </div>
              <div className="bg-[#1a3a52] border border-[#1a3a52] rounded-lg p-6">
                <div className="text-sm text-gray-400 mb-1">Avg Return</div>
                <div className={cn(
                  "text-2xl font-bold",
                  metrics.avgReturn >= 0 ? "text-[#00ff88]" : "text-red-400"
                )}>
                  {formatReturn(metrics.avgReturn)}
                </div>
              </div>
              <div className="bg-[#1a3a52] border border-[#1a3a52] rounded-lg p-6">
                <div className="text-sm text-gray-400 mb-1">Open Positions</div>
                <div className="text-2xl font-bold text-blue-400">{metrics.totalOpen}</div>
              </div>
            </div>

            {/* Empty State for All Open Positions */}
            {metrics.totalPicks > 0 && metrics.totalOpen === metrics.totalPicks && (
              <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Clock className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-400 mb-2">
                      All {ticker} Positions Currently Open
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">
                      We&apos;re tracking {metrics.totalOpen} active {ticker} position{metrics.totalOpen !== 1 ? 's' : ''}.
                      Subscribe to get exit alerts and performance updates.
                    </p>
                    <div className="text-xs text-gray-400">
                      💡 Win rate will be calculated once positions close
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Best/Worst Picks */}
            {(metrics.bestPick || metrics.worstPick) && (
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {metrics.bestPick && (
                  <div className="bg-[#1a3a52]/50 border border-[#00ff88]/30 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-[#00ff88]" />
                      <span className="font-semibold text-[#00ff88]">Best Pick</span>
                    </div>
                    <div className="text-2xl font-bold text-[#00ff88] mb-1">
                      {formatReturn(metrics.bestPick.returnPercent)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDate(metrics.bestPick.date)}
                    </div>
                  </div>
                )}
                {metrics.worstPick && (
                  <div className="bg-[#1a3a52]/50 border border-red-400/30 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-red-400" />
                      <span className="font-semibold text-red-400">Worst Pick</span>
                    </div>
                    <div className="text-2xl font-bold text-red-400 mb-1">
                      {formatReturn(metrics.worstPick.returnPercent)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDate(metrics.worstPick.date)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Latest Pick Section */}
        {metrics.latestPick && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4" id="latest-pick">
              Latest {ticker} Pick
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              Our most recent {ticker} stock pick with entry price, performance, and analysis. 
              Subscribe to get {ticker} picks delivered daily with complete technical analysis.
            </p>
            <div className="bg-[#1a3a52] border border-[#1a3a52] rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getOutcomeIcon(metrics.latestPick.outcome)}
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      getOutcomeColor(metrics.latestPick.outcome)
                    )}>
                      {metrics.latestPick.outcome.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mb-1 font-mono">
                    {formatDate(metrics.latestPick.briefDate)}
                  </div>
                  <div className="text-lg font-semibold text-white mb-2">
                    {metrics.latestPick.briefSubject}
                  </div>
                </div>
                {metrics.latestPick.returnPercent !== null && (
                  <div className={cn(
                    "text-2xl font-bold",
                    metrics.latestPick.returnPercent >= 0 ? "text-[#00ff88]" : "text-red-400"
                  )}>
                    {formatReturn(metrics.latestPick.returnPercent)}
                  </div>
                )}
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">{metrics.latestPick.summary}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <div className="text-gray-400 mb-1">Entry Price</div>
                  <div className="font-semibold text-white font-mono">${metrics.latestPick.entryPrice.toFixed(2)}</div>
                </div>
                {metrics.latestPick.exitPrice && (
                  <div>
                    <div className="text-gray-400 mb-1">Exit Price</div>
                    <div className="font-semibold text-white font-mono">${metrics.latestPick.exitPrice.toFixed(2)}</div>
                  </div>
                )}
                <div>
                  <div className="text-gray-400 mb-1">Confidence</div>
                  <div className="font-semibold text-white">
                    {userTier === 'premium'
                      ? `${metrics.latestPick.confidence}%`
                      : <PremiumBadge size="sm" />}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Risk Level</div>
                  <div className="font-semibold text-white capitalize">{metrics.latestPick.riskLevel}</div>
                </div>
              </div>
              {metrics.latestPick.briefDate ? (
                <Link
                  href={`/archive/${metrics.latestPick.briefDate}`}
                  className="inline-flex items-center gap-2 text-[#00ff88] hover:text-[#00dd77] font-medium transition-colors"
                >
                  See full analysis <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="text-gray-500 text-sm">Full analysis coming soon</span>
              )}
            </div>
          </section>
        )}

        {/* Historical Picks Table */}
        {picks.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4" id="historical-picks">
              All {ticker} Picks
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              Complete history of all {ticker} stock picks with entry prices, exit prices, returns, and performance metrics. 
              Track our {ticker} newsletter performance over time.
            </p>
            <div className="bg-[#1a3a52] border border-[#1a3a52] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0B1E32] border-b border-[#1a3a52]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Entry</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Exit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Return</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a3a52]">
                    {displayedPicks.map((pick) => (
                      <tr key={pick.id} className="hover:bg-[#0B1E32]/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                          {formatDate(pick.briefDate)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-white font-mono">
                          ${pick.entryPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400 font-mono">
                          {pick.exitPrice ? `$${pick.exitPrice.toFixed(2)}` : '-'}
                        </td>
                        <td className={cn(
                          "px-4 py-3 text-sm font-medium",
                          pick.returnPercent !== null && pick.returnPercent >= 0 ? "text-[#00ff88]" : 
                          pick.returnPercent !== null ? "text-red-400" : "text-gray-500"
                        )}>
                          {formatReturn(pick.returnPercent)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            getOutcomeColor(pick.outcome)
                          )}>
                            {pick.outcome.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {pick.briefDate ? (
                            <Link
                              href={`/archive/${pick.briefDate}`}
                              className="text-[#00ff88] hover:text-[#00dd77] text-sm font-medium transition-colors"
                            >
                              View →
                            </Link>
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {picks.length > 5 && (
                <div className="border-t border-[#1a3a52] bg-[#0B1E32] px-4 py-3 text-center">
                  <button
                    onClick={() => setShowAllPicks(!showAllPicks)}
                    className="text-[#00ff88] hover:text-[#00dd77] font-medium text-sm transition-colors"
                  >
                    {showAllPicks ? 'Show Less' : `Show All ${picks.length} Picks`}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Pro Tier Teaser - Comparison Layout */}
        <section className="mb-12">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border border-[#00ff88]/20 rounded-xl p-8 md:p-10">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#00ff88]/5 rounded-full blur-3xl -z-10" />

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#00ff88]/20 border border-[#00ff88]/40 rounded-full text-xs font-bold text-[#00ff88] mb-4">
                <Target className="w-3.5 h-3.5" />
                PRO FEATURES
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                See What You&apos;re Missing
              </h3>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Upgrade to Pro and get the complete {ticker} analysis with actionable insights
              </p>
            </div>

            {/* Comparison Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {/* FREE Column */}
              <div className="bg-[#0B1E32]/60 border border-gray-700/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-lg font-bold text-gray-300">Free Tier</h4>
                  <span className="text-xs text-gray-500 font-semibold px-2.5 py-1 bg-gray-700/50 rounded">
                    CURRENT
                  </span>
                </div>
                <ul className="space-y-3.5">
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>Daily email with picks</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>Basic stock recommendations</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>Historical performance data</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-400 opacity-40">
                    <XCircle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    <span>No technical analysis</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-400 opacity-40">
                    <XCircle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    <span>No price targets or stop-loss</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-400 opacity-40">
                    <XCircle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    <span>No real-time alerts</span>
                  </li>
                </ul>
              </div>

              {/* PRO Column */}
              <div className="relative bg-gradient-to-br from-[#00ff88]/10 to-[#00dd77]/5 border-2 border-[#00ff88]/40 rounded-lg p-6 shadow-lg shadow-[#00ff88]/10">
                {/* Premium badge */}
                <div className="absolute -top-3 -right-3 bg-[#00ff88] text-[#0B1E32] text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  RECOMMENDED
                </div>

                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-lg font-bold text-white">Pro Tier</h4>
                  <span className="text-xs text-[#00ff88] font-semibold px-2.5 py-1 bg-[#00ff88]/20 rounded">
                    UPGRADE
                  </span>
                </div>
                <ul className="space-y-3.5">
                  <li className="flex items-start gap-3 text-sm text-white">
                    <CheckCircle2 className="w-4 h-4 text-[#00ff88] flex-shrink-0 mt-0.5" />
                    <span className="font-medium">Everything in Free, plus:</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-[#00ff88] flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Complete technical analysis</strong> with charts</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-[#00ff88] flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Price targets & stop-loss levels</strong> for risk management</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-[#00ff88] flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Real-time position updates</strong> and exit alerts</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-[#00ff88] flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Advanced market insights</strong> and sector analysis</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-[#00ff88] flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Priority support</strong> and exclusive content</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <a
                href="/#pricing"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] font-bold rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#00ff88]/30 text-lg"
              >
                Upgrade to Pro — $10/month
                <ArrowRight className="w-5 h-5" />
              </a>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-400 flex-wrap">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
                  <span>60-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
                  <span>Instant access</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Stocks */}
        {relatedTickers.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Other {sector} Stocks We Cover
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedTickers.map((relatedTicker) => (
                <Link
                  key={relatedTicker.ticker}
                  href={`/stocks/${relatedTicker.ticker}`}
                  className="group bg-[#1a3a52] border border-[#1a3a52] hover:border-[#00ff88] rounded-lg p-4 transition-all hover:shadow-lg hover:shadow-[#00ff88]/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-white group-hover:text-[#00ff88] transition-colors">
                      {relatedTicker.ticker}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#00ff88] transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400">{relatedTicker.totalPicks} pick{relatedTicker.totalPicks !== 1 ? 's' : ''}</span>
                      {relatedTicker.winRate > 0 && (
                        <span className={cn(
                          "font-semibold",
                          relatedTicker.winRate >= 70 ? "text-[#00ff88]" : 
                          relatedTicker.winRate >= 50 ? "text-yellow-400" : "text-gray-400"
                        )}>
                          {relatedTicker.winRate}% win rate
                        </span>
                      )}
                    </div>
                    {relatedTicker.avgReturn !== 0 && (
                      <div className={cn(
                        "text-xs font-medium",
                        relatedTicker.avgReturn >= 0 ? "text-[#00ff88]" : "text-red-400"
                      )}>
                        {relatedTicker.avgReturn > 0 ? '+' : ''}{relatedTicker.avgReturn.toFixed(1)}% avg return
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-[#1a3a52] to-[#0B1E32] border border-[#1a3a52] rounded-lg p-12 text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Never Miss a {ticker} Pick
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Get data-driven {ticker} analysis delivered free every trading day at 8 AM EST
          </p>
          <div className="max-w-md mx-auto">
            <SubscribeForm
              placeholder="Enter your email"
              buttonText="Get Free Picks"
            />
          </div>
        </section>

        {/* Legal Disclaimers */}
        <section className="border-t border-[#1a3a52] pt-8 mb-12">
          <div className="bg-[#1a3a52]/30 rounded-lg p-6 text-xs text-gray-500 leading-relaxed">
            <p className="mb-3 font-semibold text-gray-400">Important Disclaimers</p>
            <p className="mb-3">
              <strong>Not Investment Advice:</strong> The information provided on this page, including historical performance data, stock picks, and analysis, is for informational and educational purposes only. It does not constitute investment advice, financial advice, trading advice, or any other sort of advice. Daily Ticker is not a registered investment advisor.
            </p>
            <p className="mb-3">
              <strong>Past Performance:</strong> Past performance is not indicative of future results. The historical win rates, returns, and metrics displayed on this page represent outcomes from specific market conditions and may not be replicated in the future. All investments carry risk, including the potential loss of principal.
            </p>
            <p className="mb-3">
              <strong>Do Your Own Research:</strong> You should always conduct your own research and consult with qualified financial professionals before making any investment decisions. Daily Ticker assumes no responsibility for investment decisions made based on information provided on this website.
            </p>
            <p className="mb-3">
              <strong>No Guarantees:</strong> There is no guarantee that any stock pick, strategy, or investment will be profitable or will not result in losses. Market conditions are unpredictable, and outcomes vary.
            </p>
            <p>
              <strong>Accuracy of Information:</strong> While we strive to provide accurate and up-to-date information, Daily Ticker makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information displayed.
            </p>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}

