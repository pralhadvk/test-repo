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
