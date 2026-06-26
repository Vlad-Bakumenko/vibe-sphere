import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { getPosts } from '@/features/post/actions'
import { PostFeed } from '@/features/post/components/post-feed'

export default async function FeedPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // Pre-fetch the first page on the server; PostFeed hydrates from it.
  const initialData = await getPosts()

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Feed</h1>
      <PostFeed initialData={initialData} currentUserId={session.user.id} />
    </div>
  )
}
