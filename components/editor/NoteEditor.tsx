'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { updateNoteAction } from '@/app/actions/notes'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface NoteEditorProps {
  noteId: string
  initialTitle: string
  initialContent: string
  onTitleChange?: (title: string) => void
  onContentChange?: (content: string) => void
}

const DEBOUNCE_MS = 2000

export default function NoteEditor({
  noteId,
  initialTitle,
  initialContent,
  onTitleChange,
  onContentChange,
}: NoteEditorProps): React.JSX.Element {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(
    async (nextTitle: string, nextContent: string): Promise<void> => {
      setSaveStatus('saving')
      try {
        await updateNoteAction(noteId, { title: nextTitle, content: nextContent })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 1500)
      } catch {
        setSaveStatus('error')
      }
    },
    [noteId]
  )

  const scheduleSave = useCallback(
    (nextTitle: string, nextContent: string): void => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => save(nextTitle, nextContent), DEBOUNCE_MS)
    },
    [save]
  )

  // Clear debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const val = e.target.value
    setTitle(val)
    onTitleChange?.(val)
    scheduleSave(val, content)
  }

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    const val = e.target.value
    setContent(val)
    onContentChange?.(val)
    scheduleSave(title, val)
  }

  const statusLabel: Record<SaveStatus, string> = {
    idle: '',
    saving: 'Saving…',
    saved: 'Saved',
    error: 'Error saving',
  }

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-monokai-bg-lighter px-4 py-2">
        <label htmlFor="note-title" className="sr-only">
          Note title
        </label>
        <input
          id="note-title"
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className={[
            'flex-1 bg-transparent text-lg font-semibold text-monokai-fg',
            'placeholder:text-monokai-fg-muted',
            'focus:outline-none',
          ].join(' ')}
        />
        {saveStatus !== 'idle' && (
          <span
            className={[
              'text-xs',
              saveStatus === 'error' ? 'text-monokai-pink' : 'text-monokai-fg-muted',
            ].join(' ')}
            aria-live="polite"
          >
            {statusLabel[saveStatus]}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <label htmlFor="note-content" className="sr-only">
          Note content
        </label>
        <textarea
          id="note-content"
          value={content}
          onChange={handleContentChange}
          placeholder="Write in Markdown…"
          className={[
            'w-full h-full resize-none bg-transparent p-4',
            'text-sm font-mono text-monokai-fg leading-relaxed',
            'placeholder:text-monokai-fg-muted',
            'focus:outline-none',
          ].join(' ')}
          spellCheck
        />
      </div>
    </div>
  )
}
