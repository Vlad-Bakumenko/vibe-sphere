'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createPost } from '../actions'
import { createPostSchema, type CreatePostInput } from '../schema'

export function CreatePostForm({ onCreated }: { onCreated: () => void }) {
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { content: '' },
  })

  function onSubmit(values: CreatePostInput) {
    startTransition(async () => {
      const result = await createPost(values)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      reset({ content: '' })
      onCreated()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2 rounded-lg border p-4">
      <Textarea placeholder="What's on your mind?" rows={3} {...register('content')} />
      {errors.content && <p className="text-destructive text-sm">{errors.content.message}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Posting…' : 'Post'}
        </Button>
      </div>
    </form>
  )
}
