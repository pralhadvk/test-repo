---
title: "Phase 2 — Virality Overview"
phase: 2
status: in_progress
tags: [phase-2, virality, overview, growth]
created: 2026-06-06
updated: 2026-06-06
week: 2
priority: high
---

# Phase 2 — Virality

> **Goal:** Make every result shareable — this is the growth loop.  
> **Timeline:** Week 2 (after Phase 1 is live)  
> **Deliverable for YC:** "Our K-factor is Z. Users share results organically. Here's the traffic."

---

> [!success] Phase 2 Complete — Shipped 2026-06-06
> All 3 sections built and deployed. Every search is now shareable, trending is live, and collections are available.

---

## Sections

| Section | Description | Status | Priority |
|---------|-------------|--------|----------|
| [[2.1 Shareable Result Pages]] | /s/[slug] public pages with OG images | `completed` | 🔴 high |
| [[2.2 Trending Searches]] | /trending + homepage trending chip | `completed` | 🟡 medium |
| [[2.3 Collections]] | Save results, public collections, SEO-indexed | `completed` | 🟡 medium |

---

## What Was Built

### 2.1 Shareable Result Pages
- `app/s/[slug]/page.tsx` — public shareable page with dark glassmorphism UI
- `app/s/[slug]/opengraph-image.tsx` — auto-generated 1200×630 OG image (nodejs runtime)
- `app/s/[slug]/ShareButtons.tsx` — copy link + Twitter + WhatsApp share buttons
- Share bar on homepage: "View page", "Copy link", "Save" buttons appear after every search
- Slug already stored in `searches.slug` from Phase 1 (nanoid 8 chars)
- API now returns `slug` in response for immediate share access

### 2.2 Trending Searches
- `app/trending/page.tsx` — server component with period filter (Today / This Week / All Time)
- `app/trending/TrendingClient.tsx` — clickable ranked list with progress bars, medal icons
- "See trending →" chip added to homepage example chips row
- Trending link added to Navbar
- SQL: `GROUP BY query ORDER BY count DESC` on `searches` table

### 2.3 Collections
- `collections` + `collection_items` tables created in Neon DB
- `app/api/collections/route.ts` — POST endpoint to create collection + save a search
- `app/collections/[id]/page.tsx` — public collection page showing all saved searches
- "Save" button on homepage opens modal → enter name → creates collection → shows permalink
- Collections are public, permanent, and shareable (no auth required)

---

## The Growth Loop

```
User searches → gets top 3 → shares /s/[slug] link
     ↓
Friend opens link (no login needed)
     ↓
Friend is impressed → searches something themselves
     ↓
Friend saves to collection → bookmarks permalink
     ↓
Friend shares their result → loop repeats
```

---

## Related

- [[01 - Phase 1 Foundation/Overview]] — prerequisite
- [[03 - Phase 3 Monetization/Overview]] — next phase
