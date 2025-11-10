/**
 * Test Archive SEO Implementation
 * 
 * Tests the SEO metadata generation with sample brief data
 */

import { generateArchiveTitle, generateArchiveDescription, generateArchiveMetadata, formatArchiveDate } from '../lib/seo/generate-archive-metadata';
import type { BriefData } from '../app/api/archive/store/route';

// Sample brief data for testing
const sampleBrief: BriefData = {
  date: '2025-01-15',
  subject: 'Tech Rally Continues: AI Stocks Lead Market Higher',
  tldr: 'AI stocks rally continues with NVDA, AMD, and MSFT showing strength. Market sentiment remains bullish.',
  actionableCount: 3,
  stocks: [
    {
      ticker: 'NVDA',
      sector: 'Technology',
      confidence: 85,
      riskLevel: 'Medium',
      action: 'BUY',
      entryPrice: 485.20,
      summary: 'NVIDIA continues to dominate the AI chip market with strong demand for data center GPUs.',
      whyMatters: 'AI infrastructure spending is accelerating, driving demand for NVIDIA\'s products.',
      momentumCheck: 'Strong upward momentum with positive earnings outlook.',
      actionableInsight: 'Consider entering near $480-485 range with stop-loss at $460.',
      entryZoneLow: 480,
      entryZoneHigh: 485,
      stopLoss: 460,
      profitTarget: 520,
    },
    {
      ticker: 'AMD',
      sector: 'Technology',
      confidence: 75,
      riskLevel: 'Medium',
      action: 'WATCH',
      entryPrice: 142.50,
      summary: 'AMD is gaining market share in data center CPUs and GPUs.',
      whyMatters: 'Competitive positioning against Intel and NVIDIA is improving.',
      momentumCheck: 'Moderate momentum with potential for acceleration.',
      actionableInsight: 'Watch for entry opportunity near $140-142 range.',
      entryZoneLow: 140,
      entryZoneHigh: 142,
      stopLoss: 135,
      profitTarget: 155,
    },
    {
      ticker: 'MSFT',
      sector: 'Technology',
      confidence: 80,
      riskLevel: 'Low',
      action: 'BUY',
      entryPrice: 385.75,
      summary: 'Microsoft\'s cloud and AI services continue to drive growth.',
      whyMatters: 'Azure growth and AI integration across products provide strong tailwinds.',
      momentumCheck: 'Steady upward trend with strong fundamentals.',
      actionableInsight: 'Good entry point at current levels with stop-loss at $370.',
      entryZoneLow: 383,
      entryZoneHigh: 388,
      stopLoss: 370,
      profitTarget: 410,
    },
  ],
};

console.log('🧪 Testing Archive SEO Implementation\n');
console.log('='.repeat(70));

// Test 1: Date Formatting
console.log('\n1. Date Formatting Test');
console.log('-'.repeat(70));
const formattedDate = formatArchiveDate(sampleBrief.date);
console.log(`Input:  ${sampleBrief.date}`);
console.log(`Output: ${formattedDate}`);
console.log(`✅ ${formattedDate === 'January 15, 2025' ? 'PASS' : 'FAIL'}`);

// Test 2: Title Generation
console.log('\n2. Title Generation Test');
console.log('-'.repeat(70));
const title = generateArchiveTitle(sampleBrief);
console.log(`Title: ${title}`);
console.log(`Length: ${title.length} characters`);
console.log(`✅ ${title.length <= 70 ? 'PASS (under 70 chars)' : 'FAIL (too long)'}`);
console.log(`✅ ${title.includes('Stock Picks') ? 'PASS (contains "Stock Picks")' : 'FAIL'}`);
console.log(`✅ ${title.includes('NVDA') ? 'PASS (contains ticker)' : 'FAIL'}`);
console.log(`✅ ${title.includes('Daily Ticker') ? 'PASS (contains brand)' : 'FAIL'}`);

// Test 3: Description Generation
console.log('\n3. Description Generation Test');
console.log('-'.repeat(70));
const description = generateArchiveDescription(sampleBrief);
console.log(`Description: ${description}`);
console.log(`Length: ${description.length} characters`);
console.log(`✅ ${description.length <= 155 ? 'PASS (under 155 chars)' : 'FAIL (too long)'}`);
console.log(`✅ ${description.includes('NVDA') ? 'PASS (contains ticker)' : 'FAIL'}`);
console.log(`✅ ${description.includes('$485.20') ? 'PASS (contains price)' : 'FAIL'}`);
console.log(`✅ ${description.includes("Get tomorrow's picks") ? 'PASS (contains CTA)' : 'FAIL'}`);

// Test 4: Complete Metadata
console.log('\n4. Complete Metadata Test');
console.log('-'.repeat(70));
const metadata = generateArchiveMetadata(sampleBrief);
console.log('Metadata Object:');
console.log(JSON.stringify(metadata, null, 2));
console.log(`✅ ${metadata.title === title ? 'PASS (title matches)' : 'FAIL'}`);
console.log(`✅ ${metadata.description === description ? 'PASS (description matches)' : 'FAIL'}`);
// Check OpenGraph type (it's a string in the metadata object)
const ogType = (metadata.openGraph as any)?.type;
console.log(`✅ ${ogType === 'article' ? 'PASS (OpenGraph type)' : 'FAIL'}`);
console.log(`✅ ${metadata.twitter?.card === 'summary_large_image' ? 'PASS (Twitter card)' : 'FAIL'}`);

// Test 5: Edge Cases
console.log('\n5. Edge Case Tests');
console.log('-'.repeat(70));

// Test with long ticker names
const longTickerBrief: BriefData = {
  ...sampleBrief,
  stocks: [
    { ...sampleBrief.stocks[0], ticker: 'VERYLONGTICKER' },
    { ...sampleBrief.stocks[1], ticker: 'ANOTHERLONGTICKER' },
    { ...sampleBrief.stocks[2], ticker: 'THIRDLONGTICKER' },
  ],
};
const longTitle = generateArchiveTitle(longTickerBrief);
console.log(`Long tickers title: ${longTitle}`);
console.log(`Length: ${longTitle.length} characters`);
console.log(`✅ ${longTitle.length <= 70 ? 'PASS (handles long tickers)' : 'FAIL'}`);

// Test with single stock
const singleStockBrief: BriefData = {
  ...sampleBrief,
  stocks: [sampleBrief.stocks[0]],
};
const singleTitle = generateArchiveTitle(singleStockBrief);
console.log(`Single stock title: ${singleTitle}`);
console.log(`✅ ${singleTitle.includes('NVDA') ? 'PASS (single stock works)' : 'FAIL'}`);

// Test with no TLDR
const noTldrBrief: BriefData = {
  ...sampleBrief,
  tldr: undefined,
};
const noTldrDesc = generateArchiveDescription(noTldrBrief);
console.log(`No TLDR description: ${noTldrDesc}`);
console.log(`✅ ${noTldrDesc.length <= 155 ? 'PASS (handles missing TLDR)' : 'FAIL'}`);

console.log('\n' + '='.repeat(70));
console.log('✅ All Tests Complete!');
console.log('\nNext Steps:');
console.log('1. Deploy changes to production');
console.log('2. Visit an archive page and view page source');
console.log('3. Verify metadata appears in <head> section');
console.log('4. Test with Google Rich Results Test');
console.log('5. Submit updated sitemap to Search Console');

