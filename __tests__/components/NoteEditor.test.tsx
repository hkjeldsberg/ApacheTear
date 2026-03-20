import { render, screen, fireEvent, act } from '@testing-library/react'
import NoteEditor from '@/components/editor/NoteEditor'

vi.mock('@/app/actions/notes', () => ({
  updateNoteAction: vi.fn(),
}))

import { updateNoteAction } from '@/app/actions/notes'

describe('NoteEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders title input with initial value', () => {
    render(
      <NoteEditor
        noteId="note-1"
        initialTitle="My Note"
        initialContent="Hello"
      />
    )
    expect(screen.getByDisplayValue('My Note')).toBeInTheDocument()
  })

  it('renders content textarea with initial value', () => {
    render(
      <NoteEditor
        noteId="note-1"
        initialTitle="Title"
        initialContent="# Heading"
      />
    )
    expect(screen.getByDisplayValue('# Heading')).toBeInTheDocument()
  })

  it('calls updateNoteAction after 2000ms debounce on content change', async () => {
    vi.mocked(updateNoteAction).mockResolvedValue(undefined)
    render(
      <NoteEditor noteId="note-1" initialTitle="Title" initialContent="" />
    )

    fireEvent.change(screen.getByLabelText('Note content', { exact: false }) ??
      screen.getByRole('textbox', { name: /content/i }), {
      target: { value: 'New content' },
    })

    // Should not be called yet
    expect(updateNoteAction).not.toHaveBeenCalled()

    // Advance timers by 2000ms
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(updateNoteAction).toHaveBeenCalledWith('note-1', {
      title: 'Title',
      content: 'New content',
    })
  })

  it('debounce is cleared on unmount without firing', () => {
    const { unmount, container } = render(
      <NoteEditor noteId="note-1" initialTitle="T" initialContent="" />
    )
    fireEvent.change(container.querySelector('textarea')!, {
      target: { value: 'New' },
    })
    // Unmount before the 2000ms debounce fires
    unmount()
    vi.advanceTimersByTime(3000)
    expect(updateNoteAction).not.toHaveBeenCalled()
  })
})
