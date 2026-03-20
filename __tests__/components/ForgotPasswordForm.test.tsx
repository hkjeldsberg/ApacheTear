import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

vi.mock('@/app/actions/auth', () => ({
  requestPasswordReset: vi.fn(),
}))

import { requestPasswordReset } from '@/app/actions/auth'

describe('ForgotPasswordForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders email label and input', () => {
    render(<ForgotPasswordForm />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('calls requestPasswordReset with the email on submit', async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue(undefined)
    render(<ForgotPasswordForm />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      expect(requestPasswordReset).toHaveBeenCalledWith('user@example.com')
    })
  })

  it('shows success confirmation message after submit', async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue(undefined)
    render(<ForgotPasswordForm />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/check your inbox/i)
    })
  })

  it('shows error message when request fails', async () => {
    vi.mocked(requestPasswordReset).mockRejectedValue(new Error('Too many requests'))
    render(<ForgotPasswordForm />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'x@x.com' } })
    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Too many requests')
    })
  })
})
