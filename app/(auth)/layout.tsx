export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-monokai-bg px-4">
      <div className="w-full max-w-sm rounded-lg border border-monokai-bg-lighter bg-monokai-bg-light p-8 shadow-2xl">
        {children}
      </div>
    </div>
  )
}
