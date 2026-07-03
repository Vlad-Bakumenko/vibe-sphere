import Link from 'next/link'

import { getEvents, getSuggestedEvents, type EventFilters } from '@/features/event/actions'
import { EventCard } from '@/features/event/components/event-card'
import { EventFilters as EventFiltersBar } from '@/features/event/components/event-filters'
import { Button } from '@/components/ui/button'

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; paid?: string; when?: string }>
}) {
  const sp = await searchParams
  const filters: EventFilters = {
    type: sp.type,
    paid: sp.paid === 'free' || sp.paid === 'paid' ? sp.paid : undefined,
    when: sp.when === 'upcoming' || sp.when === 'past' ? sp.when : undefined,
  }

  const [events, suggested] = await Promise.all([getEvents(filters), getSuggestedEvents()])

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Events</h1>
        <Button asChild size="sm">
          <Link href="/events/new">Create event</Link>
        </Button>
      </div>

      {suggested.length > 0 && (
        <section className="grid gap-3">
          <h2 className="text-muted-foreground text-sm font-medium">Suggested for you</h2>
          {suggested.slice(0, 3).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      )}

      <EventFiltersBar />

      <div className="grid gap-3">
        {events.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No events match your filters.
          </p>
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} />)
        )}
      </div>
    </div>
  )
}
