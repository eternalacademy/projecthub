import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import SignIn from '@/app/auth/sign-in/page'

// Mock Next.js navigation
const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  }),
}))

describe('Sign In Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email sign-in form', () => {
    render(<SignIn />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders OAuth buttons', () => {
    render(<SignIn />)
    // Use getAllByText since base-ui render prop may duplicate in test env
    const googleButtons = screen.getAllByText(/continue with google/i)
    const githubButtons = screen.getAllByText(/continue with github/i)
    expect(googleButtons.length).toBeGreaterThanOrEqual(1)
    expect(githubButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('has sign up toggle link', () => {
    render(<SignIn />)
    const signUpButtons = screen.getAllByRole('button', { name: /sign up/i })
    expect(signUpButtons.length).toBeGreaterThanOrEqual(1)
  })
})
