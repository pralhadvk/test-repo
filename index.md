---
title: "Master Index — 3C Search Wiki"
updated: 2026-06-06
---

# 3C Search — Build Wiki Index

> Master catalog of all wiki pages. The LLM updates this on every change. Read this first when answering questions.

---

## Progress Snapshot

```dataview
TABLE length(rows) AS "Pages", phase
FROM ""
WHERE phase != null
GROUP BY status
SORT phase ASC
```

---

## Meta

| Page | Description |
|------|-------------|
| [[CLAUDE.md]] | Wiki schema, conventions, LLM operating instructions |
| [[log.md]] | Append-only activity log |
| [[00 - Meta/3C Search]] | Project overview, stack, live URLs |
| [[00 - Meta/YC Checklist]] | YC application readiness tracker |
| [[00 - Meta/Architecture]] | System architecture and tech decisions |
| [[00 - Meta/Stack Decisions]] | Why each technology was chosen |

---

## Phase 1 — Foundation `Week 1` 🔵

| Page | Status | Priority |
|------|--------|----------|
| [[01 - Phase 1 Foundation/Overview]] | `in_progress` | — |
| [[01 - Phase 1 Foundation/1.1 Database Schema]] | `completed` | high |
| [[01 - Phase 1 Foundation/1.2 Auth with Clerk]] | `in_progress` | high |
| [[01 - Phase 1 Foundation/1.3 Search History Dashboard]] | `completed` | high |

---

## Phase 2 — Virality `Week 2` 🟣

| Page | Status | Priority |
|------|--------|----------|
| [[02 - Phase 2 Virality/Overview]] | `in_progress` | — |
| [[02 - Phase 2 Virality/2.1 Shareable Result Pages]] | `completed` | high |
| [[02 - Phase 2 Virality/2.2 Trending Searches]] | `completed` | medium |
| [[02 - Phase 2 Virality/2.3 Collections]] | `completed` | medium |

---

## Phase 3 — Monetization `Week 3` 🟢

| Page | Status | Priority |
|------|--------|----------|
| [[03 - Phase 3 Monetization/Overview]] | `todo` | — |
| [[03 - Phase 3 Monetization/3.1 Category Modes]] | `todo` | high |
| [[03 - Phase 3 Monetization/3.2 Affiliate Links]] | `todo` | high |
| [[03 - Phase 3 Monetization/3.3 Pro Tier]] | `todo` | high |

---

## Phase 4 — Defensibility `Week 4+` 🟡

| Page | Status | Priority |
|------|--------|----------|
| [[04 - Phase 4 Defensibility/Overview]] | `todo` | — |
| [[04 - Phase 4 Defensibility/4.1 Browser Extension]] | `todo` | high |
| [[04 - Phase 4 Defensibility/4.2 Public API]] | `todo` | medium |
| [[04 - Phase 4 Defensibility/4.3 Curated Verticals]] | `todo` | high |
| [[04 - Phase 4 Defensibility/4.4 Analytics Dashboard]] | `todo` | medium |

---

## Raw Sources

| File | Topic | Date Added |
|------|-------|------------|
| — | — | — |

> Drop source documents into `raw/` and ask Claude to ingest them.
