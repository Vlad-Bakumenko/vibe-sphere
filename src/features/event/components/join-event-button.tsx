'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { joinEvent, declineEvent } from '../actions'

export function JoinEventButton({
  eventId,
  initialJoined,
  size = 'sm',
}: {
  eventId: string
  initialJoined: boolean
  size?: 'sm' | 'default'
}) {
  const [joined, setJoined] = useState(initialJoined)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function toggle() {
    const next = !joined
    setJoined(next) // optimistic
    startTransition(async () => {
      const result = await (next ? joinEvent(eventId) : declineEvent(eventId))
      if ('error' in result) {
        setJoined(!next)
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <Button
      size={size}
      variant={joined ? 'outline' : 'default'}
      disabled={isPending}
      onClick={toggle}
    >
      {joined ? 'Leave' : 'Join'}
    </Button>
  )
}
