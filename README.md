# 3C Search

> AI-powered ranked search with categories, virality, monetization, and a data moat. Built for YC.

**Live app:** https://test-repo-seven-lyart.vercel.app

---

## What It Is

3C Search is an AI search product that returns the **top 3 curated results** for any query — not a wall of links. It is category-aware (food, travel, tech, finance, entertainment), share-friendly, and built with a defensible data layer of human-verified results that outperform raw GPT output.

---

## Features

### Phase 1 — Foundation
- **AI Search**: OpenRouter (GPT-4o-mini) returns ranked top-3 results per query
- **Category-aware prompts**: each category gets a specialized system prompt
- **24h query cache**: MD5-hashed cache in Neon PostgreSQL — zero API calls on repeat queries
- **Search history**: all searches persisted to DB with user_id (auth) or anonymous
- **Dashboard** (`/dashboard`): search history with stats and replay
- **Progress tracker** (`/progress`): live build task tracker with Recharts gauges

### Phase 2 — Virality
- **Shareable result pages** (`/s/[slug]`): every search gets a public permalink with OG image (1200×630 dark card), Twitter/X and WhatsApp share buttons, clipboard copy
- **Trending searches** (`/trending`): Today / This Week / All Time tabs with animated ranked list and category filters
- **Collections** (`/collections/[id]`): save multiple searches into a named collection with a shareable permalink

### Phase 3 — Monetization
- **Category selector**: 5-pill UI (Food, Travel, Tech, Finance, Entertainment) with dynamic placeholders
- **Affiliate links**: inline buttons on each result card — Yelp/Maps (food), Booking.com/Skyscanner (travel), GitHub/npm (tech), JustWatch/IMDb (entertainment). All clicks tracked.
- **Pro tier** (`/pricing`): Free (10 searches/day, top 3) vs Pro ($9/mo — unlimited, top 5, CSV export). Stripe-ready.
- **Usage tracker**: dot row UI showing daily searches consumed; upgrade prompt at limit

### Phase 4 — Defensibility
- **Browser extension**: Manifest V3 Chrome extension — right-click any selected text to search, or use the popup with category pills, result cards, and recent searches history
- **Public API** (`/developer`): `POST /api/v1/search` with `Bearer sk_3c_...` auth, 100 req/day free, full docs + live key generator
- **Curated verticals**: human-verified results for key queries (Hyderabad restaurants, JS frameworks, etc.) served before AI — the data moat
- **Analytics dashboard** (`/admin?secret=...`): 8 KPI cards, 7-day volume chart, category pie, top queries, affiliate clicks, curated status

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS (dark glassmorphism) |
| Database | Neon PostgreSQL (serverless) |
| AI | OpenRouter API → GPT-4o-mini |
| Payments | Stripe (checkout + webhooks) |
| Charts | Recharts |
| Deployment | Vercel |
| Extension | Chrome Manifest V3 |

---

## Project Structure

```
app/
├── page.tsx                  # Main search UI
├── trending/                 # Trending searches page
├── s/[slug]/                 # Shareable result pages + OG images
├── collections/[id]/         # Public collection pages
├── pricing/                  # Free vs Pro pricing
├── dashboard/                # Search history
├── developer/                # API docs + key generation
├── admin/                    # Analytics dashboard (owner-only)
├── progress/                 # Build task tracker
├── components/
│   ├── CategorySelector.tsx
│   ├── Navbar.tsx
│   └── UpgradeModal.tsx
└── api/
    ├── search/               # Core search (curated → cache → OpenRouter)
    ├── collections/          # Collection CRUD
    ├── affiliate-click/      # Affiliate CTR tracking
    ├── stripe/               # Checkout + webhook
    ├── v1/search/            # Public API (Bearer auth)
    └── v1/keys/              # API key generation

extension/                    # Chrome extension (load unpacked)
├── manifest.json
├── background.js             # Context menu → open tab
├── popup.html / popup.js     # Mini search UI
└── style.css
```

---

## Database Schema

```sql
searches          -- every query (user_id, query, category, slug, created_at)
search_results    -- ranked results per search (rank, name, description, url)
cache             -- 24h query cache (query_hash, results JSONB)
collections       -- named collections (id, name, created_at)
collection_items  -- search ↔ collection join
affiliate_clicks  -- CTR tracking (search_id, result_name, affiliate_type)
users             -- user plans (user_id, email, plan: free|pro)
api_keys          -- public API keys (key, label, usage_total, rate_limit)
curated_results   -- human-verified results (query_hash, vertical, city, results JSONB)
```

---

## Live Routes

| Route | Description |
|-------|-------------|
| `/` | Main search |
| `/trending` | Trending queries |
| `/s/[slug]` | Shareable result page |
| `/collections/[id]` | Public collection |
| `/pricing` | Free vs Pro |
| `/dashboard` | Search history |
| `/developer` | API docs + key gen |
| `/admin?secret=...` | Analytics (owner-only) |
| `/progress` | Build task tracker |

---

## Environment Variables

```env
# Required
OPENAI_API_KEY=           # OpenRouter API key
DATABASE_URL=             # Neon PostgreSQL connection string

# Stripe (Pro tier)
STRIPE_SECRET_KEY=
STRIPE_PRO_PRICE_ID=
STRIPE_WEBHOOK_SECRET=

# Admin dashboard
ADMIN_SECRET=             # Protects /admin route

# Auth (optional — activates Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

---

## Local Development

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`.

**Browser extension:** Go to `chrome://extensions` → Developer mode → Load unpacked → select the `extension/` folder.

---

## Build Status

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Foundation (DB, cache, history) | Complete |
| 1.2 | Clerk auth | Pending env vars |
| 2 | Virality (share, trending, collections) | Complete |
| 3 | Monetization (categories, affiliate, Pro) | Complete |
| 3.2 | Affiliate program signup | Review |
| 4 | Defensibility (extension, API, curated, analytics) | Complete |
| 4.3 | Curated verticals expansion (Mumbai, Bangalore, Delhi) | Todo |

**71/79 tasks completed.**
