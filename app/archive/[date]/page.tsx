import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { generateArchiveMetadata } from '@/lib/seo/generate-archive-metadata'
import { ArticleSchema } from '@/components/seo/article-schema'
import { ArchivePageClient } from '@/components/archive/archive-page-client'
import type { BriefData } from '@/app/api/archive/store/route'

interface ArchivePageProps {
  params: {
    date: string
  }
}

/**
 * Generate SEO metadata for archive page
 * This runs server-side and provides optimized title, description, and OpenGraph tags
 */
export async function generateMetadata({ params }: ArchivePageProps): Promise<Metadata> {
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(params.date)) {
    return {
      title: 'Invalid Date | Daily Ticker',
    }
  }

  // Fetch brief data
  const { data: brief } = await supabase
    .from('briefs')
    .select(`
      *,
      stocks (*)
    `)
    .eq('date', params.date)
    .single()

  if (!brief) {
    return {
      title: 'Brief Not Found | Daily Ticker',
    }
  }

  // Transform to BriefData format
  const briefData: BriefData = {
    date: (brief as any).date,
    subject: (brief as any).subject_premium || (brief as any).subject,
    tldr: (brief as any).tldr || undefined,
    actionableCount: (brief as any).actionable_count,
    stocks: ((brief as any).stocks as any[]).map((stock) => ({
      ticker: stock.ticker,
      sector: stock.sector,
      confidence: stock.confidence,
      riskLevel: stock.risk_level,
      action: stock.action,
      entryPrice: stock.entry_price,
      entryZoneLow: stock.entry_zone_low || undefined,
      entryZoneHigh: stock.entry_zone_high || undefined,
      stopLoss: stock.stop_loss || undefined,
      profitTarget: stock.profit_target || undefined,
      summary: stock.summary,
      whyMatters: stock.why_matters,
      momentumCheck: stock.momentum_check,
      actionableInsight: stock.actionable_insight,
      allocation: stock.allocation || undefined,
      cautionNotes: stock.caution_notes || undefined,
      learningMoment: stock.learning_moment || undefined,
    })),
  }

  return generateArchiveMetadata(briefData)
}

/**
 * Archive page - Server component for SEO optimization
 * Fetches data server-side and renders with optimized metadata
 */
export default async function ArchivePage({ params }: ArchivePageProps) {
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(params.date)) {
    notFound()
  }

  // Fetch brief data server-side
  const { data: brief, error } = await supabase
    .from('briefs')
    .select(`
      *,
      stocks (*)
    `)
    .eq('date', params.date)
    .single()

  if (error || !brief) {
    notFound()
  }

  // Transform to BriefData format
  const briefData: BriefData = {
    date: (brief as any).date,
    subject: (brief as any).subject_premium || (brief as any).subject,
    htmlContent: (brief as any).html_content_premium || (brief as any).html_content,
    tldr: (brief as any).tldr || undefined,
    actionableCount: (brief as any).actionable_count,
    stocks: ((brief as any).stocks as any[]).map((stock) => ({
      ticker: stock.ticker,
      sector: stock.sector,
      confidence: stock.confidence,
      riskLevel: stock.risk_level,
      action: stock.action,
      entryPrice: stock.entry_price,
      entryZoneLow: stock.entry_zone_low || undefined,
      entryZoneHigh: stock.entry_zone_high || undefined,
      stopLoss: stock.stop_loss || undefined,
      profitTarget: stock.profit_target || undefined,
      summary: stock.summary,
      whyMatters: stock.why_matters,
      momentumCheck: stock.momentum_check,
      actionableInsight: stock.actionable_insight,
      allocation: stock.allocation || undefined,
      cautionNotes: stock.caution_notes || undefined,
      learningMoment: stock.learning_moment || undefined,
    })),
  }

  return (
    <>
      {/* Article schema markup for SEO */}
      <ArticleSchema brief={briefData} />
      
      {/* Client component for interactivity */}
      <ArchivePageClient brief={briefData} />
    </>
  )
}
