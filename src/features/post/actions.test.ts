import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockAuth, mockCreate, mockFindFirst, mockUpdate } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockCreate: vi.fn(),
  mockFindFirst: vi.fn(),
  mockUpdate: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('@/lib/db', () => ({
  db: { post: { create: mockCreate, findFirst: mockFindFirst, update: mockUpdate } },
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { createPost, likePost } from './actions'

describe('createPost', () => {
  beforeEach(() => {
    mockAuth.mockReset()
    mockCreate.mockReset()
  })

  it('rejects unauthenticated callers', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await createPost({ content: 'hello' })
    expect(result).toEqual({ error: 'Not authenticated' })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects empty content', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'me' } })
    const result = await createPost({ content: '' })
    expect(result).toEqual({ error: expect.any(String) })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('creates a post for the current user', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'me' } })
    mockCreate.mockResolvedValue({ id: 'post_1' })
    const result = await createPost({ content: 'hello world' })
    expect(mockCreate).toHaveBeenCalledWith({
      data: { content: 'hello world', images: [], createdById: 'me' },
    })
    expect(result).toBeUndefined()
  })

  it('persists uploaded image urls', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'me' } })
    mockCreate.mockResolvedValue({ id: 'post_1' })
    const images = ['https://utfs.io/f/a.png', 'https://utfs.io/f/b.png']
    const result = await createPost({ content: 'with photos', images })
    expect(mockCreate).toHaveBeenCalledWith({
      data: { content: 'with photos', images, createdById: 'me' },
    })
    expect(result).toBeUndefined()
  })

  it('rejects more than four images', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'me' } })
    const images = Array.from({ length: 5 }, (_, i) => `https://utfs.io/f/${i}.png`)
    const result = await createPost({ content: 'too many', images })
    expect(result).toEqual({ error: expect.any(String) })
    expect(mockCreate).not.toHaveBeenCalled()
  })
})

describe('likePost', () => {
  beforeEach(() => {
    mockAuth.mockReset()
    mockFindFirst.mockReset()
    mockUpdate.mockReset()
    mockAuth.mockResolvedValue({ user: { id: 'me' } })
  })

  it('likes a post that is not yet liked', async () => {
    mockFindFirst.mockResolvedValue(null)
    const result = await likePost('post_1')
    expect(result).toEqual({ liked: true })
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'post_1' },
      data: { likes: { connect: { id: 'me' } } },
    })
  })

  it('unlikes a post that is already liked', async () => {
    mockFindFirst.mockResolvedValue({ id: 'post_1' })
    const result = await likePost('post_1')
    expect(result).toEqual({ liked: false })
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'post_1' },
      data: { likes: { disconnect: { id: 'me' } } },
    })
  })
})
