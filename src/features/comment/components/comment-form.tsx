'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addComment } from '../actions'

export function CommentForm({ postId, onAdded }: { postId: string; onAdded: () => void }) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    startTransition(async () => {
      const result = await addComment({ postId, content })
      if (result?.error) {
        toast.error(result.error)
        return
      }
      setContent('')
      onAdded()
    })
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment…"
        aria-label="Comment"
      />
      <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
        Comment
      </Button>
    </form>
  )
}
