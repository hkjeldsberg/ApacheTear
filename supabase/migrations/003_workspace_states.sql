-- Migration 003: Create workspace_states table for UI persistence
-- Depends on: 002 (apache.notes)

CREATE TABLE IF NOT EXISTS apache.workspace_states (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  open_note_ids  uuid[]      NOT NULL DEFAULT '{}',
  active_note_id uuid        REFERENCES apache.notes(id) ON DELETE SET NULL,
  panel_layout   jsonb       NOT NULL DEFAULT '{"sidebarWidth":260,"previewVisible":true}',
  updated_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT workspace_states_user_unique UNIQUE (user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS workspace_states_user_id_idx ON apache.workspace_states (user_id);

-- Row Level Security
ALTER TABLE apache.workspace_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY ws_select ON apache.workspace_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY ws_insert ON apache.workspace_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY ws_update ON apache.workspace_states FOR UPDATE
  USING (auth.uid() = user_id);
