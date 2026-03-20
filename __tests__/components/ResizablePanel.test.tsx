import { render, screen, fireEvent } from '@testing-library/react'
import ResizablePanel from '@/components/workspace/ResizablePanel'

describe('ResizablePanel', () => {
  it('renders sidebar and main children', () => {
    render(
      <ResizablePanel sidebar={<div>Sidebar content</div>}>
        <div>Main content</div>
      </ResizablePanel>
    )
    expect(screen.getByText('Sidebar content')).toBeInTheDocument()
    expect(screen.getByText('Main content')).toBeInTheDocument()
  })

  it('mousedown on handle then mousemove fires onResize with calculated width', () => {
    const onResize = vi.fn()
    render(
      <ResizablePanel onResize={onResize} sidebar={<div>Sidebar</div>}>
        <div>Main</div>
      </ResizablePanel>
    )

    const handle = screen.getByTestId('resize-handle')
    fireEvent.mouseDown(handle, { clientX: 260 })
    fireEvent.mouseMove(document, { clientX: 320 })
    expect(onResize).toHaveBeenCalledWith(320)
  })

  it('clamps width to 160px minimum', () => {
    const onResize = vi.fn()
    render(
      <ResizablePanel onResize={onResize} sidebar={<div>Sidebar</div>}>
        <div>Main</div>
      </ResizablePanel>
    )

    const handle = screen.getByTestId('resize-handle')
    fireEvent.mouseDown(handle)
    fireEvent.mouseMove(document, { clientX: 50 }) // below minimum
    expect(onResize).toHaveBeenCalledWith(160)
  })

  it('clamps width to 480px maximum', () => {
    const onResize = vi.fn()
    render(
      <ResizablePanel onResize={onResize} sidebar={<div>Sidebar</div>}>
        <div>Main</div>
      </ResizablePanel>
    )

    const handle = screen.getByTestId('resize-handle')
    fireEvent.mouseDown(handle)
    fireEvent.mouseMove(document, { clientX: 600 }) // above maximum
    expect(onResize).toHaveBeenCalledWith(480)
  })

  it('mouseup stops resizing — further mousemove does not fire onResize', () => {
    const onResize = vi.fn()
    render(
      <ResizablePanel onResize={onResize} sidebar={<div>Sidebar</div>}>
        <div>Main</div>
      </ResizablePanel>
    )

    const handle = screen.getByTestId('resize-handle')
    fireEvent.mouseDown(handle)
    fireEvent.mouseMove(document, { clientX: 300 })
    expect(onResize).toHaveBeenCalledTimes(1)

    fireEvent.mouseUp(document)
    fireEvent.mouseMove(document, { clientX: 350 })
    expect(onResize).toHaveBeenCalledTimes(1) // no more calls after mouseup
  })
})
