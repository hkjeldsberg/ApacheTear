import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '@/components/ui/Modal'

describe('Modal', () => {
  const defaultProps = {
    title: 'Confirm action',
    onConfirm: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders title and children', () => {
    render(
      <Modal {...defaultProps}>
        Are you sure you want to proceed?
      </Modal>
    )
    expect(screen.getByText('Confirm action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument()
  })

  it('calls onClose when Escape is pressed', () => {
    render(<Modal {...defaultProps}>Body</Modal>)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Cancel button is clicked', () => {
    render(<Modal {...defaultProps}>Body</Modal>)
    fireEvent.click(screen.getByText('Cancel'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirm when Confirm button is clicked', () => {
    render(<Modal {...defaultProps}>Body</Modal>)
    fireEvent.click(screen.getByText('Confirm'))
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('renders custom confirm and cancel labels', () => {
    render(
      <Modal {...defaultProps} confirmLabel="Delete" cancelLabel="Keep">
        Body
      </Modal>
    )
    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Keep')).toBeInTheDocument()
  })
})
