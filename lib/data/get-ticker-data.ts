import { supabase } from '@/lib/supabase';

export interface TickerPick {
  id: string;
  date: string;
  entryPrice: number;
  exitPrice: number | null;
  returnPercent: number | null;
  outcome: 'win' | 'loss' | 'open';
  sector: string;
  confidence: number;
  riskLevel: string;
  action: string;
  summary: string;
  briefSubject: string;
  briefDate: string;
}

export interface TickerMetrics {
  totalPicks: number;
  totalWins: number;
  totalLosses: number;
  totalOpen: number;
  winRate: number;
  avgReturn: number;
  avgWin: number;
  avgLoss: number;
  bestPick: { returnPercent: number; date: string } | null;
  worstPick: { returnPercent: number; date: string } | null;
  latestPick: TickerPick | null;
}

/**
 * Get all picks for a specific ticker
 */
export async function getTickerPicks(ticker: string): Promise<TickerPick[]> {
  // Fetch stocks first
  const { data: stocks, error: stocksError } = await supabase
    .from('stocks')
    .select(`
      id,
      ticker,
      sector,
      confidence,
      risk_level,
      action,
      entry_price,
      summary,
      brief_id
    `)
    .eq('ticker', ticker.toUpperCase())
    .order('created_at', { ascending: false });

  if (stocksError) {
    console.error(`Error fetching stocks for ${ticker}:`, stocksError);
    return [];
  }

  if (!stocks || stocks.length === 0) {
    console.log(`No stocks found for ${ticker}`);
    return [];
  }

  console.log(`Found ${stocks.length} stocks for ${ticker}`);

  // Get unique brief IDs
  const briefIds = [...new Set(stocks.map((s: any) => s.brief_id).filter(Boolean))];
  
  // Fetch briefs
  let briefMap = new Map();
  if (briefIds.length > 0) {
    const { data: briefs, error: briefsError } = await supabase
      .from('briefs')
      .select('id, date, subject_premium')
      .in('id', briefIds);

    if (briefsError) {
      console.error(`Error fetching briefs for ${ticker}:`, briefsError);
    } else if (briefs && briefs.length > 0) {
      console.log(`Found ${briefs.length} briefs for ${ticker}`);
      briefMap = new Map(briefs.map((b: any) => [b.id, b]));
    } else {
      console.warn(`No briefs found for brief IDs:`, briefIds);
    }
  }

  // Combine stocks with their briefs
  const stocksWithBriefs = stocks.map((stock: any) => ({
    ...stock,
    brief: briefMap.get(stock.brief_id) || {},
  }));

  // Fetch performance data
  const stockIds = stocksWithBriefs.map((s: any) => s.id);
  const { data: performances } = await supabase
    .from('stock_performance')
    .select('stock_id, entry_date, entry_price, exit_date, exit_price, return_percent, outcome')
    .in('stock_id', stockIds);

  // Create performance lookup
  const perfMap = new Map((performances || []).map((p: any) => [p.stock_id, p]));

  // Combine data
  return stocksWithBriefs.map((stock: any) => {
    const brief = stock.brief || {};
    const performance = perfMap.get(stock.id);

    // Extract date from brief - handle various formats
    let briefDate = '';
    if (brief.date) {
      // PostgreSQL DATE returns as string in YYYY-MM-DD format
      if (typeof brief.date === 'string') {
        briefDate = brief.date.split('T')[0].split(' ')[0]; // Remove time if present
      } else if (brief.date instanceof Date) {
        // If it's a Date object, format it
        briefDate = brief.date.toISOString().split('T')[0];
      }
    }

    // Debug logging
    if (!briefDate && brief.id) {
      console.log(`[getTickerPicks] Brief ${brief.id} has no date. Brief data:`, {
        id: brief.id,
        date: brief.date,
        dateType: typeof brief.date,
        hasSubject: !!brief.subject_premium || !!brief.subject,
      });
    }

    return {
      id: stock.id,
      date: briefDate,
      entryPrice: performance?.entry_price || stock.entry_price,
      exitPrice: performance?.exit_price || null,
      returnPercent: performance?.return_percent || null,
      outcome: (performance?.outcome as 'win' | 'loss' | 'open') || 'open',
      sector: stock.sector,
      confidence: stock.confidence,
      riskLevel: stock.risk_level,
      action: stock.action,
      summary: stock.summary,
      briefSubject: brief.subject_premium || '',
      briefDate: briefDate,
    };
  }).sort((a, b) => {
    // Sort by briefDate descending (use briefDate as primary, since date field is unreliable)
    if (!a.briefDate && !b.briefDate) return 0;
    if (!a.briefDate) return 1;
    if (!b.briefDate) return -1;
    return new Date(b.briefDate).getTime() - new Date(a.briefDate).getTime();
  });
}

/**
 * Calculate metrics for a ticker
 */
export function calculateTickerMetrics(picks: TickerPick[]): TickerMetrics {
  if (picks.length === 0) {
    return {
      totalPicks: 0,
      totalWins: 0,
      totalLosses: 0,
      totalOpen: 0,
      winRate: 0,
      avgReturn: 0,
      avgWin: 0,
      avgLoss: 0,
      bestPick: null,
      worstPick: null,
      latestPick: null,
    };
  }

  // Data validation - log warnings for suspicious data
  picks.forEach((pick, index) => {
    if (pick.returnPercent !== null && (pick.returnPercent < -100 || pick.returnPercent > 1000)) {
      console.warn(`[Data Validation] Suspicious return for pick ${index}:`, {
        ticker: pick.id,
        return: pick.returnPercent,
        entry: pick.entryPrice,
        exit: pick.exitPrice,
      });
    }
    if (pick.entryPrice <= 0) {
      console.warn(`[Data Validation] Invalid entry price for pick ${index}:`, pick.entryPrice);
    }
  });

  const closedPicks = picks.filter(p => p.outcome !== 'open');
  const wins = picks.filter(p => p.outcome === 'win');
  const losses = picks.filter(p => p.outcome === 'loss');
  const open = picks.filter(p => p.outcome === 'open');

  const winRate = closedPicks.length > 0
    ? Math.round((wins.length / closedPicks.length) * 100)
    : 0;

  // Validate win rate is within bounds
  if (winRate < 0 || winRate > 100) {
    console.error(`[Data Validation] Invalid win rate calculated: ${winRate}%`, {
      wins: wins.length,
      closed: closedPicks.length,
    });
  }

  const avgReturn = closedPicks.length > 0
    ? closedPicks.reduce((sum, p) => sum + (p.returnPercent || 0), 0) / closedPicks.length
    : 0;

  const avgWin = wins.length > 0
    ? wins.reduce((sum, p) => sum + (p.returnPercent || 0), 0) / wins.length
    : 0;

  const avgLoss = losses.length > 0
    ? losses.reduce((sum, p) => sum + (p.returnPercent || 0), 0) / losses.length
    : 0;

  const closedWithReturns = closedPicks.filter(p => p.returnPercent !== null);
  const bestPick = closedWithReturns.length > 0
    ? closedWithReturns.reduce((best, p) => 
        (p.returnPercent || 0) > (best.returnPercent || 0) ? p : best
      )
    : null;

  const worstPick = closedWithReturns.length > 0
    ? closedWithReturns.reduce((worst, p) => 
        (p.returnPercent || 0) < (worst.returnPercent || 0) ? p : worst
      )
    : null;

  return {
    totalPicks: picks.length,
    totalWins: wins.length,
    totalLosses: losses.length,
    totalOpen: open.length,
    winRate,
    avgReturn: Math.round(avgReturn * 10) / 10,
    avgWin: Math.round(avgWin * 10) / 10,
    avgLoss: Math.round(avgLoss * 10) / 10,
    bestPick: bestPick ? {
      returnPercent: bestPick.returnPercent || 0,
      date: bestPick.briefDate, // Use briefDate instead of date
    } : null,
    worstPick: worstPick ? {
      returnPercent: worstPick.returnPercent || 0,
      date: worstPick.briefDate, // Use briefDate instead of date
    } : null,
    latestPick: picks[0] || null,
  };
}

/**
 * Get related tickers (other stocks in same sector)
 */
export async function getRelatedTickers(
  ticker: string,
  sector: string,
  limit: number = 5
): Promise<string[]> {
  const { data, error } = await supabase
    .from('stocks')
    .select('ticker')
    .eq('sector', sector)
    .neq('ticker', ticker.toUpperCase())
    .limit(limit);

  if (error || !data) {
    return [];
  }

  // Get unique tickers
  const uniqueTickers = Array.from(new Set(data.map((s: any) => s.ticker)));
  return uniqueTickers.slice(0, limit);
}

