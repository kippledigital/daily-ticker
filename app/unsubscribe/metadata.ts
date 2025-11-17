import type { Metadata } from "next"

// Metadata for unsubscribe page - should be noindex since it's a utility page
export const metadata: Metadata = {
  title: "Unsubscribe — Daily Ticker",
  description: "Unsubscribe from Daily Ticker email newsletter. We're sorry to see you go!",
  alternates: {
    canonical: "https://dailyticker.co/unsubscribe",
  },
  robots: {
    index: false, // Don't index unsubscribe pages - they're utility pages
    follow: true,
  },
}

