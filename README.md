# 🧾 Daily Ticker

A daily, clear & actionable market brief for people who want to be in the action but don't have time to do the research.

**Live Site:** [dailyticker.co](https://dailyticker.co)
**Twitter:** [@GetDailyTicker](https://twitter.com/GetDailyTicker)
**Contact:** brief@dailyticker.co

## 🚀 Tech Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Animation:** Framer Motion
- **Market Data:** Polygon.io API (real-time stock quotes)
- **Email:** Beehiiv/ConvertKit API
- **Automation:** Gumloop for data fetching
- **Hosting:** Vercel
- **Analytics:** Umami (optional)

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ (Note: create-next-app v16 requires Node 20+, but this project uses manual setup)
- npm or pnpm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd daily-ticker
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:
- **Polygon.io API key** (for real-time stock data) - [Get free key](https://polygon.io)
- Beehiiv API key and publication ID
- Gumloop endpoint and API key
- (Optional) Analytics ID

**See [POLYGON_SETUP.md](POLYGON_SETUP.md) for detailed Polygon.io integration guide**

4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
daily-ticker/
├── app/
│   ├── api/
│   │   └── subscribe/      # Email subscription endpoint
│   ├── privacy/            # Privacy policy page
│   ├── layout.tsx          # Root layout with SEO meta
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles
│   ├── manifest.ts         # PWA manifest
│   └── sitemap.ts          # SEO sitemap
├── components/
│   ├── TickerBoard.tsx     # Animated stock ticker
│   └── SubscribeForm.tsx   # Email signup form
├── lib/
│   └── getBriefs.ts        # Gumloop API utilities
├── public/
│   ├── favicon.ico         # Favicon
│   ├── og.png              # OG image
│   └── robots.txt          # SEO robots
└── daily-ticker-prd.md     # Product requirements doc
```

## 🔧 Configuration

### Email Integration (Beehiiv)

1. Sign up at [Beehiiv](https://beehiiv.com)
2. Get your API key from Settings > Integrations
3. Add to `.env.local`:
```
BEEHIIV_API_KEY=your_key
BEEHIIV_PUBLICATION_ID=your_id
```

### Market Data (Gumloop)

1. Set up your Gumloop automation workflow
2. Configure Google Sheets watchlist
3. Add webhook endpoint to `.env.local`

### Deploy to Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Configure custom domain: `dailyticker.co`

## 🎨 Design System

- **Background:** `#0B1E32`
- **LED Green:** `#00FF88`
- **LED Red:** `#FF3366`
- **Fonts:** Inter (sans), Space Mono (mono)

## 📬 Email Setup

Configure SPF/DKIM/DMARC for `brief@dailyticker.co`:

```
TXT @ "v=spf1 include:_spf.google.com ~all"
TXT default._domainkey "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY"
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:brief@dailyticker.co"
```

## 🚦 Roadmap

- [x] Landing page with animated ticker
- [x] Email subscription form
- [x] Privacy policy
- [ ] Beehiiv API integration
- [ ] Gumloop webhook setup
- [ ] Email template design
- [ ] Brief archive page
- [ ] Analytics dashboard

## 📊 Success Metrics

- Open rate > 45%
- Click-through > 10%
- Subscribers > 1000 in 6 months
- Unsubscribe rate < 3%

## 📝 License

© 2025 Daily Ticker. All rights reserved.

## 🤝 Contributing

This is a private project. For questions or feedback, contact brief@dailyticker.co
