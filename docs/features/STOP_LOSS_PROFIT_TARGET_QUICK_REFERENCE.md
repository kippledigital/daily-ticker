# Stop Loss & Profit Target - Quick Reference

## Overview
Two new critical fields have been added to the Daily Ticker stock analysis system:
- **stop_loss**: Price level where trader should exit to limit losses
- **profit_target**: Price level where trader should take profits

## Field Specifications

### stop_loss
- **Type:** `number` (TypeScript), `DECIMAL(10,2)` (Database)
- **Requirement:** Must be BELOW entry price
- **Typical Range:** 5-10% below entry price
- **Calculation Methods:**
  1. Support Level: Recent swing low or key technical support
  2. ATR Method: `entry_price - (2 × ATR)`
  3. Percentage: `entry_price × 0.92` (8% stop)
- **Default Fallback:** `entry_price × 0.92` (8% below entry)

### profit_target
- **Type:** `number` (TypeScript), `DECIMAL(10,2)` (Database)
- **Requirement:** Must be ABOVE entry price
- **Calculation:** `entry_price + (2 × (entry_price - stop_loss))`
- **Risk/Reward Ratio:** 2:1 (standard)
- **Valid Range:** 1.5:1 to 3:1
- **Default Fallback:** `entry_price × 1.15` (15% above entry, ~2:1)

## Example Calculation

```
Entry Price:    $100.00
Stop Loss:      $92.00  (8% below entry)
Risk:           $8.00 per share

Profit Target:  $116.00 (16% above entry)
Reward:         $16.00 per share

Risk/Reward:    $16 ÷ $8 = 2:1 ✅
```

## Code Examples

### TypeScript Interface
```typescript
export interface StockAnalysis {
  ticker: string;
  last_price: number;
  stop_loss: number;      // NEW
  profit_target: number;  // NEW
  // ... other fields
}
```

### Creating a Stock Analysis
```typescript
const stock: StockAnalysis = {
  ticker: 'AAPL',
  last_price: 269.70,
  stop_loss: 248.16,      // 8% below entry
  profit_target: 312.77,  // 2:1 R/R ratio
  // ... other fields
};
```

### Accessing Fields
```typescript
const risk = stock.last_price - stock.stop_loss;
const reward = stock.profit_target - stock.last_price;
const rrRatio = reward / risk;

console.log(`Risk: $${risk.toFixed(2)}`);
console.log(`Reward: $${reward.toFixed(2)}`);
console.log(`R/R Ratio: ${rrRatio.toFixed(2)}:1`);
```

## Database Schema

### Column Definition
```sql
CREATE TABLE stocks (
  -- ... existing columns ...
  stop_loss DECIMAL(10, 2),
  profit_target DECIMAL(10, 2),
  -- ... other columns ...
);
```

### Inserting Data
```sql
INSERT INTO stocks (
  ticker,
  entry_price,
  stop_loss,
  profit_target
) VALUES (
  'AAPL',
  269.70,
  248.16,
  312.77
);
```

### Querying Data
```sql
SELECT
  ticker,
  entry_price,
  stop_loss,
  profit_target,
  (entry_price - stop_loss) AS risk_amount,
  (profit_target - entry_price) AS reward_amount,
  ((profit_target - entry_price) / (entry_price - stop_loss)) AS rr_ratio
FROM stocks
WHERE date = '2025-10-30';
```

## Validation Rules

### Rule 1: Stop Loss < Entry Price
```typescript
if (stop_loss >= last_price) {
  // Invalid! Adjust to safe default
  stop_loss = last_price * 0.92;
}
```

### Rule 2: Profit Target > Entry Price
```typescript
if (profit_target <= last_price) {
  // Invalid! Calculate proper target
  const risk = last_price - stop_loss;
  profit_target = last_price + (2 * risk);
}
```

### Rule 3: R/R Ratio 1.5:1 to 3:1
```typescript
const rrRatio = (profit_target - last_price) / (last_price - stop_loss);

if (rrRatio < 1.5 || rrRatio > 3.0) {
  // Outside valid range! Adjust to 2:1
  const risk = last_price - stop_loss;
  profit_target = last_price + (2 * risk);
}
```

## API Endpoints

### Test Endpoint
```bash
curl "http://localhost:3001/api/test/validation?ticker=AAPL"
```

### Archive Storage
```bash
curl -X POST http://localhost:3001/api/archive/store \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-30",
    "subject": "Daily Brief",
    "stocks": [{
      "ticker": "AAPL",
      "entryPrice": 269.70,
      "stopLoss": 248.16,
      "profitTarget": 312.77
    }]
  }'
```

## Common Calculations

### Calculate Risk Amount
```typescript
const riskAmount = entryPrice - stopLoss;
const riskPercent = (riskAmount / entryPrice) * 100;
```

### Calculate Reward Amount
```typescript
const rewardAmount = profitTarget - entryPrice;
const rewardPercent = (rewardAmount / entryPrice) * 100;
```

### Calculate Risk/Reward Ratio
```typescript
const rrRatio = rewardAmount / riskAmount;
```

### Calculate Position Size (Risk-Based)
```typescript
const accountSize = 10000;  // $10,000 account
const riskPercentage = 0.02;  // 2% risk per trade
const maxRiskAmount = accountSize * riskPercentage;  // $200

const riskPerShare = entryPrice - stopLoss;
const positionSize = Math.floor(maxRiskAmount / riskPerShare);

console.log(`Position Size: ${positionSize} shares`);
console.log(`Max Risk: $${maxRiskAmount.toFixed(2)}`);
```

## AI Prompt Snippet

The AI uses this instruction to generate the fields:

```
- stop_loss: Calculate using one of these methods:
  (1) Support level: Recent swing low or key support,
  (2) ATR method: last_price - (2 × ATR),
  (3) Percentage: last_price × 0.92 (8% stop).
  Choose based on volatility. Must be BELOW last_price.

- profit_target: Calculate as last_price + (2 × (last_price - stop_loss))
  for 2:1 reward-to-risk ratio. Adjust if exceeds technical resistance.
  Must be ABOVE last_price.

- Ensure: stop_loss < last_price < profit_target
```

## Error Handling

### Missing Fields
```typescript
if (!stock.stop_loss || !stock.profit_target) {
  // Calculate defaults
  stock.stop_loss = stock.last_price * 0.92;
  stock.profit_target = stock.last_price * 1.15;
}
```

### Invalid Values
```typescript
if (stock.stop_loss >= stock.last_price) {
  console.warn(`Invalid stop_loss: ${stock.stop_loss} >= ${stock.last_price}`);
  stock.stop_loss = stock.last_price * 0.92;
}
```

## Testing Commands

### Test AI Generation
```bash
npx tsx -e "
import { analyzeStock } from './lib/automation/ai-analyzer';
import { getRawAggregatedData } from './lib/automation/news-gatherer';

(async () => {
  const data = await getRawAggregatedData('AAPL');
  const analysis = await analyzeStock({
    ticker: 'AAPL',
    financialData: 'Test data',
    historicalWatchlist: '',
    aggregatedData: data
  });
  console.log('Stop Loss:', analysis.stop_loss);
  console.log('Profit Target:', analysis.profit_target);
})();
"
```

### Test Full Pipeline
```bash
curl "http://localhost:3001/api/test/full-pipeline?tickers=AAPL"
```

## Migration Commands

### Apply Migration (Supabase Studio)
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Click "SQL Editor"
3. Copy contents of: `supabase/migrations/add_stop_loss_profit_target.sql`
4. Paste and click "Run"

### Rollback Migration (if needed)
1. Open SQL Editor
2. Copy contents of: `supabase/migrations/rollback_stop_loss_profit_target.sql`
3. Paste and click "Run"

## Best Practices

1. **Always validate** stop_loss and profit_target before storing
2. **Use try-catch** blocks when accessing these fields
3. **Provide defaults** if AI fails to generate values
4. **Log warnings** when validation adjusts values
5. **Display clearly** in user interfaces with risk/reward metrics
6. **Round values** to 2 decimal places for display
7. **Calculate position size** based on risk amount
8. **Monitor accuracy** of AI-generated levels over time

## Future Enhancements

- [ ] Add visual indicators (🛑 stop loss, 🎯 profit target) to email template
- [ ] Track historical accuracy of AI-generated levels
- [ ] Allow user-adjustable risk/reward ratio preferences
- [ ] Add trailing stop loss functionality
- [ ] Generate performance reports (hit rate for stop loss vs profit target)
- [ ] Add alerts when price approaches stop loss or profit target

---

**Last Updated:** 2025-10-30
**Version:** 1.0
