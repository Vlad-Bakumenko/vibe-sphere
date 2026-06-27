'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Heart, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { deleteComment, editComment, likeComment, type CommentData } from '../actions'

export function CommentItem({
  comment,
  onChanged,
}: {
  comment: CommentData
  onChanged: () => void
}) {
  const [liked, setLiked] = useState(comment.likedByMe)
  const [likeCount, setLikeCount] = useState(comment.likeCount)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(comment.content)
  const [isPending, startTransition] = useTransition()

  function toggleLike() {
    const nextLiked = !liked
    setLiked(nextLiked)
    setLikeCount((c) => c + (nextLiked ? 1 : -1))
    startTransition(async () => {
      const result = await likeComment(comment.id)
      if ('error' in result) {
        setLiked(!nextLiked)
        setLikeCount((c) => c + (nextLiked ? -1 : 1))
        toast.error(result.error)
      }
    })
  }

  function saveEdit() {
    startTransition(async () => {
      const result = await editComment({ id: comment.id, content: draft })
      if (result?.error) {
        toast.error(result.error)
        return
      }
      setIsEditing(false)
      onChanged()
    })
  }

  function remove() {
    if (!window.confirm('Delete this comment?')) return
    startTransition(async () => {
      const result = await deleteComment(comment.id)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      onChanged()
    })
  }

  return (
    <div className="flex gap-3">
      <Link href={`/profile/${comment.author.username}`}>
        <Avatar className="size-8">
          {comment.author.image && (
            <AvatarImage src={comment.author.image} alt={comment.author.name ?? ''} />
          )}
          <AvatarFallback>
            {(comment.author.name ?? comment.author.username ?? '?')[0]}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="grid flex-1 gap-1">
        <div className="bg-muted/50 rounded-lg px-3 py-2">
          <Link href={`/profile/${comment.author.username}`} className="text-sm font-medium">
            {comment.author.name}
          </Link>
          {isEditing ? (
            <div className="mt-1 flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                aria-label="Edit comment"
              />
              <Button size="sm" onClick={saveEdit} disabled={isPending}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDraft(comment.content)
                  setIsEditing(false)
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          )}
        </div>

        <div className="text-muted-foreground flex items-center gap-3 px-1 text-xs">
          <button
            type="button"
            onClick={toggleLike}
            aria-pressed={liked}
            aria-label={liked ? 'Unlike comment' : 'Like comment'}
            className={cn('hover:text-foreground flex items-center gap-1', liked && 'text-red-500')}
          >
            <Heart className={cn('size-3.5', liked && 'fill-current')} />
            {likeCount > 0 && likeCount}
          </button>

          {comment.isOwn && (
            <>
              <button
                type="button"
                onClick={() => setIsEditing((v) => !v)}
                className="hover:text-foreground flex items-center gap-1"
              >
                <Pencil className="size-3.5" /> Edit
              </button>
              <button
                type="button"
                onClick={remove}
                className="hover:text-destructive flex items-center gap-1"
              >
                <Trash2 className="size-3.5" /> Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
