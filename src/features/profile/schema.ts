import { z } from 'zod'
import { Interest } from '@prisma/client'

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(60),
  username: z
    .string()
    .min(3, 'At least 3 characters')
    .max(20, 'At most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and underscores only'),
  bio: z.string().max(300, 'At most 300 characters'),
  location: z.string().max(100, 'At most 100 characters'),
  interests: z.array(z.nativeEnum(Interest)),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// All selectable interests, for the InterestsSelector UI.
export const ALL_INTERESTS = Object.values(Interest)
