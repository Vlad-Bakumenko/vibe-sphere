'use server'

import { revalidatePath } from 'next/cache'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { updateProfileSchema, type UpdateProfileInput } from './schema'

// Public-facing profile read (callers are already behind auth middleware).
export async function getProfile(username: string) {
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      location: true,
      interests: true,
      createdAt: true,
      posts: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        select: { id: true, content: true, images: true, createdAt: true },
      },
      createdEvents: {
        where: { deletedAt: null },
        orderBy: { startDate: 'asc' },
        select: { id: true, title: true, location: true, startDate: true },
      },
    },
  })
  if (!user) return null

  // Accepted friendships on either side; map to the "other" user.
  const friendships = await db.friendship.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ requesterId: user.id }, { addresseeId: user.id }],
    },
    select: {
      requester: { select: { id: true, username: true, name: true, image: true } },
      addressee: { select: { id: true, username: true, name: true, image: true } },
    },
  })
  const friends = friendships.map((f) => (f.requester.id === user.id ? f.addressee : f.requester))

  return { ...user, friends }
}

export type ProfileData = NonNullable<Awaited<ReturnType<typeof getProfile>>>

// Editable fields for the current user (settings form defaults).
export async function getMyProfile() {
  const session = await auth()
  if (!session?.user?.id) return null
  return db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, username: true, bio: true, location: true, interests: true, image: true },
  })
}

type UpdateResult = { error: string } | { success: true; username: string }

export async function updateProfile(input: UpdateProfileInput): Promise<UpdateResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const parsed = updateProfileSchema.safeParse(input)
  if (!parsed.success) return { error: 'Please check the form and try again' }

  const { fullName, username, bio, location, interests } = parsed.data

  const taken = await db.user.findFirst({
    where: { username, NOT: { id: session.user.id } },
    select: { id: true },
  })
  if (taken) return { error: 'Username already taken' }

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: { name: fullName, username, bio, location, interests },
    select: { username: true },
  })

  revalidatePath(`/profile/${updated.username}`)
  revalidatePath('/settings')
  return { success: true, username: updated.username ?? username }
}
