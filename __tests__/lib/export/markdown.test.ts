import { downloadNoteAsMarkdown } from '@/lib/export/markdown'

function captureAnchor(): { anchor: HTMLAnchorElement | null } {
  const ref: { anchor: HTMLAnchorElement | null } = { anchor: null }
  const orig = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    const el = orig(tag)
    if (tag === 'a') {
      ref.anchor = el as HTMLAnchorElement
      vi.spyOn(ref.anchor, 'click').mockImplementation(() => {})
    }
    return el
  })
  return ref
}

describe('downloadNoteAsMarkdown', () => {
  let createObjectURLSpy: ReturnType<typeof vi.fn>
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    createObjectURLSpy = vi.fn().mockReturnValue('blob:mock-url')
    revokeObjectURLSpy = vi.fn()
    Object.defineProperty(globalThis, 'URL', {
      value: {
        createObjectURL: createObjectURLSpy,
        revokeObjectURL: revokeObjectURLSpy,
      },
      writable: true,
    })
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const orig = Object.getPrototypeOf(document).createElement.bind(document)
      const el = orig(tag) as HTMLElement
      if (tag === 'a') vi.spyOn(el as HTMLAnchorElement, 'click').mockImplementation(() => {})
      return el
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a Blob with note content and calls createObjectURL', () => {
    downloadNoteAsMarkdown('My Note', '# Hello')
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1)
    const blob: Blob = createObjectURLSpy.mock.calls[0][0]
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('text/markdown;charset=utf-8')
  })

  it('derives filename from note title', () => {
    const ref = captureAnchor()
    downloadNoteAsMarkdown('My Special Note', 'content')
    expect(ref.anchor?.download).toBe('My-Special-Note.md')
  })

  it('replaces special characters and collapses hyphens in filename', () => {
    const ref = captureAnchor()
    downloadNoteAsMarkdown('Hello: World & Stuff!', 'body')
    // ':' '&' '!' stripped → spaces remain → spaces→hyphens → collapse consecutive hyphens
    expect(ref.anchor?.download).toBe('Hello-World-Stuff.md')
  })

  it('calls URL.revokeObjectURL after click', () => {
    downloadNoteAsMarkdown('Note', 'body')
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url')
  })

  it('uses "untitled" when title is empty', () => {
    const ref = captureAnchor()
    downloadNoteAsMarkdown('', 'body')
    expect(ref.anchor?.download).toBe('untitled.md')
  })
})
