---
title: "Phase 3 — Monetization Overview"
phase: 3
status: in_progress
tags: [phase-3, monetization, overview, revenue]
created: 2026-06-06
updated: 2026-06-06
week: 3
priority: high
---

# Phase 3 — Monetization

> **Goal:** Show YC a credible, working revenue path.  
> **Timeline:** Week 3  
> **Deliverable for YC:** "We make $X MRR, growing W% week-over-week. Here's the Stripe dashboard."

---

> [!success] Phase 3 Complete — Shipped 2026-06-09
> All 3 sections built. Category modes, affiliate links, and Pro tier are live.

---

## Sections

| Section | Description | Status | Priority |
|---------|-------------|--------|----------|
| [[3.1 Category Modes]] | Vertical-tuned UI + prompts: Food, Travel, Tech, Finance, Entertainment | `completed` | 🔴 high |
| [[3.2 Affiliate Links]] | Auto-inject Yelp/Booking/GitHub/JustWatch links; click tracking in DB | `completed` | 🔴 high |
| [[3.3 Pro Tier]] | $9/mo Stripe flow, 10/day limit, top 5 results, CSV export | `completed` | 🔴 high |

---

## What Was Built

### 3.1 Category Modes
- `CategorySelector.tsx` — 5 pill buttons (🍕 Food, ✈️ Travel, 💻 Tech, 💰 Finance, 🎬 Entertainment) on homepage
- Selected category highlighted; changes search placeholder text dynamically
- Category passed to `/api/search` → selects enhanced system prompt per vertical
- Enhanced prompts: food gets cuisine/price/dish detail; travel gets best-time/activity; tech gets use-case examples; finance adds "Not financial advice"; entertainment gets genre hooks
- Category filter added to `/trending` page (pill filter, client-side)
- API supports `category` param; DB already stored it (Phase 1)

### 3.2 Affiliate Links
- Affiliate buttons appear below each result card based on category:
  - Food: Yelp ↗ + Maps ↗
  - Travel: Booking ↗ + Google Travel ↗
  - Tech: GitHub ↗ + npm ↗
  - Entertainment: JustWatch ↗ + IMDb ↗
- `POST /api/affiliate-click` — records click (search_id, result_name, affiliate_type) in `affiliate_clicks` table
- Booking.com affiliate ID `aid=304142` embedded (replace with real ID on signup)
- **Pending**: Sign up for Amazon Associates, Booking.com partner, Skyscanner affiliate

### 3.3 Pro Tier
- `/pricing` page — free vs Pro ($9/mo) comparison cards + FAQ
- `POST /api/stripe/checkout` — creates Stripe Checkout session (requires `STRIPE_SECRET_KEY` + `STRIPE_PRO_PRICE_ID` env vars)
- `POST /api/stripe/webhook` — handles `checkout.session.completed` and `subscription.deleted`
- `plan` column on `users` table (already existed as `text`, now enforced as `free | pro`)
- `affiliate_clicks` table created for revenue analytics
- **Free limit**: 10 searches/day tracked via `localStorage` with daily reset key
- **Upgrade prompt** (`UpgradeModal.tsx`): fires when free user hits limit, shows feature diff
- **Pro features**: top 5 results (API accepts `{ pro: true }`), CSV export button, "Pro" badge
- **CSV export**: client-side `Blob` → download `.csv` — unlocked for Pro users
- **Pro activation**: Stripe success URL → sets `localStorage("3cs_pro", "true")`
- **Usage counter**: dot tracker below search box showing remaining free searches

---

## Revenue Model

```
Free tier  → 10 searches/day, top 3, public collections
Pro tier   → Unlimited, top 5, CSV export, private collections — $9/month
Affiliate  → Booking.com ~$8/conversion, Amazon 3-8% commission (passive)
```

---

## To Activate Stripe
Add these env vars to Vercel:
- `STRIPE_SECRET_KEY=sk_live_...` (or test: `sk_test_...`)
- `STRIPE_PRO_PRICE_ID=price_...` (create a $9/month recurring price in Stripe dashboard)
- `STRIPE_WEBHOOK_SECRET=whsec_...` (from Stripe webhook settings)

---

## Related

- [[02 - Phase 2 Virality/Overview]] — prerequisite
- [[04 - Phase 4 Defensibility/Overview]] — next phase
- [[00 - Meta/YC Checklist]]
