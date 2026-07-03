import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockAuth, mockCreate } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockCreate: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('@/lib/db', () => ({ db: { event: { create: mockCreate } } }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { createEvent } from './actions'

const validInput = {
  title: 'Launch party',
  description: 'Come celebrate',
  eventType: ['Music' as const],
  startDate: '2027-01-01T18:00',
  endDate: '2027-01-01T22:00',
  location: 'Berlin',
  isPaid: false,
}

describe('createEvent', () => {
  beforeEach(() => {
    mockAuth.mockReset()
    mockCreate.mockReset()
  })

  it('rejects unauthenticated callers', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await createEvent(validInput)
    expect(result).toEqual({ error: 'Not authenticated' })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects an end date before the start date', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'me' } })
    const result = await createEvent({ ...validInput, endDate: '2026-01-01T10:00' })
    expect(result).toEqual({ error: expect.any(String) })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects an event with no type', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'me' } })
    const result = await createEvent({ ...validInput, eventType: [] })
    expect(result).toEqual({ error: expect.any(String) })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('creates an event and auto-joins the creator', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'me' } })
    mockCreate.mockResolvedValue({ id: 'event_1' })

    const result = await createEvent(validInput)

    expect(mockCreate).toHaveBeenCalledOnce()
    const arg = mockCreate.mock.calls[0]![0]
    expect(arg.data).toMatchObject({
      title: 'Launch party',
      createdById: 'me',
      participants: { connect: { id: 'me' } },
    })
    expect(arg.data.startDate).toBeInstanceOf(Date)
    expect(result).toEqual({ id: 'event_1' })
  })
})
