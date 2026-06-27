import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockAuth, mockPostFindFirst, mockCommentCreate } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockPostFindFirst: vi.fn(),
  mockCommentCreate: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('@/lib/db', () => ({
  db: {
    post: { findFirst: mockPostFindFirst },
    comment: { create: mockCommentCreate },
  },
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { addComment } from './actions'

describe('addComment', () => {
  beforeEach(() => {
    mockAuth.mockReset()
    mockPostFindFirst.mockReset()
    mockCommentCreate.mockReset()
  })

  it('rejects unauthenticated callers', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await addComment({ postId: 'p1', content: 'hi' })
    expect(result).toEqual({ error: 'Not authenticated' })
    expect(mockCommentCreate).not.toHaveBeenCalled()
  })

  it('rejects empty content', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'me' } })
    const result = await addComment({ postId: 'p1', content: '' })
    expect(result).toEqual({ error: expect.any(String) })
    expect(mockCommentCreate).not.toHaveBeenCalled()
  })

  it('rejects commenting on a missing post', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'me' } })
    mockPostFindFirst.mockResolvedValue(null)
    const result = await addComment({ postId: 'gone', content: 'hi' })
    expect(result).toEqual({ error: 'Post not found' })
    expect(mockCommentCreate).not.toHaveBeenCalled()
  })

  it('creates a comment on an existing post', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'me' } })
    mockPostFindFirst.mockResolvedValue({ id: 'p1' })
    mockCommentCreate.mockResolvedValue({ id: 'c1' })

    const result = await addComment({ postId: 'p1', content: 'nice post' })

    expect(mockCommentCreate).toHaveBeenCalledWith({
      data: { content: 'nice post', postId: 'p1', commentedById: 'me' },
    })
    expect(result).toBeUndefined()
  })
})
