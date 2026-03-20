# Quickstart: Apache Tear — Core Application

**Branch**: `001-apache-tear-core` | **Date**: 2026-03-20

This guide takes you from a clean clone to a running dev environment with
auth, note creation, and full-text search working.

---

## Prerequisites

- Node.js ≥ 18.17 (required by Next.js 14)
- pnpm ≥ 9 (`npm install -g pnpm`)
- A Supabase project (free tier is sufficient)
- Supabase CLI (`brew install supabase/tap/supabase` or see supabase.com/docs/guides/cli)

---

## 1. Clone and install

```bash
git clone <repo-url> apache-tear
cd apache-tear
pnpm install
```

---

## 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Both values are available in your Supabase project under
**Settings → API → Project URL / Project API keys**.

---

## 3. Apply database migrations

```bash
# Log in to Supabase CLI
supabase login

# Link to your remote project
supabase link --project-ref <your-project-ref>

# Push migrations (creates notes, folders, workspace_states tables + RLS)
supabase db push
```

Alternatively, paste the SQL from `data-model.md` directly into the
Supabase Dashboard **SQL Editor**.

---

## 4. Generate TypeScript types

```bash
supabase gen types typescript --project-id <your-project-ref> \
  --schema public > types/database.types.ts
```

Re-run this command whenever the database schema changes.

---

## 5. Enable Email Auth in Supabase

In the Supabase Dashboard:

1. Go to **Authentication → Providers → Email**
2. Ensure "Enable Email provider" is on
3. Set "Confirm email" to **enabled** (required for FR-002)
4. Under **Authentication → URL Configuration**, add:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/api/auth/callback`

---

## 6. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 7. Validation checklist

Run through these steps to confirm the core flows work:

### Auth (US1)

- [ ] Visit `/signup` — create account with email + password
- [ ] Check inbox for confirmation email, click link
- [ ] You are redirected to `/notes` (dashboard)
- [ ] Log out via the user menu
- [ ] Log back in at `/login` with the same credentials
- [ ] Attempt login with wrong password — descriptive error shown

### Note creation (US2)

- [ ] Click "New note" — a note titled `Untitled` appears in the file tree
- [ ] Type a title and markdown body (use `## Heading`, `**bold**`, ` ``` code ``` `)
- [ ] The preview pane renders the markdown correctly
- [ ] Reload the page — the note content is preserved
- [ ] Right-click the note → Rename → verify file tree updates
- [ ] Right-click the note → Delete → confirm dialog → note removed from tree

### Folder organisation (US3)

- [ ] Create a folder — appears in file tree
- [ ] Rename the folder — file tree updates
- [ ] Create a nested folder inside it
- [ ] Drag a note into the folder — note moves under the folder
- [ ] Delete the folder (which contains a note) — confirmation dialog shown

### Full-text search (US4)

- [ ] Create 3 notes with distinct keywords
- [ ] Open search, type one keyword — only the matching note(s) appear
- [ ] Matching keyword is highlighted in the result snippet
- [ ] Click a result — the note opens

### Workspace persistence (US5)

- [ ] Open 2–3 notes, resize the sidebar
- [ ] Close the browser tab entirely, reopen `http://localhost:3000`
- [ ] The same notes are open and the sidebar is the same width

### Export (US6)

- [ ] Open a note with rich markdown (table, code block, headings)
- [ ] Click "Export → Download .md" — file downloads, opens correctly in a
      text editor (e.g., VS Code)
- [ ] Click "Export → Print / Save as PDF" — browser print dialog opens with
      formatted note content visible; save as PDF and verify formatting

---

## 8. Running tests

```bash
# Component and unit tests
pnpm test

# Watch mode
pnpm test --watch
```

---

## Common issues

| Symptom | Fix |
|---------|-----|
| `Error: supabaseUrl is required` | Check `.env.local` values are set and server restarted |
| Types out of date after schema change | Re-run `supabase gen types ...` (step 4) |
| Confirmation email not arriving | Check Supabase Auth → Logs; verify SMTP config in Supabase Dashboard |
| `policy "..." already exists` | Migrations are idempotent; safe to ignore on re-push |
