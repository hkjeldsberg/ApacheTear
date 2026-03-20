-- Migration 001: Create apache schema, trigger function, and folders table
-- Run: supabase db push

-- Create schema
CREATE SCHEMA IF NOT EXISTS apache;

-- Shared trigger function for updated_at
CREATE OR REPLACE FUNCTION apache.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Folders table (must exist before notes, which references it)
CREATE TABLE IF NOT EXISTS apache.folders (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id  uuid        REFERENCES apache.folders(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS folders_user_id_idx   ON apache.folders (user_id);
CREATE INDEX IF NOT EXISTS folders_parent_id_idx ON apache.folders (parent_id);

-- Updated-at trigger
CREATE TRIGGER folders_updated_at
  BEFORE UPDATE ON apache.folders
  FOR EACH ROW EXECUTE FUNCTION apache.set_updated_at();

-- Row Level Security
ALTER TABLE apache.folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY folders_select ON apache.folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY folders_insert ON apache.folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY folders_update ON apache.folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY folders_delete ON apache.folders FOR DELETE
  USING (auth.uid() = user_id);
