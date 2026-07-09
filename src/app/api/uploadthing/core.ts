import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const f = createUploadthing()

// Every uploader authenticates the current user via the Auth.js session before
// a signed upload URL is issued — never trust a client-supplied user id.
async function authedMiddleware() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) throw new UploadThingError('Unauthorized')
  return { userId }
}

export const ourFileRouter = {
  // Images attached to a post: up to 4, matching createPostSchema's cap.
  postImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 4 },
  })
    .middleware(authedMiddleware)
    .onUploadComplete(({ metadata, file }) => {
      // Returned to the client's onClientUploadComplete callback.
      return { uploadedBy: metadata.userId, url: file.ufsUrl }
    }),

  // Profile avatar: a single image persisted straight to the user's record.
  avatar: f({
    image: { maxFileSize: '2MB', maxFileCount: 1 },
  })
    .middleware(authedMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      await db.user.update({
        where: { id: metadata.userId },
        data: { image: file.ufsUrl },
      })
      return { uploadedBy: metadata.userId, url: file.ufsUrl }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
