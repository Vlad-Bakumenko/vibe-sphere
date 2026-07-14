'use client'

import { useTransition } from 'react'
import Image from 'next/image'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { UploadButton } from '@/lib/uploadthing'
import { createPost } from '../actions'
import { createPostSchema, type CreatePostInput } from '../schema'

const MAX_IMAGES = 4

export function CreatePostForm({ onCreated }: { onCreated: () => void }) {
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { content: '', images: [] },
  })

  const images = useWatch({ control, name: 'images' }) ?? []

  function removeImage(url: string) {
    setValue(
      'images',
      images.filter((i) => i !== url),
      { shouldValidate: true },
    )
  }

  function onSubmit(values: CreatePostInput) {
    startTransition(async () => {
      const result = await createPost(values)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      reset({ content: '', images: [] })
      onCreated()
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card shadow-soft grid gap-3 rounded-2xl border p-4"
    >
      <Textarea
        placeholder="What's on your mind?"
        rows={3}
        className="resize-none border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
        {...register('content')}
      />
      {errors.content && <p className="text-destructive text-sm">{errors.content.message}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((url) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-md border">
              <Image src={url} alt="Attached image" fill className="object-cover" sizes="120px" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                aria-label="Remove image"
                className="bg-background/80 absolute top-1 right-1 rounded-full p-0.5 shadow"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-t pt-3">
        {images.length < MAX_IMAGES ? (
          <UploadButton
            endpoint="postImage"
            appearance={{
              button: 'ut-ready:bg-secondary ut-ready:text-secondary-foreground text-sm',
            }}
            content={{ button: 'Add photos' }}
            onClientUploadComplete={(res) => {
              const urls = res.map((f) => f.ufsUrl)
              setValue('images', [...images, ...urls].slice(0, MAX_IMAGES), {
                shouldValidate: true,
              })
            }}
            onUploadError={(err) => {
              toast.error(err.message)
            }}
          />
        ) : (
          <span className="text-muted-foreground text-sm">Max {MAX_IMAGES} images</span>
        )}
        <Button type="submit" variant="brand" disabled={isPending} className="cursor-pointer">
          {isPending ? 'Posting…' : 'Post'}
        </Button>
      </div>
    </form>
  )
}
