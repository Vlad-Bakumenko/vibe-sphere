'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { CommentSection } from '@/features/comment/components/comment-section'
import { deletePost, editPost, likePost, type FeedPost } from '../actions'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function PostCard({
  post,
  currentUserId,
  onChanged,
}: {
  post: FeedPost
  currentUserId: string
  onChanged: () => void
}) {
  const isOwn = post.author.id === currentUserId

  const [liked, setLiked] = useState(post.likedByMe)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(post.content)
  const [showComments, setShowComments] = useState(false)
  const [isPending, startTransition] = useTransition()

  function toggleLike() {
    // Optimistic update, reverted on failure.
    const nextLiked = !liked
    setLiked(nextLiked)
    setLikeCount((c) => c + (nextLiked ? 1 : -1))
    startTransition(async () => {
      const result = await likePost(post.id)
      if ('error' in result) {
        setLiked(!nextLiked)
        setLikeCount((c) => c + (nextLiked ? -1 : 1))
        toast.error(result.error)
      }
    })
  }

  function saveEdit() {
    startTransition(async () => {
      const result = await editPost({ id: post.id, content: draft })
      if (result?.error) {
        toast.error(result.error)
        return
      }
      setIsEditing(false)
      onChanged()
    })
  }

  function remove() {
    if (!window.confirm('Delete this post?')) return
    startTransition(async () => {
      const result = await deletePost(post.id)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success('Post deleted')
      onChanged()
    })
  }

  return (
    <article className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar className="size-9">
              {post.author.image && (
                <AvatarImage src={post.author.image} alt={post.author.name ?? ''} />
              )}
              <AvatarFallback>
                {(post.author.name ?? post.author.username ?? '?')[0]}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="text-sm leading-tight">
            <Link href={`/profile/${post.author.username}`} className="font-medium hover:underline">
              {post.author.name}
            </Link>
            <p className="text-muted-foreground">
              @{post.author.username} · {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        {isOwn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" aria-label="Post actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing((v) => !v)}>
                <Pencil className="size-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={remove} variant="destructive">
                <Trash2 className="size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isEditing ? (
        <div className="mt-3 grid gap-2">
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} />
          <div className="flex gap-2">
            <Button size="sm" onClick={saveEdit} disabled={isPending}>
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraft(post.content)
                setIsEditing(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm whitespace-pre-wrap">{post.content}</p>
      )}

      <div className="text-muted-foreground mt-3 flex items-center gap-4 text-sm">
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike' : 'Like'}
          className={cn(
            'hover:text-foreground flex items-center gap-1.5 transition-colors',
            liked && 'text-red-500 hover:text-red-500',
          )}
        >
          <Heart className={cn('size-4', liked && 'fill-current')} />
          {likeCount}
        </button>
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          aria-expanded={showComments}
          aria-label="Toggle comments"
          className="hover:text-foreground flex items-center gap-1.5 transition-colors"
        >
          <MessageCircle className="size-4" />
          {post.commentCount}
        </button>
      </div>

      {showComments && <CommentSection postId={post.id} />}
    </article>
  )
}
