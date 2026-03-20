-- Migration 002: Create notes table with FTS and RLS
-- Depends on: 001 (apache schema, set_updated_at function, folders table)

CREATE TABLE IF NOT EXISTS apache.notes (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id     uuid        REFERENCES apache.folders(id) ON DELETE SET NULL,
  title         text        NOT NULL DEFAULT 'Untitled',
  content       text        NOT NULL DEFAULT '',
  search_vector tsvector    GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title,   '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) STORED,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS notes_user_id_idx       ON apache.notes (user_id);
CREATE INDEX IF NOT EXISTS notes_folder_id_idx     ON apache.notes (folder_id);
CREATE INDEX IF NOT EXISTS notes_search_vector_idx ON apache.notes USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS notes_updated_at_idx    ON apache.notes (user_id, updated_at DESC);

-- Updated-at trigger
CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON apache.notes
  FOR EACH ROW EXECUTE FUNCTION apache.set_updated_at();

-- Row Level Security
ALTER TABLE apache.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY notes_select ON apache.notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY notes_insert ON apache.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY notes_update ON apache.notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY notes_delete ON apache.notes FOR DELETE
  USING (auth.uid() = user_id);
