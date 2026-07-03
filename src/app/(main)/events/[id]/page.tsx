import { notFound } from 'next/navigation'

import { getEvent } from '@/features/event/actions'
import { EventDetail } from '@/features/event/components/event-detail'

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await getEvent(id)
  if (!event) notFound()

  return <EventDetail event={event} />
}
