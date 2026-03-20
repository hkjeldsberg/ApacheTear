import Link from 'next/link'
import SignupForm from '@/components/auth/SignupForm'

export default function SignupPage(): React.JSX.Element {
  return (
    <>
      <h1 className="mb-6 text-xl font-semibold text-monokai-fg">
        Create account
      </h1>
      <SignupForm />
      <p className="mt-4 text-center text-sm text-monokai-fg-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-monokai-blue hover:underline inline-block min-h-[44px] py-3">
          Log in
        </Link>
      </p>
    </>
  )
}
