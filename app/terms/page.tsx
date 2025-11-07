import Link from "next/link"
import { SiteHeader } from "@/components/site-header"

export const metadata = {
  title: "Terms of Service — Daily Ticker",
  description: "Terms of Service for Daily Ticker",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0B1E32]">
      <SiteHeader />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing or using Daily Ticker (&quot;the Service&quot;), you agree to be bound by these Terms of
              Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">2. Service Description</h2>
            <p className="leading-relaxed">
              Daily Ticker provides daily market briefs and stock market insights via email newsletter. Our content is
              for informational and educational purposes only and does not constitute financial advice.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">3. No Financial Advice</h2>
            <p className="leading-relaxed">
              <strong>IMPORTANT DISCLAIMER:</strong> Daily Ticker is for educational purposes only. We do not provide
              financial, investment, tax, or legal advice. All content is for informational purposes. You should always
              consult with a qualified financial advisor before making any investment decisions.
            </p>
            <p className="leading-relaxed">
              Past performance does not guarantee future results. Investing in securities involves risk, including
              possible loss of principal. Daily Ticker is not liable for any financial losses incurred based on
              information provided in our briefs.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">4. User Responsibilities</h2>
            <p className="leading-relaxed">You agree to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate email information when subscribing</li>
              <li>Use the Service for lawful purposes only</li>
              <li>Not redistribute our content without permission</li>
              <li>Conduct your own due diligence before making investment decisions</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">5. Intellectual Property</h2>
            <p className="leading-relaxed">
              All content provided through Daily Ticker, including text, graphics, logos, and data, is the property of
              Daily Ticker and is protected by copyright laws. You may not reproduce, distribute, or create derivative
              works from our content without explicit written permission.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">6. Subscription and Cancellation</h2>
            <p className="leading-relaxed">
              Daily Ticker is currently a free service. You may unsubscribe at any time by clicking the unsubscribe
              link in any email or by contacting us at brief@dailyticker.co. If we introduce paid features in the
              future, we will notify subscribers in advance.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">7. Accuracy of Information</h2>
            <p className="leading-relaxed">
              While we strive to provide accurate and up-to-date information, Daily Ticker makes no warranties or
              representations about the accuracy, completeness, or timeliness of the content. Market data may be delayed
              or contain errors. Always verify information independently.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">8. Limitation of Liability</h2>
            <p className="leading-relaxed">
              Daily Ticker and its operators shall not be liable for any direct, indirect, incidental, consequential, or
              special damages arising from your use of the Service, including but not limited to financial losses,
              investment decisions, or trading activities.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">9. Third-Party Links and Services</h2>
            <p className="leading-relaxed">
              Our content may include links to third-party websites or references to third-party services. Daily Ticker
              is not responsible for the content, accuracy, or practices of third-party sites. Use of third-party
              services is at your own risk.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">10. Modifications to Service</h2>
            <p className="leading-relaxed">
              We reserve the right to modify, suspend, or discontinue the Service at any time without notice. We may
              also update these Terms of Service periodically. Continued use of the Service after changes constitutes
              acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">11. Privacy</h2>
            <p className="leading-relaxed">
              Your use of Daily Ticker is also governed by our{" "}
              <Link href="/privacy" className="text-[#00ff88] hover:underline">
                Privacy Policy
              </Link>
              . Please review our Privacy Policy to understand how we collect, use, and protect your information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">12. Governing Law</h2>
            <p className="leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of the United States,
              without regard to conflict of law principles.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">13. Contact Information</h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:{" "}
              <a href="mailto:brief@dailyticker.co" className="text-[#00ff88] hover:underline">
                brief@dailyticker.co
              </a>
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-[#1a3a52]">
            <p className="text-sm text-gray-300">
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
