'use client'

import { useEffect, useRef } from 'react'

interface NewItemInputProps {
  placeholder?: string
  onCreate: (name: string) => void
  onCancel: () => void
}

export default function NewItemInput({
  placeholder = 'Name…',
  onCreate,
  onCancel,
}: NewItemInputProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') {
      const value = inputRef.current?.value.trim() ?? ''
      if (value) onCreate(value)
    }
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="px-2 py-1">
      <label htmlFor="new-item-input" className="sr-only">
        {placeholder}
      </label>
      <input
        id="new-item-input"
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        onBlur={onCancel}
        className="w-full bg-monokai-bg border border-monokai-blue rounded px-2 py-1 text-sm text-monokai-fg focus:outline-none placeholder:text-monokai-fg-muted"
      />
    </div>
  )
}
