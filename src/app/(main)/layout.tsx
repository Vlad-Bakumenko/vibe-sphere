import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth, signOut } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  })

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <nav className="mx-auto flex max-w-3xl items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4">
            <Link href="/feed" className="font-semibold">
              VibeSphere
            </Link>
            <Link href="/feed" className="text-muted-foreground hover:text-foreground text-sm">
              Feed
            </Link>
            {user?.username && (
              <Link
                href={`/profile/${user.username}`}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Profile
              </Link>
            )}
            <Link href="/settings" className="text-muted-foreground hover:text-foreground text-sm">
              Settings
            </Link>
          </div>
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
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 p-4">{children}</main>
    </div>
  )
}
