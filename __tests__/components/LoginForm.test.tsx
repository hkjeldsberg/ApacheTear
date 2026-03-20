import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginForm from '@/components/auth/LoginForm'

vi.mock('@/app/actions/auth', () => ({
  signIn: vi.fn(),
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import { signIn } from '@/app/actions/auth'

describe('LoginForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders email and password labels', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('renders forgot-password link pointing to /forgot-password', () => {
    render(<LoginForm />)
    const link = screen.getByText('Forgot password?')
    expect(link.closest('a')).toHaveAttribute('href', '/forgot-password')
  })

  it('calls signIn with email and password on valid submit', async () => {
    vi.mocked(signIn).mockResolvedValue(undefined)
    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'pass' },
    })
    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('user@example.com', 'pass')
    })
  })

  it('shows error message when signIn throws', async () => {
    vi.mocked(signIn).mockRejectedValue(
      new Error('Invalid email or password. Please try again or reset your password.')
    )
    render(<LoginForm />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'x@x.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } })
    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})
