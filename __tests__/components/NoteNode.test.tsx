import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NoteNode from '@/components/file-tree/NoteNode'

vi.mock('@/app/actions/notes', () => ({
  updateNoteAction: vi.fn(),
  deleteNoteAction: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/notes/other-id',
}))

import { updateNoteAction, deleteNoteAction } from '@/app/actions/notes'

describe('NoteNode', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the note title', () => {
    render(<NoteNode id="note-1" title="My Note" />)
    expect(screen.getByText('My Note')).toBeInTheDocument()
  })

  it('enters rename mode on double-click', () => {
    render(<NoteNode id="note-1" title="My Note" />)
    fireEvent.doubleClick(screen.getByText('My Note'))
    const input = screen.getByRole('textbox', { name: /rename note/i })
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('My Note')
  })

  it('calls updateNoteAction with new title on Enter in rename', async () => {
    vi.mocked(updateNoteAction).mockResolvedValue(undefined)
    render(<NoteNode id="note-1" title="Old Title" />)
    fireEvent.doubleClick(screen.getByText('Old Title'))
    const input = screen.getByRole('textbox', { name: /rename note/i })
    fireEvent.change(input, { target: { value: 'New Title' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(updateNoteAction).toHaveBeenCalledWith('note-1', { title: 'New Title' })
    })
  })

  it('shows delete Modal when delete button is clicked', async () => {
    render(<NoteNode id="note-1" title="My Note" />)
    // Hover to reveal action buttons
    const container = screen.getByText('My Note').closest('div')!
    fireEvent.mouseEnter(container)
    const deleteBtn = screen.getByLabelText('Delete note')
    fireEvent.click(deleteBtn)

    await waitFor(() => {
      expect(screen.getByText('Delete note')).toBeInTheDocument()
    })
  })

  it('calls deleteNoteAction after confirming delete', async () => {
    vi.mocked(deleteNoteAction).mockResolvedValue(undefined)
    render(<NoteNode id="note-1" title="My Note" />)
    const deleteBtn = screen.getByLabelText('Delete note')
    fireEvent.click(deleteBtn)
    await waitFor(() => screen.getByText('Delete note'))
    fireEvent.click(screen.getByText('Delete'))
    await waitFor(() => {
      expect(deleteNoteAction).toHaveBeenCalledWith('note-1')
    })
  })
})
