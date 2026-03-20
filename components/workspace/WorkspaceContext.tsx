'use client'

import { createContext, useContext, useState, useRef, useCallback } from 'react'
import { saveWorkspaceAction } from '@/app/actions/workspace'
import type { PanelLayout } from '@/lib/db/workspace'

interface WorkspaceState {
  openNoteIds: string[]
  activeNoteId: string | null
  panelLayout: PanelLayout
}

interface WorkspaceContextValue extends WorkspaceState {
  openNote: (id: string) => void
  closeNote: (id: string) => void
  setActiveNote: (id: string) => void
  updateLayout: (layout: PanelLayout) => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider')
  return ctx
}

interface WorkspaceProviderProps {
  initialState: WorkspaceState
  children: React.ReactNode
}

export function WorkspaceProvider({
  initialState,
  children,
}: WorkspaceProviderProps): React.JSX.Element {
  const [state, setState] = useState<WorkspaceState>(initialState)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const persist = useCallback((next: WorkspaceState): void => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      saveWorkspaceAction(next).catch(() => {
        // persistence is best-effort — silently ignore network errors
      })
    }, 2000)
  }, [])

  function update(patch: Partial<WorkspaceState>): void {
    setState((prev) => {
      const next = { ...prev, ...patch }
      persist(next)
      return next
    })
  }

  function openNote(id: string): void {
    setState((prev) => {
      if (prev.openNoteIds.includes(id)) {
        const next = { ...prev, activeNoteId: id }
        persist(next)
        return next
      }
      const next = {
        ...prev,
        openNoteIds: [...prev.openNoteIds, id],
        activeNoteId: id,
      }
      persist(next)
      return next
    })
  }

  function closeNote(id: string): void {
    setState((prev) => {
      const openNoteIds = prev.openNoteIds.filter((n) => n !== id)
      const activeNoteId =
        prev.activeNoteId === id ? (openNoteIds[openNoteIds.length - 1] ?? null) : prev.activeNoteId
      const next = { ...prev, openNoteIds, activeNoteId }
      persist(next)
      return next
    })
  }

  function setActiveNote(id: string): void {
    update({ activeNoteId: id })
  }

  function updateLayout(layout: PanelLayout): void {
    update({ panelLayout: layout })
  }

  return (
    <WorkspaceContext.Provider
      value={{ ...state, openNote, closeNote, setActiveNote, updateLayout }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}
