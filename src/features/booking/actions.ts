'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { checkoutSchema, type CheckoutInput } from './schema'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// Creates a Stripe Checkout Session for an event's ticket and returns its URL.
// The Booking row is created later by the webhook on `checkout.session.completed`.
export async function createCheckoutSession(
  input: CheckoutInput,
): Promise<{ url: string } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const parsed = checkoutSchema.safeParse(input)
  if (!parsed.success) return { error: 'Invalid request' }

  const event = await db.event.findFirst({
    where: { id: parsed.data.eventId, deletedAt: null },
    select: {
      id: true,
      title: true,
      isPaid: true,
      createdById: true,
      tickets: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        select: { id: true, price: true, quantity: true },
      },
      bookings: { where: { userId: session.user.id }, select: { id: true } },
    },
  })

  if (!event) return { error: 'Event not found' }
  if (!event.isPaid) return { error: 'This event is free — just join it' }
  if (event.createdById === session.user.id) return { error: 'You created this event' }
  if (event.bookings.length > 0) return { error: 'You already have a ticket' }

  const ticket = event.tickets[0]
  if (!ticket) return { error: 'No ticket available for this event' }
  if (ticket.quantity <= 0) return { error: 'Sold out' }

  const checkout = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: ticket.price,
          product_data: { name: event.title },
        },
      },
    ],
    // Consumed by the webhook to create the Booking.
    metadata: {
      userId: session.user.id,
      eventId: event.id,
      ticketId: ticket.id,
    },
    success_url: `${APP_URL}/events/${event.id}?booking=success`,
    cancel_url: `${APP_URL}/events/${event.id}?booking=cancelled`,
  })

  if (!checkout.url) return { error: 'Could not start checkout' }
  return { url: checkout.url }
}
