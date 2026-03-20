'use server'

import { createClient } from '@/lib/supabase/server'
import { saveWorkspaceState } from '@/lib/db/workspace'
import { AppError } from '@/lib/errors'

export async function saveWorkspaceAction(state: {
  openNoteIds: string[]
  activeNoteId: string | null
  panelLayout: { sidebarWidth: number; previewVisible: boolean }
}): Promise<void> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user.id) {
    throw new AppError('Not authenticated', 'auth/unauthenticated')
  }

  await saveWorkspaceState(session.user.id, state)
}
