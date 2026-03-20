'use client'

import { Component } from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
          <p className="text-monokai-fg-muted text-sm">
            Something went wrong. Please reload and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded px-4 py-2 text-sm bg-monokai-bg-lighter text-monokai-fg hover:bg-monokai-bg-light transition-colors duration-150 min-h-[44px] min-w-[44px]"
          >
            Reload
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
