'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import { updateNoteAction, deleteNoteAction } from '@/app/actions/notes'

interface NoteNodeProps {
  id: string
  title: string
  /** True when this note is in the workspace's open note list */
  isOpen?: boolean
  /** True when this note is the workspace's active note */
  isActive?: boolean
}

export default function NoteNode({ id, title, isOpen, isActive: isActiveProp }: NoteNodeProps): React.JSX.Element {
  const router = useRouter()
  const pathname = usePathname()
  const isActive = isActiveProp ?? pathname === `/notes/${id}`

  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(title)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isRenaming) renameInputRef.current?.select()
  }, [isRenaming])

  async function handleRenameCommit(): Promise<void> {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== title) {
      await updateNoteAction(id, { title: trimmed })
    }
    setIsRenaming(false)
  }

  function handleRenameKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') handleRenameCommit()
    if (e.key === 'Escape') {
      setRenameValue(title)
      setIsRenaming(false)
    }
  }

  async function handleDelete(): Promise<void> {
    setShowDeleteModal(false)
    await deleteNoteAction(id)
  }

  return (
    <>
      <div
        className={[
          'group flex items-center gap-1 rounded px-2 py-1',
          'min-h-[44px] text-sm cursor-pointer transition-colors duration-150',
          isActive
            ? 'bg-monokai-bg-lighter text-monokai-fg'
            : 'text-monokai-fg-muted hover:bg-monokai-bg-light hover:text-monokai-fg',
        ].join(' ')}
      >
        {isRenaming ? (
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameCommit}
            onKeyDown={handleRenameKeyDown}
            aria-label="Rename note"
            className="flex-1 bg-monokai-bg border border-monokai-blue rounded px-1 text-monokai-fg focus:outline-none"
          />
        ) : (
          <button
            className="flex-1 text-left truncate flex items-center gap-1.5"
            onClick={() => router.push(`/notes/${id}`)}
            onDoubleClick={() => setIsRenaming(true)}
          >
            {isOpen && !isActive && (
              <span
                aria-label="Open in workspace"
                className="flex-none w-1.5 h-1.5 rounded-full bg-monokai-blue/60"
              />
            )}
            <span className="truncate">{title || 'Untitled'}</span>
          </button>
        )}

        {/* Action icons (visible on hover) */}
        {!isRenaming && (
          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); setIsRenaming(true) }}
              aria-label="Rename note"
              className="p-1 rounded hover:text-monokai-blue min-w-[44px] min-h-[44px]"
              title="Rename"
            >
              ✎
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true) }}
              aria-label="Delete note"
              className="p-1 rounded hover:text-monokai-pink min-w-[44px] min-h-[44px]"
              title="Delete"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <Modal
          title="Delete note"
          confirmLabel="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onClose={() => setShowDeleteModal(false)}
        >
          Are you sure you want to delete <strong>{title || 'Untitled'}</strong>?
          This cannot be undone.
        </Modal>
      )}
    </>
  )
}
