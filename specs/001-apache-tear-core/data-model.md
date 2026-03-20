# Data Model: Apache Tear — Core Application

**Branch**: `001-apache-tear-core` | **Date**: 2026-03-20

---

## Entities Overview

| Entity | Table | Purpose |
|--------|-------|---------|
| User | `auth.users` (Supabase managed) | Identity, owns all data |
| Note | `notes` | Markdown document with content |
| Folder | `folders` | Hierarchical note container |
| WorkspaceState | `workspace_states` | Per-user UI persistence |

---

## Entity: Note

**Table**: `notes`

### Schema

```sql
CREATE TABLE notes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id   uuid        REFERENCES folders(id) ON DELETE SET NULL,
  title       text        NOT NULL DEFAULT 'Untitled',
  content     text        NOT NULL DEFAULT '',
  search_vector tsvector  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')),   'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) STORED,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
```

### Indexes

```sql
CREATE INDEX notes_user_id_idx        ON notes (user_id);
CREATE INDEX notes_folder_id_idx      ON notes (folder_id);
CREATE INDEX notes_search_vector_idx  ON notes USING GIN (search_vector);
CREATE INDEX notes_updated_at_idx     ON notes (user_id, updated_at DESC);
```

### Row Level Security

```sql
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY notes_select ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY notes_insert ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY notes_update ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY notes_delete ON notes FOR DELETE
  USING (auth.uid() = user_id);
```

### Validation Rules (application-level)

- `title`: trimmed, max 255 characters; empty title defaults to `'Untitled'`
- `content`: no hard size limit in v1; graceful handling of large content in UI
- `folder_id`: nullable — null means note is at root level

### Updated-at Trigger

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

## Entity: Folder

**Table**: `folders`

### Schema

```sql
CREATE TABLE folders (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id   uuid        REFERENCES folders(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
```

### Indexes

```sql
CREATE INDEX folders_user_id_idx   ON folders (user_id);
CREATE INDEX folders_parent_id_idx ON folders (parent_id);
```

### Row Level Security

```sql
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY folders_select ON folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY folders_insert ON folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY folders_update ON folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY folders_delete ON folders FOR DELETE
  USING (auth.uid() = user_id);
```

### Validation Rules

- `name`: trimmed, 1–100 characters, non-empty
- `parent_id`: nullable — null means top-level folder
- Circular nesting prevention: application-level check before update
  (a folder MUST NOT be moved into one of its own descendants)

### Updated-at Trigger

```sql
CREATE TRIGGER folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

## Entity: WorkspaceState

**Table**: `workspace_states`

### Schema

```sql
CREATE TABLE workspace_states (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  open_note_ids   uuid[]      NOT NULL DEFAULT '{}',
  active_note_id  uuid        REFERENCES notes(id) ON DELETE SET NULL,
  panel_layout    jsonb       NOT NULL DEFAULT '{}',
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT workspace_states_user_unique UNIQUE (user_id)
);
```

**`panel_layout` JSON shape**:

```json
{
  "sidebarWidth": 260,
  "previewVisible": true
}
```

### Indexes

```sql
CREATE INDEX workspace_states_user_id_idx ON workspace_states (user_id);
```

### Row Level Security

```sql
ALTER TABLE workspace_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY ws_select ON workspace_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY ws_insert ON workspace_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY ws_update ON workspace_states FOR UPDATE
  USING (auth.uid() = user_id);
```

### Upsert Pattern

WorkspaceState is always upserted (never inserted twice):

```ts
supabase
  .from('workspace_states')
  .upsert({ user_id, open_note_ids, active_note_id, panel_layout })
  .eq('user_id', user_id)
```

---

## Relationships Diagram

```
auth.users (1)
  ├──< notes (N)      — user_id FK
  │     └── folder_id FK (nullable) ──> folders.id
  ├──< folders (N)    — user_id FK
  │     └── parent_id FK (nullable) ──> folders.id (self-referential)
  └──  workspace_states (1) — user_id FK UNIQUE
        └── active_note_id FK (nullable) ──> notes.id
```

---

## State Transitions

### Note Lifecycle

```
[created] → [draft: editing] → [saved] → [edited] → [saved]
                                                    → [deleted]
```

- **created**: row inserted with default title `'Untitled'`, empty content
- **saved**: content + title written to DB; `updated_at` bumped by trigger
- **deleted**: row removed; `workspace_states.open_note_ids` cleaned up by
  application logic on next session restore (not by DB cascade, since the
  array column cannot cascade automatically)

### Folder Lifecycle

```
[created] → [named] → [renamed] → [nested/moved] → [deleted]
```

- **deleted** with `ON DELETE CASCADE`: all child folders and their notes
  (`folder_id` → `SET NULL`) are handled by the DB; application confirms
  with user before deletion (FR-015).

---

## Full-Text Search Query Example

```sql
SELECT id, title, content, ts_rank(search_vector, query) AS rank
FROM notes,
     websearch_to_tsquery('english', $1) AS query
WHERE user_id = auth.uid()
  AND search_vector @@ query
ORDER BY rank DESC, updated_at DESC
LIMIT 20;
```

Supabase client equivalent:

```ts
supabase
  .from('notes')
  .select('id, title, content, updated_at')
  .textSearch('search_vector', query, { type: 'websearch', config: 'english' })
  .order('updated_at', { ascending: false })
  .limit(20)
```
