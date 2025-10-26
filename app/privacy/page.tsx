import { TrendingUp } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0B1E32]">
      {/* Header */}
      <header className="border-b border-[#1a3a52] bg-[#0B1E32]/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <TrendingUp className="h-6 w-6 text-[#00ff88]" />
            <h1 className="text-xl font-bold text-white font-mono">Daily Ticker</h1>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Information We Collect</h2>
            <p className="leading-relaxed">
              When you subscribe to Daily Ticker, we collect your email address to deliver our daily market brief. We
              may also collect information about how you interact with our emails and website.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">How We Use Your Information</h2>
            <p className="leading-relaxed">
              We use your email address solely to send you our daily market brief and occasional updates about Daily
              Ticker. We will never sell, rent, or share your email address with third parties for marketing purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Email Communications</h2>
            <p className="leading-relaxed">
              You can unsubscribe from our emails at any time by clicking the unsubscribe link at the bottom of any
              email. We respect your inbox and your time.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Data Security</h2>
            <p className="leading-relaxed">
              We take reasonable measures to protect your personal information from unauthorized access, use, or
              disclosure. Your data is stored securely and handled with care.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Changes to This Policy</h2>
            <p className="leading-relaxed">
              We may update this privacy policy from time to time. We will notify subscribers of any material changes
              via email or by posting a notice on our website.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this privacy policy or how we handle your data, please contact us at{" "}
              <a href="mailto:brief@dailyticker.co" className="text-[#00ff88] hover:underline">
                brief@dailyticker.co
              </a>
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-[#1a3a52]">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
