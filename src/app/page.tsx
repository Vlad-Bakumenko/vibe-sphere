import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="grid gap-3">
        <h1 className="text-4xl font-bold tracking-tight">VibeSphere</h1>
        <p className="text-muted-foreground max-w-md text-lg">
          Connect with people, share moments, and discover events around you.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/signup">Get started</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </main>
  )
}
