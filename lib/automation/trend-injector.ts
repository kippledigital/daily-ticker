import { ValidatedStock } from '@/types/automation';

/**
 * Injects trend symbols (📈, 📉, →) based on momentum_check analysis
 * Replicates Gumloop "Trend Symbol Injector" node
 *
 * Analyzes the momentum_check field and adds the appropriate trend emoji:
 * - UP 📈 (positive momentum, gains, bullish)
 * - DOWN 📉 (negative momentum, losses, bearish)
 * - SIDEWAYS → (neutral, consolidating, mixed)
 */
export function injectTrendSymbol(stock: ValidatedStock): ValidatedStock {
  const momentum = stock.momentum_check.toLowerCase();

  // Determine trend symbol based on momentum_check keywords
  let trendSymbol: '📈' | '📉' | '→' = '→';

  // Bullish/Up indicators
  const bullishKeywords = [
    'up',
    'gain',
    'rally',
    'bullish',
    'rising',
    'climb',
    'surge',
    'jump',
    'spike',
    'breakout',
    'momentum',
    'strength',
    'positive',
    'strong',
  ];

  // Bearish/Down indicators
  const bearishKeywords = [
    'down',
    'loss',
    'drop',
    'bearish',
    'falling',
    'decline',
    'pullback',
    'retreat',
    'weakness',
    'negative',
    'cooling',
    'correction',
    'sell',
  ];

  // Sideways/Neutral indicators
  const sidewaysKeywords = [
    'sideways',
    'flat',
    'neutral',
    'consolidat',
    'range',
    'mixed',
    'stable',
    'steady',
    'hold',
  ];

  // Check for bullish signals
  if (bullishKeywords.some(keyword => momentum.includes(keyword))) {
    trendSymbol = '📈';
  }
  // Check for bearish signals
  else if (bearishKeywords.some(keyword => momentum.includes(keyword))) {
    trendSymbol = '📉';
  }
  // Check for sideways signals
  else if (sidewaysKeywords.some(keyword => momentum.includes(keyword))) {
    trendSymbol = '→';
  }

  // Return stock with trend_symbol added
  return {
    ...stock,
    trend_symbol: trendSymbol,
  };
}

/**
 * Injects trend symbols for multiple stocks
 */
export function injectTrendSymbols(stocks: ValidatedStock[]): ValidatedStock[] {
  return stocks.map(injectTrendSymbol);
}

/**
 * Gets a text representation of the trend
 */
export function getTrendText(symbol: '📈' | '📉' | '→'): string {
  switch (symbol) {
    case '📈':
      return 'Bullish';
    case '📉':
      return 'Bearish';
    case '→':
      return 'Neutral';
  }
}
