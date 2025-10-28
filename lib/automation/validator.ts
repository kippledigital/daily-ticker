import { StockAnalysis, ValidatedStock } from '@/types/automation';

/**
 * Validates stock analysis JSON
 * Replicates Gumloop "Validation Check" node logic
 *
 * Parse this stock JSON and extract the stock object from any JSON wrapper/array.
 * Validate it has ALL required fields with real values (no UNKNOWN/N/A).
 * If missing ANY field or has invalid data, return: {}
 * If valid, return ONLY the single stock object (not wrapped in array).
 */
export function validateStockAnalysis(response: unknown): ValidatedStock | null {
  try {
    // Parse JSON if string
    let data = response;
    if (typeof response === 'string') {
      data = JSON.parse(response);
    }

    // Extract stock object from array wrapper if present
    let stockObject: any;
    if (Array.isArray(data)) {
      if (data.length === 0) return null;
      stockObject = data[0];
    } else if (typeof data === 'object' && data !== null) {
      // Check if it's wrapped in a response/data field
      if ('data' in data) {
        stockObject = (data as any).data;
      } else if ('stock' in data) {
        stockObject = (data as any).stock;
      } else {
        stockObject = data;
      }
    } else {
      return null;
    }

    // Required fields
    const requiredFields: (keyof StockAnalysis)[] = [
      'ticker',
      'confidence',
      'risk_level',
      'last_price',
      'avg_volume',
      'sector',
      'summary',
      'why_matters',
      'momentum_check',
      'actionable_insight',
      'suggested_allocation',
      'why_trust',
      'caution_notes',
      'ideal_entry_zone',
      'mini_learning_moment',
    ];

    // Check all required fields exist
    for (const field of requiredFields) {
      if (!(field in stockObject)) {
        console.error(`Validation failed: Missing field "${field}"`);
        return null;
      }

      const value = stockObject[field];

      // Check for invalid placeholder values
      if (
        value === null ||
        value === undefined ||
        value === '' ||
        value === 'UNKNOWN' ||
        value === 'N/A' ||
        value === 'n/a' ||
        value === 'unknown'
      ) {
        console.error(`Validation failed: Invalid value for field "${field}": ${value}`);
        return null;
      }
    }

    // Validate specific field types and values
    const stock = stockObject as StockAnalysis;

    // confidence must be 0-100
    if (typeof stock.confidence !== 'number' || stock.confidence < 0 || stock.confidence > 100) {
      console.error(`Validation failed: confidence must be 0-100, got ${stock.confidence}`);
      return null;
    }

    // risk_level must be exactly: Low, Medium, or High
    if (!['Low', 'Medium', 'High'].includes(stock.risk_level)) {
      console.error(`Validation failed: risk_level must be Low/Medium/High, got ${stock.risk_level}`);
      return null;
    }

    // last_price and avg_volume must be numbers
    if (typeof stock.last_price !== 'number' || stock.last_price <= 0) {
      console.error(`Validation failed: last_price must be positive number, got ${stock.last_price}`);
      return null;
    }

    if (typeof stock.avg_volume !== 'number' || stock.avg_volume <= 0) {
      console.error(`Validation failed: avg_volume must be positive number, got ${stock.avg_volume}`);
      return null;
    }

    // sector must be valid
    const validSectors = [
      'Technology',
      'Healthcare',
      'Energy',
      'Finance',
      'Consumer',
      'Industrial',
      'Materials',
      'Real Estate',
      'Utilities',
      'Communication',
      'Other',
    ];

    if (!validSectors.includes(stock.sector)) {
      console.error(`Validation failed: Invalid sector "${stock.sector}"`);
      return null;
    }

    // All validations passed - return the stock object
    return stock as ValidatedStock;
  } catch (error) {
    console.error('Validation error:', error);
    return null;
  }
}

/**
 * Validates multiple stock analyses
 * Returns only valid stocks, filters out invalid ones
 */
export function validateStockAnalyses(responses: unknown[]): ValidatedStock[] {
  const validatedStocks: ValidatedStock[] = [];

  for (const response of responses) {
    const validated = validateStockAnalysis(response);
    if (validated) {
      validatedStocks.push(validated);
    }
  }

  return validatedStocks;
}
