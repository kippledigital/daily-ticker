import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Find any NVDA data related to October 15, 2025
 */
async function findOct15NVDA() {
  console.log('🔍 Searching for ANY NVDA data related to October 15, 2025...\n');
  console.log('═'.repeat(60));

  try {
    // Check stocks with brief date October 15
    const { data: stocksOct15 } = await supabase
      .from('stocks')
      .select(`
        id,
        ticker,
        entry_price,
        brief_id,
        briefs!inner(id, date, subject_premium)
      `)
      .eq('ticker', 'NVDA')
      .eq('briefs.date', '2025-10-15');

    console.log(`📊 Stocks with brief date October 15, 2025: ${stocksOct15?.length || 0}`);
    if (stocksOct15 && stocksOct15.length > 0) {
      stocksOct15.forEach(s => {
        const brief = (s as any).briefs;
        console.log(`  • Stock ID: ${s.id}`);
        console.log(`    Entry Price: $${s.entry_price}`);
        console.log(`    Brief Subject: ${brief?.subject_premium || 'N/A'}`);
      });
    }

    // Check performance with entry_date October 15
    const { data: perfOct15 } = await supabase
      .from('stock_performance')
      .select(`
        *,
        stocks!inner(ticker, entry_price, brief_id, briefs!inner(date))
      `)
      .eq('entry_date', '2025-10-15')
      .eq('stocks.ticker', 'NVDA');

    console.log(`\n📈 Performance records with entry_date October 15, 2025: ${perfOct15?.length || 0}`);
    if (perfOct15 && perfOct15.length > 0) {
      perfOct15.forEach(p => {
        const stock = (p as any).stocks;
        const brief = stock?.briefs;
        console.log(`  • Performance ID: ${p.id}`);
        console.log(`    Stock ID: ${p.stock_id}`);
        console.log(`    Entry Price: $${p.entry_price}`);
        console.log(`    Exit Price: ${p.exit_price ? `$${p.exit_price}` : 'Open'}`);
        console.log(`    Return: ${p.return_percent ? `${p.return_percent.toFixed(1)}%` : 'N/A'}`);
        console.log(`    Stock Entry Price: $${stock?.entry_price || 'N/A'}`);
        console.log(`    Brief Date: ${brief?.date || 'N/A'}`);
        console.log(`    Brief Subject: ${brief?.subject_premium || 'N/A'}`);
      });
    }

    // Check ALL NVDA performance records
    console.log('\n═'.repeat(60));
    console.log('📊 ALL NVDA Performance Records:\n');

    const { data: allNVDA } = await supabase
      .from('stock_performance')
      .select(`
        *,
        stocks!inner(ticker, entry_price, brief_id, briefs!inner(date, subject_premium))
      `)
      .eq('stocks.ticker', 'NVDA')
      .order('entry_date', { ascending: false });

    if (allNVDA && allNVDA.length > 0) {
      allNVDA.forEach(p => {
        const stock = (p as any).stocks;
        const brief = stock?.briefs;
        console.log(`Entry Date: ${p.entry_date}`);
        console.log(`  Entry Price: $${p.entry_price}`);
        console.log(`  Exit Price: ${p.exit_price ? `$${p.exit_price} on ${p.exit_date}` : 'Open'}`);
        console.log(`  Return: ${p.return_percent ? `${p.return_percent.toFixed(1)}%` : 'N/A'}`);
        console.log(`  Brief Date: ${brief?.date || 'N/A'}`);
        console.log(`  Brief Subject: ${brief?.subject_premium || 'N/A'}`);
        console.log();
      });
    } else {
      console.log('No performance records found');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

findOct15NVDA();

