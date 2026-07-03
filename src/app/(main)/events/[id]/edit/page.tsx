import { notFound, redirect } from 'next/navigation'

import { getEvent } from '@/features/event/actions'
import { CreateEventForm } from '@/features/event/components/create-event-form'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await getEvent(id)
  if (!event) notFound()
  if (!event.isOwner) redirect(`/events/${id}`)

  return (
    <div className="grid max-w-2xl gap-6">
      <h1 className="text-2xl font-semibold">Edit event</h1>
      <CreateEventForm event={event} />
    </div>
  )
}
