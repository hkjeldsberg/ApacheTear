import { createClient } from '@/lib/supabase/server'
import { AppError } from '@/lib/errors'
import type { Database } from '@/types/database.types'

type Note = Database['apache']['Tables']['notes']['Row']
type NoteInsert = Database['apache']['Tables']['notes']['Insert']
type NoteUpdate = Database['apache']['Tables']['notes']['Update']

type NoteListItem = Pick<Note, 'id' | 'title' | 'folder_id' | 'updated_at'>

export type { Note, NoteInsert, NoteUpdate }

export async function listNotes(userId: string): Promise<NoteListItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notes')
    .select('id, title, folder_id, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw new AppError('Failed to list notes', 'notes/list-failed', error)
  }

  return (data ?? []) as NoteListItem[]
}

export async function getNote(
  noteId: string,
  userId: string
): Promise<Note | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw new AppError('Failed to get note', 'notes/get-failed', error)
  }

  return data as Note
}

export async function createNote(
  data: Pick<NoteInsert, 'title' | 'content' | 'folder_id' | 'user_id'>
): Promise<Note> {
  const supabase = await createClient()
  const { data: note, error } = await supabase
    .from('notes')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new AppError('Failed to create note', 'notes/create-failed', error)
  }

  return note as Note
}

export async function updateNote(
  noteId: string,
  userId: string,
  data: Pick<NoteUpdate, 'title' | 'content' | 'folder_id'>
): Promise<Note> {
  const supabase = await createClient()
  const { data: note, error } = await supabase
    .from('notes')
    .update(data)
    .eq('id', noteId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new AppError('Failed to update note', 'notes/update-failed', error)
  }

  return note as Note
}

export async function deleteNote(
  noteId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId)

  if (error) {
    throw new AppError('Failed to delete note', 'notes/delete-failed', error)
  }
}
