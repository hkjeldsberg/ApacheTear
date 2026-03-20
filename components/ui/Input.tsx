'use client'

import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hideLabel?: boolean
}

export default function Input({
  label,
  error,
  hideLabel = false,
  id,
  className = '',
  ...props
}: InputProps): React.JSX.Element {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className={hideLabel ? 'sr-only' : 'text-sm text-monokai-fg-muted'}
      >
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        className={[
          'bg-monokai-bg-light border border-monokai-bg-lighter rounded px-3 py-2',
          'text-monokai-fg text-sm placeholder:text-monokai-fg-muted',
          'focus:outline-none focus:ring-2 focus:ring-monokai-blue',
          'min-h-[44px] w-full transition-colors duration-150',
          error ? 'border-monokai-pink' : '',
          className,
        ].join(' ')}
        aria-describedby={error ? `${inputId}-error` : undefined}
        aria-invalid={error ? true : undefined}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-xs text-monokai-pink"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
