import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockAuth, mockEventFindFirst, mockCheckoutCreate } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockEventFindFirst: vi.fn(),
  mockCheckoutCreate: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('@/lib/db', () => ({ db: { event: { findFirst: mockEventFindFirst } } }))
vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({ checkout: { sessions: { create: mockCheckoutCreate } } }),
}))

import { createCheckoutSession } from './actions'

const paidEvent = {
  id: 'e1',
  title: 'Concert',
  isPaid: true,
  createdById: 'creator',
  tickets: [{ id: 't1', price: 2000, quantity: 5 }],
  bookings: [] as { id: string }[],
}

describe('createCheckoutSession', () => {
  beforeEach(() => {
    mockAuth.mockReset()
    mockEventFindFirst.mockReset()
    mockCheckoutCreate.mockReset()
    mockAuth.mockResolvedValue({ user: { id: 'buyer' } })
  })

  it('rejects unauthenticated callers', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await createCheckoutSession({ eventId: 'e1' })
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('rejects a free event', async () => {
    mockEventFindFirst.mockResolvedValue({ ...paidEvent, isPaid: false })
    const result = await createCheckoutSession({ eventId: 'e1' })
    expect(result).toEqual({ error: expect.stringContaining('free') })
    expect(mockCheckoutCreate).not.toHaveBeenCalled()
  })

  it('rejects the event creator buying their own ticket', async () => {
    mockEventFindFirst.mockResolvedValue({ ...paidEvent, createdById: 'buyer' })
    const result = await createCheckoutSession({ eventId: 'e1' })
    expect(result).toEqual({ error: 'You created this event' })
  })

  it('rejects when already booked', async () => {
    mockEventFindFirst.mockResolvedValue({ ...paidEvent, bookings: [{ id: 'b1' }] })
    const result = await createCheckoutSession({ eventId: 'e1' })
    expect(result).toEqual({ error: 'You already have a ticket' })
  })

  it('rejects a sold-out event', async () => {
    mockEventFindFirst.mockResolvedValue({
      ...paidEvent,
      tickets: [{ id: 't1', price: 2000, quantity: 0 }],
    })
    const result = await createCheckoutSession({ eventId: 'e1' })
    expect(result).toEqual({ error: 'Sold out' })
  })

  it('creates a checkout session and returns the URL', async () => {
    mockEventFindFirst.mockResolvedValue(paidEvent)
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.test/session' })

    const result = await createCheckoutSession({ eventId: 'e1' })

    expect(mockCheckoutCreate).toHaveBeenCalledOnce()
    const arg = mockCheckoutCreate.mock.calls[0]![0]
    expect(arg.mode).toBe('payment')
    expect(arg.line_items[0].price_data.unit_amount).toBe(2000)
    expect(arg.metadata).toMatchObject({ userId: 'buyer', eventId: 'e1', ticketId: 't1' })
    expect(result).toEqual({ url: 'https://checkout.stripe.test/session' })
  })
})
