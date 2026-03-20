# Lib Function Contracts: Apache Tear — Core Application

**Branch**: `001-apache-tear-core` | **Date**: 2026-03-20

These are the typed signatures for all functions in `lib/`. They define the
contract between the UI layer (components, Server Components, Server Actions)
and the data layer (Supabase client, business logic).

All functions return explicit types — no `any` or implicit `unknown`.

---

## `lib/db/notes.ts`

```ts
import type { Database } from '@/types/database.types'

type Note = Database['public']['Tables']['notes']['Row']
type NoteInsert = Database['public']['Tables']['notes']['Insert']
type NoteUpdate = Database['public']['Tables']['notes']['Update']

/** Fetch all notes for the authenticated user (metadata only, no content). */
export async function listNotes(
  userId: string
): Promise<Pick<Note, 'id' | 'title' | 'folder_id' | 'updated_at'>[]>

/** Fetch a single note including full content. */
export async function getNote(
  noteId: string,
  userId: string
): Promise<Note | null>

/** Create a new note, returns the created row. */
export async function createNote(
  data: Pick<NoteInsert, 'title' | 'content' | 'folder_id' | 'user_id'>
): Promise<Note>

/** Update note title and/or content. Returns updated row. */
export async function updateNote(
  noteId: string,
  userId: string,
  data: Pick<NoteUpdate, 'title' | 'content' | 'folder_id'>
): Promise<Note>

/** Permanently delete a note. */
export async function deleteNote(
  noteId: string,
  userId: string
): Promise<void>

/** Full-text search across user's notes. Returns ranked matches. */
export async function searchNotes(
  userId: string,
  query: string
): Promise<Pick<Note, 'id' | 'title' | 'content' | 'updated_at'>[]>
```

---

## `lib/db/folders.ts`

```ts
import type { Database } from '@/types/database.types'

type Folder = Database['public']['Tables']['folders']['Row']
type FolderInsert = Database['public']['Tables']['folders']['Insert']

/** Fetch all folders for the authenticated user. */
export async function listFolders(
  userId: string
): Promise<Folder[]>

/** Create a new folder. */
export async function createFolder(
  data: Pick<FolderInsert, 'name' | 'parent_id' | 'user_id'>
): Promise<Folder>

/** Rename a folder. */
export async function renameFolder(
  folderId: string,
  userId: string,
  name: string
): Promise<Folder>

/** Move a folder to a new parent (null = root level).
 *  Throws if the target parent is a descendant of folderId (circular nesting). */
export async function moveFolder(
  folderId: string,
  userId: string,
  newParentId: string | null
): Promise<Folder>

/** Delete a folder. Application must confirm with user before calling.
 *  Notes inside will have folder_id set to null (SET NULL cascade). */
export async function deleteFolder(
  folderId: string,
  userId: string
): Promise<void>

/** Checks whether targetId is a descendant of folderId.
 *  Used to prevent circular nesting. */
export async function isFolderDescendant(
  folderId: string,
  targetId: string,
  userId: string
): Promise<boolean>
```

---

## `lib/db/workspace.ts`

```ts
import type { Database } from '@/types/database.types'

type WorkspaceState = Database['public']['Tables']['workspace_states']['Row']

export interface PanelLayout {
  sidebarWidth: number
  previewVisible: boolean
}

/** Load the workspace state for the user. Returns null if none exists yet. */
export async function getWorkspaceState(
  userId: string
): Promise<WorkspaceState | null>

/** Persist workspace state (upsert). Debounce calls to ≤ 1 per 2 seconds. */
export async function saveWorkspaceState(
  userId: string,
  state: {
    openNoteIds: string[]
    activeNoteId: string | null
    panelLayout: PanelLayout
  }
): Promise<void>
```

---

## `lib/export/markdown.ts`

```ts
/** Triggers a browser file download of the note content as a .md file. */
export function downloadNoteAsMarkdown(
  title: string,
  content: string
): void
```

---

## `lib/export/pdf.ts`

```ts
/** Opens the browser print dialog with the note preview pane as the print target.
 *  Caller must ensure the preview pane has the `print-target` CSS class applied. */
export function printNoteToPdf(): void
```

---

## `lib/supabase/client.ts`

```ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

/** Returns a typed Supabase client for use in Client Components. */
export function createClient(): SupabaseClient<Database>
```

---

## `lib/supabase/server.ts`

```ts
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

/** Returns a typed Supabase client for use in Server Components and Route Handlers.
 *  Reads cookies from the Next.js request context. */
export async function createClient(): Promise<SupabaseClient<Database>>
```

---

## Error Handling Convention

All `lib/db/*` functions:
- Throw a typed `AppError` on Supabase errors (never swallow)
- Return `null` (not throw) when a record is not found (single-record fetch)
- Let the caller handle not-found vs error cases distinctly

```ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}
```
