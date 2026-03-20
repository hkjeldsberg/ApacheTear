# Server Actions & Route Handlers: Apache Tear — Core Application

**Branch**: `001-apache-tear-core` | **Date**: 2026-03-20

Apache Tear uses Next.js Server Actions for all mutations that originate from
Client Components, and Route Handlers for any operations that need a true HTTP
endpoint (e.g., OAuth redirects handled by Supabase SSR).

---

## Auth Route Handlers (`app/api/auth/`)

These are required by `@supabase/ssr` for session cookie management.

### `GET /api/auth/callback`

Handles the OAuth/magic-link redirect after Supabase Auth confirmation.

**File**: `app/api/auth/callback/route.ts`

```
Query params:  code (string) — auth code from Supabase
Response:      302 redirect → /notes (success) | /login?error=... (failure)
Side effects:  Exchanges code for session; sets session cookie via @supabase/ssr
```

---

## Server Actions (`app/actions/`)

All actions use `'use server'` and are called from Client Components.
They validate that the calling user owns the resource before mutating.

### Note Actions (`app/actions/notes.ts`)

```ts
'use server'

/** Create a note owned by the authenticated user. */
export async function createNoteAction(
  data: { title: string; content: string; folderId: string | null }
): Promise<{ id: string; title: string }>

/** Update note content (title + body). Rate: debounced, at most every 2 s. */
export async function updateNoteAction(
  noteId: string,
  data: { title?: string; content?: string; folderId?: string | null }
): Promise<void>

/** Delete a note. Client must confirm before calling. */
export async function deleteNoteAction(noteId: string): Promise<void>
```

### Folder Actions (`app/actions/folders.ts`)

```ts
'use server'

export async function createFolderAction(
  data: { name: string; parentId: string | null }
): Promise<{ id: string; name: string }>

export async function renameFolderAction(
  folderId: string,
  name: string
): Promise<void>

export async function moveFolderAction(
  folderId: string,
  newParentId: string | null
): Promise<void>

/** Deletes folder and sets folder_id = null on child notes. */
export async function deleteFolderAction(folderId: string): Promise<void>
```

### Workspace Actions (`app/actions/workspace.ts`)

```ts
'use server'

export async function saveWorkspaceAction(state: {
  openNoteIds: string[]
  activeNoteId: string | null
  panelLayout: { sidebarWidth: number; previewVisible: boolean }
}): Promise<void>
```

---

## Data Flow Summary

```
Client Component
  │
  ├── read  → Server Component fetches via lib/db/* on initial render
  │
  └── write → Server Action (app/actions/*.ts)
                └── calls lib/db/* which calls lib/supabase/server.ts
```

No raw Supabase client calls in components — all DB access goes through `lib/`.
