# [Apache Tear] — Product Specification
> Stack: Next.js · TypeScript · Supabase · Vercel · Claude AI

---

## 1. Constitution (Principles & Constraints)

/speckit.constitution 

### Code Quality
- TypeScript strict mode — no `any`, explicit return types on all functions
- Component-level tests required for all interactive UI elements
- All commits follow [Conventional Commits](https://www.conventionalcommits.org/) format:
  `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`, `test:`
- A new commit is made at the end of each phase and after each major feature
- No file exceeds 300 lines — split into smaller modules if needed
- New features added without modifying core/shared modules unless strictly necessary

### Performance
- No blocking third-party scripts in the critical render path
- Prefer server components; use client components only where interactivity requires it

### Accessibility & Universal Design
- Sufficient color contrast ratio: ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- All images have descriptive `alt` text; decorative images use `alt=""`
- Form fields have associated `<label>` elements — no placeholder-only labels
- Error messages are descriptive and suggest how to fix the problem
- Touch targets minimum 44×44px on mobile
- No content that flashes more than 3 times per second
- Responsive layout works from 375px (mobile) to 1440px+ (desktop)

### Security & Privacy (GDPR)
- Auth handled exclusively via Supabase Auth — no custom session management
- Session tokens are never exposed client-side or committed to version control
- Data collected is minimal and purposeful — collect only what the app needs
- `.env.local` is gitignored; environment variables documented in `.env.example`

### Maintainability
- Folder structure follows Next.js App Router conventions
- Shared UI in `components/`, business logic in `lib/`, DB queries in `lib/db/`
- No business logic in page/route files — delegate to `lib/` functions
- All Supabase queries typed using generated types from `supabase gen types`

---

## 2. Concept and Specify (What & Why)
/speckit.specify 

**One-liner:**  Apache Tear is a proprietary personal knowledge base and note-taking application that operates on markdown files.

**Target user:** For personal use.

**Core value proposition:** It stores notes (markdown files) in a shared repository / database such that users can access their notes from anywhere. 

**Design philosophy:** Very minimalistic and professional.

**AI usage:** Claude AI (model TBD per feature)

# User Stories
## Creating notes
> As a writer, I want to create a new note with a title and markdown body so that I can capture thoughts quickly.
> **Done when:** note is saved, appears in the file tree, and renders markdown in preview mode.
## Organization
> As a user, I want to organize notes into folders so that I can keep topics separated.
> **Done when:** folders can be created, renamed, and nested; notes can be moved between them.

> As a user, I want to search across all notes by keyword so that I can find content without remembering where it is.
> **Done when:** full-text search returns results ranked by relevance, with matching text highlighted.

> As a user, I want my workspace layout and open notes to persist between sessions so that I can resume where I left off.
> **Done when:** reopening the app restores the same open notes and panel layout.

## Document export
> As a user, I want to export a note as a PDF or .md file so that I can share it with people who don't use the app.
> **Done when:** exported file preserves formatting.

> As a user, I want my notes stored as plain `.md` files on a server / in a bucket.
> **Done when:** notes are stored on a server, and when downloaded they should be readable and editable in any text editor outside the app .

## Authentication
> As a new visitor, I want to create an account with email and password so that my data is private and persisted.
> **Done when:** account is created, user is redirected to dashboard/homepage, and a confirmation email is sent.

> As a returning user, I want to log in so that I can access my data.
> **Done when:** user is authenticated and redirected to their last visited page or dashboard/homepage.

### Style Guide

- **Color palette:** Monokai style

- **Breakpoints:**
  - Mobile: < 640px
  - Tablet: 640px–1024px
  - Desktop: > 1024px

- **Motion:** 
	- Subtle transitions (150ms ease)

- **References/inspiration:**  https://obsidian.md/

---

## 4. Plan (How & Tech Stack)

/specify.plan

### Stack

| Layer           | Choice               | Notes                                      |
| --------------- | -------------------- | ------------------------------------------ |
| Framework       | Next.js (App Router) | Server components by default               |
| Language        | TypeScript (strict)  | `supabase gen types` for DB types          |
| Styling         | Tailwind CSS         | Utility-first, no CSS-in-JS                |
| Auth & DB       | Supabase             | Auth + Postgres  + Storage if needed       |
| Deployment      | Vercel               | Preview deployments on PRs, prod on `main` |
| Package manager | [npm / pnpm / bun]   |                                            |


---

## 5. Backlog (Post-v1)

- [Feature A] — [reason deferred]
- [Feature B] — [reason deferred]