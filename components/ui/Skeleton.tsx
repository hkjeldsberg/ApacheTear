interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps): React.JSX.Element {
  return (
    <div
      className={`animate-pulse rounded bg-monokai-bg-lighter ${className}`}
      aria-hidden="true"
    />
  )
}

export function FileTreeSkeleton(): React.JSX.Element {
  return (
    <div className="px-2 py-2 space-y-1" aria-hidden="true">
      {[80, 60, 72, 55, 68].map((w, i) => (
        <Skeleton key={i} className={`h-8 w-${w === 80 ? 'full' : `[${w}%]`}`} />
      ))}
    </div>
  )
}

export function EditorSkeleton(): React.JSX.Element {
  return (
    <div className="flex flex-col h-full p-4 space-y-3" aria-hidden="true">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
