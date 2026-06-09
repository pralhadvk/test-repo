# Activity Log

Append-only. Never delete entries.  
Parse last 10 entries: `grep "^## \[" log.md | tail -10`

---

## [2026-06-06] build | Vault initialized — 3C Search wiki created

- Created folder structure: 00–04 phases, raw/, resources/
- Created CLAUDE.md schema following Karpathy LLM-wiki pattern
- Created index.md master catalog
- Created all phase Overview pages and section notes (16 pages)
- Stack: Next.js 14, Tailwind CSS, Neon PostgreSQL, OpenRouter, Vercel
- Live URLs: https://test-repo-seven-lyart.vercel.app
- 79 tasks stored in Neon DB as version_1
- Progress dashboard live at /progress

---

## [2026-06-09] build | Phase 4 complete — Defensibility shipped

- **4.1 Browser Extension**: Manifest V3 Chrome extension in `extension/` folder. Context menu "3C Search this" + popup mini UI with category selector, results, recent searches. Load unpacked to test.
- **4.2 Public API**: `POST /api/v1/search` with `Bearer sk_3c_...` auth. `api_keys` table + key generation. `/developer` page with full docs, cURL/JS examples, live key generator.
- **4.3 Curated Verticals**: `curated_results` table with 7 seeded queries (Hyderabad restaurants + Tech tools). Search API checks curated first — human-verified results override AI. Returns `"curated": true` flag.
- **4.4 Analytics Dashboard**: `/admin?secret=...` page with 8 KPI cards, 7-day area chart, category pie chart, top queries bar chart, affiliate clicks chart, curated verticals status.
- Navbar updated with API link.
- 23/25 Phase 4 tasks completed; 2 todo (city expansion, email digest).
- Vault: all Phase 4 notes updated.

---

## [2026-06-09] build | Phase 3 complete — Monetization shipped

- **3.1 Category Modes**: CategorySelector UI (5 pills) on homepage; enhanced per-category prompts (food/travel/tech/finance/entertainment); dynamic placeholder; category filter on /trending
- **3.2 Affiliate Links**: Inline buttons on result cards (Yelp/Maps, Booking/Travel, GitHub/npm, JustWatch/IMDb); `affiliate_clicks` table; `POST /api/affiliate-click` tracking; Booking.com aid placeholder ready
- **3.3 Pro Tier**: `/pricing` page (free vs $9/mo); Stripe checkout + webhook (`/api/stripe/checkout`, `/api/stripe/webhook`); 10/day free limit via localStorage dot tracker; UpgradeModal; top 5 results for Pro; CSV export; Pro badge
- stripe package installed; `affiliate_clicks` table created in Neon
- 18/19 Phase 3 tasks `completed`, 1 `review` (affiliate signup pending)
- Vault: Overview, 3.1, 3.2, 3.3, index.md, log.md updated

---

## [2026-06-06] build | Phase 2 complete — Virality shipped

- **2.1 Shareable Result Pages**: Every search has a public `/s/[slug]` page with OG image (1200×630), Twitter + WhatsApp share buttons, clipboard copy. API now returns `slug` on every response.
- **2.2 Trending Searches**: `/trending` page with Today/This Week/All Time tabs, animated ranked list. "See trending →" chip on homepage. Navbar updated.
- **2.3 Collections**: `collections` + `collection_items` tables in Neon. POST `/api/collections`, `/collections/[id]` public page. "Save" button on homepage opens name-entry modal → creates permalink.
- 17 Phase 2 tasks marked `completed` in Neon DB (version_1)
- Vault notes updated: Overview, 2.1, 2.2, 2.3, index.md

---

## [2026-06-06] build | Phase 1 progress dashboard synced

- Updated 14 task statuses in Neon DB (version_1) to reflect actual build state
- 1.1 DB Schema: 4/4 completed
- 1.2 Auth: 3/5 completed, 1 in_progress (user sync), 1 todo (Clerk providers)
- 1.3 Dashboard: 5/5 completed

---

## [2026-06-06] build | Phase 1 complete — Foundation shipped

- **1.1 DB Schema**: `users`, `searches`, `search_results`, `cache` tables live in Neon
- **1.2 Auth**: `@clerk/nextjs` installed, middleware, `/sign-in`, `/sign-up`, navbar with UserButton
- **1.3 Dashboard**: `/dashboard` server component with stats + history cards + replay
- **Cache layer**: 24h MD5-hashed query cache in Neon, zero API calls on cache hits
- **History saving**: All searches persisted (user_id if logged in, null if anonymous for trending)
- **Category prompts**: Food, Travel, Tech, Finance, Entertainment system prompts live
- **Status**: Built and deployed. Auth activates once Clerk keys are added to Vercel.

---

## [2026-06-06] build | Next.js app deployed to Vercel

- Converted preview.html → Next.js 14 + Tailwind app
- Connected GitHub repo: https://github.com/pralhadvk/test-repo
- Connected Neon PostgreSQL database
- Deployed /progress page with recharts gauges and interactive task tree
- OpenRouter API key configured for GPT-4o-mini search

---
