import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Apache Tear',
  description: 'Personal knowledge base — markdown notes, anywhere.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): React.JSX.Element {
  return (
    <html lang="en">
      <body className="bg-monokai-bg text-monokai-fg antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
