import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 text-center">
      <div
        aria-hidden
        className="bg-brand pointer-events-none absolute -top-32 left-1/2 size-[32rem] -translate-x-1/2 rounded-full opacity-15 blur-[120px]"
      />
      <p className="text-brand font-heading text-7xl font-bold">404</p>
      <h1 className="font-heading mt-4 text-2xl font-bold">Page not found</h1>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Button asChild variant="brand" className="mt-6 cursor-pointer">
        <Link href="/feed">Back to feed</Link>
      </Button>
    </main>
  )
}
