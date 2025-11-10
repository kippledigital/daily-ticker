'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ArchiveNavigationProps {
  currentDate: string; // YYYY-MM-DD format
}

/**
 * Navigation component for archive pages
 * Shows previous/next day links and related archives
 */
export function ArchiveNavigation({ currentDate }: ArchiveNavigationProps) {
  // Calculate previous and next dates
  const [year, month, day] = currentDate.split('-').map(Number);
  const current = new Date(year, month - 1, day);
  
  const previous = new Date(current);
  previous.setDate(previous.getDate() - 1);
  const previousDateStr = previous.toISOString().split('T')[0];
  
  const next = new Date(current);
  next.setDate(next.getDate() + 1);
  const nextDateStr = next.toISOString().split('T')[0];
  
  // Format dates for display
  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="mt-12 pt-8 border-t border-[#1a3a52]">
      <div className="flex items-center justify-between">
        <Link
          href={`/archive/${previousDateStr}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a52]/30 hover:bg-[#1a3a52]/50 border border-[#1a3a52] rounded-lg text-gray-300 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm">Previous: {formatDate(previousDateStr)}</span>
        </Link>
        
        <Link
          href="/archive"
          className="text-sm text-gray-400 hover:text-[#00ff88] transition-colors"
        >
          All Archives
        </Link>
        
        <Link
          href={`/archive/${nextDateStr}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a52]/30 hover:bg-[#1a3a52]/50 border border-[#1a3a52] rounded-lg text-gray-300 hover:text-white transition-colors"
        >
          <span className="text-sm">Next: {formatDate(nextDateStr)}</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

