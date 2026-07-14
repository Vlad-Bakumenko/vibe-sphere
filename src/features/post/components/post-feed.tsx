'use client'

import { useEffect, useRef } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquareText } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { getPosts, type PostsPage } from '../actions'
import { PostCard } from './post-card'
import { CreatePostForm } from './create-post-form'

export function PostFeed({
  initialData,
  currentUserId,
}: {
  initialData: PostsPage
  currentUserId: string
}) {
  const queryClient = useQueryClient()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => getPosts({ cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: { pages: [initialData], pageParams: [null] },
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['posts'] })

  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const posts = data.pages.flatMap((page) => page.posts)

  return (
    <div className="grid gap-4">
      <CreatePostForm onCreated={refresh} />

      {posts.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title="No posts yet"
          description="Be the first to share something with your community."
        />
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={currentUserId} onChanged={refresh} />
        ))
      )}

      <div ref={sentinelRef} aria-hidden />
      {isFetchingNextPage && (
        <p className="text-muted-foreground text-center text-sm">Loading more…</p>
      )}
    </div>
  )
}
