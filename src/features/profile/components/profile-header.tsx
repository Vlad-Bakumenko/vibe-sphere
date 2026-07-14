import { MapPin, CalendarDays } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { ProfileData } from '../actions'

function initials(name: string | null, username: string | null) {
  const source = name ?? username ?? '?'
  return source
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function ProfileHeader({
  profile,
  action,
}: {
  profile: ProfileData
  action?: React.ReactNode
}) {
  const joined = new Date(profile.createdAt).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="bg-card shadow-soft overflow-hidden rounded-2xl border">
      {/* Vibrant brand banner. */}
      <div className="bg-brand h-24 sm:h-28" />

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Avatar className="ring-card -mt-14 size-24 ring-4 sm:-mt-20">
            {profile.image && <AvatarImage src={profile.image} alt={profile.name ?? ''} />}
            <AvatarFallback className="bg-brand text-xl text-white">
              {initials(profile.name, profile.username)}
            </AvatarFallback>
          </Avatar>

          <div className="grid gap-1">
            <h1 className="font-heading text-2xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
            {profile.bio && <p className="mt-1 max-w-prose text-sm">{profile.bio}</p>}

            <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" /> {profile.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarDays className="size-4" /> Joined {joined}
              </span>
            </div>

            {profile.interests.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {profile.interests.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  )
}
