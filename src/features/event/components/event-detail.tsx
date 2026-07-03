import Link from 'next/link'
import { CalendarDays, MapPin, Users } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { JoinEventButton } from './join-event-button'
import { EventOwnerActions } from './event-owner-actions'
import type { EventDetailData } from '../actions'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function EventDetail({ event }: { event: EventDetailData }) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-2">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center gap-1">
              <CalendarDays className="size-4" /> {formatDateTime(event.startDate)} –{' '}
              {formatDateTime(event.endDate)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-4" /> {event.location}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-4" /> {event.participantCount} going
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={event.isPaid ? 'default' : 'secondary'}>
              {event.isPaid ? 'Paid' : 'Free'}
            </Badge>
            {event.eventType.map((type) => (
              <Badge key={type} variant="outline">
                {type}
              </Badge>
            ))}
          </div>
        </div>

        {event.isOwner ? (
          <EventOwnerActions eventId={event.id} />
        ) : (
          <JoinEventButton eventId={event.id} initialJoined={event.isJoined} size="default" />
        )}
      </div>

      <p className="max-w-prose whitespace-pre-wrap">{event.description}</p>

      <div>
        <h2 className="mb-3 font-semibold">Participants ({event.participantCount})</h2>
        <div className="grid gap-2">
          {event.participants.map((participant) => (
            <Link
              key={participant.id}
              href={`/profile/${participant.username}`}
              className="hover:bg-accent flex items-center gap-3 rounded-md p-2"
            >
              <Avatar className="size-9">
                {participant.image && (
                  <AvatarImage src={participant.image} alt={participant.name ?? ''} />
                )}
                <AvatarFallback>
                  {(participant.name ?? participant.username ?? '?')[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{participant.name}</p>
                <p className="text-muted-foreground">@{participant.username}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
