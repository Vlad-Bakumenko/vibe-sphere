'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="bg-brand-soft text-primary flex size-14 items-center justify-center rounded-2xl">
        <AlertTriangle className="size-7" />
      </div>
      <h1 className="font-heading mt-4 text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        An unexpected error occurred. You can try again — if it keeps happening, please come back
        later.
      </p>
      <Button onClick={reset} variant="brand" className="mt-6 cursor-pointer">
        Try again
      </Button>
    </main>
  )
}
