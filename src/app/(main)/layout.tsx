import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'

import { auth, signOut } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { MainNav } from '@/components/main-nav'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, name: true, image: true },
  })

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav
        user={{
          username: user?.username ?? null,
          name: user?.name ?? null,
          image: user?.image ?? null,
        }}
        signOut={
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}
          >
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              aria-label="Sign out"
              className="cursor-pointer"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </form>
        }
      />
      <main className="mx-auto w-full max-w-3xl flex-1 p-4 pb-24 sm:p-6 sm:pb-6">{children}</main>
    </div>
  )
}
