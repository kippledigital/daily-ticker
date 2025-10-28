#!/bin/bash
# Quick Test Script for Daily Ticker Archive
# Run this after Vercel KV is connected

echo "🧪 Testing Daily Ticker Archive Integration"
echo "============================================"
echo ""

# Your Vercel URL
VERCEL_URL="https://daily-ticker.vercel.app"

echo "📍 Testing Vercel deployment..."
curl -I $VERCEL_URL 2>&1 | grep "HTTP/2 200" && echo "✅ Site is live!" || echo "❌ Site is not responding"
echo ""

echo "📋 Testing Archive List API..."
curl -s $VERCEL_URL/api/archive/list | grep -q "success" && echo "✅ Archive API is working!" || echo "⚠️  Archive API returned error (KV not connected yet?)"
echo ""

echo "📝 Sending test brief to database..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $VERCEL_URL/api/archive/store \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-27",
    "subject": "🧪 Test Brief — Vercel URL Test",
    "htmlContent": "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\"><h1>Test Brief</h1><p>Testing archive integration with Vercel URL.</p><h2>Market Overview</h2><p>This is a test brief to verify the webhook endpoint works correctly.</p></div>",
    "tldr": "Testing the archive webhook integration with Vercel deployment URL.",
    "actionableCount": 2,
    "stocks": [
      {
        "ticker": "AAPL",
        "sector": "Tech",
        "confidence": 85,
        "riskLevel": "Low",
        "action": "HOLD",
        "entryPrice": 178.45,
        "entryZoneLow": 175.00,
        "entryZoneHigh": 180.00,
        "summary": "Apple holds steady with strong iPhone demand.",
        "whyMatters": "China sales exceeded expectations.",
        "momentumCheck": "Sideways →",
        "actionableInsight": "Wait for dip to $175 before adding.",
        "allocation": "5-10%",
        "cautionNotes": "Watch Q4 guidance.",
        "learningMoment": "P/E ratios help compare valuations."
      },
      {
        "ticker": "NVDA",
        "sector": "Tech",
        "confidence": 72,
        "riskLevel": "Medium",
        "action": "WATCH",
        "entryPrice": 495.22,
        "entryZoneLow": 480.00,
        "entryZoneHigh": 500.00,
        "summary": "Slight pullback after recent rally.",
        "whyMatters": "Stock up 40% over past quarter.",
        "momentumCheck": "Cooling 📉",
        "actionableInsight": "Dip below $480 may be buying opportunity.",
        "allocation": "3-8%",
        "cautionNotes": "High valuation, sensitive to corrections.",
        "learningMoment": "RSI above 70 signals overbought conditions."
      }
    ]
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "201" ]; then
  echo "✅ Success! Brief stored in database (HTTP 201)"
  echo "$BODY" | grep -q "success" && echo "✅ Response confirms success"
elif [ "$HTTP_CODE" = "409" ]; then
  echo "⚠️  Brief already exists (HTTP 409) - This is OK if you ran this test before"
else
  echo "❌ Failed with HTTP $HTTP_CODE"
  echo "Response: $BODY"
fi
echo ""

echo "🌐 Checking archive page..."
curl -s $VERCEL_URL/archive | grep -q "Brief Archive" && echo "✅ Archive page loads!" || echo "❌ Archive page not loading"
echo ""

echo "🔍 Verifying brief appears in archive list..."
curl -s $VERCEL_URL/api/archive/list | grep -q "2025-10-27" && echo "✅ Test brief found in archive!" || echo "⚠️  Brief not found (may need to refresh)"
echo ""

echo "============================================"
echo "✅ Testing complete!"
echo ""
echo "Next steps:"
echo "1. Visit: $VERCEL_URL/archive"
echo "2. Verify the test brief appears in the list"
echo "3. Click on it to see the full brief page"
echo "4. Update Gumloop with Vercel URL (see GUMLOOP_URL_UPDATE.txt)"
echo ""
