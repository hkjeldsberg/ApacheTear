import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listNotes } from '@/lib/db/notes'
import { createNoteAction } from '@/app/actions/notes'
import Button from '@/components/ui/Button'

export default async function NotesPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const notes = await listNotes(session.user.id)

  if (notes.length > 0) {
    redirect(`/notes/${notes[0].id}`)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
      <p className="text-monokai-fg-muted text-sm">
        You don't have any notes yet.
      </p>
      <form
        action={async () => {
          'use server'
          const supabase2 = await createClient()
          const { data: { session: s } } = await supabase2.auth.getSession()
          if (!s) redirect('/login')
          const note = await createNoteAction({})
          redirect(`/notes/${note.id}`)
        }}
      >
        <Button type="submit" variant="primary">
          Create your first note
        </Button>
      </form>
    </div>
  )
}
