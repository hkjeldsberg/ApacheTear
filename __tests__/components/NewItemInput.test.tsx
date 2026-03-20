import { render, screen, fireEvent } from '@testing-library/react'
import NewItemInput from '@/components/file-tree/NewItemInput'

describe('NewItemInput', () => {
  it('autofocuses on mount', () => {
    render(<NewItemInput onCreate={vi.fn()} onCancel={vi.fn()} />)
    expect(document.activeElement).toBe(screen.getByRole('textbox'))
  })

  it('Enter with non-empty value fires onCreate with trimmed value', () => {
    const onCreate = vi.fn()
    render(<NewItemInput onCreate={onCreate} onCancel={vi.fn()} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '  My Folder  ' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onCreate).toHaveBeenCalledWith('My Folder')
  })

  it('Escape fires onCancel', () => {
    const onCancel = vi.fn()
    render(<NewItemInput onCreate={vi.fn()} onCancel={onCancel} />)
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' })
    expect(onCancel).toHaveBeenCalled()
  })

  it('Enter with empty value does not fire onCreate', () => {
    const onCreate = vi.fn()
    render(<NewItemInput onCreate={onCreate} onCancel={vi.fn()} />)
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(onCreate).not.toHaveBeenCalled()
  })

  it('renders custom placeholder', () => {
    render(<NewItemInput placeholder="Folder name…" onCreate={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByPlaceholderText('Folder name…')).toBeInTheDocument()
  })
})
