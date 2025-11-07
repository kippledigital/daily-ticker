import { TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { ROICalculatorModal } from './roi-calculator-modal'

export function SiteFooter() {
  return (
    <footer className="border-t border-[#1a3a52] bg-[#0B1E32] mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#00ff88]" />
              <span className="font-bold text-white font-mono">Daily Ticker</span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">
              Market insights that make sense. Delivered daily at 8 AM EST.
            </p>
          </div>

          {/* Product Column */}
          <div className="space-y-4">
            <h5 className="font-semibold text-white">Product</h5>
            <div className="space-y-2">
              <Link href="/#pricing" className="block text-sm text-gray-200 hover:text-[#00ff88] transition-colors">
                Pricing
              </Link>
              <Link href="/premium" className="block text-sm text-gray-200 hover:text-[#00ff88] transition-colors">
                Premium Features
              </Link>
              <Link href="/archive" className="block text-sm text-gray-200 hover:text-[#00ff88] transition-colors">
                Archive
              </Link>
              <ROICalculatorModal
                triggerText="Value Calculator"
                triggerClassName="block text-sm text-gray-200 hover:text-[#00ff88] transition-colors text-left"
                showIcon={false}
              />
            </div>
          </div>

          {/* Connect Column */}
          <div className="space-y-4">
            <h5 className="font-semibold text-white">Connect</h5>
            <div className="space-y-2">
              <a
                href="https://twitter.com/GetDailyTicker"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-gray-200 hover:text-[#00ff88] transition-colors"
              >
                Twitter
              </a>
              <a
                href="https://www.linkedin.com/in/nikkikipple/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-gray-200 hover:text-[#00ff88] transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="mailto:brief@dailyticker.co"
                className="block text-sm text-gray-200 hover:text-[#00ff88] transition-colors"
              >
                Email Us
              </a>
            </div>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h5 className="font-semibold text-white">Legal</h5>
            <div className="space-y-2">
              <Link href="/privacy" className="block text-sm text-gray-200 hover:text-[#00ff88] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-sm text-gray-200 hover:text-[#00ff88] transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-[#1a3a52]">
          <p className="text-xs text-gray-300 leading-relaxed">
            <strong>Disclaimer:</strong> Daily Ticker is for educational purposes only and does not provide financial
            advice. All content is for informational purposes. Always consult with a qualified financial advisor
            before making investment decisions.
          </p>
          <p className="text-xs text-gray-300 mt-4">
            © {new Date().getFullYear()} Daily Ticker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

