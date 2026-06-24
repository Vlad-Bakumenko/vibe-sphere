import { auth, signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'

// Minimal protected landing so the login → redirect flow is real and
// e2e-testable. The real feed is built in Phase 3B.
export default async function FeedPage() {
  const session = await auth()

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Feed</h1>
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}
        >
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>
      <p className="text-muted-foreground">
        Signed in as <span className="text-foreground font-medium">{session?.user?.name}</span> (
        {session?.user?.email})
      </p>
    </main>
  )
}
