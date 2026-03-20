import { createClient } from '@/lib/supabase/server'
import { AppError } from '@/lib/errors'
import type { Database } from '@/types/database.types'

type Folder = Database['apache']['Tables']['folders']['Row']
type FolderInsert = Database['apache']['Tables']['folders']['Insert']

export type { Folder, FolderInsert }

export async function listFolders(userId: string): Promise<Folder[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })

  if (error) {
    throw new AppError('Failed to list folders', 'folders/list-failed', error)
  }

  return (data ?? []) as Folder[]
}

export async function createFolder(
  data: Pick<FolderInsert, 'name' | 'parent_id' | 'user_id'>
): Promise<Folder> {
  const supabase = await createClient()
  const { data: folder, error } = await supabase
    .from('folders')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new AppError('Failed to create folder', 'folders/create-failed', error)
  }

  return folder as Folder
}

export async function renameFolder(
  folderId: string,
  userId: string,
  name: string
): Promise<Folder> {
  const supabase = await createClient()
  const { data: folder, error } = await supabase
    .from('folders')
    .update({ name })
    .eq('id', folderId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new AppError('Failed to rename folder', 'folders/rename-failed', error)
  }

  return folder as Folder
}

export async function moveFolder(
  folderId: string,
  userId: string,
  newParentId: string | null
): Promise<Folder> {
  const supabase = await createClient()
  const { data: folder, error } = await supabase
    .from('folders')
    .update({ parent_id: newParentId })
    .eq('id', folderId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new AppError('Failed to move folder', 'folders/move-failed', error)
  }

  return folder as Folder
}

export async function deleteFolder(
  folderId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId)
    .eq('user_id', userId)

  if (error) {
    throw new AppError('Failed to delete folder', 'folders/delete-failed', error)
  }
}

export async function isFolderDescendant(
  folderId: string,
  targetId: string,
  userId: string
): Promise<boolean> {
  // Load all folders for the user and walk ancestry in-memory
  const all = await listFolders(userId)
  const parentMap = new Map<string, string | null>(all.map((f) => [f.id, f.parent_id]))

  let currentId: string | null = targetId
  while (currentId !== null) {
    if (currentId === folderId) return true
    currentId = parentMap.get(currentId) ?? null
  }
  return false
}
