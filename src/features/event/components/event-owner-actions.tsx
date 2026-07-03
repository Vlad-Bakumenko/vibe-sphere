'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { deleteEvent } from '../actions'

export function EventOwnerActions({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function remove() {
    if (!window.confirm('Delete this event?')) return
    startTransition(async () => {
      const result = await deleteEvent(eventId)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success('Event deleted')
      router.push('/events')
      router.refresh()
    })
  }

  return (
    <div className="flex gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/events/${eventId}/edit`}>Edit</Link>
      </Button>
      <Button variant="outline" size="sm" disabled={isPending} onClick={remove}>
        Delete
      </Button>
    </div>
  )
}
