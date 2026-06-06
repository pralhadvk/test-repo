---
title: "System Architecture"
phase: null
status: in_progress
tags: [meta, architecture, technical]
created: 2026-06-06
updated: 2026-06-06
---

# System Architecture

---

## Current Architecture

```
User → Vercel Edge → Next.js App Router
                         │
              ┌──────────┴──────────┐
              │                     │
         /api/search           /api/tasks
              │                     │
        OpenRouter API        Neon PostgreSQL
        (GPT-4o-mini)         (tasks, plan_versions)
```

---

## Planned Architecture (Phase 1+)

```
User → Clerk Auth → Next.js App Router
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   /api/search      /api/tasks      /api/user
        │                │                │
  OpenRouter      Neon PostgreSQL    Clerk API
  + DB cache      (users, searches,
                   results, cache,
                   collections)
```

---

## Database Schema (Current)

```sql
plan_versions  — id, version, notes, created_at
tasks          — id, version_id, parent_id, phase, order_index,
                 title, description, status, created_at,
                 updated_at, completed_at
```

## Database Schema (Phase 1 additions)

```sql
users          — id, clerk_id, email, name, plan, created_at
searches       — id, user_id, query, category, slug, created_at
search_results — id, search_id, rank, name, description
cache          — id, query_hash, result_json, created_at, expires_at
collections    — id, user_id, name, is_public, created_at
```

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth | Clerk | Native Vercel Marketplace, fastest to ship |
| DB | Neon | Serverless PostgreSQL, branching for dev/prod |
| AI | OpenRouter | Model-agnostic, swap without code changes |
| ORM | Raw SQL (pg) | Simple, no abstraction overhead for this scale |
| Deployment | Vercel | Auto-deploy, edge functions, env var management |

---

## Related Pages

- [[00 - Meta/Stack Decisions]] — deeper rationale per tech
- [[01 - Phase 1 Foundation/1.1 Database Schema]] — schema implementation
