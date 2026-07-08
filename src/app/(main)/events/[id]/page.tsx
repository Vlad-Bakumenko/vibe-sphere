import { notFound } from 'next/navigation'

import { getEvent } from '@/features/event/actions'
import { EventDetail } from '@/features/event/components/event-detail'

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ booking?: string }>
}) {
  const [{ id }, { booking }] = await Promise.all([params, searchParams])
  const event = await getEvent(id)
  if (!event) notFound()

  return (
    <div className="grid gap-4">
      {booking === 'success' && (
        <div className="rounded-md border border-green-600/40 bg-green-600/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          Payment successful — your ticket is confirmed. 🎟
        </div>
      )}
      {booking === 'cancelled' && (
        <div className="text-muted-foreground rounded-md border px-4 py-3 text-sm">
          Checkout cancelled — you have not been charged.
        </div>
      )}
      <EventDetail event={event} />
    </div>
  )
}
