'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppError } from '@/lib/errors'

export async function signUp(email: string, password: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/auth/callback`,
    },
  })

  if (error) {
    throw new AppError(error.message, 'auth/signup-failed', error)
  }

  redirect('/notes')
}

export async function signIn(email: string, password: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    throw new AppError(
      'Invalid email or password. Please try again or reset your password.',
      'auth/invalid-credentials',
      error
    )
  }

  redirect('/notes')
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function requestPasswordReset(email: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/auth/callback`,
  })

  if (error) {
    throw new AppError(error.message, 'auth/reset-failed', error)
  }
}
