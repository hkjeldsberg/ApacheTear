'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import NoteNode from './NoteNode'

interface DraggableNoteWrapperProps {
  id: string
  title: string
  indent?: number
  isOpen?: boolean
  isActive?: boolean
}

export default function DraggableNoteWrapper({
  id,
  title,
  indent = 0,
  isOpen,
  isActive,
}: DraggableNoteWrapperProps): React.JSX.Element {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `note:${id}`,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        paddingLeft: indent ? `${indent}px` : undefined,
        cursor: isDragging ? 'grabbing' : undefined,
      }}
      {...attributes}
      {...listeners}
    >
      <NoteNode id={id} title={title} isOpen={isOpen} isActive={isActive} />
    </div>
  )
}
