'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createFolder,
  renameFolder,
  moveFolder,
  deleteFolder,
  isFolderDescendant,
} from '@/lib/db/folders'
import { AppError } from '@/lib/errors'

async function getAuthenticatedUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user.id) {
    throw new AppError('Not authenticated', 'auth/unauthenticated')
  }

  return session.user.id
}

export async function createFolderAction(data: {
  name: string
  parentId: string | null
}): Promise<{ id: string; name: string }> {
  const userId = await getAuthenticatedUserId()

  const folder = await createFolder({
    name: data.name,
    parent_id: data.parentId,
    user_id: userId,
  })

  revalidatePath('/notes')
  return { id: folder.id, name: folder.name }
}

export async function renameFolderAction(
  folderId: string,
  name: string
): Promise<void> {
  const userId = await getAuthenticatedUserId()
  await renameFolder(folderId, userId, name)
  revalidatePath('/notes')
}

export async function moveFolderAction(
  folderId: string,
  newParentId: string | null
): Promise<void> {
  const userId = await getAuthenticatedUserId()

  if (newParentId !== null) {
    const circular = await isFolderDescendant(folderId, newParentId, userId)
    if (circular) {
      throw new AppError(
        'Cannot move a folder into one of its own descendants',
        'folders/circular-nesting'
      )
    }
  }

  await moveFolder(folderId, userId, newParentId)
  revalidatePath('/notes')
}

export async function deleteFolderAction(folderId: string): Promise<void> {
  const userId = await getAuthenticatedUserId()
  await deleteFolder(folderId, userId)
  revalidatePath('/notes')
}
