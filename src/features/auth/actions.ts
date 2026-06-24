'use server'

import { AuthError } from 'next-auth'
import bcrypt from 'bcryptjs'

import { db } from '@/lib/db'
import { signIn } from '@/lib/auth'
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from './schema'

export type ActionResult = { error: string } | undefined

const REDIRECT_AFTER_AUTH = '/feed'

// signIn throws a NEXT_REDIRECT error on success that MUST propagate; only
// AuthError (bad credentials) should be turned into a user-facing message.
export async function login(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return { error: 'Invalid email or password' }

  try {
    await signIn('credentials', { ...parsed.data, redirectTo: REDIRECT_AFTER_AUTH })
  } catch (error) {
    if (error instanceof AuthError) return { error: 'Invalid email or password' }
    throw error
  }
}

export async function register(input: SignupInput): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(input)
  if (!parsed.success) return { error: 'Please check the form and try again' }

  const { fullName, username, email, password } = parsed.data

  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  })
  if (existing) {
    return {
      error: existing.email === email ? 'Email already in use' : 'Username already taken',
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  await db.user.create({
    data: { name: fullName, username, email, password: hashedPassword },
  })

  // Establish the session and redirect (throws NEXT_REDIRECT on success).
  try {
    await signIn('credentials', { email, password, redirectTo: REDIRECT_AFTER_AUTH })
  } catch (error) {
    if (error instanceof AuthError) return { error: 'Could not sign in after signup' }
    throw error
  }
}

export async function loginWithProvider(provider: 'google' | 'github'): Promise<void> {
  await signIn(provider, { redirectTo: REDIRECT_AFTER_AUTH })
}
