# Research: Apache Tear — Core Application

**Branch**: `001-apache-tear-core` | **Date**: 2026-03-20
**Phase**: 0 — Pre-design technology decisions

---

## 1. Package Manager

**Decision**: pnpm

**Rationale**: ~3× faster than npm on install (28 s vs 134 s on large projects),
disk-efficient via content-addressed store, natively supported by Vercel (auto-detects
`pnpm-lock.yaml`), and adopted by the Next.js and Vite ecosystems internally.

**Alternatives considered**:
- `npm` — universal default, zero setup, but slowest; acceptable fallback.
- `bun` — fastest installs (~5 s) but minor ecosystem compatibility risks in 2025;
  preferable for greenfield personal projects once ecosystem matures further.

---

## 2. Markdown Editor (Input Component)

**Decision**: Plain `<textarea>` (controlled) with debounced auto-save + side-by-side
live preview via `react-markdown`.

**Rationale**: Minimises bundle size, has no mobile prose-editing quirks (auto-correct
and IME input work correctly with a native textarea, not with CodeMirror), and keeps
the component simple enough to stay under the 300-line file limit. The Obsidian-inspired
design is best approximated by a clean split-pane rather than an in-editor live preview.
Can be upgraded to CodeMirror 6 in a future iteration if syntax highlighting in the
editor is requested.

**Alternatives considered**:
- `@uiw/react-codemirror` (CodeMirror 6) — syntax highlighting inside the editor;
  ~200 kB bundle addition; poor mobile prose IME support; overkill for v1.
- Monaco Editor — VS Code engine; ~1.5 MB bundle; far exceeds v1 requirements.

---

## 3. Markdown Rendering (Preview Component)

**Decision**: `react-markdown` + `remark-gfm` + `rehype-highlight`

**Rationale**: `react-markdown` is compatible with both Server Components (pure render)
and Client Components (interactive preview). `remark-gfm` adds GitHub Flavored Markdown
(tables, strikethrough, task lists). `rehype-highlight` provides `highlight.js`-powered
code block syntax highlighting, aligned with the Monokai visual theme.

**Alternatives considered**:
- `@uiw/react-markdown-preview` — tightly couples editor + preview; less extensible.
- `marked` — low-level; requires manual HTML sanitisation in React; no plugin ecosystem.

---

## 4. PDF Export

**Decision**: `window.print()` with a dedicated `@media print` CSS stylesheet.

**Rationale**: Zero new dependencies; uses the browser's own PDF engine (highest
fidelity rendering); text remains selectable and searchable in the output PDF;
works offline; consistent across modern browsers. The implementation is a single
utility function + a print stylesheet class on the preview pane.

**Alternatives considered**:
- `html2canvas` + `jsPDF` — pixel-based (rasterises text); exported text is not
  selectable; larger bundle; lower quality for document-style content.
- `@react-pdf/renderer` — requires rewriting all layouts with PDF-specific primitives
  (`<Document>`, `<Page>`, `<Text>`); inflexible for markdown-derived HTML.

---

## 5. Full-Text Search

**Decision**: Postgres `tsvector` generated column + GIN index + Supabase `textSearch()`
with `ts_rank` ordering.

**Rationale**: Server-side, indexed search that scales effortlessly to 1,000+ notes
per user without loading any content client-side. Supports weighted columns (title
ranked higher than body), language-aware stemming, and result ranking. Supabase
wraps this natively via the `textSearch()` query builder — no extra service needed.
A GIN index keeps search query time well under the 2 s SC-003 target.

**Alternatives considered**:
- `fuse.js` (client-side fuzzy search) — requires fetching all note content on page
  load; degrades UX on slow connections; no true relevance ranking.
- Typesense / Algolia — external services; unnecessary operational overhead for a
  single-user, personal app.

**Implementation note**: The `search_vector` column is a `GENERATED ALWAYS AS`
computed column of type `tsvector`, combining `title` (weight A) and `content`
(weight B). A GIN index is created on this column. A database trigger keeps the
vector current on every `INSERT` / `UPDATE`.

---

## 6. Note Content Storage

**Decision**: Postgres `TEXT` column as the single source of truth for note content.
No Supabase Storage bucket for note text in v1.

**Rationale**: Single source of truth eliminates sync complexity. Postgres `TEXT`
columns are included in database backups; Storage objects are not. Transactional
consistency is automatic. FR-011 ("stored as a plain `.md` file, readable outside
the app") is satisfied by the `.md` download export (FR-023) which serialises the
Postgres content on demand. Supabase Storage will be added in a future iteration
for binary attachments (images, files embedded in notes).

**Alternatives considered**:
- Storage-primary + metadata in Postgres — adds a sync layer; Storage not covered
  by DB backups; increases read latency for every note open.
- Hybrid (write to both on save) — premature for v1; sync failure handling adds
  complexity without a clear user-facing benefit.

---

## 7. Drag-and-Drop (File Tree)

**Decision**: `@dnd-kit/core` + `@dnd-kit/sortable`

**Rationale**: Modular, tree-DnD-capable, first-class keyboard navigation and ARIA
live-region announcements (satisfies Accessibility Principle III). Actively maintained
(last release 2024). Lightweight: `@dnd-kit/core` is ~11 kB gzipped.

**Alternatives considered**:
- `react-beautiful-dnd` — battle-tested but officially unmaintained since 2022
  (Atlassian deprioritised); community fork `hello-pangea/dnd` exists but lower
  release velocity.
- HTML5 native DnD API — verbose setup; poor accessibility defaults; no
  keyboard-DnD support out of the box.

---

## 8. Testing Stack

**Decision**: Vitest + React Testing Library (component tests) + Playwright (E2E,
optional for v1)

**Rationale**: Vitest is 30–70 % faster than Jest on equivalent suites (~3.8 s vs
~15.5 s), natively supports TypeScript/ESM without additional transform config, and
is officially documented in the Next.js testing guide. React Testing Library aligns
with testing interactive components "as users see them" — the correct approach for
the constitution's "component-level tests required for all interactive UI elements"
gate. Playwright covers auth flows and full-page scenarios that Vitest cannot reach
(async Server Components).

**Alternatives considered**:
- Jest + React Testing Library — safe, mature, but slower; better for legacy codebases.
- Testing Library alone without E2E — insufficient coverage for auth and route-based
  flows.

---

## Resolved Unknowns Summary

| Unknown | Resolution |
|---------|------------|
| Package manager | pnpm |
| Markdown editor | `<textarea>` + debounced save |
| Markdown renderer | `react-markdown` + `remark-gfm` + `rehype-highlight` |
| PDF export | `window.print()` + print CSS |
| Full-text search | Postgres `tsvector` + GIN + Supabase `textSearch()` |
| Note content storage | Postgres `TEXT` column only (v1) |
| Drag-and-drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Testing | Vitest + React Testing Library |
