import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockAuth, mockFindFirst, mockCreate } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockFindFirst: vi.fn(),
  mockCreate: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('@/lib/db', () => ({
  db: { friendship: { findFirst: mockFindFirst, create: mockCreate } },
}))

import { sendRequest } from './actions'

describe('sendRequest', () => {
  beforeEach(() => {
    mockAuth.mockReset()
    mockFindFirst.mockReset()
    mockCreate.mockReset()
  })

  it('rejects unauthenticated callers', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await sendRequest('other')
    expect(result).toEqual({ error: 'Not authenticated' })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects adding yourself', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'me' } })
    const result = await sendRequest('me')
    expect(result).toEqual({ error: 'You cannot add yourself' })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects when a friendship already exists', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'me' } })
    mockFindFirst.mockResolvedValue({ id: 'existing' })
    const result = await sendRequest('other')
    expect(result).toEqual({ error: 'A friendship already exists' })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('creates a pending request', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'me' } })
    mockFindFirst.mockResolvedValue(null)
    mockCreate.mockResolvedValue({ id: 'f1' })

    const result = await sendRequest('other')

    expect(mockCreate).toHaveBeenCalledWith({
      data: { requesterId: 'me', addresseeId: 'other', status: 'PENDING' },
    })
    expect(result).toEqual({ state: 'requested' })
  })
})
