import { z } from 'zod'

export const addCommentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1, 'Write a comment').max(1000, 'At most 1000 characters'),
})

export const editCommentSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'At most 1000 characters'),
})

export type AddCommentInput = z.infer<typeof addCommentSchema>
export type EditCommentInput = z.infer<typeof editCommentSchema>
