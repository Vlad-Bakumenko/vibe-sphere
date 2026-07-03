import Link from 'next/link'
import { CalendarDays, MapPin, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
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
    <Card>
      <CardContent className="grid gap-3 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-1">
            <Link href={`/events/${event.id}`} className="text-lg font-semibold hover:underline">
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
          <Badge variant={event.isPaid ? 'default' : 'secondary'}>
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
          ) : (
            <JoinEventButton eventId={event.id} initialJoined={event.isJoined} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
