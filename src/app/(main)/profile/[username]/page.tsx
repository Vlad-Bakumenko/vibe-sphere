import Link from 'next/link'
import { notFound } from 'next/navigation'

import { auth } from '@/lib/auth'
import { getProfile } from '@/features/profile/actions'
import { ProfileHeader } from '@/features/profile/components/profile-header'
import { getFriendshipState } from '@/features/friendship/actions'
import { FriendButton } from '@/features/friendship/components/friend-button'
import { FriendsList } from '@/features/friendship/components/friends-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground py-8 text-center text-sm">{children}</p>
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const [session, profile] = await Promise.all([auth(), getProfile(username)])
  if (!profile) notFound()

  const isOwnProfile = session?.user?.id === profile.id

  let headerAction: React.ReactNode = null
  if (isOwnProfile) {
    headerAction = (
      <Button asChild variant="outline" size="sm">
        <Link href="/settings">Edit profile</Link>
      </Button>
    )
  } else if (session?.user?.id) {
    const state = await getFriendshipState(profile.id)
    headerAction = <FriendButton targetUserId={profile.id} initialState={state} />
  }

  return (
    <div className="grid gap-6">
      <ProfileHeader profile={profile} action={headerAction} />

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Posts ({profile.posts.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({profile.createdEvents.length})</TabsTrigger>
          <TabsTrigger value="friends">Friends ({profile.friends.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="grid gap-3">
          {profile.posts.length === 0 ? (
            <EmptyState>No posts yet.</EmptyState>
          ) : (
            profile.posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="py-4">
                  <p className="text-sm">{post.content}</p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="events" className="grid gap-3">
          {profile.createdEvents.length === 0 ? (
            <EmptyState>No events yet.</EmptyState>
          ) : (
            profile.createdEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="py-4">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {event.location} · {new Date(event.startDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="friends">
          <FriendsList friends={profile.friends} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
