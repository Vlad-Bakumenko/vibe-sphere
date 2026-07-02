'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

// Relationship of the current user to a target user.
export type FriendState = 'none' | 'requested' | 'incoming' | 'friends'

type ActionResult = { error: string } | { state: FriendState }

async function currentUserId() {
  const session = await auth()
  return session?.user?.id ?? null
}

function between(a: string, b: string) {
  return {
    OR: [
      { requesterId: a, addresseeId: b },
      { requesterId: b, addresseeId: a },
    ],
  }
}

export async function getFriendshipState(targetUserId: string): Promise<FriendState> {
  const me = await currentUserId()
  if (!me || me === targetUserId) return 'none'

  const rel = await db.friendship.findFirst({
    where: between(me, targetUserId),
    select: { status: true, requesterId: true },
  })
  if (!rel) return 'none'
  if (rel.status === 'ACCEPTED') return 'friends'
  return rel.requesterId === me ? 'requested' : 'incoming'
}

export async function sendRequest(targetUserId: string): Promise<ActionResult> {
  const me = await currentUserId()
  if (!me) return { error: 'Not authenticated' }
  if (me === targetUserId) return { error: 'You cannot add yourself' }

  const existing = await db.friendship.findFirst({
    where: between(me, targetUserId),
    select: { id: true },
  })
  if (existing) return { error: 'A friendship already exists' }

  await db.friendship.create({
    data: { requesterId: me, addresseeId: targetUserId, status: 'PENDING' },
  })
  return { state: 'requested' }
}

export async function acceptRequest(targetUserId: string): Promise<ActionResult> {
  const me = await currentUserId()
  if (!me) return { error: 'Not authenticated' }

  const rel = await db.friendship.findFirst({
    where: { requesterId: targetUserId, addresseeId: me, status: 'PENDING' },
    select: { id: true },
  })
  if (!rel) return { error: 'No pending request to accept' }

  await db.friendship.update({ where: { id: rel.id }, data: { status: 'ACCEPTED' } })
  return { state: 'friends' }
}

// Removes a PENDING request in either direction: declining an incoming
// request or cancelling one you sent.
export async function declineRequest(targetUserId: string): Promise<ActionResult> {
  const me = await currentUserId()
  if (!me) return { error: 'Not authenticated' }

  await db.friendship.deleteMany({ where: { status: 'PENDING', ...between(me, targetUserId) } })
  return { state: 'none' }
}

export async function removeFriend(targetUserId: string): Promise<ActionResult> {
  const me = await currentUserId()
  if (!me) return { error: 'Not authenticated' }

  await db.friendship.deleteMany({ where: { status: 'ACCEPTED', ...between(me, targetUserId) } })
  return { state: 'none' }
}

export type FriendSummary = {
  id: string
  name: string | null
  username: string | null
  image: string | null
}

export async function getFriends(userId: string): Promise<FriendSummary[]> {
  const rows = await db.friendship.findMany({
    where: { status: 'ACCEPTED', OR: [{ requesterId: userId }, { addresseeId: userId }] },
    select: {
      requester: { select: { id: true, name: true, username: true, image: true } },
      addressee: { select: { id: true, name: true, username: true, image: true } },
    },
  })
  return rows.map((f) => (f.requester.id === userId ? f.addressee : f.requester))
}
