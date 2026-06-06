---
title: "Phase 1 — Foundation Overview"
phase: 1
status: todo
tags: [phase-1, foundation, overview]
created: 2026-06-06
updated: 2026-06-06
week: 1
priority: high
---

# Phase 1 — Foundation

> **Goal:** Turn the demo into a real product with accounts and memory.  
> **Timeline:** Week 1  
> **Deliverable for YC:** "We have X users with Y searches. Users return for their history."

---

> [!info] Status: Not Started
> Start here. Phase 1 is the prerequisite for everything else — without auth and history, there's no retention data for YC.

---

## Sections

```dataview
TABLE status, priority, week
FROM "01 - Phase 1 Foundation"
WHERE section != null
SORT order ASC
```

| Section | Description | Status | Priority |
|---------|-------------|--------|----------|
| [[1.1 Database Schema]] | Core tables: users, searches, results, cache | `todo` | 🔴 high |
| [[1.2 Auth with Clerk]] | Sign up/in, session management, route protection | `todo` | 🔴 high |
| [[1.3 Search History Dashboard]] | /dashboard, saved searches, cache layer | `todo` | 🔴 high |

---

## Dependencies

- Requires: Nothing (this is Phase 1)
- Unlocks: [[02 - Phase 2 Virality/Overview]]

---

## Deliverable Definition

> [!tip] "Done" for YC means:
> - User can sign up with Google or email via Clerk
> - Every search is saved to their account in Neon
> - /dashboard shows their full history with replay
> - Repeated queries return from cache (no API call = zero cost)
> - You can show YC a user count and search volume graph

---

## Tech Checklist

- [ ] `npm install @clerk/nextjs` + configure
- [ ] `npx drizzle-kit push` or raw SQL migration for new tables
- [ ] Clerk webhook → sync user to `users` table
- [ ] Wrap `/api/search` to save results after response
- [ ] Build `/dashboard` page with Dataview-style table of searches
- [ ] Add `cache` table lookup before every OpenRouter call

---

## Related

- [[00 - Meta/Architecture]] — schema design
- [[00 - Meta/Stack Decisions]] — why Clerk
