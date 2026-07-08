import Stripe from 'stripe'

// Lazy singleton so importing this module never throws when STRIPE_SECRET_KEY
// is absent (e.g. during builds/CI without secrets). The client is created on
// first use; callers that actually need Stripe surface a clear error if the
// key is missing.
let stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (stripe) return stripe

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }

  stripe = new Stripe(key)
  return stripe
}
