/**
 * Import ALL Legacy Email Briefs (Oct 10-27, 2025)
 *
 * Parsed from actual email briefs sent before database setup.
 * Calculates stop loss and profit targets from entry prices.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface LegacyStock {
  ticker: string;
  price: number;
  action: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  summary: string;
  whyMatters: string;
  trend: string;
  confidence: string;
}

interface LegacyBrief {
  date: string;
  emailDate: string;
  subject: string;
  tldr: string[];
  stocks: LegacyStock[];
  learningConcept?: string;
}

// All 15 legacy briefs extracted from emails
const legacyBriefs: LegacyBrief[] = [
  {
    date: '2025-10-27',
    emailDate: 'Mon, Oct 27, 8:46 PM',
    subject: '🤖 Nvidia Rides AI Wave | Tesla Gains, Walmart Steady',
    tldr: [
      "NVDA — Nvidia's shares are up sharply after strong AI demand; worth watching for continued growth.",
      "TSLA — Tesla saw steady gains this week on new car deliveries; consider holding if you believe in electric cars.",
      "WMT — Walmart's price is steady with cautious optimism after strong sales; wait to see next quarter's results.",
    ],
    stocks: [
      {
        ticker: 'NVDA',
        price: 460,
        action: 'Watch closely for more news; this stock can move fast with AI developments.',
        riskLevel: 'Medium',
        summary: "Nvidia makes powerful computer chips used in gaming and artificial intelligence (AI). Shares rose 15% this week as strong demand for AI tech boosts sales expectations.",
        whyMatters: "Nvidia is getting popular because a lot of companies want their chips for AI, but prices can jump around quickly.",
        trend: 'Uptrend',
        confidence: 'Solid pick',
      },
      {
        ticker: 'TSLA',
        price: 720,
        action: 'Hold for now if you believe in electric cars growing over time.',
        riskLevel: 'Medium',
        summary: "Tesla builds electric cars and renewable energy products. Tesla's stock climbed 7% this week after delivering more cars than expected.",
        whyMatters: "Tesla is making more cars and selling them well, so many investors are excited, but the price can still change a lot.",
        trend: 'Uptrend',
        confidence: 'Worth watching',
      },
      {
        ticker: 'WMT',
        price: 155,
        action: 'Wait and watch how upcoming earnings report affects price.',
        riskLevel: 'Low',
        summary: "Walmart runs big stores selling groceries, clothes, and everyday items. Stock is steady after good holiday sales but mixed outlook ahead.",
        whyMatters: "Walmart is selling well but the future is less certain, so it's good to wait for clearer signs before buying.",
        trend: 'Sideways',
        confidence: 'Worth watching',
      },
    ],
    learningConcept: 'Trend — This means the general direction a stock\'s price is moving.',
  },
  {
    date: '2025-10-26',
    emailDate: 'Sun, Oct 26, 9:04 AM',
    subject: '🔍 Volatile Picks: Watch GRND, CIFR & FLNC Price Dips Today',
    tldr: [
      'DOWN 📉 GRND — Strong niche growth but stock is down sharply; watch for entry near $11.50–$13.',
      '📈 CIFR — Bitcoin mining with big swings and high risk; consider buying only near $15.50–$17.',
      '📈 FLNC — Renewable energy stock soaring recently but still risky; wait for a pullback around $14.50–$17.50.',
    ],
    stocks: [
      {
        ticker: 'GRND',
        price: 13.21,
        action: 'Watch for a price near $11.50–$13 to consider buying if you can handle ups and downs.',
        riskLevel: 'High',
        summary: 'GRND runs a popular dating app for the LGBTQ community, focusing on tech and AI to grow its user base. The stock price has dropped about 31% over the past three months.',
        whyMatters: 'This stock is growing sales fast but is still losing money, so the price moves a lot.',
        trend: 'Cooling off with increased volatility',
        confidence: 'Risky right now',
      },
      {
        ticker: 'CIFR',
        price: 17.75,
        action: 'Consider buying only if price dips near $15.50–$17 and you\'re okay with big swings.',
        riskLevel: 'High',
        summary: 'CIFR mines Bitcoin by running special computers that secure and create new coins. The stock trades near recent highs on strong interest.',
        whyMatters: 'This stock can jump or drop a lot because it\'s linked to Bitcoin prices.',
        trend: 'Uptrend with high price swings',
        confidence: 'Risky right now',
      },
      {
        ticker: 'FLNC',
        price: 19.52,
        action: 'Wait for a price pullback to around $14.50–$17.50 before thinking about buying to reduce risk.',
        riskLevel: 'High',
        summary: 'FLNC makes software to help store and balance renewable energy on power grids. The stock climbed over 70% last month.',
        whyMatters: 'This stock is popular in clean energy but can go up and down quickly.',
        trend: 'Uptrend with possible pullbacks',
        confidence: 'Risky right now',
      },
    ],
    learningConcept: 'Volatility — This means how much a stock\'s price moves up and down over a short time.',
  },
  {
    date: '2025-10-25',
    emailDate: 'Sat, Oct 25, 7:45 PM',
    subject: '📉 Risky Stocks to Watch: GRND Falls, CIFR & FLNC Volatile Gains',
    tldr: [
      'GRND — The dating app Grindr is falling in price despite strong revenue growth and AI upgrades; risky but could rebound near $11.50-$13.00.',
      'CIFR — Bitcoin miner Cipher Mining trades near highs amid high volatility; good for risk-takers but watch for big swings.',
      'FLNC — Renewable energy storage leader Fluence surged recently but still posts losses; waiting for a pullback may be wise.',
    ],
    stocks: [
      {
        ticker: 'GRND',
        price: 13.21,
        action: 'Watch for a buy opportunity near $11.50-$13.00 if you are comfortable with risk.',
        riskLevel: 'High',
        summary: 'Grindr runs a popular dating app mainly for the LGBTQ community. The stock price has dropped about 31% over three months despite growing revenue.',
        whyMatters: 'The company is growing but spending a lot to get bigger, so the stock price moves are bumpy.',
        trend: 'Cooling off',
        confidence: 'Risky right now',
      },
      {
        ticker: 'CIFR',
        price: 17.75,
        action: 'Consider buying if you can stand big ups and downs, especially near $15.50-$17.00.',
        riskLevel: 'High',
        summary: 'Cipher Mining operates Bitcoin mining facilities to earn cryptocurrency. CIFR stock is near recent highs with a lot of daily price swings.',
        whyMatters: 'This stock can jump or drop a lot one day to the next because it\'s tied to Bitcoin.',
        trend: 'Uptrend with high swings',
        confidence: 'Risky right now',
      },
      {
        ticker: 'FLNC',
        price: 19.52,
        action: 'Wait for a pullback to $14.50-$17.50 before considering a buy due to risks.',
        riskLevel: 'High',
        summary: 'Fluence makes energy storage and software that helps renewable energy work better on the grid. The stock price surged over 70% in the last month.',
        whyMatters: 'The company is in a fast-growing but tricky field, so the stock jumps a lot.',
        trend: 'Uptrend but volatile',
        confidence: 'Risky right now',
      },
    ],
    learningConcept: 'Volatility — This means how much and how quickly a stock\'s price goes up and down.',
  },
  {
    date: '2025-10-24',
    emailDate: 'Fri, Oct 24, 8:01 AM',
    subject: '🚀 GRND Soars 19% | DOWN Plunges 30% | Crypto CIFR Climbs',
    tldr: [
      'GRND 📈 — Recently up 19% after good results, this social networking company targets a unique community and is growing fast but still not profitable.',
      'DOWN 📉 OPEN — Just dropped 30%, this real estate tech stock is risky with big losses and high ups and downs, best for cautious traders only.',
      '📈CIFR — Bitcoin mining company climbing strongly, volatile and risky but showing growth.',
    ],
    stocks: [
      {
        ticker: 'GRND',
        price: 15.08,
        action: 'Consider buying if comfortable with medium risk; watch how the company\'s AI and health projects progress.',
        riskLevel: 'Medium',
        summary: 'Grindr is a social networking app focused on the LGBTQ+ community. After recent quarterly results showing strong 32.7% revenue growth, the stock jumped 19% in two weeks.',
        whyMatters: 'This stock is growing fast but still losing money because it\'s investing in new ideas.',
        trend: 'Uptrend',
        confidence: 'Solid pick for growth-focused investors',
      },
      {
        ticker: 'OPEN',
        price: 7.03,
        action: 'Avoid for now unless you like high-risk, fast-moving stocks; wait for signs the company is reducing losses.',
        riskLevel: 'High',
        summary: 'Opendoor runs an online platform to help people buy and sell homes more easily. The stock has fallen sharply by 30% recently due to ongoing losses.',
        whyMatters: 'This stock can go up or down a lot quickly and is losing money.',
        trend: 'Cooling off',
        confidence: 'Risky right now',
      },
      {
        ticker: 'CIFR',
        price: 17.75,
        action: 'Buy only if you can handle big price swings and want some exposure to Bitcoin mining.',
        riskLevel: 'High',
        summary: 'Cipher Mining runs large Bitcoin mining centers in the US. The stock rose sharply from under $2 to $17.75 recently.',
        whyMatters: 'This stock depends a lot on Bitcoin\'s price and can move up or down quickly.',
        trend: 'Uptrend with high volatility',
        confidence: 'Worth watching for high-risk growth investors',
      },
    ],
    learningConcept: 'Revenue vs. Profit — Revenue is all the money a company brings in. Profit is what\'s left after paying all costs.',
  },
  {
    date: '2025-10-23',
    emailDate: 'Thu, Oct 23, 7:56 PM',
    subject: '📊 Market Rallies | Fed Signals Rate Pause',
    tldr: [
      'CRS — Specialty metals company rising fast; it\'s in a strong growth phase but a bit pricey and can be volatile.',
      'GTX — Industrial tech firm with low price and strong recent gains, good for steady growth and some income.',
      'PI — Technology stock booming lately with big revenue growth but still risky due to high price and uneven profits.',
    ],
    stocks: [
      {
        ticker: 'CRS',
        price: 252,
        action: 'Watch for price dips to $235–$245 before buying, and keep an eye on earnings.',
        riskLevel: 'Medium',
        summary: 'Carpenter Technology makes specialty metals like titanium and stainless steel used in planes, medical tools, and industry. The stock has gone up about 50% in the past year.',
        whyMatters: 'This stock is popular because it makes important metals for planes and machines, but it can jump up or down a lot.',
        trend: 'Uptrend with higher volatility',
        confidence: 'Solid pick',
      },
      {
        ticker: 'GTX',
        price: 13.21,
        action: 'Consider buying if price pulls back toward $12.00–$13.00 or after market calm returns.',
        riskLevel: 'Medium',
        summary: 'Garrett Motion makes turbochargers and related tech for cars and trucks. The stock has jumped over 86% in the last year.',
        whyMatters: 'This is a car technology company doing well and paying a small dividend, good for steady growth.',
        trend: 'Uptrend with moderate volatility',
        confidence: 'Solid pick',
      },
      {
        ticker: 'PI',
        price: 239.34,
        action: 'Hold for now or buy cautiously if it dips near $210–$225, watch supply chain and earnings closely.',
        riskLevel: 'Medium',
        summary: 'Impinj makes technology for tracking items using RFID, mainly for inventory and the Internet of Things (IoT). The stock surged 111% in the past three months.',
        whyMatters: 'This company is on the cutting edge of tracking tech with lots of growth potential, but it\'s riskier because profits aren\'t steady.',
        trend: 'Uptrend with volatility',
        confidence: 'Solid pick',
      },
    ],
    learningConcept: 'P/E Ratio — This means how much investors are willing to pay for $1 of a company\'s earnings.',
  },
  {
    date: '2025-10-22',
    emailDate: 'Wed, Oct 22, 12:49 PM',
    subject: '📊 Market Rallies | Fed Signals Rate Pause',
    tldr: [
      'VICR — Innovative tech power company with recent earnings gains but some price volatility; watch carefully.',
      'ISRG — Leader in robotic surgery, showing strong growth but down from highs; consider buying on dips.',
      'PEGA — AI and cloud software stock climbing near 52-week highs; good growth but pricey, so watch for pullbacks.',
    ],
    stocks: [
      {
        ticker: 'VICR',
        price: 65.80,
        action: 'Hold steady and watch closely for a drop toward $55–$60 before adding more.',
        riskLevel: 'Medium',
        summary: 'Makes special parts and systems that help manage and convert power efficiently in technology devices. The stock jumped after beating earnings expectations.',
        whyMatters: 'This stock is growing because of smart new tech, but its price can swing a lot.',
        trend: 'Volatile, with mixed signals ahead',
        confidence: 'Worth watching',
      },
      {
        ticker: 'ISRG',
        price: 462.74,
        action: 'Watch for price to dip near $430–$460 to consider buying.',
        riskLevel: 'Medium',
        summary: 'Builds robotic systems that help doctors perform less invasive surgeries with more precision. Despite strong sales growth, the stock has pulled back from its peak price.',
        whyMatters: 'This is a leader in cutting-edge medical robots, and while the stock\'s pulled back, it could be a smart buy if the price drops a bit more.',
        trend: 'Cooling off but with potential for bounce',
        confidence: 'Solid pick',
      },
      {
        ticker: 'PEGA',
        price: 57.05,
        action: 'Consider buying on small pullbacks between $50 and $55.',
        riskLevel: 'Medium',
        summary: 'Provides software that uses AI to automate business tasks and improve customer service in the cloud. The stock is near its yearly high thanks to strong earnings.',
        whyMatters: 'This company is growing fast with smart AI products, but the stock price expects a lot of growth already.',
        trend: 'Uptrend, but pricey',
        confidence: 'Solid pick',
      },
    ],
    learningConcept: 'P/E Ratio — This means the price of a stock compared to what the company earns per share.',
  },
  {
    date: '2025-10-21',
    emailDate: 'Tue, Oct 21, 8:01 AM',
    subject: '🚀 Market Rally Lifts Tech Stocks | Inflation Eases',
    tldr: [
      'GM 📈 — Strong recent gains after great earnings and electric vehicle plans, showing potential for more growth.',
      'WBD 📈 — Media giant near its high, with streaming growth but some valuation and competition risks.',
      'HAL 📉 — Oilfield services stock down but looking like a value buy with solid fundamentals and upside potential.',
    ],
    stocks: [
      {
        ticker: 'GM',
        price: 58.20,
        action: 'Consider buying if price dips to $55–$57.50 for a safer entry.',
        riskLevel: 'Medium',
        summary: 'Makes cars and trucks, including a growing focus on electric vehicles (EVs). The stock jumped about 12–14% after beating earnings, hitting a 52-week high near $65.',
        whyMatters: 'GM is gaining confidence because it\'s growing earnings and moving into electric cars.',
        trend: 'Uptrend',
        confidence: 'Solid pick',
      },
      {
        ticker: 'WBD',
        price: 18.19,
        action: 'Hold for now; consider buying if price drops toward $16–$17.50.',
        riskLevel: 'Medium',
        summary: 'Runs TV shows, movies, and streaming services combining WarnerMedia and Discovery. Stock is close to its yearly high near $20.',
        whyMatters: 'This stock is popular because of its streaming content, but prices are high and competition is tough.',
        trend: 'Uptrend',
        confidence: 'Worth watching',
      },
      {
        ticker: 'HAL',
        price: 22.62,
        action: 'Consider buying near $20–$23, especially if the price dips closer to $20.',
        riskLevel: 'Medium',
        summary: 'Provides equipment and services for oil and gas drilling and energy production. Stock is down about 20% this year but looks like a bargain with solid profits.',
        whyMatters: 'Halliburton is a steady company in energy. It looks cheap now, so it might be a good long-term buy.',
        trend: 'Cooling off, but stable',
        confidence: 'Solid pick',
      },
    ],
    learningConcept: 'Price-to-Earnings Ratio (P/E) — This measures how much investors pay for one dollar of a company\'s earnings.',
  },
  {
    date: '2025-10-20',
    emailDate: 'Mon, Oct 20, 8:02 AM',
    subject: '🚀 Market Rally Lifts Tech Stocks | Inflation Eases',
    tldr: [
      'CELC — Biotech stock hitting near highs thanks to promising cancer drug trials, but still risky without profits yet.',
      'CLF — Steel producer showing signs of recovery but remains unprofitable and volatile, worth cautious watching.',
      'NVTS — Tech stock growing fast on new partnerships but still losing money, watch for price stability near current levels.',
    ],
    stocks: [
      {
        ticker: 'CELC',
        price: 78.38,
        action: 'Watch carefully; could be a buy if you like high risk and growth, especially near $60-$68 for a safer entry.',
        riskLevel: 'High',
        summary: 'A biotech company working on new cancer treatments, focusing on solid tumors. The stock is near its highest price ever, reflecting excitement about its drug trials.',
        whyMatters: 'Biotech stocks often don\'t make money yet and depend on successful drug tests.',
        trend: 'Cooling off or consolidating after big gains',
        confidence: 'Risky right now',
      },
      {
        ticker: 'CLF',
        price: 13.37,
        action: 'Watch closely, consider a small position if losses start shrinking and margins improve.',
        riskLevel: 'Medium',
        summary: 'A large steel maker supplying metal mainly in North America. The stock is bouncing back from recent lows but still faces money losses.',
        whyMatters: 'Making lots of steel doesn\'t mean the company is making money — costs and losses matter too.',
        trend: 'Sideways with short-term buy signals, but watch for swings',
        confidence: 'Worth watching',
      },
      {
        ticker: 'NVTS',
        price: 8.22,
        action: 'Consider buying if you want growth but watch for price to settle between $7-$8 to reduce risk.',
        riskLevel: 'Medium',
        summary: 'Creates energy-efficient semiconductor chips used in tech like fast chargers and AI computers. Growing fast on new partnerships, recent price jumped from under $2 to over $8.',
        whyMatters: 'Negative earnings mean the company isn\'t profitable yet, so focus on its growth partnerships.',
        trend: 'Uptrend but watch for some price swings',
        confidence: 'Worth watching',
      },
    ],
    learningConcept: 'Negative Earnings — This means a company is spending more money than it\'s making right now.',
  },
  {
    date: '2025-10-17',
    emailDate: 'Fri, Oct 17, 9:47 AM',
    subject: '📊 Market Rallies | Fed Signals Rate Pause',
    tldr: [
      'DOWN (LBRT) — Energy company recovering near 52-week lows; watch partnership news for growth signs.',
      'IRON — Biotech firm with promising drugs and strong recent gains; good for growth if you can handle ups and downs.',
      'PRAX — High-risk biotech focused on brain disorders, big swings but potential big rewards around $45–$55.',
    ],
    stocks: [
      {
        ticker: 'LBRT',
        price: 11.94,
        action: 'Hold for now and watch how the Oklo partnership develops; consider buying if price stabilizes near $10.50–$12.50.',
        riskLevel: 'Medium',
        summary: 'Liberty Energy offers services like hydraulic fracturing to help produce oil and gas more efficiently. The stock is near a 52-week low after falling off recent highs.',
        whyMatters: 'This stock is cheaper than before because the market feels uncertain about energy prices and new projects.',
        trend: 'Cooling off',
        confidence: 'Solid pick',
      },
      {
        ticker: 'IRON',
        price: 75.34,
        action: 'Consider buying if comfortable with risk, especially on dips near $65–$72 before earnings.',
        riskLevel: 'Medium',
        summary: 'IRON works on new drugs targeting blood diseases. The stock has grown about 47% over the past year, fueled by hope around its drug pipeline.',
        whyMatters: 'This stock\'s price goes up and down a lot because the company isn\'t making profits yet.',
        trend: 'Uptrend with volatility',
        confidence: 'Solid pick',
      },
      {
        ticker: 'PRAX',
        price: 52.52,
        action: 'Watch for key news like clinical trial results; consider buying only if price dips into $45–$55 range and you can handle risk.',
        riskLevel: 'High',
        summary: 'PRAX develops targeted medicines for disorders like epilepsy affecting the brain\'s nervous system. The stock soared over 140% last year but is very volatile now.',
        whyMatters: 'This stock is risky because it depends on whether new medicines get approved.',
        trend: 'Volatile / speculative',
        confidence: 'Risky right now',
      },
    ],
    learningConcept: 'Volatility — This means how much a stock\'s price moves up and down over time.',
  },
  {
    date: '2025-10-16',
    emailDate: 'Thu, Oct 16, 8:01 AM',
    subject: '🚀 Market Rally Lifts Tech Stocks | Inflation Eases',
    tldr: [
      'PRAX — Early-stage biotech with promising brain disorder treatments; watch for trial news and regulatory updates.',
      'JBHT — Big trucking company recovering well, showing stronger profits after recent challenges.',
      'GRAL — Cancer detection innovator with big stock gains but no profits yet; a wait-and-watch for dips is wise.',
    ],
    stocks: [
      {
        ticker: 'PRAX',
        price: 55.30,
        action: 'Watch closely for updates on their main drug trials; consider small investments if price dips near $50.',
        riskLevel: 'High',
        summary: 'PRAX is working on new medicines to help people with brain and nerve problems. The stock price has settled around $55 after beating recent earnings expectations slightly.',
        whyMatters: 'This company doesn\'t make money yet. Its value depends on how its new medicine tests go.',
        trend: 'Sideways, with possible big moves when trial news comes',
        confidence: 'Risky right now',
      },
      {
        ticker: 'JBHT',
        price: 143.99,
        action: 'Consider buying if price dips between $135 and $140 to gain from possible growth.',
        riskLevel: 'Medium',
        summary: 'JBHT moves goods across the US, mainly by trucks and trains. The stock trades near $144 after strong earnings showed profit growth.',
        whyMatters: 'This company shows steady profits and is important for tracking how goods move in the economy.',
        trend: 'Uptrend, nearing recent highs',
        confidence: 'Solid pick',
      },
      {
        ticker: 'GRAL',
        price: 75.52,
        action: 'Wait for price dips between $50 and $65 or clearer profit signals before buying heavily.',
        riskLevel: 'High',
        summary: 'GRAIL develops tests to detect many types of cancer early using a simple blood test. The stock surged over 400% in a year but still loses money.',
        whyMatters: 'Investors hope this company\'s tests will save lives and make money in the future.',
        trend: 'Strong upward, but volatile',
        confidence: 'Risky right now',
      },
    ],
    learningConcept: 'Market Volatility — This means how much and how quickly a stock\'s price goes up and down.',
  },
  {
    date: '2025-10-15',
    emailDate: 'Wed, Oct 15, 8:01 AM',
    subject: '🚀 Market Rally Lifts Tech Stocks | Inflation Eases',
    tldr: [
      'BTDR — Tech stock surging on crypto and AI growth, but still not profitable; good for patient growth watchers.',
      'NVTS — Growing chip maker with hot partnerships, yet earnings still negative; a cautious buy on dips.',
      'SMR — Clean energy nuclear tech rising, but very risky and costly; better to wait for price pullbacks.',
    ],
    stocks: [
      {
        ticker: 'BTDR',
        price: 25.27,
        action: 'Watch for price to settle between $20 and $23; consider buying there if you\'re okay with some ups and downs.',
        riskLevel: 'Medium',
        summary: 'BTDR builds technology for crypto mining and AI cloud services. The stock jumped from about $5 to over $25 recently thanks to strong growth and investor excitement.',
        whyMatters: 'People like this stock because it\'s growing in hot areas like crypto and AI, but it\'s not yet making money steadily.',
        trend: 'Uptrend',
        confidence: 'Solid pick (for patient investors)',
      },
      {
        ticker: 'NVTS',
        price: 8.22,
        action: 'Watch for the price to stay stable between $7 and $8, or look for dips to buy if you\'re comfortable with short-term ups and downs.',
        riskLevel: 'Medium',
        summary: 'NVTS makes advanced chips that use less power, important for AI and new tech like hydrogen fuel cells. The stock climbed from under $2 to over $8 thanks to new partnerships.',
        whyMatters: 'This company is growing thanks to partnerships, but it isn\'t profitable yet.',
        trend: 'Uptrend with some volatility',
        confidence: 'Worth watching',
      },
      {
        ticker: 'SMR',
        price: 42.50,
        action: 'Be patient and consider buying only if the price dips into the $30–$35 range to reduce risk.',
        riskLevel: 'High',
        summary: 'SMR creates small, safer nuclear reactors aimed at clean energy solutions. The stock is near all-time highs around $45 but analysts expect it might drop up to 17%.',
        whyMatters: 'This is a promising clean energy stock but it\'s still losing money and can move a lot.',
        trend: 'Cooling off',
        confidence: 'Risky right now',
      },
    ],
    learningConcept: 'Negative Earnings — This means a company is spending more money than it\'s making right now.',
  },
  {
    date: '2025-10-14',
    emailDate: 'Tue, Oct 14, 8:02 AM',
    subject: '🚀 Market Rally Lifts Tech Stocks | Inflation Eases',
    tldr: [
      'CRML — A mining company specializing in lithium and rare metals has jumped in price but remains risky and unprofitable.',
      'NVTS — A tech chip maker is growing fast thanks to new partnerships, but still shows losses and price ups and downs.',
      'ERIC 📈 — Telecom giant Ericsson is stable with modest gains, focusing on 5G, but looks pricey compared to its value.',
    ],
    stocks: [
      {
        ticker: 'CRML',
        price: 17.61,
        action: 'Watch carefully and wait for a price pullback near $13.20 to $16.75 before considering buying.',
        riskLevel: 'High',
        summary: 'CRML digs for lithium and rare earth metals, important materials for electric cars and tech devices. The stock surged about 120% over the last year.',
        whyMatters: 'This stock can win big but also lose fast. It\'s popular because people want metals for new tech.',
        trend: 'Uptrend with caution due to sharp price changes',
        confidence: 'Risky right now',
      },
      {
        ticker: 'NVTS',
        price: 8.22,
        action: 'Consider watching for a dip toward $7.00 to $8.00 before buying, to get a better deal and lower risk.',
        riskLevel: 'Medium',
        summary: 'NVTS makes advanced, power-saving chips used for fast charging and AI technology. The stock climbed from under $2 to over $8 recently thanks to big partnership news.',
        whyMatters: 'NVTS is growing but not making a profit yet. It\'s worth watching because new tech deals could help it grow big.',
        trend: 'Uptrend with some volatility',
        confidence: 'Worth watching',
      },
      {
        ticker: 'ERIC',
        price: 8.20,
        action: 'Hold if you own it, but wait for a dip nearer $7.50 to $8.00 before buying new shares.',
        riskLevel: 'Medium',
        summary: 'Ericsson builds technology for mobile networks and internet systems, especially 5G connections. The stock is stable and recently beat the market\'s short-term gains.',
        whyMatters: 'Ericsson is a well-known company in phone networks. It\'s doing okay, but its stock price is a bit high.',
        trend: 'Sideways with some short-term momentum',
        confidence: 'Worth watching',
      },
    ],
    learningConcept: 'Volatility — This means how much a stock\'s price moves up or down.',
  },
  {
    date: '2025-10-13',
    emailDate: 'Mon, Oct 13, 8:02 AM',
    subject: '🚀 Market Rally Lifts Tech Stocks | Inflation Eases',
    tldr: [
      'CRML — Small mining stock surging on lithium and rare earth interest but risky and volatile.',
      'USAR — Rare earth magnet maker exploding higher on U.S. supply hopes but still unprofitable and volatile.',
      'MP — Big rare earth materials player with steady growth but high volatility and losses.',
    ],
    stocks: [
      {
        ticker: 'CRML',
        price: 17.61,
        action: 'Watch closely and avoid jumping in now; wait for prices to pull back near $13.20 before considering buying.',
        riskLevel: 'High',
        summary: 'It explores and mines lithium and rare earth metals, which are important for electric vehicles and tech. The stock has jumped over 100% in the past year with big ups and downs.',
        whyMatters: 'This is a small company with big price swings. People like it because lithium and rare metals are important for future tech.',
        trend: 'Uptrend with volatility',
        confidence: 'Risky right now',
      },
      {
        ticker: 'USAR',
        price: 39.50,
        action: 'Consider watching this one; wait for a dip between $25 and $30 before buying if you\'re comfortable with risk.',
        riskLevel: 'High',
        summary: 'Produces rare earth magnets crucial for clean energy and defense hardware. The stock soared nearly 8 times in 2025 due to growth hopes.',
        whyMatters: 'This company could do well because the U.S. wants to reduce reliance on China for these important metals.',
        trend: 'Very strong uptrend but volatile',
        confidence: 'Risky right now',
      },
      {
        ticker: 'MP',
        price: 76.50,
        action: 'Hold if you own it; newcomers can think about small buys but be cautious of price swings and losses.',
        riskLevel: 'Medium',
        summary: 'A bigger company mining rare earth materials used in electronics and clean energy. The stock is steady with ups and downs.',
        whyMatters: 'This company is bigger and more stable than the others, but like many in the rare earth space, it isn\'t making money yet.',
        trend: 'Sideways with volatility',
        confidence: 'Solid pick for cautious investors',
      },
    ],
    learningConcept: 'Volatility — This means how much a stock\'s price goes up and down.',
  },
  {
    date: '2025-10-10',
    emailDate: 'Fri, Oct 10, 3:53 PM',
    subject: '📊 Market Rallies | Fed Signals Rate Pause',
    tldr: [
      'PTGX — Biotech stock rising with exciting drug tests ahead; watch for chances to buy on small dips.',
      'APLD — Tech infrastructure firm pushing AI and crypto data centers; hold and wait for a better price to buy.',
      'NAMS — Healthcare company with promising drug trials and price gains; consider buying near support prices.',
    ],
    stocks: [
      {
        ticker: 'PTGX',
        price: 67.04,
        action: 'Watch for small price dips to buy between $60 and $65 before key drug test news.',
        riskLevel: 'Medium',
        summary: 'Protagonist makes special peptide medicines to treat blood and inflammation diseases. The stock recently climbed about 37% over the past year, nearing its all-time high around $67.',
        whyMatters: 'This stock is popular because of its new medicines that could help many people, but prices can jump up and down a lot.',
        trend: 'Uptrend',
        confidence: 'Solid pick',
      },
      {
        ticker: 'APLD',
        price: 28.07,
        action: 'Hold for now; consider buying only if the price dips between $20 and $23.',
        riskLevel: 'Medium',
        summary: 'Applied Digital builds and runs big data centers for AI, crypto mining, and fast computing. The stock is near a year-high around $28.',
        whyMatters: 'The company is growing but still losing money, so its stock price might go up and down.',
        trend: 'Sideways to cautious uptrend',
        confidence: 'Worth watching',
      },
      {
        ticker: 'NAMS',
        price: 30.67,
        action: 'Consider buying between $27 and $29 to lower risk while aiming for gains from new trial data.',
        riskLevel: 'Medium',
        summary: 'NewAmsterdam develops new medicines targeting metabolic and heart diseases. The stock price has gone up over 45% this year.',
        whyMatters: 'The company\'s future depends a lot on how its new medicines perform in tests.',
        trend: 'Uptrend with possible short-term ups and downs',
        confidence: 'Solid pick',
      },
    ],
    learningConcept: 'P/E Ratio (Price-to-Earnings Ratio) — This number shows how much investors are paying for each dollar a company earns.',
  },
];

function calculateTargets(entryPrice: number): { stopLoss: number; profitTarget: number } {
  const stopLoss = entryPrice * 0.92; // 8% below entry
  const risk = entryPrice - stopLoss;
  const profitTarget = entryPrice + (2 * risk); // 2:1 R/R
  return {
    stopLoss: Math.round(stopLoss * 100) / 100,
    profitTarget: Math.round(profitTarget * 100) / 100,
  };
}

function mapConfidence(confidence: string): number {
  if (confidence.includes('Solid pick')) return 85;
  if (confidence.includes('Worth watching')) return 70;
  if (confidence.includes('Risky')) return 60;
  return 75;
}

function mapAction(action: string): 'BUY' | 'WATCH' | 'HOLD' {
  const lower = action.toLowerCase();
  if (lower.includes('buy') || lower.includes('consider buying')) return 'BUY';
  if (lower.includes('hold')) return 'HOLD';
  return 'WATCH';
}

function guessSector(ticker: string): string {
  const sectorMap: Record<string, string> = {
    NVDA: 'Technology', TSLA: 'Consumer', WMT: 'Consumer',
    GRND: 'Technology', CIFR: 'Technology', FLNC: 'Energy',
    OPEN: 'Real Estate', CRS: 'Materials', GTX: 'Industrial',
    PI: 'Technology', QBTS: 'Technology', VICR: 'Technology',
    ISRG: 'Healthcare', PEGA: 'Technology', GM: 'Consumer',
    WBD: 'Communication', HAL: 'Energy', CELC: 'Healthcare',
    CLF: 'Materials', NVTS: 'Technology', LBRT: 'Energy',
    IRON: 'Healthcare', PRAX: 'Healthcare', JBHT: 'Industrial',
    GRAL: 'Healthcare', BTDR: 'Technology', SMR: 'Energy',
    CRML: 'Materials', ERIC: 'Communication', USAR: 'Materials',
    MP: 'Materials', PTGX: 'Healthcare', APLD: 'Technology',
    NAMS: 'Healthcare',
  };
  return sectorMap[ticker] || 'Other';
}

async function importLegacyBrief(brief: LegacyBrief) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📅 Importing ${brief.date}`);
  console.log('='.repeat(70));

  // Check if already exists
  const { data: existing } = await supabase
    .from('briefs')
    .select('id')
    .eq('date', brief.date)
    .single();

  if (existing) {
    console.log(`  ⏭️  ${brief.date} already exists, skipping...`);
    return;
  }

  const enrichedStocks = brief.stocks.map(stock => {
    const targets = calculateTargets(stock.price);
    return {
      ...stock,
      stopLoss: targets.stopLoss,
      profitTarget: targets.profitTarget,
      sector: guessSector(stock.ticker),
      confidence: mapConfidence(stock.confidence),
      actionType: mapAction(stock.action),
    };
  });

  // Generate simple HTML
  const stockCards = enrichedStocks
    .map(s => `
    <div style="background:#1a3a52; padding:24px; margin-bottom:24px; border-radius:12px;">
      <h3 style="color:#00ff88; font-size:24px; margin:0 0 8px 0;">🔹 ${s.ticker}</h3>
      <p style="color:#d1d5db; margin:0 0 16px 0;">${s.summary}</p>
      <p style="color:#9ca3af; font-size:13px; margin:0;">Risk: ${s.riskLevel} | Action: ${s.action}</p>
    </div>
  `)
    .join('');

  const htmlContent = `
<div style="font-family:Inter,Arial,sans-serif;max-width:680px;background:#0B1E32;color:#F0F0F0;margin:0 auto;">
  <div style="background:linear-gradient(135deg,#0B1E32 0%,#1a3a52 100%);padding:40px 24px;text-align:center;border-bottom:3px solid #00ff88;">
    <h1 style="color:#00ff88;margin:0;font-size:32px;">Daily Ticker</h1>
    <p style="color:#00ff88;font-size:14px;margin:8px 0 0;">☀️ ${new Date(brief.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
  </div>
  <div style="padding:32px 24px;">
    ${stockCards}
  </div>
</div>
  `.trim();

  const tldr = brief.tldr.join(' | ');
  const subject = brief.subject;

  // Insert brief
  const { data: briefData, error: briefError } = await supabase
    .from('briefs')
    .insert({
      date: brief.date,
      subject_free: subject,
      subject_premium: subject,
      html_content_free: htmlContent,
      html_content_premium: htmlContent,
      tldr,
      actionable_count: enrichedStocks.filter(s => s.actionType === 'BUY').length,
    })
    .select()
    .single();

  if (briefError || !briefData) {
    console.error('  ❌ Failed to insert brief:', briefError);
    return;
  }

  console.log(`  ✅ Brief inserted (ID: ${briefData.id})`);

  // Insert stocks
  for (const stock of enrichedStocks) {
    const { error: stockError } = await supabase.from('stocks').insert({
      brief_id: briefData.id,
      ticker: stock.ticker,
      sector: stock.sector,
      confidence: stock.confidence,
      risk_level: stock.riskLevel,
      action: stock.actionType,
      entry_price: stock.price,
      stop_loss: stock.stopLoss,
      profit_target: stock.profitTarget,
      summary: stock.summary,
      why_matters: stock.whyMatters,
      momentum_check: stock.trend,
      actionable_insight: stock.action,
      allocation: '5-10% of portfolio',
      caution_notes: `Legacy import from ${brief.emailDate}`,
      learning_moment: brief.learningConcept || 'Steady learning and patience are key.',
    });

    if (stockError) {
      console.error(`    ❌ ${stock.ticker} failed:`, stockError.message);
    } else {
      console.log(`    ✅ ${stock.ticker}: $${stock.price} (Stop: $${stock.stopLoss}, Target: $${stock.profitTarget})`);
    }
  }
}

async function main() {
  console.log('🚀 LEGACY BRIEF IMPORT - All October 10-27, 2025 Briefs\n');
  console.log('━'.repeat(70));
  console.log(`Importing ${legacyBriefs.length} briefs with calculated stop loss/profit targets`);
  console.log('━'.repeat(70));

  for (const brief of legacyBriefs) {
    await importLegacyBrief(brief);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n' + '━'.repeat(70));
  console.log('✅ IMPORT COMPLETE');
  console.log('━'.repeat(70));

  const { data: octoberBriefs } = await supabase
    .from('briefs')
    .select('date')
    .gte('date', '2025-10-01')
    .lte('date', '2025-10-31')
    .order('date');

  console.log(`\n📊 Total October briefs: ${octoberBriefs?.length || 0}`);
}

main();
