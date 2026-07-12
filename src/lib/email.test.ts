import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createElement } from 'react'

const { mockSend } = vi.hoisted(() => ({ mockSend: vi.fn() }))

// Resend is instantiated with `new`, so the mock must be a constructor.
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mockSend }
  },
}))

// A trivial element stands in for a React Email template.
const react = createElement('div', null, 'hi')

describe('sendEmail', () => {
  beforeEach(() => {
    vi.resetModules()
    mockSend.mockReset()
    mockSend.mockResolvedValue({ data: { id: 'e1' }, error: null })
  })

  afterEach(() => {
    delete process.env.RESEND_API_KEY
  })

  it('no-ops (never calls Resend) when no API key is set', async () => {
    delete process.env.RESEND_API_KEY
    const { sendEmail } = await import('./email')
    await expect(sendEmail({ to: 'a@b.com', subject: 'Hi', react })).resolves.toBeUndefined()
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('sends via Resend when a key is configured', async () => {
    process.env.RESEND_API_KEY = 'test_key'
    const { sendEmail } = await import('./email')
    await sendEmail({ to: 'a@b.com', subject: 'Hi', react })
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'a@b.com', subject: 'Hi', react }),
    )
  })

  it('swallows a delivery error without throwing', async () => {
    process.env.RESEND_API_KEY = 'test_key'
    mockSend.mockResolvedValue({ data: null, error: { message: 'boom' } })
    const { sendEmail } = await import('./email')
    await expect(sendEmail({ to: 'a@b.com', subject: 'Hi', react })).resolves.toBeUndefined()
  })
})
