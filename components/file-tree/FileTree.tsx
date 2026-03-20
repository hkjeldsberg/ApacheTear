'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core'
import FolderNode from './FolderNode'
import DraggableNoteWrapper from './DraggableNoteWrapper'
import NewItemInput from './NewItemInput'
import Button from '@/components/ui/Button'
import { createNoteAction, updateNoteAction } from '@/app/actions/notes'
import { createFolderAction, moveFolderAction } from '@/app/actions/folders'

interface NoteItem {
  id: string
  title: string
  folder_id: string | null
  updated_at: string
}

interface FolderItem {
  id: string
  name: string
  parent_id: string | null
}

interface FileTreeProps {
  notes: NoteItem[]
  openNoteIds?: string[]
  activeNoteId?: string | null
  folders?: FolderItem[]
}

// Droppable root zone — notes dragged here become folder_id: null
function RootDropZone({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { isOver, setNodeRef } = useDroppable({ id: 'root' })

  return (
    <div
      ref={setNodeRef}
      className={[
        'flex-1 overflow-y-auto py-1 transition-colors duration-150',
        isOver ? 'bg-monokai-blue/10 ring-1 ring-inset ring-monokai-blue/30 rounded' : '',
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export default function FileTree({
  notes,
  folders = [],
  openNoteIds = [],
  activeNoteId = null,
}: FileTreeProps): React.JSX.Element {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showNewFolder, setShowNewFolder] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const rootNotes = notes.filter((n) => n.folder_id === null)
  const rootFolders = folders.filter((f) => f.parent_id === null)

  function handleNewNote(): void {
    startTransition(async () => {
      const { id } = await createNoteAction({})
      router.push(`/notes/${id}`)
    })
  }

  async function handleNewFolder(name: string): Promise<void> {
    setShowNewFolder(false)
    await createFolderAction({ name, parentId: null })
  }

  async function handleDragEnd(event: DragEndEvent): Promise<void> {
    const { active, over } = event
    if (!over) return

    const activeStr = String(active.id)
    const overStr = String(over.id)

    if (!activeStr.startsWith('note:')) {
      // Folder drag: move folder under new parent folder
      if (activeStr.startsWith('folder:') && overStr.startsWith('folder:')) {
        const folderId = activeStr.slice(7)
        const newParentId = overStr.slice(7)
        if (folderId !== newParentId) {
          await moveFolderAction(folderId, newParentId)
        }
      }
      return
    }

    const noteId = activeStr.slice(5)

    if (overStr.startsWith('folder:')) {
      // Drop on folder → move note into that folder
      const folderId = overStr.slice(7)
      await updateNoteAction(noteId, { folderId })
    } else if (overStr === 'root') {
      // Drop on root zone → move note to root (remove folder)
      await updateNoteAction(noteId, { folderId: null })
    }
  }

  return (
    <nav aria-label="Notes" className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-monokai-bg-lighter">
        <span className="text-xs font-semibold uppercase tracking-wider text-monokai-fg-muted">
          Notes
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            onClick={() => setShowNewFolder(true)}
            aria-label="New folder"
            className="p-1 text-sm leading-none min-h-[44px] min-w-[44px]"
            title="New folder"
          >
            📁
          </Button>
          <Button
            variant="ghost"
            onClick={handleNewNote}
            disabled={isPending}
            aria-label="New note"
            className="p-1 text-lg leading-none min-h-[44px] min-w-[44px]"
          >
            +
          </Button>
        </div>
      </div>

      {/* New folder input */}
      {showNewFolder && (
        <NewItemInput
          placeholder="Folder name…"
          onCreate={handleNewFolder}
          onCancel={() => setShowNewFolder(false)}
        />
      )}

      {/* DnD tree */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <RootDropZone>
          {rootFolders.length === 0 && rootNotes.length === 0 ? (
            <p className="px-3 py-4 text-xs text-monokai-fg-muted text-center">
              No notes yet.
              <br />
              Click <strong>+</strong> to create one.
            </p>
          ) : (
            <>
              {rootFolders.map((folder) => (
                <FolderNode
                  key={folder.id}
                  folder={folder}
                  childFolders={folders}
                  notes={notes}
                  openNoteIds={openNoteIds}
                  activeNoteId={activeNoteId}
                  depth={0}
                />
              ))}
              {rootNotes.map((note) => (
                <DraggableNoteWrapper
                  key={note.id}
                  id={note.id}
                  title={note.title}
                  isOpen={openNoteIds.includes(note.id)}
                  isActive={activeNoteId === note.id}
                />
              ))}
            </>
          )}
        </RootDropZone>
      </DndContext>
    </nav>
  )
}
