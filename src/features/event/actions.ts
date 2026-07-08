'use server'

import { revalidatePath } from 'next/cache'
import { EventType, Prisma } from '@prisma/client'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import {
  createEventSchema,
  editEventSchema,
  type CreateEventInput,
  type EditEventInput,
} from './schema'

type UserSummary = {
  id: string
  name: string | null
  username: string | null
  image: string | null
}

export type EventListItem = {
  id: string
  title: string
  location: string
  isPaid: boolean
  startDate: string
  endDate: string
  eventType: EventType[]
  creator: UserSummary
  participantCount: number
  isJoined: boolean
  isOwner: boolean
}

export type EventDetailData = EventListItem & {
  description: string
  participants: UserSummary[]
  ticket: { id: string; price: number; quantity: number } | null
  hasBooked: boolean
}

export type EventFilters = {
  type?: string
  paid?: 'free' | 'paid'
  when?: 'upcoming' | 'past'
}

const listSelect = {
  id: true,
  title: true,
  location: true,
  isPaid: true,
  startDate: true,
  endDate: true,
  eventType: true,
  createdById: true,
  createdBy: { select: { id: true, name: true, username: true, image: true } },
  _count: { select: { participants: true } },
} satisfies Prisma.EventSelect

function toListItem(
  row: Prisma.EventGetPayload<{ select: typeof listSelect }> & { joined: boolean },
  userId: string,
): EventListItem {
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    isPaid: row.isPaid,
    startDate: row.startDate.toISOString(),
    endDate: row.endDate.toISOString(),
    eventType: row.eventType,
    creator: row.createdBy,
    participantCount: row._count.participants,
    isJoined: row.joined,
    isOwner: row.createdById === userId,
  }
}

async function listEvents(where: Prisma.EventWhereInput, userId: string): Promise<EventListItem[]> {
  const rows = await db.event.findMany({
    where,
    orderBy: { startDate: 'asc' },
    select: { ...listSelect, participants: { where: { id: userId }, select: { id: true } } },
  })
  return rows.map((r) => toListItem({ ...r, joined: r.participants.length > 0 }, userId))
}

export async function getEvents(filters: EventFilters = {}): Promise<EventListItem[]> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return []

  const where: Prisma.EventWhereInput = { deletedAt: null }
  if (filters.type && filters.type in EventType)
    where.eventType = { has: filters.type as EventType }
  if (filters.paid === 'free') where.isPaid = false
  else if (filters.paid === 'paid') where.isPaid = true
  if (filters.when === 'upcoming') where.startDate = { gte: new Date() }
  else if (filters.when === 'past') where.startDate = { lt: new Date() }

  return listEvents(where, userId)
}

export async function getSuggestedEvents(): Promise<EventListItem[]> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return []

  const me = await db.user.findUnique({ where: { id: userId }, select: { interests: true } })
  // Interests and event types are separate enums; match by shared value names.
  const types = (me?.interests ?? []).filter(
    (i) => (i as string) in EventType,
  ) as unknown as EventType[]
  if (types.length === 0) return []

  return listEvents(
    {
      deletedAt: null,
      startDate: { gte: new Date() },
      eventType: { hasSome: types },
      createdById: { not: userId },
    },
    userId,
  )
}

export async function getEvent(id: string): Promise<EventDetailData | null> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null

  const row = await db.event.findFirst({
    where: { id, deletedAt: null },
    select: {
      ...listSelect,
      description: true,
      participants: { select: { id: true, name: true, username: true, image: true } },
      tickets: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        select: { id: true, price: true, quantity: true },
      },
      bookings: { where: { userId }, select: { id: true } },
    },
  })
  if (!row) return null

  const ticket = row.tickets[0] ?? null

  return {
    ...toListItem({ ...row, joined: row.participants.some((p) => p.id === userId) }, userId),
    description: row.description,
    participants: row.participants,
    ticket: ticket ? { id: ticket.id, price: ticket.price, quantity: ticket.quantity } : null,
    hasBooked: row.bookings.length > 0,
  }
}

export async function createEvent(
  input: CreateEventInput,
): Promise<{ error: string } | { id: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const parsed = createEventSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid event' }

  const d = parsed.data
  const event = await db.event.create({
    data: {
      title: d.title,
      description: d.description,
      eventType: d.eventType,
      location: d.location,
      isPaid: d.isPaid,
      startDate: new Date(d.startDate),
      endDate: new Date(d.endDate),
      createdById: session.user.id,
      participants: { connect: { id: session.user.id } }, // creator auto-joins
      tickets: d.isPaid
        ? {
            create: {
              offeredById: session.user.id,
              price: Math.round(Number(d.priceUsd) * 100), // dollars → cents
              quantity: Number(d.quantity) || 0,
              type: 'General',
            },
          }
        : undefined,
    },
    select: { id: true },
  })
  revalidatePath('/events')
  return { id: event.id }
}

export async function editEvent(
  input: EditEventInput,
): Promise<{ error: string } | { id: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const parsed = editEventSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid event' }

  const existing = await db.event.findUnique({
    where: { id: parsed.data.id },
    select: { createdById: true },
  })
  if (!existing || existing.createdById !== session.user.id) return { error: 'Not allowed' }

  const d = parsed.data
  await db.event.update({
    where: { id: d.id },
    data: {
      title: d.title,
      description: d.description,
      eventType: d.eventType,
      location: d.location,
      isPaid: d.isPaid,
      startDate: new Date(d.startDate),
      endDate: new Date(d.endDate),
    },
  })

  // Sync the event's single ticket with the paid/price state.
  if (d.isPaid) {
    const price = Math.round(Number(d.priceUsd) * 100)
    const quantity = Number(d.quantity) || 0
    const existing = await db.ticket.findFirst({ where: { eventId: d.id }, select: { id: true } })
    if (existing) {
      await db.ticket.update({ where: { id: existing.id }, data: { price, quantity } })
    } else {
      await db.ticket.create({
        data: { eventId: d.id, offeredById: session.user.id, price, quantity, type: 'General' },
      })
    }
  } else {
    await db.ticket.deleteMany({ where: { eventId: d.id } })
  }

  revalidatePath('/events')
  revalidatePath(`/events/${d.id}`)
  return { id: d.id }
}

export async function deleteEvent(eventId: string): Promise<{ error: string } | undefined> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const event = await db.event.findUnique({ where: { id: eventId }, select: { createdById: true } })
  if (!event || event.createdById !== session.user.id) return { error: 'Not allowed' }

  await db.event.update({ where: { id: eventId }, data: { deletedAt: new Date() } })
  revalidatePath('/events')
}

export async function joinEvent(eventId: string): Promise<{ joined: boolean } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const event = await db.event.findFirst({
    where: { id: eventId, deletedAt: null },
    select: { id: true, isPaid: true },
  })
  if (!event) return { error: 'Event not found' }
  // Paid events are joined by buying a ticket (handled by the Stripe webhook).
  if (event.isPaid) return { error: 'This event requires a ticket' }

  await db.event.update({
    where: { id: eventId },
    data: { participants: { connect: { id: session.user.id } } },
  })
  revalidatePath(`/events/${eventId}`)
  return { joined: true }
}

export async function declineEvent(
  eventId: string,
): Promise<{ joined: boolean } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  await db.event.update({
    where: { id: eventId },
    data: { participants: { disconnect: { id: session.user.id } } },
  })
  revalidatePath(`/events/${eventId}`)
  return { joined: false }
}
