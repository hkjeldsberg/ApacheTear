'use client'

import { useState, useTransition } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { requestPasswordReset } from '@/app/actions/auth'

export default function ForgotPasswordForm(): React.JSX.Element {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        await requestPasswordReset(email)
        setSubmitted(true)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.'
        )
      }
    })
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded border border-monokai-green/30 bg-monokai-green/10 px-4 py-3 text-sm text-monokai-green"
      >
        Check your inbox — we sent a password reset link to <strong>{email}</strong>.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="Email"
        id="reset-email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      {error && <ErrorMessage message={error} />}
      <Button type="submit" variant="primary" loading={isPending}>
        Send reset link
      </Button>
    </form>
  )
}
