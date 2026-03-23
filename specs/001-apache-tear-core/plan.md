# Implementation Plan: Apache Tear — Core Application

**Branch**: `001-apache-tear-core` | **Date**: 2026-03-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-apache-tear-core/spec.md`

---

## Summary

Apache Tear is a personal, single-user markdown knowledge base. The core
application delivers: email/password authentication (Supabase Auth), note
creation and editing (textarea + live preview), folder organisation with
drag-and-drop nesting, full-text search (Postgres tsvector), workspace state
persistence, and note export (PDF via print CSS, `.md` via download).

Stack: Next.js 14 App Router · TypeScript strict · Tailwind CSS · Supabase
(Auth + Postgres) · Vercel · pnpm.

Database: Supabase (existing project), schema: "apache"
- All tables created under the "apache" schema, exposed via Supabase API settings.
- Prefix buckets with "apache"
---

## Technical Context

**Language/Version**: TypeScript 5 (strict), Next.js 14 (App Router)
**Primary Dependencies**: `@supabase/ssr`, `react-markdown`, `remark-gfm`,
`rehype-highlight`, `@dnd-kit/core`, `@dnd-kit/sortable`, Tailwind CSS
**Storage**: Supabase Postgres — `notes`, `folders`, `workspace_states` tables;
note content stored as `TEXT` column (no Supabase Storage bucket in v1)
**Testing**: Vitest + React Testing Library (component tests); Playwright (E2E,
optional v1)
**Target Platform**: Web browser, deployed on Vercel (preview on PRs, prod on `main`)
**Project Type**: Web application (Next.js App Router, server-first)
**Performance Goals**: Note save < 1 s · Search results < 2 s for ≤ 1,000 notes ·
Workspace restore < 2 s
**Constraints**: WCAG AA (≥ 4.5:1 contrast) · Responsive 375 px–1440 px+ ·
No blocking scripts · Monokai-inspired dark theme · 150 ms ease transitions
**Scale/Scope**: Single user, personal use; ≤ 1,000 notes initial target

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Pre-Phase 0 | Post-Phase 1 |
|-----------|------|-------------|--------------|
| I. Code Quality | TypeScript strict, no `any`, explicit return types | ✅ stack specifies strict | ✅ enforced in lib contracts |
| I. Code Quality | Component-level tests for all interactive UI | ✅ Vitest + RTL chosen | ✅ test tasks defined per US |
| I. Code Quality | Conventional commits + commit after each phase | ✅ constitution requirement acknowledged | ✅ |
| I. Code Quality | No file > 300 lines | ✅ structure split by responsibility | ✅ contracts enforce single-responsibility |
| II. Performance | No blocking third-party scripts | ✅ no CDN scripts planned | ✅ all deps bundled via pnpm |
| II. Performance | Server components by default | ✅ Next.js App Router | ✅ client components isolated to interactive UI |
| III. Accessibility | WCAG AA contrast on Monokai theme | ✅ `#272822` bg / `#F8F8F2` fg ≈ 12.7:1 | ✅ |
| III. Accessibility | Labels on all form fields | ✅ | ✅ auth forms, search input all labelled |
| III. Accessibility | Touch targets ≥ 44×44 px | ✅ | ✅ Tailwind `min-h-11 min-w-11` on interactive elements |
| III. Accessibility | Responsive 375 px–1440 px+ | ✅ breakpoints defined in spec | ✅ |
| IV. Security | Auth via Supabase Auth only | ✅ no custom session management | ✅ |
| IV. Security | Session tokens never client-side | ✅ `@supabase/ssr` cookie-based sessions | ✅ |
| IV. Security | `.env.local` gitignored + `.env.example` | ✅ | ✅ documented in quickstart |
| V. Maintainability | Next.js App Router structure | ✅ | ✅ enforced in Project Structure |
| V. Maintainability | `components/`, `lib/`, `lib/db/` | ✅ | ✅ enforced in Project Structure |
| V. Maintainability | No business logic in page files | ✅ | ✅ all logic in `lib/`, actions in `app/actions/` |
| V. Maintainability | `supabase gen types` for all queries | ✅ | ✅ `types/database.types.ts` in quickstart step 4 |

**All gates pass. No complexity violations require justification.**

---

## Project Structure

### Documentation (this feature)

```text
specs/001-apache-tear-core/
├── plan.md              # This file
├── research.md          # Phase 0 — technology decisions
├── data-model.md        # Phase 1 — DB schema + RLS
├── quickstart.md        # Phase 1 — dev setup guide
├── contracts/
│   ├── lib-functions.md # Phase 1 — typed lib/ function signatures
│   └── server-actions.md # Phase 1 — Server Actions + Route Handlers
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   ├── (app)/
│   │   ├── layout.tsx             # Authenticated shell — sidebar + main
│   │   └── notes/
│   │       ├── page.tsx           # Dashboard / empty state (Server Component)
│   │       └── [id]/
│   │           └── page.tsx       # Note editor page (Server Component)
│   ├── api/
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts       # Supabase auth code exchange
│   ├── actions/
│   │   ├── notes.ts               # Note Server Actions
│   │   ├── folders.ts             # Folder Server Actions
│   │   └── workspace.ts           # Workspace Server Actions
│   ├── icon.tsx                   # Favicon — black teardrop SVG via ImageResponse
│   ├── layout.tsx                 # Root layout (fonts, Tailwind base)
│   └── page.tsx                   # Root → redirect to /notes
│
├── components/
│   ├── editor/
│   │   ├── NoteEditor.tsx         # Client — textarea + auto-save
│   │   ├── MarkdownPreview.tsx    # Client — react-markdown renderer
│   │   └── EditorLayout.tsx       # Client — split-pane editor/preview
│   ├── file-tree/
│   │   ├── FileTree.tsx           # Client — DnD context + tree root
│   │   ├── FolderNode.tsx         # Client — folder item + collapse
│   │   ├── NoteNode.tsx           # Client — note item
│   │   └── NewItemInput.tsx       # Client — inline create input
│   ├── search/
│   │   ├── SearchBar.tsx          # Client — input with keyboard shortcut
│   │   └── SearchResults.tsx      # Client — result list + highlight
│   ├── workspace/
│   │   └── ResizablePanel.tsx     # Client — sidebar resize handle
│   └── ui/
│       ├── Button.tsx
│       ├── Modal.tsx              # Confirmation dialog (delete folder/note)
│       ├── Input.tsx
│       └── ErrorMessage.tsx
│
├── lib/
│   ├── db/
│   │   ├── notes.ts               # Note CRUD + search queries
│   │   ├── folders.ts             # Folder CRUD + descendant check
│   │   └── workspace.ts           # WorkspaceState read/upsert
│   ├── export/
│   │   ├── markdown.ts            # .md Blob download
│   │   └── pdf.ts                 # window.print() trigger
│   ├── supabase/
│   │   ├── client.ts              # createBrowserClient (typed)
│   │   └── server.ts              # createServerClient (typed, cookie-aware)
│   └── errors.ts                  # AppError class
│
├── types/
│   └── database.types.ts          # Generated: supabase gen types
│
├── __tests__/
│   ├── components/
│   │   ├── NoteEditor.test.tsx
│   │   ├── FileTree.test.tsx
│   │   ├── SearchBar.test.tsx
│   │   └── ResizablePanel.test.tsx
│   └── lib/
│       ├── db/notes.test.ts
│       └── export/markdown.test.ts
│
├── .env.example
├── .env.local                     # gitignored
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
└── tsconfig.json
```

**Structure Decision**: Web application (Option 2 equivalent collapsed into
Next.js App Router conventions). Server and client code coexist in the same
project per App Router patterns. No separate `backend/` / `frontend/` split —
Next.js handles this at the component level (`'use client'` / Server Components).

---

## Complexity Tracking

> No constitution violations — table omitted.
