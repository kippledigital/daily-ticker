'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const sampleTickers: TickerItem[] = [
  { symbol: 'AAPL', price: 178.45, change: 2.34, changePercent: 1.33 },
  { symbol: 'MSFT', price: 412.89, change: -1.23, changePercent: -0.30 },
  { symbol: 'GOOGL', price: 142.56, change: 3.45, changePercent: 2.48 },
  { symbol: 'AMZN', price: 178.92, change: 4.12, changePercent: 2.35 },
  { symbol: 'NVDA', price: 875.28, change: -5.67, changePercent: -0.64 },
  { symbol: 'TSLA', price: 242.84, change: 8.45, changePercent: 3.61 },
  { symbol: 'META', price: 489.23, change: 6.78, changePercent: 1.41 },
  { symbol: 'AMD', price: 165.43, change: -2.34, changePercent: -1.39 },
];

export default function TickerBoard() {
  const [tickers, setTickers] = useState<TickerItem[]>(sampleTickers);
  const [duplicatedTickers, setDuplicatedTickers] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real-time stock data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/stocks');

        if (!response.ok) {
          throw new Error('Failed to fetch stock data');
        }

        const result = await response.json();

        if (result.success && result.data) {
          setTickers(result.data);
          setError(null);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        // Keep using sample data on error
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch immediately
    fetchStockData();

    // Refresh every 60 seconds
    const interval = setInterval(fetchStockData, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Duplicate tickers for seamless scroll
    setDuplicatedTickers([...tickers, ...tickers, ...tickers]);
  }, [tickers]);

  return (
    <div className="relative w-full overflow-hidden bg-[#0B1E32] border-y-2 border-[#1a3a52] py-4">
      {/* Status indicator */}
      <div className="absolute top-2 right-4 z-10 flex items-center gap-2 text-xs">
        <div className={`w-2 h-2 rounded-full ${error ? 'bg-yellow-500' : 'bg-ledGreen'} ${!error && 'animate-pulse'}`} />
        <span className="text-gray-400 font-mono">
          {error ? 'SAMPLE DATA' : 'LIVE'}
        </span>
      </div>

      {/* LED-style ticker board */}
      <div className="ticker-glow bg-gradient-to-b from-[#0d2438] to-[#0B1E32] px-4 py-2">
        <motion.div
          className="flex gap-12"
          animate={{
            x: [0, -100 * tickers.length],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 30,
              ease: 'linear',
            },
          }}
        >
          {duplicatedTickers.map((ticker, index) => (
            <div
              key={`${ticker.symbol}-${index}`}
              className="flex items-center gap-3 min-w-fit"
            >
              {/* Symbol */}
              <span className="font-mono text-lg font-bold text-white">
                {ticker.symbol}
              </span>

              {/* Price */}
              <span className="font-mono text-lg text-gray-300">
                ${ticker.price.toFixed(2)}
              </span>

              {/* Change */}
              <div
                className={`flex items-center gap-1 font-mono text-sm led-text ${
                  ticker.change >= 0 ? 'text-ledGreen' : 'text-ledRed'
                }`}
              >
                <span>{ticker.change >= 0 ? '▲' : '▼'}</span>
                <span>
                  {ticker.change >= 0 ? '+' : ''}
                  {ticker.change.toFixed(2)}
                </span>
                <span>
                  ({ticker.changePercent >= 0 ? '+' : ''}
                  {ticker.changePercent.toFixed(2)}%)
                </span>
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-gray-700" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Fade edges */}
      <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-[#0B1E32] to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-[#0B1E32] to-transparent pointer-events-none" />
    </div>
  );
}
