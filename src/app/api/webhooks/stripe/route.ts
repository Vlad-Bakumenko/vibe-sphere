import { NextResponse, type NextRequest } from 'next/server'
import type Stripe from 'stripe'

import { db } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { sendEmail } from '@/lib/email'
import { BookingConfirmationEmail } from '@/emails/booking-confirmation-email'

// Prisma + signature verification need the Node runtime (not Edge).
export const runtime = 'nodejs'

async function fulfilBooking(params: {
  userId: string
  eventId: string
  ticketId?: string
  sessionId: string
}) {
  // Idempotent: the same checkout session must never create two bookings.
  const existing = await db.booking.findUnique({
    where: { stripeSessionId: params.sessionId },
    select: { id: true },
  })
  if (existing) return

  await db.$transaction(async (tx) => {
    await tx.booking.create({
      data: {
        userId: params.userId,
        eventId: params.eventId,
        ticketId: params.ticketId ?? null,
        stripeSessionId: params.sessionId,
        quantity: 1,
      },
    })
    if (params.ticketId) {
      await tx.ticket.update({
        where: { id: params.ticketId },
        data: { quantity: { decrement: 1 } },
      })
    }
    // The buyer is now attending.
    await tx.event.update({
      where: { id: params.eventId },
      data: { participants: { connect: { id: params.userId } } },
    })
  })

  // Best-effort confirmation email (never throws; skipped without an API key).
  const [user, event] = await Promise.all([
    db.user.findUnique({
      where: { id: params.userId },
      select: { name: true, email: true },
    }),
    db.event.findUnique({
      where: { id: params.eventId },
      select: { title: true, startDate: true, location: true },
    }),
  ])
  if (user?.email && event) {
    await sendEmail({
      to: user.email,
      subject: `Your ticket for ${event.title} is confirmed`,
      react: BookingConfirmationEmail({
        name: user.name ?? 'there',
        eventTitle: event.title,
        eventDate: event.startDate.toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'short',
        }),
        eventLocation: event.location,
      }),
    })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !secret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const checkout = event.data.object
    const meta = checkout.metadata ?? {}
    if (meta.userId && meta.eventId) {
      await fulfilBooking({
        userId: meta.userId,
        eventId: meta.eventId,
        ticketId: meta.ticketId,
        sessionId: checkout.id,
      })
    }
  }

  return NextResponse.json({ received: true })
}
