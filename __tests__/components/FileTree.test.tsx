import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FileTree from '@/components/file-tree/FileTree'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/notes',
}))

vi.mock('@/app/actions/notes', () => ({
  createNoteAction: vi.fn().mockResolvedValue({ id: 'note-new', title: 'Untitled' }),
  updateNoteAction: vi.fn(),
  deleteNoteAction: vi.fn(),
}))

vi.mock('@/app/actions/folders', () => ({
  createFolderAction: vi.fn().mockResolvedValue({ id: 'folder-new', name: 'New Folder' }),
  moveFolderAction: vi.fn(),
  renameFolderAction: vi.fn(),
  deleteFolderAction: vi.fn(),
}))

import { createNoteAction } from '@/app/actions/notes'
import { createFolderAction } from '@/app/actions/folders'

const notes = [
  { id: 'n1', title: 'Note One', folder_id: null, updated_at: '2024-01-01' },
  { id: 'n2', title: 'Note Two', folder_id: 'f1', updated_at: '2024-01-02' },
]
const folders = [{ id: 'f1', name: 'Work', parent_id: null }]

describe('FileTree', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders root-level notes', () => {
    render(<FileTree notes={notes} folders={folders} />)
    expect(screen.getByText('Note One')).toBeInTheDocument()
  })

  it('renders folder in tree', () => {
    render(<FileTree notes={notes} folders={folders} />)
    expect(screen.getByText(/Work/)).toBeInTheDocument()
  })

  it('"New note" button calls createNoteAction', async () => {
    render(<FileTree notes={[]} folders={[]} />)
    fireEvent.click(screen.getByRole('button', { name: /New note/i }))
    await waitFor(() => {
      expect(createNoteAction).toHaveBeenCalled()
    })
  })

  it('"New folder" button shows NewItemInput', async () => {
    render(<FileTree notes={[]} folders={[]} />)
    fireEvent.click(screen.getByRole('button', { name: /New folder/i }))
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
  })

  it('submitting folder name calls createFolderAction', async () => {
    render(<FileTree notes={[]} folders={[]} />)
    fireEvent.click(screen.getByRole('button', { name: /New folder/i }))
    const input = await screen.findByRole('textbox')
    fireEvent.change(input, { target: { value: 'My Folder' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    await waitFor(() => {
      expect(createFolderAction).toHaveBeenCalledWith({ name: 'My Folder', parentId: null })
    })
  })

  it('shows empty state when no notes or folders', () => {
    render(<FileTree notes={[]} folders={[]} />)
    expect(screen.getByText(/No notes yet/)).toBeInTheDocument()
  })
})
