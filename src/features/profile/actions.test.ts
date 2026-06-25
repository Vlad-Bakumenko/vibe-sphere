import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockAuth, mockFindFirst, mockUpdate } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockFindFirst: vi.fn(),
  mockUpdate: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('@/lib/db', () => ({
  db: { user: { findFirst: mockFindFirst, update: mockUpdate } },
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { updateProfile } from './actions'

const validInput = {
  fullName: 'Me',
  username: 'myname',
  bio: 'hello',
  location: 'NYC',
  interests: [],
}

describe('updateProfile', () => {
  beforeEach(() => {
    mockAuth.mockReset()
    mockFindFirst.mockReset()
    mockUpdate.mockReset()
  })

  it('rejects unauthenticated callers', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await updateProfile(validInput)
    expect(result).toEqual({ error: 'Not authenticated' })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('rejects invalid input', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'me' } })
    const result = await updateProfile({ ...validInput, username: 'no' })
    expect(result).toEqual({ error: expect.any(String) })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('rejects a username taken by another user', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'me' } })
    mockFindFirst.mockResolvedValue({ id: 'someone-else' })
    const result = await updateProfile(validInput)
    expect(result).toEqual({ error: 'Username already taken' })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('updates the profile and returns the username', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'me' } })
    mockFindFirst.mockResolvedValue(null)
    mockUpdate.mockResolvedValue({ username: 'myname' })

    const result = await updateProfile(validInput)

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'me' },
        data: expect.objectContaining({ name: 'Me', username: 'myname', bio: 'hello' }),
      }),
    )
    expect(result).toEqual({ success: true, username: 'myname' })
  })
})
