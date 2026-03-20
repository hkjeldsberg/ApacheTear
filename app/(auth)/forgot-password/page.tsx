import Link from 'next/link'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage(): React.JSX.Element {
  return (
    <>
      <h1 className="mb-2 text-xl font-semibold text-monokai-fg">
        Reset password
      </h1>
      <p className="mb-6 text-sm text-monokai-fg-muted">
        Enter your email and we'll send a reset link.
      </p>
      <ForgotPasswordForm />
      <p className="mt-4 text-center text-sm text-monokai-fg-muted">
        <Link href="/login" className="text-monokai-blue hover:underline inline-block min-h-[44px] py-3">
          ← Back to login
        </Link>
      </p>
    </>
  )
}
