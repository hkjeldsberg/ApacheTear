'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createNote, updateNote, deleteNote } from '@/lib/db/notes'
import { AppError } from '@/lib/errors'

async function getAuthenticatedUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user.id) {
    throw new AppError('Not authenticated', 'auth/unauthenticated')
  }

  return session.user.id
}

export async function createNoteAction(data: {
  title?: string
  content?: string
  folderId?: string | null
}): Promise<{ id: string; title: string }> {
  const userId = await getAuthenticatedUserId()

  const note = await createNote({
    user_id: userId,
    title: data.title ?? 'Untitled',
    content: data.content ?? '',
    folder_id: data.folderId ?? null,
  })

  revalidatePath('/notes')
  return { id: note.id, title: note.title }
}

export async function updateNoteAction(
  noteId: string,
  data: { title?: string; content?: string; folderId?: string | null }
): Promise<void> {
  const userId = await getAuthenticatedUserId()

  await updateNote(noteId, userId, {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.content !== undefined && { content: data.content }),
    ...(data.folderId !== undefined && { folder_id: data.folderId }),
  })

  revalidatePath('/notes')
  revalidatePath(`/notes/${noteId}`)
}

export async function deleteNoteAction(noteId: string): Promise<void> {
  const userId = await getAuthenticatedUserId()
  await deleteNote(noteId, userId)
  revalidatePath('/notes')
  redirect('/notes')
}
