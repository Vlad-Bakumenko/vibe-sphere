import { z } from 'zod'

export const checkoutSchema = z.object({
  eventId: z.string().min(1),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
