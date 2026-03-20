---

description: "Task list for Apache Tear — Core Application"
---

# Tasks: Apache Tear — Core Application

**Input**: Design documents from `specs/001-apache-tear-core/`
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, research.md ✅,
contracts/lib-functions.md ✅, contracts/server-actions.md ✅, quickstart.md ✅

**Stack**: Next.js 14 App Router · TypeScript strict · Tailwind CSS · Supabase
(Auth + Postgres) · pnpm · Vitest + React Testing Library · @dnd-kit

**Tests**: Included — constitution mandates component-level tests for all
interactive UI elements (Principle I. Code Quality).

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story this task belongs to (US1–US5)
- All file paths are relative to the repository root

## Path Conventions

- Pages/layouts: `app/`
- Server Actions: `app/actions/`
- Shared components: `components/`
- Business logic: `lib/`
- DB queries: `lib/db/`
- Generated types: `types/database.types.ts`
- Tests: `__tests__/`

---

## Phase 1: Setup

**Purpose**: Project initialization, tooling, and directory scaffold.
All tasks can run in parallel after T001.

- [x] T001 Initialize Next.js 14 App Router project with TypeScript and Tailwind CSS: run `pnpm create next-app@latest . --typescript --tailwind --app --src-dir no --import-alias "@/*"` in repo root
- [x] T002 [P] Install runtime dependencies via pnpm: `@supabase/supabase-js @supabase/ssr react-markdown remark-gfm rehype-highlight @dnd-kit/core @dnd-kit/sortable` in package.json
- [x] T003 [P] Install dev dependencies via pnpm: `vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom` in package.json
- [x] T004 [P] Configure Vitest in vitest.config.ts: jsdom environment, globals: true, @/ path alias matching tsconfig.json, setupFilesAfterFramework pointing to a `vitest.setup.ts` that imports @testing-library/jest-dom
- [x] T005 [P] Configure Tailwind CSS in tailwind.config.ts: add Monokai color tokens (bg-monokai: #272822, fg-monokai: #F8F8F2, accent-yellow: #E6DB74, accent-green: #A6E22E, accent-blue: #66D9EF, accent-pink: #F92672), custom breakpoints matching spec (sm: 640px, md: 1024px)
- [x] T006 [P] Create .env.example with `NEXT_PUBLIC_SUPABASE_URL=` and `NEXT_PUBLIC_SUPABASE_ANON_KEY=` placeholders; confirm .env.local is listed in .gitignore
- [x] T007 Create directory scaffold: `components/auth`, `components/editor`, `components/file-tree`, `components/search`, `components/workspace`, `components/ui`, `lib/db`, `lib/export`, `lib/supabase`, `types`, `__tests__/components`, `__tests__/lib/db`, `__tests__/lib/export`, `supabase/migrations`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Supabase clients, DB migrations, types, auth callback, root layout,
and shared UI. ALL must be complete before any user story begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T008 Create Supabase browser client in lib/supabase/client.ts: export `createClient()` using `createBrowserClient<Database>` from @supabase/ssr with typed Database generic (stub types/database.types.ts if not generated yet)
- [x] T009 [P] Create Supabase server client in lib/supabase/server.ts: export async `createClient()` using `createServerClient<Database>` from @supabase/ssr with Next.js `cookies()` adapter for use in Server Components and Route Handlers
- [x] T010 [P] Create AppError class in lib/errors.ts: extends Error, constructor accepts `message: string`, `code: string`, `cause?: unknown`; export as named export
- [x] T011 Create Supabase migration in supabase/migrations/001_notes.sql: notes table (id uuid PK, user_id uuid FK→auth.users CASCADE, folder_id uuid FK→folders SET NULL nullable, title text DEFAULT 'Untitled', content text DEFAULT '', search_vector tsvector GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(title,'')),'A') || setweight(to_tsvector('english', coalesce(content,'')),'B')) STORED, created_at/updated_at timestamptz DEFAULT now()); GIN index on search_vector; index on (user_id, updated_at DESC); RLS ENABLE; four RLS policies (SELECT/INSERT/UPDATE/DELETE) scoped to auth.uid() = user_id; set_updated_at() trigger
- [x] T012 [P] Create Supabase migration in supabase/migrations/002_folders.sql: folders table (id uuid PK, user_id uuid FK→auth.users CASCADE, parent_id uuid FK→folders CASCADE nullable, name text NOT NULL, created_at/updated_at timestamptz); indexes on (user_id) and (parent_id); RLS ENABLE; four RLS policies scoped to auth.uid() = user_id; updated_at trigger using shared set_updated_at() function
- [x] T013 [P] Create Supabase migration in supabase/migrations/003_workspace_states.sql: workspace_states table (id uuid PK, user_id uuid FK→auth.users CASCADE UNIQUE, open_note_ids uuid[] DEFAULT '{}', active_note_id uuid FK→notes SET NULL nullable, panel_layout jsonb DEFAULT '{"sidebarWidth":260,"previewVisible":true}', updated_at timestamptz); index on (user_id); RLS ENABLE; SELECT/INSERT/UPDATE policies scoped to auth.uid() = user_id
- [x] T014 Generate types/database.types.ts by running `supabase gen types typescript --project-id <ref> --schema public > types/database.types.ts`; apply migrations to remote project first with `supabase db push`
- [x] T015 Create auth callback route handler in app/api/auth/callback/route.ts: GET handler exchanges `code` query param for session cookie using Supabase server client; redirect to /notes on success, /login?error=auth_failed on failure
- [x] T016 Create root layout in app/layout.tsx: `<html lang="en">`, `<body>` with bg-monokai Tailwind class, import app/globals.css containing `@tailwind base/components/utilities` and `@media print { .no-print { display: none; } body { background: white; } .print-target { display: block !important; } }`
- [x] T017 [P] Create shared UI components in components/ui/: Button.tsx (variants: primary/secondary/ghost, `min-h-[44px] min-w-[44px]` touch targets, explicit onClick: () => void return type), Input.tsx (always rendered with associated `<label>` via htmlFor prop), ErrorMessage.tsx (role="alert", aria-live="assertive"), Modal.tsx (focus trap on open, Escape key closes, backdrop click closes, confirm+cancel buttons)
- [x] T018 [P] Component test for Modal in __tests__/components/Modal.test.tsx: renders title and body text, Escape keydown calls onClose, confirm button fires onConfirm callback, cancel button fires onClose callback

**Checkpoint**: Foundation complete — apply migrations, generate types, start user story work.

---

## Phase 3: User Story 1 — Account Creation & Login (Priority: P1) 🎯 MVP

**Goal**: Users can sign up with email+password, confirm via email, log in, and log out.
**Independent Test**: Sign up with a fresh email → confirm email → log out → log back in →
verify redirect to /notes. See quickstart.md §7 "Auth (US1)".

- [x] T019 [US1] Create (auth) route group layout in app/(auth)/layout.tsx: centered card layout with bg-monokai dark background, no sidebar (full-page centered column, max-w-sm)
- [x] T020 [P] [US1] Create SignupForm client component in components/auth/SignupForm.tsx: `'use client'`; email `<input>` with associated `<label htmlFor="email">Email</label>`; password `<input type="password">` with associated `<label htmlFor="password">Password</label>`; submit button (min 44×44 px); pending state; calls signUp Server Action; renders `<ErrorMessage>` on failure
- [x] T021 [P] [US1] Create LoginForm client component in components/auth/LoginForm.tsx: `'use client'`; email + password inputs each with `<label>`; "Forgot password?" link to /forgot-password; submit calls signIn Server Action; redirects to /notes on success; renders `<ErrorMessage>` on failure
- [x] T022 [P] [US1] Create ForgotPasswordForm client component in components/auth/ForgotPasswordForm.tsx: `'use client'`; email input with `<label>`; submit calls requestPasswordReset Server Action; on success renders confirmation message ("Check your inbox") without navigating away
- [x] T023 [US1] Implement auth Server Actions in app/actions/auth.ts: `'use server'`; `signUp(email, password): Promise<void>` — calls supabase.auth.signUp, redirect('/notes'); `signIn(email, password): Promise<void>` — calls supabase.auth.signInWithPassword, redirect('/notes'); `signOut(): Promise<void>` — calls supabase.auth.signOut, redirect('/login'); `requestPasswordReset(email): Promise<void>` — calls supabase.auth.resetPasswordForEmail with redirectTo callback URL
- [x] T024 [US1] Create signup page in app/(auth)/signup/page.tsx: Server Component rendering `<SignupForm>` with page heading "Create account" and "Already have an account? Log in" link to /login
- [x] T025 [P] [US1] Create login page in app/(auth)/login/page.tsx: Server Component rendering `<LoginForm>` with page heading "Welcome back" and "No account? Sign up" link to /signup
- [x] T026 [P] [US1] Create forgot-password page in app/(auth)/forgot-password/page.tsx: Server Component rendering `<ForgotPasswordForm>` with heading and back link to /login
- [x] T027 [US1] Create authenticated app shell layout in app/(app)/layout.tsx: fetch session via Supabase server client; redirect to /login if no session; render `<div>` with sidebar column (260 px default, `no-print` class) and main content area (`{children}`); include `<button>` for Sign Out in sidebar header calling signOut Server Action
- [x] T028 [US1] Create root page in app/page.tsx: fetch session server-side; `redirect('/notes')` if authenticated; `redirect('/login')` if not
- [x] T029 [P] [US1] Component test for SignupForm in __tests__/components/SignupForm.test.tsx: renders email label + input, password label + input; submitting empty form does not call signUp; submitting valid email+password calls signUp with correct arguments; error prop renders ErrorMessage
- [x] T030 [P] [US1] Component test for LoginForm in __tests__/components/LoginForm.test.tsx: renders email+password labels; "Forgot password?" link has correct href; valid submission calls signIn
- [x] T031 [P] [US1] Component test for ForgotPasswordForm in __tests__/components/ForgotPasswordForm.test.tsx: renders email label; valid submission calls requestPasswordReset; success state renders confirmation message; error renders ErrorMessage

**Checkpoint**: US1 fully functional — auth flow testable independently.

---

## Phase 4: User Story 2 — Create and View a Note (Priority: P2)

**Goal**: Users can create, edit, rename, delete notes. Notes appear in file tree.
Markdown renders in preview. Plain .md file recoverable via download (US6).
**Independent Test**: Create note → type markdown → verify preview → rename → delete.
See quickstart.md §7 "Note creation (US2)".

- [x] T032 [US2] Implement lib/db/notes.ts: `listNotes(userId): Promise<Pick<Note,'id'|'title'|'folder_id'|'updated_at'>[]>`, `getNote(noteId, userId): Promise<Note | null>`, `createNote(data): Promise<Note>`, `updateNote(noteId, userId, data): Promise<Note>`, `deleteNote(noteId, userId): Promise<void>` — all using typed Supabase client, throw AppError on DB error
- [x] T033 [US2] Implement note Server Actions in app/actions/notes.ts: `'use server'`; `createNoteAction(data): Promise<{id: string; title: string}>` — auth check, calls createNote, revalidatePath('/notes'); `updateNoteAction(noteId, data): Promise<void>` — auth check, calls updateNote; `deleteNoteAction(noteId): Promise<void>` — auth check, calls deleteNote, redirect('/notes') if deleted note was active
- [x] T034 [P] [US2] Create MarkdownPreview client component in components/editor/MarkdownPreview.tsx: `'use client'`; renders `<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{content}</ReactMarkdown>`; apply `highlight.js` Monokai theme via CSS import; `className="print-target"` on wrapper div
- [x] T035 [P] [US2] Create NoteEditor client component in components/editor/NoteEditor.tsx: `'use client'`; controlled `<input>` for title (label: "Note title", sr-only class), controlled `<textarea>` for content (label: "Note content", sr-only class); debounced auto-save via `useCallback` + `setTimeout` (2 000 ms), clears on unmount; save status indicator ("Saving…" / "Saved" / "Error saving"); explicit prop types and return type `(): JSX.Element`
- [x] T036 [P] [US2] Create EditorLayout client component in components/editor/EditorLayout.tsx: `'use client'`; split-pane flex layout rendering `<NoteEditor>` on left and `<MarkdownPreview>` on right; toggle button to show/hide preview pane (aria-pressed); export menu placeholder (`<div id="export-menu" />` — wired in US6); stays under 300 lines
- [x] T037 [US2] Create notes dashboard page in app/(app)/notes/page.tsx (Server Component): call `listNotes(userId)`; if empty render empty state with "Create your first note" `<Button>` that calls createNoteAction and redirects to /notes/[newId]; if non-empty render note count
- [x] T038 [US2] Create note editor page in app/(app)/notes/[id]/page.tsx (Server Component): call `getNote(id, userId)`; if null `notFound()`; render `<EditorLayout note={note} />`
- [x] T039 [US2] Create NoteNode client component in components/file-tree/NoteNode.tsx: `'use client'`; renders note title as `<button>` navigating to /notes/[id]; active state styling when id matches current route; double-click enters inline rename mode (replaces title with `<input>`); right-click context menu or action icons for rename + delete; delete shows `<Modal>` confirmation before calling deleteNoteAction; touch target ≥ 44 px height
- [x] T040 [US2] Create FileTree client component skeleton in components/file-tree/FileTree.tsx: `'use client'`; renders flat list of `<NoteNode>` items (folder nesting added in US3); "New note" `<Button>` in header calls createNoteAction then navigates to new note; accepts `notes` prop typed from database.types.ts
- [x] T041 [US2] Wire FileTree into app/(app)/layout.tsx sidebar: fetch `listNotes(userId)` server-side in the layout, pass result as `notes` prop to `<FileTree>`
- [x] T042 [P] [US2] Component test for NoteEditor in __tests__/components/NoteEditor.test.tsx: renders title input and textarea with initial values; title change updates input; content change updates textarea; auto-save fires updateNoteAction after 2 000 ms (use fake timers); unmount clears pending debounce
- [x] T043 [P] [US2] Component test for NoteNode in __tests__/components/NoteNode.test.tsx: renders note title; double-click enters rename mode with input pre-filled; Enter in rename calls updateNoteAction; delete button opens Modal; Modal confirm calls deleteNoteAction

**Checkpoint**: US2 fully functional — note CRUD and markdown preview testable independently.

---

## Phase 5: User Story 3 — Folder Organization (Priority: P3)

**Goal**: Users can create, rename, nest, and delete folders; move notes between folders.
**Independent Test**: Create 2 folders → nest one inside the other → create notes in each →
drag note to other folder → delete folder with confirmation. See quickstart.md §7 "Folders (US3)".

- [x] T044 [US3] Implement lib/db/folders.ts: `listFolders(userId): Promise<Folder[]>`, `createFolder(data): Promise<Folder>`, `renameFolder(id, userId, name): Promise<Folder>`, `moveFolder(id, userId, newParentId): Promise<Folder>`, `deleteFolder(id, userId): Promise<void>`, `isFolderDescendant(folderId, targetId, userId): Promise<boolean>` — all typed, throw AppError on DB error
- [x] T045 [US3] Implement folder Server Actions in app/actions/folders.ts: `'use server'`; createFolderAction, renameFolderAction, moveFolderAction (calls isFolderDescendant guard — throws descriptive AppError on circular nesting), deleteFolderAction — all with auth check and revalidatePath('/notes')
- [x] T046 [P] [US3] Create FolderNode client component in components/file-tree/FolderNode.tsx: `'use client'`; expand/collapse toggle with ChevronRight/ChevronDown icon (aria-expanded); double-click enters inline rename (input with aria-label="Rename folder"); delete shows `<Modal>` confirmation before calling deleteFolderAction; recursively renders child `<FolderNode>` and `<NoteNode>` items; touch target ≥ 44 px
- [x] T047 [P] [US3] Create NewItemInput client component in components/file-tree/NewItemInput.tsx: `'use client'`; auto-focused `<input>` with `<label className="sr-only">`; Enter key fires `onCreate(value)`; Escape key fires `onCancel()`; trims whitespace before calling onCreate
- [x] T048 [US3] Upgrade FileTree.tsx to DnD: wrap tree in `<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>`; handleDragEnd determines if dragged item is note (calls updateNoteAction to set folder_id) or folder (calls moveFolderAction); wrap each NoteNode and FolderNode in `<Draggable>` and each folder in `<Droppable>`; accepts updated `folders` + `notes` props
- [x] T049 [US3] Update app/(app)/layout.tsx sidebar: fetch both `listFolders(userId)` and `listNotes(userId)` server-side; pass both to `<FileTree folders={folders} notes={notes} />`; add "New folder" `<Button>` that shows `<NewItemInput>` then calls createFolderAction
- [x] T050 [US3] Add "New note in folder" affordance to FolderNode context menu: clicking adds a `<NewItemInput>` inside the folder that calls createNoteAction with the folderId
- [x] T051 [P] [US3] Component test for FileTree in __tests__/components/FileTree.test.tsx: renders flat note list; renders nested folder+note structure; drag-end event with valid target calls move callback; "New note" button renders NewItemInput then fires createNoteAction
- [x] T052 [P] [US3] Component test for FolderNode in __tests__/components/FolderNode.test.tsx: click toggles expand/collapse (aria-expanded changes); double-click enters rename mode; Escape exits rename without saving; delete button opens Modal; confirm calls deleteFolderAction
- [x] T053 [P] [US3] Component test for NewItemInput in __tests__/components/NewItemInput.test.tsx: autofocuses on mount; Enter with non-empty value fires onCreate with trimmed value; Escape fires onCancel; Enter with empty value does not fire onCreate

**Checkpoint**: US3 fully functional — folder hierarchy + DnD testable independently.

---

## Phase 6: User Story 4 — Session & Workspace Persistence (Priority: P4)

**Goal**: Open notes and panel layout are automatically restored on next visit.
**Independent Test**: Open 3 notes + resize sidebar → close tab → reopen app →
verify same notes open and sidebar width preserved. See quickstart.md §7 "Workspace (US5)".

- [x] T060 [US4] Implement lib/db/workspace.ts: `getWorkspaceState(userId): Promise<WorkspaceState | null>` (select by user_id), `saveWorkspaceState(userId, state): Promise<void>` (upsert with onConflict:'user_id') — typed, throw AppError on DB error
- [x] T061 [US4] Implement saveWorkspaceAction in app/actions/workspace.ts: `'use server'`; accepts `{openNoteIds, activeNoteId, panelLayout}` — auth check, calls saveWorkspaceState; no return value
- [x] T062 [P] [US4] Create ResizablePanel client component in components/workspace/ResizablePanel.tsx: `'use client'`; renders `<aside>` (sidebar) + `<main>` (content) in a flex row; drag handle `<div>` between them listens to onMouseDown → mousemove → mouseup to calculate new width; constrained to 160–480 px; fires `onResize(newWidth: number)` callback; no-print class on aside
- [x] T063 [US4] Create WorkspaceContext in components/workspace/WorkspaceContext.tsx: `'use client'`; React context providing `openNoteIds: string[]`, `activeNoteId: string | null`, `panelLayout: PanelLayout`, `openNote(id)`, `closeNote(id)`, `setActiveNote(id)`, `updateLayout(layout)`; any state change schedules a debounced (2 000 ms) call to saveWorkspaceAction; explicit return type `(): JSX.Element` on provider component
- [x] T064 [US4] Integrate workspace persistence into app/(app)/layout.tsx: call `getWorkspaceState(userId)` server-side; filter `openNoteIds` against current valid note IDs from `listNotes` (remove stale IDs); wrap children in `<WorkspaceContext.Provider initialState={workspaceState}>`; replace static sidebar div with `<ResizablePanel initialWidth={panelLayout.sidebarWidth} onResize={...}>`
- [x] T065 [US4] Restore open notes tabs or indicators from WorkspaceContext.openNoteIds in FileTree: highlight all open note IDs in the file tree; active note (from WorkspaceContext.activeNoteId) gets distinct active styling
- [x] T066 [P] [US4] Component test for ResizablePanel in __tests__/components/ResizablePanel.test.tsx: renders sidebar and main children; mousedown on handle then mousemove fires onResize with calculated width; width is clamped to 160 px minimum and 480 px maximum; mouseup stops resizing

**Checkpoint**: US5 fully functional — workspace restore testable by simulating a return visit.

---

## Phase 7: User Story 5 — Document Export (Priority: P5)

**Goal**: Users can export a note as a downloadable .md file or print/save as PDF.
**Independent Test**: Export note as .md → verify file opens in text editor with correct content.
Export as PDF → verify browser print dialog shows formatted note.
See quickstart.md §7 "Export (US6)".

- [x] T067 [P] [US5] Implement `downloadNoteAsMarkdown(title: string, content: string): void` in lib/export/markdown.ts: create `new Blob([content], { type: 'text/markdown;charset=utf-8' })`; create temporary `<a download="${sanitisedTitle}.md">` with object URL; click and revoke URL; sanitised title replaces non-alphanumeric chars with hyphens, max 80 chars
- [x] T068 [P] [US5] Implement `printNoteToPdf(): void` in lib/export/pdf.ts: find `.print-target` element, add `data-printing` attribute; call `window.print()`; remove attribute in `window.addEventListener('afterprint', ...)` handler (one-time listener)
- [x] T069 [US5] Add @media print CSS rules to app/globals.css: `.no-print { display: none !important; }` applies to sidebar, toolbar, search bar; `body { background: #fff; color: #000; }` in print context; `.print-target { display: block !important; width: 100%; }` ensures preview pane fills page
- [x] T070 [US5] Add export toolbar to EditorLayout.tsx: `<button aria-label="Download as Markdown" onClick={() => downloadNoteAsMarkdown(note.title, note.content)}>` and `<button aria-label="Print or save as PDF" onClick={printNoteToPdf}>`; both buttons ≥ 44×44 px; position in editor header bar; EditorLayout receives `note` prop for access to current title/content
- [x] T071 [P] [US5] Unit test for downloadNoteAsMarkdown in __tests__/lib/export/markdown.test.ts: Blob created with note content; filename derived from note title with special chars replaced; anchor element created with correct download attribute; URL.revokeObjectURL called after click

**Checkpoint**: US6 fully functional — export testable by downloading and opening file.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility audit, error handling, performance, and deployment.

- [x] T072 [P] Add loading skeleton components in components/ui/Skeleton.tsx (Tailwind animate-pulse rectangles); use in app/(app)/layout.tsx for FileTree (suspense boundary) and in app/(app)/notes/[id]/page.tsx for editor pane while note loads
- [x] T073 [P] Add error boundary component in components/ui/ErrorBoundary.tsx: class component wrapping EditorLayout and FileTree; displays descriptive fallback message with "Reload" button on caught error
- [x] T074 [P] Audit all interactive elements for WCAG AA compliance: verify all `<button>` and `<a>` elements have ≥ 44×44 px touch targets (Tailwind `min-h-[44px] min-w-[44px]`); verify all inputs have associated `<label>` elements; fix any violations found in components/auth/, components/editor/, components/file-tree/
- [x] T075 [P] Verify color contrast for all text rendered on Monokai dark background (#272822): run browser DevTools accessibility checker on /login, /notes, and /notes/[id]; document results in specs/001-apache-tear-core/checklists/; Monokai fg #F8F8F2 on #272822 ≈ 12.7:1 — passes WCAG AA; verify accent text colors meet ≥ 4.5:1
- [ ] T076 Validate responsive layout at 375 px (mobile), 640 px (tablet), 1024 px (desktop), 1440 px (large desktop): open each breakpoint in browser DevTools; fix any horizontal overflow, truncated file tree names, or collapsed editor pane issues
- [ ] T077 [P] Configure Vercel project: add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel environment variables for Preview and Production environments; verify preview deployments trigger on PRs to main
- [ ] T078 Run full quickstart.md validation checklist end-to-end: complete all 5 user story verification flows (§7 Auth, Note creation, Folders, Workspace, Export) in a Vercel preview or local environment; confirm all checkboxes pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T002–T007 can run in parallel after T001
- **Foundational (Phase 2)**: Depends on Setup completion — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Foundational — no dependency on other stories
- **US2 (Phase 4)**: Depends on Foundational — independent of US1 at implementation level
  (US1 must be working to manually test US2, but code is independent)
- **US3 (Phase 5)**: Depends on Foundational + US2 (extends FileTree, lib/db/notes.ts)
- **US4 (Phase 6)**: Depends on Foundational + US2 + US3 (workspace restores folders + notes)
- **US5 (Phase 7)**: Depends on US2 (EditorLayout exists and has note access)
- **Polish (Phase 8)**: Depends on all user stories being complete

### Within Each User Story

- Lib functions (lib/db/) → Server Actions (app/actions/) → Components → Pages
- Tests can be written in parallel with the implementation they test (different file)
- Server Components (pages) depend on lib/db/ functions

### Parallel Opportunities Per Story

**US1 parallelisable**:
```
Task: T020 — SignupForm component
Task: T021 — LoginForm component
Task: T022 — ForgotPasswordForm component
(after T023 Server Actions exist)
Task: T029 — SignupForm test
Task: T030 — LoginForm test
Task: T031 — ForgotPasswordForm test
```

**US2 parallelisable**:
```
Task: T034 — MarkdownPreview component
Task: T035 — NoteEditor component
Task: T036 — EditorLayout component
Task: T039 — NoteNode component
(after T032 lib/db/notes.ts and T033 actions exist)
Task: T042 — NoteEditor test
Task: T043 — NoteNode test
```

**US3 parallelisable**:
```
Task: T046 — FolderNode component
Task: T047 — NewItemInput component
(after T044 lib/db/folders.ts and T045 actions exist)
Task: T051 — FileTree test
Task: T052 — FolderNode test
Task: T053 — NewItemInput test
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 — Auth
4. **STOP and VALIDATE**: Sign up → confirm → log in → log out
5. Complete Phase 4: US2 — Note creation + preview
6. **STOP and VALIDATE**: Create → edit markdown → rename → delete
7. Deploy/demo MVP

### Incremental Delivery

```
Setup + Foundational → Foundation ready
→ US1 (Auth)         → Independently testable → Deploy (auth gate works)
→ US2 (Notes)        → Independently testable → Deploy (core note CRUD)
→ US3 (Folders)      → Independently testable → Deploy (organisation)

→ US4 (Workspace)    → Independently testable → Deploy (persistence)
→ US5 (Export)       → Independently testable → Deploy (sharing)
→ Polish             → Accessibility + deployment hardening
```

---

## Notes

- `[P]` tasks operate on different files and have no dependency on incomplete sibling tasks
- Server Component pages (app/**/page.tsx) are validated manually via quickstart.md — not via Vitest (which cannot render async Server Components)
- Vitest covers: Client Components, lib/ functions, Server Actions (mocked Supabase client)
- All files must stay under 300 lines — split into sub-modules if approaching limit
- Commit after each phase using Conventional Commits: `feat: implement US1 auth (T019–T031)`
