'use client'

import { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import Modal from '@/components/ui/Modal'
import NewItemInput from './NewItemInput'
import DraggableNoteWrapper from './DraggableNoteWrapper'
import { renameFolderAction, deleteFolderAction } from '@/app/actions/folders'
import { createNoteAction } from '@/app/actions/notes'
import { useRouter } from 'next/navigation'

interface NoteItem {
  id: string
  title: string
  folder_id: string | null
}

interface FolderItem {
  id: string
  name: string
  parent_id: string | null
}

interface FolderNodeProps {
  folder: FolderItem
  childFolders: FolderItem[]
  notes: NoteItem[]
  openNoteIds?: string[]
  activeNoteId?: string | null
  depth?: number
}

export default function FolderNode({
  folder,
  childFolders,
  notes,
  openNoteIds = [],
  activeNoteId = null,
  depth = 0,
}: FolderNodeProps): React.JSX.Element {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(folder.name)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showNewNote, setShowNewNote] = useState(false)
  const renameInputRef = useRef<HTMLInputElement>(null)

  // Make this folder a drop target
  const { isOver, setNodeRef: setDropRef } = useDroppable({ id: `folder:${folder.id}` })

  useEffect(() => {
    if (isRenaming) renameInputRef.current?.select()
  }, [isRenaming])

  // Auto-open folder when something is dragged over it
  useEffect(() => {
    if (isOver) setIsOpen(true)
  }, [isOver])

  const folderNotes = notes.filter((n) => n.folder_id === folder.id)
  const nestedFolders = childFolders.filter((f) => f.parent_id === folder.id)
  const indent = depth * 12

  async function handleRenameCommit(): Promise<void> {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== folder.name) {
      await renameFolderAction(folder.id, trimmed)
    }
    setIsRenaming(false)
  }

  function handleRenameKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') handleRenameCommit()
    if (e.key === 'Escape') {
      setRenameValue(folder.name)
      setIsRenaming(false)
    }
  }

  async function handleDelete(): Promise<void> {
    setShowDeleteModal(false)
    await deleteFolderAction(folder.id)
  }

  async function handleNewNote(name: string): Promise<void> {
    setShowNewNote(false)
    const { id } = await createNoteAction({ title: name, folderId: folder.id })
    router.push(`/notes/${id}`)
  }

  return (
    <>
      {/* Folder row — is the droppable target */}
      <div
        ref={setDropRef}
        className={[
          'group flex items-center gap-1 rounded px-2 py-1 min-h-[44px] text-sm cursor-pointer transition-colors duration-150',
          isOver
            ? 'bg-monokai-blue/20 text-monokai-fg ring-1 ring-monokai-blue/50'
            : 'text-monokai-fg-muted hover:bg-monokai-bg-light hover:text-monokai-fg',
        ].join(' ')}
        style={{ paddingLeft: `${8 + indent}px` }}
        onClick={() => { if (!isRenaming) setIsOpen((v) => !v) }}
        onDoubleClick={() => { if (!isRenaming) setIsRenaming(true) }}
      >
        {/* Expand toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen((v) => !v) }}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Collapse folder' : 'Expand folder'}
          className="flex-none w-4 text-center text-xs"
        >
          {isOpen ? '▾' : '▸'}
        </button>

        {/* Folder name / rename input */}
        {isRenaming ? (
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameCommit}
            onKeyDown={handleRenameKeyDown}
            onClick={(e) => e.stopPropagation()}
            aria-label="Rename folder"
            className="flex-1 bg-monokai-bg border border-monokai-blue rounded px-1 text-monokai-fg focus:outline-none"
          />
        ) : (
          <span className="flex-1 truncate">
            📁 {folder.name}
          </span>
        )}

        {/* Action icons */}
        {!isRenaming && (
          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); setShowNewNote(true); setIsOpen(true) }}
              aria-label="New note in folder"
              className="p-1 rounded hover:text-monokai-green min-w-[44px] min-h-[44px]"
              title="New note"
            >
              +
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIsRenaming(true) }}
              aria-label="Rename folder"
              className="p-1 rounded hover:text-monokai-blue min-w-[44px] min-h-[44px]"
              title="Rename"
            >
              ✎
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true) }}
              aria-label="Delete folder"
              className="p-1 rounded hover:text-monokai-pink min-w-[44px] min-h-[44px]"
              title="Delete"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Children (when expanded) */}
      {isOpen && (
        <div>
          {showNewNote && (
            <div style={{ paddingLeft: `${8 + indent + 16}px` }}>
              <NewItemInput
                placeholder="Note name…"
                onCreate={handleNewNote}
                onCancel={() => setShowNewNote(false)}
              />
            </div>
          )}

          {nestedFolders.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              childFolders={childFolders}
              notes={notes}
              openNoteIds={openNoteIds}
              activeNoteId={activeNoteId}
              depth={depth + 1}
            />
          ))}

          {/* Notes inside folder — draggable so they can be moved out */}
          {folderNotes.map((note) => (
            <DraggableNoteWrapper
              key={note.id}
              id={note.id}
              title={note.title}
              indent={indent + 16}
              isOpen={openNoteIds.includes(note.id)}
              isActive={activeNoteId === note.id}
            />
          ))}

          {nestedFolders.length === 0 && folderNotes.length === 0 && !showNewNote && (
            <p
              className="text-xs text-monokai-fg-muted py-1"
              style={{ paddingLeft: `${8 + indent + 16}px` }}
            >
              Empty folder
            </p>
          )}
        </div>
      )}

      {showDeleteModal && (
        <Modal
          title="Delete folder"
          confirmLabel="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onClose={() => setShowDeleteModal(false)}
        >
          Delete <strong>{folder.name}</strong>? Notes inside will be moved to the root.
          This cannot be undone.
        </Modal>
      )}
    </>
  )
}
