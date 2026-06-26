'use server'

import { revalidatePath } from 'next/cache'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import {
  createPostSchema,
  editPostSchema,
  type CreatePostInput,
  type EditPostInput,
} from './schema'

const PAGE_SIZE = 10

export type FeedPost = {
  id: string
  content: string
  images: string[]
  createdAt: string // ISO string (serializable)
  author: { id: string; name: string | null; username: string | null; image: string | null }
  likeCount: number
  commentCount: number
  likedByMe: boolean
}

export type PostsPage = { posts: FeedPost[]; nextCursor: string | null }

export async function getPosts({
  cursor,
  authorId,
}: { cursor?: string | null; authorId?: string } = {}): Promise<PostsPage> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { posts: [], nextCursor: null }

  const rows = await db.post.findMany({
    where: { deletedAt: null, ...(authorId ? { createdById: authorId } : {}) },
    orderBy: { createdAt: 'desc' },
    take: PAGE_SIZE + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    select: {
      id: true,
      content: true,
      images: true,
      createdAt: true,
      createdBy: { select: { id: true, name: true, username: true, image: true } },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { id: userId }, select: { id: true } },
    },
  })

  const hasMore = rows.length > PAGE_SIZE
  const items = hasMore ? rows.slice(0, PAGE_SIZE) : rows
  const nextCursor = hasMore ? items[items.length - 1]!.id : null

  const posts: FeedPost[] = items.map((r) => ({
    id: r.id,
    content: r.content,
    images: r.images,
    createdAt: r.createdAt.toISOString(),
    author: r.createdBy,
    likeCount: r._count.likes,
    commentCount: r._count.comments,
    likedByMe: r.likes.length > 0,
  }))

  return { posts, nextCursor }
}

export async function createPost(input: CreatePostInput): Promise<{ error: string } | undefined> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const parsed = createPostSchema.safeParse(input)
  if (!parsed.success) return { error: 'Please check your post and try again' }

  await db.post.create({
    data: {
      content: parsed.data.content,
      images: parsed.data.images ?? [],
      createdById: session.user.id,
    },
  })
  revalidatePath('/feed')
}

export async function editPost(input: EditPostInput): Promise<{ error: string } | undefined> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const parsed = editPostSchema.safeParse(input)
  if (!parsed.success) return { error: 'Please check your post and try again' }

  const post = await db.post.findUnique({
    where: { id: parsed.data.id },
    select: { createdById: true },
  })
  if (!post || post.createdById !== session.user.id) return { error: 'Not allowed' }

  await db.post.update({ where: { id: parsed.data.id }, data: { content: parsed.data.content } })
  revalidatePath('/feed')
}

export async function deletePost(postId: string): Promise<{ error: string } | undefined> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const post = await db.post.findUnique({ where: { id: postId }, select: { createdById: true } })
  if (!post || post.createdById !== session.user.id) return { error: 'Not allowed' }

  // Soft delete.
  await db.post.update({ where: { id: postId }, data: { deletedAt: new Date() } })
  revalidatePath('/feed')
}

export async function likePost(postId: string): Promise<{ liked: boolean } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const already = await db.post.findFirst({
    where: { id: postId, likes: { some: { id: session.user.id } } },
    select: { id: true },
  })

  if (already) {
    await db.post.update({
      where: { id: postId },
      data: { likes: { disconnect: { id: session.user.id } } },
    })
    return { liked: false }
  }

  await db.post.update({
    where: { id: postId },
    data: { likes: { connect: { id: session.user.id } } },
  })
  return { liked: true }
}
