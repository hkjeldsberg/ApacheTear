import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage(): React.JSX.Element {
  return (
    <>
      <h1 className="mb-6 text-xl font-semibold text-monokai-fg">
        Welcome back
      </h1>
      <LoginForm />
      <p className="mt-4 text-center text-sm text-monokai-fg-muted">
        No account?{' '}
        <Link href="/signup" className="text-monokai-blue hover:underline inline-block min-h-[44px] py-3">
          Sign up
        </Link>
      </p>
    </>
  )
}
