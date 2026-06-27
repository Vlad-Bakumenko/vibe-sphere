'use server'

import { revalidatePath } from 'next/cache'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import {
  addCommentSchema,
  editCommentSchema,
  type AddCommentInput,
  type EditCommentInput,
} from './schema'

export type CommentData = {
  id: string
  content: string
  createdAt: string
  author: { id: string; name: string | null; username: string | null; image: string | null }
  likeCount: number
  likedByMe: boolean
  isOwn: boolean
}

export async function getComments(postId: string): Promise<CommentData[]> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return []

  const rows = await db.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      content: true,
      createdAt: true,
      commentedBy: { select: { id: true, name: true, username: true, image: true } },
      _count: { select: { likes: true } },
      likes: { where: { id: userId }, select: { id: true } },
    },
  })

  return rows.map((r) => ({
    id: r.id,
    content: r.content,
    createdAt: r.createdAt.toISOString(),
    author: r.commentedBy,
    likeCount: r._count.likes,
    likedByMe: r.likes.length > 0,
    isOwn: r.commentedBy.id === userId,
  }))
}

export async function addComment(input: AddCommentInput): Promise<{ error: string } | undefined> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const parsed = addCommentSchema.safeParse(input)
  if (!parsed.success) return { error: 'Please check your comment and try again' }

  const post = await db.post.findFirst({
    where: { id: parsed.data.postId, deletedAt: null },
    select: { id: true },
  })
  if (!post) return { error: 'Post not found' }

  await db.comment.create({
    data: {
      content: parsed.data.content,
      postId: parsed.data.postId,
      commentedById: session.user.id,
    },
  })
  revalidatePath('/feed')
}

export async function editComment(input: EditCommentInput): Promise<{ error: string } | undefined> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const parsed = editCommentSchema.safeParse(input)
  if (!parsed.success) return { error: 'Please check your comment and try again' }

  const comment = await db.comment.findUnique({
    where: { id: parsed.data.id },
    select: { commentedById: true },
  })
  if (!comment || comment.commentedById !== session.user.id) return { error: 'Not allowed' }

  await db.comment.update({ where: { id: parsed.data.id }, data: { content: parsed.data.content } })
  revalidatePath('/feed')
}

export async function deleteComment(commentId: string): Promise<{ error: string } | undefined> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const comment = await db.comment.findUnique({
    where: { id: commentId },
    select: { commentedById: true },
  })
  if (!comment || comment.commentedById !== session.user.id) return { error: 'Not allowed' }

  await db.comment.delete({ where: { id: commentId } })
  revalidatePath('/feed')
}

export async function likeComment(
  commentId: string,
): Promise<{ liked: boolean } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const already = await db.comment.findFirst({
    where: { id: commentId, likes: { some: { id: session.user.id } } },
    select: { id: true },
  })

  if (already) {
    await db.comment.update({
      where: { id: commentId },
      data: { likes: { disconnect: { id: session.user.id } } },
    })
    return { liked: false }
  }

  await db.comment.update({
    where: { id: commentId },
    data: { likes: { connect: { id: session.user.id } } },
  })
  return { liked: true }
}
