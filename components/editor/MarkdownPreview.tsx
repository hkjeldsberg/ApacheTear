'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface MarkdownPreviewProps {
  content: string
  className?: string
}

export default function MarkdownPreview({
  content,
  className = '',
}: MarkdownPreviewProps): React.JSX.Element {
  return (
    <div
      className={[
        'print-target prose prose-invert max-w-none h-full overflow-auto',
        'p-4 text-monokai-fg',
        // Heading colours
        '[&_h1]:text-monokai-yellow [&_h2]:text-monokai-yellow [&_h3]:text-monokai-yellow',
        '[&_h4]:text-monokai-yellow [&_h5]:text-monokai-yellow [&_h6]:text-monokai-yellow',
        // Link colours
        '[&_a]:text-monokai-blue [&_a:hover]:underline',
        // Strong / em
        '[&_strong]:text-monokai-orange [&_em]:text-monokai-green',
        // Code (inline)
        '[&_:not(pre)>code]:bg-monokai-bg-light [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:rounded',
        '[&_:not(pre)>code]:text-monokai-pink [&_:not(pre)>code]:text-sm',
        // Blockquote
        '[&_blockquote]:border-l-4 [&_blockquote]:border-monokai-fg-muted [&_blockquote]:pl-4',
        '[&_blockquote]:text-monokai-fg-muted',
        // HR
        '[&_hr]:border-monokai-bg-lighter',
        className,
      ].join(' ')}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content || '*Start typing to see a preview…*'}
      </ReactMarkdown>
    </div>
  )
}
