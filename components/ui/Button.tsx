'use client'

import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-monokai-green text-monokai-bg hover:opacity-90 font-semibold',
  secondary:
    'bg-monokai-bg-light text-monokai-fg hover:bg-monokai-bg-lighter border border-monokai-bg-lighter',
  ghost:
    'bg-transparent text-monokai-fg-muted hover:text-monokai-fg hover:bg-monokai-bg-light',
  danger:
    'bg-monokai-pink text-white hover:opacity-90 font-semibold',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', loading = false, disabled, children, className = '', ...props },
  ref
) {
  return (
    <button
      {...props}
      ref={ref}
      disabled={disabled ?? loading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded px-3 py-2',
        'text-sm transition-all duration-150',
        'min-h-[44px] min-w-[44px]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-monokai-blue',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {loading ? <span className="opacity-70">Loading…</span> : children}
    </button>
  )
})

export default Button
