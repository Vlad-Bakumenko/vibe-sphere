import { createRouteHandler } from 'uploadthing/next'

import { ourFileRouter } from './core'

// Prisma access in the avatar router needs the Node runtime (not Edge).
export const runtime = 'nodejs'

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
})
