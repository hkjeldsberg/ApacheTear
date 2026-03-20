import { createClient } from '@/lib/supabase/server'
import { AppError } from '@/lib/errors'
import type { Database } from '@/types/database.types'

type WorkspaceState = Database['apache']['Tables']['workspace_states']['Row']

export interface PanelLayout {
  sidebarWidth: number
  previewVisible: boolean
}

export type { WorkspaceState }

export async function getWorkspaceState(
  userId: string
): Promise<WorkspaceState | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workspace_states')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // no row yet
    throw new AppError('Failed to load workspace', 'workspace/load-failed', error)
  }

  return data as WorkspaceState
}

export async function saveWorkspaceState(
  userId: string,
  state: {
    openNoteIds: string[]
    activeNoteId: string | null
    panelLayout: PanelLayout
  }
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('workspace_states')
    .upsert(
      {
        user_id: userId,
        open_note_ids: state.openNoteIds,
        active_note_id: state.activeNoteId,
        panel_layout: state.panelLayout as unknown as Database['apache']['Tables']['workspace_states']['Insert']['panel_layout'],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    throw new AppError('Failed to save workspace', 'workspace/save-failed', error)
  }
}
