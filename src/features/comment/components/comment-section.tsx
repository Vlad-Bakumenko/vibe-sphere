'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { getComments } from '../actions'
import { CommentForm } from './comment-form'
import { CommentItem } from './comment-item'

export function CommentSection({ postId }: { postId: string }) {
  const queryClient = useQueryClient()

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => getComments(postId),
  })

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    // Keep the feed's comment counts in sync.
    void queryClient.invalidateQueries({ queryKey: ['posts'] })
  }

  return (
    <div className="mt-3 grid gap-3 border-t pt-3">
      <CommentForm postId={postId} onAdded={refresh} />

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading comments…</p>
      ) : comments && comments.length > 0 ? (
        comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} onChanged={refresh} />
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No comments yet.</p>
      )}
    </div>
  )
}
