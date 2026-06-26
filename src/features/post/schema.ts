import { z } from 'zod'

export const createPostSchema = z.object({
  content: z.string().min(1, 'Write something first').max(2000, 'At most 2000 characters'),
  images: z.array(z.url()).max(4).optional(),
})

export const editPostSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1, 'Post cannot be empty').max(2000, 'At most 2000 characters'),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type EditPostInput = z.infer<typeof editPostSchema>
