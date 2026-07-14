import Link from 'next/link'
import { CalendarDays, MapPin, Ticket, Users } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { JoinEventButton } from './join-event-button'
import { EventOwnerActions } from './event-owner-actions'
import { BuyTicketButton } from '@/features/booking/components/buy-ticket-button'
import type { EventDetailData } from '../actions'

function EventAction({ event }: { event: EventDetailData }) {
  if (event.isOwner) return <EventOwnerActions eventId={event.id} />

  // Paid event with a ticket → buy flow.
  if (event.isPaid && event.ticket) {
    if (event.hasBooked) {
      return (
        <Badge className="bg-brand h-9 gap-1 border-0 px-4 text-sm text-white">
          <Ticket className="size-4" /> You&apos;re going
        </Badge>
      )
    }
    if (event.ticket.quantity <= 0) {
      return (
        <Badge variant="secondary" className="h-9 px-4 text-sm">
          Sold out
        </Badge>
      )
    }
    return <BuyTicketButton eventId={event.id} priceCents={event.ticket.price} />
  }

  // Free event → plain join/leave.
  return <JoinEventButton eventId={event.id} initialJoined={event.isJoined} size="default" />
}

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
          <h1 className="font-heading text-3xl font-bold tracking-tight">{event.title}</h1>
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
              {event.isPaid && event.ticket
                ? `$${(event.ticket.price / 100).toFixed(2)}`
                : event.isPaid
                  ? 'Paid'
                  : 'Free'}
            </Badge>
            {event.eventType.map((type) => (
              <Badge key={type} variant="outline">
                {type}
              </Badge>
            ))}
          </div>
        </div>

        <EventAction event={event} />
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
