import Link from "next/link"
import { SiteHeader } from "@/components/site-header"

export const metadata = {
  title: "Privacy Policy — Daily Ticker",
  description: "Privacy Policy for Daily Ticker",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0B1E32]">
      <SiteHeader />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
            <p className="leading-relaxed">We collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Email Address:</strong> When you subscribe to Daily Ticker, we collect your email address to
                deliver our daily market brief.
              </li>
              <li>
                <strong>Usage Data:</strong> We use Google Analytics to collect anonymized information about how
                visitors use our website, including pages visited, time spent, and general location (city/country
                level). IP addresses are anonymized.
              </li>
              <li>
                <strong>Email Engagement:</strong> We track email open rates and link clicks to improve our content.
                This data is handled by our email service provider (Beehiiv).
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">2. How We Use Your Information</h2>
            <p className="leading-relaxed">We use your information for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To send you our daily market brief (Mon-Fri at 8 AM)</li>
              <li>To send occasional updates about Daily Ticker features or changes</li>
              <li>To analyze and improve our content and user experience</li>
              <li>To understand which topics and features are most valuable to readers</li>
            </ul>
            <p className="leading-relaxed mt-4">
              <strong>We will never sell, rent, or share your email address with third parties for marketing
              purposes.</strong>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">3. Third-Party Services</h2>
            <p className="leading-relaxed">We use the following third-party services to operate Daily Ticker:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Beehiiv:</strong> Email delivery and subscriber management. View their{" "}
                <a
                  href="https://www.beehiiv.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ff88] hover:underline"
                >
                  privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Google Analytics:</strong> Website analytics with IP anonymization enabled. View their{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ff88] hover:underline"
                >
                  privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Polygon.io:</strong> Real-time stock market data API. View their{" "}
                <a
                  href="https://polygon.io/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ff88] hover:underline"
                >
                  privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Vercel:</strong> Website hosting and deployment. View their{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ff88] hover:underline"
                >
                  privacy policy
                </a>
                .
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">4. Cookies and Tracking</h2>
            <p className="leading-relaxed">
              We use cookies and similar tracking technologies to improve your experience. Google Analytics uses cookies
              to track usage patterns. You can disable cookies in your browser settings, though this may affect site
              functionality.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">5. Email Communications</h2>
            <p className="leading-relaxed">
              You can unsubscribe from our emails at any time by clicking the unsubscribe link at the bottom of any
              email or by contacting us at brief@dailyticker.co. We respect your inbox and your time. Unsubscribe
              requests are processed immediately.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">6. Data Retention</h2>
            <p className="leading-relaxed">
              We retain your email address and subscription data for as long as you remain subscribed. After you
              unsubscribe, we may retain your email in a suppression list to ensure we don&apos;t accidentally re-add you
              to our mailing list.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">7. Data Security</h2>
            <p className="leading-relaxed">
              We take reasonable measures to protect your personal information from unauthorized access, use, or
              disclosure. This includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>HTTPS encryption for all website traffic</li>
              <li>Secure API connections to third-party services</li>
              <li>Regular security updates and monitoring</li>
              <li>Limited access to subscriber data</li>
            </ul>
            <p className="leading-relaxed mt-4">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your data,
              we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">8. Your Rights</h2>
            <p className="leading-relaxed">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt out of email communications at any time</li>
              <li>Object to processing of your personal data</li>
            </ul>
            <p className="leading-relaxed mt-4">
              To exercise these rights, contact us at brief@dailyticker.co.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">9. Children&apos;s Privacy</h2>
            <p className="leading-relaxed">
              Daily Ticker is not intended for children under 13. We do not knowingly collect personal information from
              children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">10. International Users</h2>
            <p className="leading-relaxed">
              Daily Ticker is operated in the United States. If you are accessing our service from outside the US, please
              be aware that your information may be transferred to, stored, and processed in the US where our servers and
              third-party service providers are located.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">11. Changes to This Policy</h2>
            <p className="leading-relaxed">
              We may update this privacy policy from time to time to reflect changes in our practices or legal
              requirements. We will notify subscribers of any material changes via email or by posting a notice on our
              website. Continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">12. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this privacy policy or how we handle your data, please contact us at{" "}
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
