'use client'

interface ErrorMessageProps {
  message: string
  className?: string
}

export default function ErrorMessage({
  message,
  className = '',
}: ErrorMessageProps): React.JSX.Element {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        'rounded border border-monokai-pink/30 bg-monokai-pink/10',
        'px-3 py-2 text-sm text-monokai-pink',
        className,
      ].join(' ')}
    >
      {message}
    </div>
  )
}
