import type { ReactElement } from 'react'
import { Resend } from 'resend'

// Lazy singleton so importing this module never throws when RESEND_API_KEY is
// absent (builds/CI/local dev without secrets). Created on first send.
let resend: Resend | null = null

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  if (!resend) resend = new Resend(key)
  return resend
}

// Verified-domain sender; overridable via EMAIL_FROM. The Resend sandbox
// address works out of the box before a domain is configured.
const FROM = process.env.EMAIL_FROM ?? 'VibeSphere <onboarding@resend.dev>'

type SendArgs = {
  to: string
  subject: string
  react: ReactElement
}

// Transactional email is best-effort: a delivery failure must never break the
// user flow that triggered it, so this never throws — it logs and returns.
export async function sendEmail({ to, subject, react }: SendArgs): Promise<void> {
  const client = getResend()
  if (!client) {
    // No key configured (dev/CI); skip silently rather than fail the caller.
    console.info(`[email] RESEND_API_KEY not set — skipping "${subject}" to ${to}`)
    return
  }

  try {
    const { error } = await client.emails.send({ from: FROM, to, subject, react })
    if (error) console.error(`[email] failed to send "${subject}" to ${to}:`, error)
  } catch (err) {
    console.error(`[email] error sending "${subject}" to ${to}:`, err)
  }
}
