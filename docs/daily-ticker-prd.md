---
title: "Daily Ticker — Product PRD + Build Spec"
author: "Nikki Kipple"
date: 2025-10-25
version: 1.0
---

# 🧾 Product PRD: Daily Ticker

## 1. Overview  
**Product Name:** Daily Ticker  
**Domain:** [dailyticker.co](https://dailyticker.co)  
**Twitter:** [@GetDailyTicker](https://twitter.com/GetDailyTicker)  
**Primary Email:** brief@dailyticker.co  
**Stack:** Cursor (front-end)  |  Gumloop (data automation)  |  Google Workspace (email infra)  |  Vercel (hosting)  

**One-liner:**  
> A daily, plain-English market brief for people who want to be in the action but don’t have time to do the research.

---

## 2. Mission & Goals  
Make stock insights **clear, actionable, and human.**  
- Summarize the market and top tickers before the bell each morning.  
- Empower casual investors to understand *why* moves happen, not just *what* moved.  
- Create trust through transparency (no hype, no FOMO).  

---

## 3. Audience  
**Primary:** busy professionals & light investors ($1k–$100k in assets) who want credible, digestible insights.  
**Secondary:** design-minded or tech-curious readers who enjoy clean data visualization and UX.  

**Pain Points:**  
- Feeds are cluttered or too technical.  
- No time to research or verify tickers.  
- Want a brief that feels human, not algorithmic.  

---

## 4. Core Experience  
### 🕗 Morning Brief  
- Sent 8 AM Mon–Fri.  
- HTML email built via Gumloop + Google Sheets data.  
- Features 3–5 tickers with plain-English context, actionable takeaways, and risk levels.  

### 🗓️ Friday Market Wrap  
- End-of-week roundup after market close.  
- Includes summary of top performers, watchlist updates, and educational insights.  

### ⚡ Landing Page  
- Animated stock ticker UI (similar to airport/market board).  
- Email signup form connected to Beehiiv or ConvertKit.  
- OG image + favicon for shareability.  
- Live “Today’s Top Moves” feed from watchlist data.  

---

## 5. Compliance & Trust  
Add visible disclaimer:  
> Daily Ticker is for educational purposes only and does not provide financial advice.  

All emails include unsubscribe and contact link (brief@dailyticker.co).  

---

## 6. Marketing Plan  
**Phase 1: Soft Launch**  
- Announce via Twitter profile (@GetDailyTicker).  
- Share sample brief screenshots.  
- Add “Join the Morning Brief” CTA on landing page.  

**Phase 2: SEO & Content**  
- Publish archive of past briefs (tagged by sector and ticker).  
- Create “How to Read the Market” micro-guides for SEO traffic.  

**Phase 3: Engagement**  
- Introduce “Week in Charts” visual recaps on social.  
- Test polls and community features (e.g., “Pick Next Week’s Watchlist”).  

---

## 7. Monetization Plan (Future)  
- Freemium newsletter model (Free brief + Paid “Deep Dive”).  
- Annual one-time payment preferred ($30–50 range).  
- Affiliate or sponsorship optional later but secondary to trust.  

---

## 8. Roadmap  

| Phase | Focus | Deliverables |
|-------|-------|--------------|
| Week 1 | Setup | Domain + email + automation connection |
| Week 2 | Landing Page MVP | Ticker animation + email form |
| Week 3 | Brand Launch | Social branding + sample brief |
| Week 4 | Friday Wrap | Weekly summary flow |
| Month 2 | Beehiiv Integration | Automated sign-up → email sequence |
| Month 3 | Analytics & Refinement | Open rates tracking + content iteration |

---

## 9. Metrics of Success  
- Open rate > 45 %  
- Click-through > 10 %  
- Subscribers > 1000 in 6 months  
- Unsubscribe rate < 3 %  
- Repeat visitors to archive > 20 % of traffic  

---

# 🧰 Build Spec for Cursor / Vercel

## 💻 Tech Stack
- **Frontend:** Next.js (Vercel) + Tailwind + Framer Motion (ticker animation)  
- **Backend:** Gumloop for data fetch + Google Sheets watchlist storage  
- **Email:** Google Workspace → Beehiiv/ConvertKit API  
- **Hosting:** Vercel (dailyticker.co)  

## 🧩 Core Features
- Animated Ticker Board Component (`TickerBoard.tsx`)  
- Email Signup (`SubscribeForm.tsx`) → Beehiiv API POST  
- Daily Brief Fetch (`getBriefs.ts`) from Gumloop endpoint  
- SEO meta + OG image (`/public/og.png`)  
- Friday Wrap conditional trigger (`isFriday` check in Gumloop)  

## 🖼️ Design Notes
- Dark background #0B1E32 with LED-style green/red type.  
- Font: Inter / Space Mono for ticker digits.  
- Add subtle scroll animation (simulate market feed).  
- Button: “Join the Morning Brief →” (primary CTA).  

## 🔒 Security & Compliance
- SPF/DKIM/DMARC verified for `brief@dailyticker.co`.  
- Add `robots.txt` and `/privacy` page.  
- Disclaimer in footer.  

## 📬 Integrations
- Beehiiv or ConvertKit API for subscriber sync.  
- Gumloop Webhook → Send Morning Brief email.  
- Optional Fidelity or Polygon.io API for price feed (upgrade path).  

## 🧠 Next Steps
1. Finalize Beehiiv setup (API key + form ID).  
2. Generate favicon & OG image (`/public/og.png`).  
3. Build animated ticker component.  
4. Add daily brief email template test (send via Gumloop).  
5. Connect analytics (Umami or Plausible).  
