import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Check all NVDA data to identify test entries
 */
async function checkNVDAData() {
  console.log('🔍 Checking all NVDA data...\n');
  console.log('═'.repeat(60));

  try {
    // Get all NVDA stocks with their briefs
    const { data: nvdaStocks, error: stocksError } = await supabase
      .from('stocks')
      .select(`
        id,
        ticker,
        entry_price,
        brief_id,
        briefs!inner(
          id,
          date,
          subject_premium
        )
      `)
      .eq('ticker', 'NVDA')
      .order('created_at', { ascending: false });

    if (stocksError) {
      throw new Error(`Failed to fetch stocks: ${stocksError.message}`);
    }

    if (!nvdaStocks || nvdaStocks.length === 0) {
      console.log('❌ No NVDA stocks found');
      return;
    }

    console.log(`📊 Found ${nvdaStocks.length} NVDA stock(s):\n`);

    for (const stock of nvdaStocks) {
      const brief = (stock as any).briefs;
      console.log(`Stock ID: ${stock.id}`);
      console.log(`  Entry Price: $${stock.entry_price}`);
      console.log(`  Brief Date: ${brief?.date || 'N/A'}`);
      console.log(`  Brief Subject: ${brief?.subject_premium || 'N/A'}`);
      console.log(`  Brief ID: ${stock.brief_id}`);

      // Check performance data
      const { data: performance } = await supabase
        .from('stock_performance')
        .select('*')
        .eq('stock_id', stock.id);

      if (performance && performance.length > 0) {
        console.log(`  Performance Data:`);
        performance.forEach(p => {
          console.log(`    - Entry: $${p.entry_price} on ${p.entry_date}`);
          console.log(`    - Exit: ${p.exit_price ? `$${p.exit_price} on ${p.exit_date}` : 'Still open'}`);
          console.log(`    - Return: ${p.return_percent ? `${p.return_percent.toFixed(1)}%` : 'N/A'}`);
          console.log(`    - Outcome: ${p.outcome || 'N/A'}`);
          
          // Check if this looks like test data
          if (p.entry_price === 495 && p.exit_price === 604) {
            console.log(`    ⚠️  THIS LOOKS LIKE TEST DATA!`);
          }
        });
      } else {
        console.log(`  No performance data`);
      }
      console.log();
    }

    // Check for October 15, 2025 specifically
    console.log('═'.repeat(60));
    console.log('🔍 Checking for October 15, 2025 entries...\n');

    const { data: oct15Briefs } = await supabase
      .from('briefs')
      .select('id, date, subject_premium')
      .eq('date', '2025-10-15');

    if (oct15Briefs && oct15Briefs.length > 0) {
      console.log(`Found ${oct15Briefs.length} brief(s) for October 15, 2025:`);
      for (const brief of oct15Briefs) {
        console.log(`  • Brief ID: ${brief.id}`);
        console.log(`    Subject: ${brief.subject_premium || 'N/A'}`);

        const { data: stocks } = await supabase
          .from('stocks')
          .select('id, ticker, entry_price')
          .eq('brief_id', brief.id);

        if (stocks && stocks.length > 0) {
          console.log(`    Stocks in this brief:`);
          stocks.forEach(s => {
            console.log(`      - ${s.ticker}: $${s.entry_price}`);
          });
        }
      }
    } else {
      console.log('No briefs found for October 15, 2025');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

checkNVDAData();

