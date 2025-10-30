// Types for Daily Ticker automation system
// Matches Gumloop output structure

export interface StockAnalysis {
  ticker: string;
  confidence: number; // 0-100
  risk_level: 'Low' | 'Medium' | 'High';
  last_price: number;
  avg_volume: number;
  sector: 'Technology' | 'Healthcare' | 'Energy' | 'Finance' | 'Consumer' | 'Industrial' | 'Materials' | 'Real Estate' | 'Utilities' | 'Communication' | 'Other';
  summary: string;
  why_matters: string;
  momentum_check: string;
  actionable_insight: string;
  suggested_allocation: string;
  why_trust: string;
  caution_notes: string;
  ideal_entry_zone: string;
  mini_learning_moment: string;
  stop_loss: number; // Price level where trader should exit to limit losses
  profit_target: number; // Price level where trader should take profits (2:1 reward-to-risk)
}

export interface ValidatedStock extends StockAnalysis {
  // After validation, all fields are guaranteed to be present
  trend_symbol?: '📈' | '📉' | '→';
}

export interface DailyBrief {
  date: string; // YYYY-MM-DD
  subject: string;
  htmlContent: string;
  tldr: string;
  actionableCount: number;
  stocks: ValidatedStock[];
}

export interface HistoricalStockData {
  ticker: string;
  date: string;
  analysis?: StockAnalysis;
}

export interface StockDiscoveryConfig {
  numberOfTickers: number;
  focusSectors: string[];
  timeWindow: string; // e.g., "72 hours"
  minPrice?: number;
  minVolume?: number;
  rsiLowerBound?: number;
  rsiUpperBound?: number;
  minPriceChangePercent?: number;
}

export interface NewsData {
  ticker: string;
  summary: string;
  sources: string[];
  relevantNews: string[];
}

export interface AutomationResult {
  success: boolean;
  brief?: DailyBrief;
  error?: string;
  steps: {
    stockDiscovery?: boolean;
    historicalData?: boolean;
    newsGathering?: boolean;
    aiAnalysis?: boolean;
    validation?: boolean;
    trendInjection?: boolean;
    emailGeneration?: boolean;
    emailSending?: boolean;
    archiveStorage?: boolean;
    twitterPosting?: boolean;
  };
}
