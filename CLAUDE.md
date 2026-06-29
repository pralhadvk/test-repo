# CLAUDE.md — Wiki Schema for 3C Search Build

This file is the operating contract between the human (pralhadvk) and the LLM (Claude).  
It defines how this Obsidian vault is structured, what every page type looks like, and how to maintain it.  
Read this file at the start of every session. Keep it updated as conventions evolve.

---

## Purpose

This vault is the living knowledge base for building **3C Search** into a YC-ready product.  
It follows the Karpathy LLM-wiki pattern: the LLM writes and maintains all pages; the human curates, directs, and asks questions.  
Source documents go in `raw/`. The wiki sits above them — synthesized, cross-referenced, always current.

---

## How to Work Here (always)

These behavioral rules apply to all work in this repo — wiki edits and app code alike. They supersede the standalone `rules.md` (which can be retired).

**1. Think before coding.** State assumptions explicitly; if uncertain, ask. If multiple interpretations exist, present them — don't pick silently. If a simpler approach exists, say so.

**2. Simplicity first.** Minimum that solves the problem. No features beyond what was asked, no abstractions for single-use code, no speculative flexibility, no error handling for impossible cases. If 200 lines could be 50, rewrite. Test: "Would a senior engineer call this overcomplicated?"

**3. Surgical changes.** Touch only what the request requires. Match existing style. Don't refactor working code or "improve" adjacent lines. Remove only the orphans *your* change created; mention pre-existing dead code, don't delete it. Every changed line should trace to the request.

**4. Goal-driven execution.** Turn the task into a verifiable check (a test or command), then loop until it passes. Weak criteria ("make it work") need constant clarification; strong ones let you finish independently.

### Before a big or risky change
Stress-test the plan before building it: run `/grill-me`, or `/grill-with-docs` to also capture the resulting decisions. Don't implement on top of an unexamined plan.

### Keep docs current
After any change that alters purpose, scope, contracts, structure, or rules, update the affected pages (this file, `index.md`, the relevant section page) per the Operations rules below. Delete stale or contradictory lines immediately — these docs are living contracts, not changelogs.

---

## Folder Structure

```
CLAUDE.md                      ← this file (schema)
index.md                       ← master catalog (update on every change)
log.md                         ← append-only activity log
raw/                           ← immutable source documents (never modify)
resources/                     ← images, assets, diagrams
00 - Meta/                     ← project overview, YC checklist, decisions
01 - Phase 1 Foundation/       ← Week 1 tasks
02 - Phase 2 Virality/         ← Week 2 tasks
03 - Phase 3 Monetization/     ← Week 3 tasks
04 - Phase 4 Defensibility/    ← Week 4+ tasks
```

---

## Color Coding (PLN Nord Theme)

Use these status tags and callout types consistently:

| Status | Callout | Nord Color | Meaning |
|--------|---------|-----------|---------|
| `todo` | `[!info]` | `#5e81ac` Blue | Not started |
| `in_progress` | `[!warning]` | `#d08770` Orange | Actively being built |
| `completed` | `[!success]` | `#a3be8c` Green | Done and deployed |
| `blocked` | `[!danger]` | `#bf616a` Red | Blocked, needs resolution |
| `review` | `[!tip]` | `#ebcb8b` Yellow | Built, needs review |

Phase accent colors:
- Phase 1 Foundation → `#5e81ac` (Nord Blue)
- Phase 2 Virality → `#b48ead` (Nord Purple)
- Phase 3 Monetization → `#a3be8c` (Nord Green)
- Phase 4 Defensibility → `#ebcb8b` (Nord Yellow)

---

## Page Frontmatter Schema

Every page (except index.md, log.md, CLAUDE.md) must have YAML frontmatter:

```yaml
---
title: "Page Title"
phase: 1          # 1-4, or null for meta pages
section: "1.1"    # section number, or null
status: todo      # todo | in_progress | completed | blocked | review
tags: [phase-1, foundation, database]
created: 2026-06-06
updated: 2026-06-06
priority: high    # high | medium | low
week: 1           # target delivery week
---
```

---

## Page Types

### Overview Page (one per phase)
- Summary of the phase goal
- Dataview table of all sections in that phase
- Dependencies on other phases
- Deliverable definition (what "done" looks like for YC)

### Section Page (e.g., 1.1 Database Schema)
- What it is and why it matters
- Task checklist (synced from DB)
- Tech decisions and rationale
- Links to raw sources used
- Blockers / open questions

### Meta Pages (in `00 - Meta/`)
- Project overview, stack, decisions log
- YC application checklist
- Architecture diagram descriptions

---

## Operations

### When a new task is started
1. Update the section page status → `in_progress`
2. Add a log entry to `log.md`
3. Update `index.md` status column

### When a task is completed
1. Update frontmatter `status: completed`
2. Update the phase Overview page task count
3. Add log entry
4. Update `index.md`

### When a new source is added to `raw/`
1. Read it, extract key insights
2. Update or create relevant section pages
3. Cross-link where relevant
4. Log the ingest in `log.md`

### Lint (run periodically)
- Find pages with no inbound links
- Find `todo` tasks that are overdue
- Flag contradictions between pages
- Check for missing cross-references

---

## Dataview Queries

Use these standard queries in Overview pages:

```dataview
TABLE status, priority, week
FROM "01 - Phase 1 Foundation"
SORT status ASC
```

Progress summary on index.md:
```dataview
TABLE length(rows) AS count
FROM ""
WHERE phase != null
GROUP BY status
```

---

## Log Entry Format

Every log entry starts with a parseable prefix:
```
## [2026-06-06] ingest | Source Title
## [2026-06-06] build | Task completed: 1.1 Database Schema
## [2026-06-06] query | Question asked + answer filed
## [2026-06-06] lint  | Health check findings
```

Unix grep: `grep "^## \[" log.md | tail -10`
