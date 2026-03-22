'use client'

import { useState } from 'react'
import NoteEditor from './NoteEditor'
import { downloadNoteAsMarkdown } from '@/lib/export/markdown'
import { printNoteToPdf } from '@/lib/export/pdf'
import type { Note } from '@/lib/db/notes'

interface EditorLayoutProps {
  note: Note
}

export default function EditorLayout({ note }: EditorLayoutProps): React.JSX.Element {
  const [liveTitle, setLiveTitle] = useState(note.title)
  const [liveContent, setLiveContent] = useState(note.content)

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-monokai-bg-lighter px-4 py-2 no-print">
        <span className="text-xs text-monokai-fg-muted truncate max-w-[60%]">
          {liveTitle || 'Untitled'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadNoteAsMarkdown(liveTitle || 'untitled', liveContent)}
            aria-label="Download as Markdown"
            title="Download as Markdown"
            className="rounded px-3 py-1 text-xs text-monokai-fg-muted hover:text-monokai-fg transition-colors duration-150 min-h-[44px] min-w-[44px]"
          >
            .md
          </button>
          <button
            onClick={printNoteToPdf}
            aria-label="Print or save as PDF"
            title="Print or save as PDF"
            className="rounded px-3 py-1 text-xs text-monokai-fg-muted hover:text-monokai-fg transition-colors duration-150 min-h-[44px] min-w-[44px]"
          >
            PDF
          </button>
        </div>
      </div>

      {/* Editor — full remaining height, plain markdown textarea */}
      <div className="flex-1 overflow-hidden print-target">
        <NoteEditor
          noteId={note.id}
          initialTitle={note.title}
          initialContent={note.content}
          onTitleChange={setLiveTitle}
          onContentChange={setLiveContent}
        />
      </div>
    </div>
  )
}
