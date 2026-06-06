---
title: "3C Search — Project Overview"
phase: null
status: in_progress
tags: [meta, overview, project]
created: 2026-06-06
updated: 2026-06-06
---

# 3C Search

> **Top 3 curated AI results for anything you search.**  
> The hook: fast, opinionated, concise. No scrolling through 10 blue links.

---

## Elevator Pitch

3C Search returns exactly 3 results for any query — ranked, explained, and shareable. Powered by GPT-4o-mini via OpenRouter. Built for people who want a fast answer, not a list of links.

---

## Live URLs

| Environment | URL |
|-------------|-----|
| Production | https://test-repo-seven-lyart.vercel.app |
| Progress Dashboard | https://test-repo-seven-lyart.vercel.app/progress |
| GitHub | https://github.com/pralhadvk/test-repo |
| Vercel Project | https://vercel.com/pralhadkolambkar-8090s-projects/test-repo |

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router) | Vercel-native, server components + API routes |
| Styling | Tailwind CSS | Fast, consistent dark UI |
| AI | OpenRouter → GPT-4o-mini | Flexible model switching, cost-effective |
| Database | Neon PostgreSQL | Serverless, branching, Vercel integration |
| Auth (planned) | Clerk | Native Vercel Marketplace, free tier |
| Payments (planned) | Stripe | Industry standard, Vercel integration |
| Hosting | Vercel | Auto-deploy from GitHub, edge functions |

---

## Current State (Phase 0 — Done)

> [!success] Shipped
> - Dark glassmorphism UI with Nord-inspired design
> - OpenRouter AI search returning top 3 structured results
> - Shareable Google links per result
> - /progress page with recharts gauges + interactive Neon-backed task tree
> - 79-task YC roadmap stored in PostgreSQL as `version_1`

---

## What Makes It Different

- **Opinionated** — forces a top 3, no scrolling
- **Shareable** — every result will be a link (Phase 2)
- **Compound** — history, trending, collections build up over time
- **Monetizable** — affiliate links + Pro tier are natural extensions

---

## Related Pages

- [[CLAUDE.md]] — wiki schema
- [[00 - Meta/YC Checklist]] — YC readiness tracker
- [[00 - Meta/Architecture]] — system design
- [[01 - Phase 1 Foundation/Overview]] — next milestone
