'use client'

import { useEffect, useRef } from 'react'
import Button from './Button'

interface ModalProps {
  title: string
  children: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'primary' | 'danger'
  onConfirm: () => void
  onClose: () => void
}

export default function Modal({
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onClose,
}: ModalProps): React.JSX.Element {
  const confirmRef = useRef<HTMLButtonElement>(null)

  // Focus confirm button on open
  useEffect(() => {
    confirmRef.current?.focus()
  }, [])

  // Escape key closes the modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      {/* Panel — stop click propagation so backdrop click doesn't fire inside */}
      <div
        className="w-full max-w-sm rounded-lg bg-monokai-bg-light border border-monokai-bg-lighter p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="modal-title"
          className="text-base font-semibold text-monokai-fg mb-3"
        >
          {title}
        </h2>
        <div className="text-sm text-monokai-fg-muted mb-6">{children}</div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            variant={confirmVariant}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
