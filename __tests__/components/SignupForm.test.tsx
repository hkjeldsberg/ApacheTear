import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignupForm from '@/components/auth/SignupForm'

// Mock the server action
vi.mock('@/app/actions/auth', () => ({
  signUp: vi.fn(),
}))

import { signUp } from '@/app/actions/auth'

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email and password fields with labels', () => {
    render(<SignupForm />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('shows error when submitting with empty fields', async () => {
    const { container } = render(<SignupForm />)
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(signUp).not.toHaveBeenCalled()
  })

  it('calls signUp with email and password on valid submit', async () => {
    vi.mocked(signUp).mockResolvedValue(undefined)
    render(<SignupForm />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'secret123' },
    })
    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith('user@example.com', 'secret123')
    })
  })

  it('shows error message when signUp throws', async () => {
    vi.mocked(signUp).mockRejectedValue(new Error('Email already in use'))
    render(<SignupForm />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'dup@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'pass' },
    })
    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email already in use')
    })
  })
})
