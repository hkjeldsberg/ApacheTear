import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getNote } from '@/lib/db/notes'
import EditorLayout from '@/components/editor/EditorLayout'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

interface NotePageProps {
  params: Promise<{ id: string }>
}

export default async function NotePage({
  params,
}: NotePageProps): Promise<React.JSX.Element> {
  const { id } = await params

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const note = await getNote(id, session.user.id)

  if (!note) notFound()

  return (
    <div className="h-full overflow-hidden">
      <ErrorBoundary>
        <EditorLayout note={note} />
      </ErrorBoundary>
    </div>
  )
}
