import { auth } from '@/lib/auth'

// Minimal protected landing. The real feed is built in Phase 3B.
export default async function FeedPage() {
  const session = await auth()

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Feed</h1>
      <p className="text-muted-foreground">
        Signed in as <span className="text-foreground font-medium">{session?.user?.name}</span> (
        {session?.user?.email})
      </p>
    </div>
  )
}
