import { z } from 'zod'
import { EventType } from '@prisma/client'

const dateString = z
  .string()
  .min(1, 'Required')
  .refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid date')

const eventBase = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  description: z.string().min(1, 'Description is required').max(2000),
  eventType: z.array(z.nativeEnum(EventType)).min(1, 'Pick at least one type'),
  startDate: dateString,
  endDate: dateString,
  location: z.string().min(1, 'Location is required').max(120),
  isPaid: z.boolean(),
  // Ticket fields (kept as strings for the form inputs; only meaningful when
  // isPaid). Validated by the refinements below.
  priceUsd: z.string().optional(),
  quantity: z.string().optional(),
})

const endAfterStart = (data: { startDate: string; endDate: string }) =>
  Date.parse(data.endDate) >= Date.parse(data.startDate)

// A paid event must have a positive ticket price.
const paidNeedsPrice = (data: { isPaid: boolean; priceUsd?: string }) =>
  !data.isPaid || (data.priceUsd !== undefined && Number(data.priceUsd) > 0)

export const createEventSchema = eventBase
  .refine(endAfterStart, { message: 'End must be after start', path: ['endDate'] })
  .refine(paidNeedsPrice, { message: 'Paid events need a ticket price', path: ['priceUsd'] })

export const editEventSchema = eventBase
  .extend({ id: z.string().min(1) })
  .refine(endAfterStart, { message: 'End must be after start', path: ['endDate'] })
  .refine(paidNeedsPrice, { message: 'Paid events need a ticket price', path: ['priceUsd'] })

export type CreateEventInput = z.infer<typeof createEventSchema>
export type EditEventInput = z.infer<typeof editEventSchema>

export const ALL_EVENT_TYPES = Object.values(EventType)
