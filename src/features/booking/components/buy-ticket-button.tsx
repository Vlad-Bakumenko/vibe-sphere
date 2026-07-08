'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { createCheckoutSession } from '../actions'

export function BuyTicketButton({ eventId, priceCents }: { eventId: string; priceCents: number }) {
  const [isPending, startTransition] = useTransition()

  function buy() {
    startTransition(async () => {
      const result = await createCheckoutSession({ eventId })
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      window.location.href = result.url // redirect to Stripe Checkout
    })
  }

  return (
    <Button size="default" disabled={isPending} onClick={buy}>
      {isPending ? 'Redirecting…' : `Buy ticket ($${(priceCents / 100).toFixed(2)})`}
    </Button>
  )
}
