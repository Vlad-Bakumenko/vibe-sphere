'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  acceptRequest,
  declineRequest,
  removeFriend,
  sendRequest,
  type FriendState,
} from '../actions'

type Action = () => Promise<{ error: string } | { state: FriendState }>

export function FriendButton({
  targetUserId,
  initialState,
}: {
  targetUserId: string
  initialState: FriendState
}) {
  const [state, setState] = useState(initialState)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function run(action: Action) {
    startTransition(async () => {
      const result = await action()
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      setState(result.state)
      router.refresh()
    })
  }

  if (state === 'friends') {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => {
          if (window.confirm('Remove this friend?')) run(() => removeFriend(targetUserId))
        }}
      >
        Friends
      </Button>
    )
  }

  if (state === 'requested') {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => run(() => declineRequest(targetUserId))}
      >
        Requested
      </Button>
    )
  }

  if (state === 'incoming') {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => run(() => acceptRequest(targetUserId))}
        >
          Accept
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => run(() => declineRequest(targetUserId))}
        >
          Decline
        </Button>
      </div>
    )
  }

  return (
    <Button size="sm" disabled={isPending} onClick={() => run(() => sendRequest(targetUserId))}>
      Add friend
    </Button>
  )
}
