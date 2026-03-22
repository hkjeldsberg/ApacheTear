'use client'

import { useRef, useCallback, useState } from 'react'

const MIN_WIDTH = 160
const MAX_WIDTH = 480

interface ResizablePanelProps {
  initialWidth?: number
  onResize?: (newWidth: number) => void
  sidebar: React.ReactNode
  children: React.ReactNode
}

export default function ResizablePanel({
  initialWidth = 260,
  onResize,
  sidebar,
  children,
}: ResizablePanelProps): React.JSX.Element {
  const sidebarRef = useRef<HTMLElement>(null)
  const isResizing = useRef(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      e.preventDefault()
      isResizing.current = true

      function onMouseMove(moveEvent: MouseEvent): void {
        if (!isResizing.current || !sidebarRef.current) return
        const newWidth = Math.min(
          MAX_WIDTH,
          Math.max(MIN_WIDTH, moveEvent.clientX)
        )
        sidebarRef.current.style.width = `${newWidth}px`
        onResize?.(newWidth)
      }

      function onMouseUp(): void {
        isResizing.current = false
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [onResize]
  )

  return (
    <div className="flex h-full overflow-hidden">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — overlay on mobile, static on desktop */}
      <aside
        ref={sidebarRef}
        className={[
          'no-print flex flex-col border-r border-monokai-bg-lighter flex-none overflow-hidden bg-monokai-bg',
          // Mobile: fixed overlay with slide transition
          'fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: static in flow, reset transforms
          'md:relative md:translate-x-0 md:z-auto md:transition-none',
        ].join(' ')}
        style={{ width: `${initialWidth}px` }}
      >
        {sidebar}
      </aside>

      {/* Drag handle — desktop only */}
      <div
        onMouseDown={handleMouseDown}
        aria-hidden="true"
        className="hidden md:block w-1 cursor-col-resize bg-monokai-bg-lighter hover:bg-monokai-blue/50 transition-colors duration-150 flex-none"
        data-testid="resize-handle"
      />

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile header bar with hamburger */}
        <div className="md:hidden flex items-center gap-3 px-3 py-2 border-b border-monokai-bg-lighter no-print">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-expanded={mobileOpen}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-monokai-fg-muted hover:text-monokai-fg transition-colors"
          >
            {/* Hamburger / X icon */}
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
          <span className="text-sm font-semibold text-monokai-fg">Apache Tear</span>
        </div>

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}
