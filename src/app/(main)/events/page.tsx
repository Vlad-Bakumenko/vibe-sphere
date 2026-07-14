import Link from 'next/link'

import { CalendarSearch } from 'lucide-react'

import { getEvents, getSuggestedEvents, type EventFilters } from '@/features/event/actions'
import { EventCard } from '@/features/event/components/event-card'
import { EventFilters as EventFiltersBar } from '@/features/event/components/event-filters'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'

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
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground text-sm">
            Discover what&apos;s happening around you.
          </p>
        </div>
        <Button asChild variant="brand" size="sm" className="cursor-pointer">
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
          <EmptyState
            icon={CalendarSearch}
            title="No events found"
            description="Try adjusting your filters, or create the first one."
          />
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} />)
        )}
      </div>
    </div>
  )
}
