'use client'

import { useRef, useCallback } from 'react'

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
      <aside
        ref={sidebarRef}
        className="no-print flex flex-col border-r border-monokai-bg-lighter flex-none overflow-hidden"
        style={{ width: `${initialWidth}px` }}
      >
        {sidebar}
      </aside>

      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        aria-hidden="true"
        className="w-1 cursor-col-resize bg-monokai-bg-lighter hover:bg-monokai-blue/50 transition-colors duration-150 flex-none"
        data-testid="resize-handle"
      />

      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
