import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'

// Hoisted mocks so the vi.mock factories can reference them.
const { mockFindFirst, mockCreate, mockSignIn } = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockCreate: vi.fn(),
  mockSignIn: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: { user: { findFirst: mockFindFirst, create: mockCreate } },
}))
vi.mock('@/lib/auth', () => ({ signIn: mockSignIn }))
vi.mock('@/lib/email', () => ({ sendEmail: vi.fn() }))
vi.mock('next-auth', () => ({ AuthError: class AuthError extends Error {} }))

import { register } from './actions'

const validInput = {
  fullName: 'New User',
  username: 'newuser',
  email: 'new@example.com',
  password: 'secret1',
}

describe('register', () => {
  beforeEach(() => {
    mockFindFirst.mockReset()
    mockCreate.mockReset()
    mockSignIn.mockReset()
  })

  it('rejects invalid input without touching the database', async () => {
    const result = await register({ ...validInput, email: 'not-an-email', password: '123' })
    expect(result).toEqual({ error: expect.any(String) })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects a duplicate email', async () => {
    mockFindFirst.mockResolvedValue({ email: validInput.email, username: 'someoneelse' })
    const result = await register(validInput)
    expect(result).toEqual({ error: 'Email already in use' })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects a duplicate username', async () => {
    mockFindFirst.mockResolvedValue({ email: 'other@example.com', username: validInput.username })
    const result = await register(validInput)
    expect(result).toEqual({ error: 'Username already taken' })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('hashes the password, creates the user, and signs in', async () => {
    mockFindFirst.mockResolvedValue(null)
    mockCreate.mockResolvedValue({ id: 'user_1' })
    mockSignIn.mockResolvedValue(undefined)

    const result = await register(validInput)

    expect(mockCreate).toHaveBeenCalledOnce()
    const createArg = mockCreate.mock.calls[0]![0]
    expect(createArg.data.password).not.toBe(validInput.password)
    expect(await bcrypt.compare(validInput.password, createArg.data.password)).toBe(true)
    expect(createArg.data).toMatchObject({
      name: validInput.fullName,
      username: validInput.username,
      email: validInput.email,
    })
    expect(mockSignIn).toHaveBeenCalledWith(
      'credentials',
      expect.objectContaining({ email: validInput.email }),
    )
    expect(result).toBeUndefined()
  })
})
