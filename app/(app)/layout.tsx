import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listNotes } from '@/lib/db/notes'
import { listFolders } from '@/lib/db/folders'
import { getWorkspaceState } from '@/lib/db/workspace'
import type { PanelLayout } from '@/lib/db/workspace'
import FileTree from '@/components/file-tree/FileTree'
import ResizablePanel from '@/components/workspace/ResizablePanel'
import { WorkspaceProvider } from '@/components/workspace/WorkspaceContext'
import { signOut } from '@/app/actions/auth'

const DEFAULT_LAYOUT: PanelLayout = { sidebarWidth: 260, previewVisible: true }

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const [notes, folders, workspace] = await Promise.all([
    listNotes(session.user.id),
    listFolders(session.user.id),
    getWorkspaceState(session.user.id),
  ])

  const validNoteIds = new Set(notes.map((n) => n.id))
  const rawOpenIds: string[] = Array.isArray(workspace?.open_note_ids)
    ? (workspace.open_note_ids as string[])
    : []
  const openNoteIds = rawOpenIds.filter((id) => validNoteIds.has(id))
  const activeNoteId =
    workspace?.active_note_id && validNoteIds.has(workspace.active_note_id)
      ? workspace.active_note_id
      : (openNoteIds[0] ?? null)
  const panelLayout: PanelLayout =
    workspace?.panel_layout && typeof workspace.panel_layout === 'object'
      ? (workspace.panel_layout as unknown as PanelLayout)
      : DEFAULT_LAYOUT

  const initialWorkspace = { openNoteIds, activeNoteId, panelLayout }

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-monokai-bg-lighter">
        <span className="text-sm font-semibold text-monokai-fg">Apache Tear</span>
        <form action={signOut}>
          <button
            type="submit"
            className="text-xs text-monokai-fg-muted hover:text-monokai-fg transition-colors min-h-[44px] min-w-[44px] px-2"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* File tree — passes open/active state for highlighting */}
      <div className="flex-1 overflow-hidden">
        <FileTree
          notes={notes}
          folders={folders}
          openNoteIds={openNoteIds}
          activeNoteId={activeNoteId}
        />
      </div>
    </div>
  )

  return (
    <WorkspaceProvider initialState={initialWorkspace}>
      <div className="h-screen overflow-hidden bg-monokai-bg text-monokai-fg">
        <ResizablePanel initialWidth={panelLayout.sidebarWidth} sidebar={sidebar}>
          {children}
        </ResizablePanel>
      </div>
    </WorkspaceProvider>
  )
}
