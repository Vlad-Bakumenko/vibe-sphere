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
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your feed</h1>
        <p className="text-muted-foreground text-sm">See what your community is sharing.</p>
      </div>
      <PostFeed initialData={initialData} currentUserId={session.user.id} />
    </div>
  )
}
