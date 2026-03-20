import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FolderNode from '@/components/file-tree/FolderNode'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/notes',
}))

vi.mock('@/app/actions/folders', () => ({
  renameFolderAction: vi.fn(),
  deleteFolderAction: vi.fn(),
}))

vi.mock('@/app/actions/notes', () => ({
  createNoteAction: vi.fn().mockResolvedValue({ id: 'note-new', title: 'New Note' }),
}))

import { renameFolderAction, deleteFolderAction } from '@/app/actions/folders'

const folder = { id: 'folder-1', name: 'Work', parent_id: null }

describe('FolderNode', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders folder name', () => {
    render(<FolderNode folder={folder} childFolders={[]} notes={[]} />)
    expect(screen.getByText(/Work/)).toBeInTheDocument()
  })

  it('click toggles expand/collapse (aria-expanded changes)', async () => {
    render(<FolderNode folder={folder} childFolders={[]} notes={[]} />)
    const toggle = screen.getByRole('button', { name: /Expand folder/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(toggle)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Collapse folder/i })).toBeInTheDocument()
    })
  })

  it('double-click folder name enters rename mode', async () => {
    render(<FolderNode folder={folder} childFolders={[]} notes={[]} />)
    // hover to make actions visible, then double-click name button
    const nameBtn = screen.getByRole('button', { name: /📁 Work/ })
    fireEvent.doubleClick(nameBtn)
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /Rename folder/i })).toBeInTheDocument()
    })
  })

  it('Escape exits rename without saving', async () => {
    render(<FolderNode folder={folder} childFolders={[]} notes={[]} />)
    const nameBtn = screen.getByRole('button', { name: /📁 Work/ })
    fireEvent.doubleClick(nameBtn)
    const input = await screen.findByRole('textbox', { name: /Rename folder/i })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(renameFolderAction).not.toHaveBeenCalled()
  })

  it('delete button opens confirmation modal', async () => {
    render(<FolderNode folder={folder} childFolders={[]} notes={[]} />)
    const deleteBtn = screen.getByRole('button', { name: /Delete folder/i })
    fireEvent.click(deleteBtn)
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/Delete folder/i)).toBeInTheDocument()
    })
  })

  it('modal confirm calls deleteFolderAction', async () => {
    render(<FolderNode folder={folder} childFolders={[]} notes={[]} />)
    fireEvent.click(screen.getByRole('button', { name: /Delete folder/i }))
    const confirmBtn = await screen.findByRole('button', { name: /^Delete$/ })
    fireEvent.click(confirmBtn)
    expect(deleteFolderAction).toHaveBeenCalledWith('folder-1')
  })
})
