import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { FriendSummary } from '../actions'

export function FriendsList({ friends }: { friends: FriendSummary[] }) {
  if (friends.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">No friends yet.</p>
  }

  return (
    <div className="grid gap-2">
      {friends.map((friend) => (
        <Link
          key={friend.id}
          href={`/profile/${friend.username}`}
          className="hover:bg-accent flex items-center gap-3 rounded-md p-2"
        >
          <Avatar className="size-9">
            {friend.image && <AvatarImage src={friend.image} alt={friend.name ?? ''} />}
            <AvatarFallback>{(friend.name ?? friend.username ?? '?')[0]}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium">{friend.name}</p>
            <p className="text-muted-foreground">@{friend.username}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
