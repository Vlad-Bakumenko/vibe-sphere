import Link from 'next/link'
import { CalendarDays, MapPin, Ticket, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { JoinEventButton } from './join-event-button'
import type { EventListItem } from '../actions'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function EventCard({ event }: { event: EventListItem }) {
  return (
    <Card className="hover:shadow-soft-lg transition-shadow">
      <CardContent className="grid gap-3 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-1">
            <Link
              href={`/events/${event.id}`}
              className="font-heading text-lg font-semibold hover:underline"
            >
              {event.title}
            </Link>
            <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-1">
                <CalendarDays className="size-4" /> {formatDateTime(event.startDate)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-4" /> {event.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="size-4" /> {event.participantCount}
              </span>
            </div>
          </div>
          <Badge className={event.isPaid ? 'bg-brand border-0 text-white' : ''} variant="secondary">
            {event.isPaid ? 'Paid' : 'Free'}
          </Badge>
        </div>

        {event.eventType.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.eventType.map((type) => (
              <Badge key={type} variant="outline">
                {type}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">by {event.creator.name}</span>
          {event.isOwner ? (
            <span className="text-muted-foreground text-xs">Your event</span>
          ) : event.isPaid ? (
            // Paid events must be joined by buying a ticket on the detail page.
            event.isJoined ? (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Ticket className="size-3.5" /> Going
              </span>
            ) : (
              <Button asChild size="sm" variant="outline">
                <Link href={`/events/${event.id}`}>Get ticket</Link>
              </Button>
            )
          ) : (
            <JoinEventButton eventId={event.id} initialJoined={event.isJoined} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
