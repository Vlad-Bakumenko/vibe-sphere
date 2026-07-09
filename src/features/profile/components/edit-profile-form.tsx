'use client'

import { useState, useTransition } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { UploadButton } from '@/lib/uploadthing'
import { updateProfile } from '../actions'
import { updateProfileSchema, type UpdateProfileInput } from '../schema'
import { InterestsSelector } from './interests-selector'

export function EditProfileForm({
  defaultValues,
  currentImage,
}: {
  defaultValues: UpdateProfileInput
  currentImage: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  // Avatar uploads persist server-side immediately (see the `avatar` file
  // router); this only mirrors the new URL for an instant preview.
  const [image, setImage] = useState(currentImage)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues,
  })

  function onSubmit(values: UpdateProfileInput) {
    startTransition(async () => {
      const result = await updateProfile(values)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success('Profile updated')
      router.push(`/profile/${result.username}`)
      router.refresh()
    })
  }

  const initial = (defaultValues.fullName || defaultValues.username || '?')[0]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          {image && <AvatarImage src={image} alt="Your avatar" />}
          <AvatarFallback className="text-lg">{initial}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <Label>Profile picture</Label>
          <UploadButton
            endpoint="avatar"
            appearance={{
              button: 'ut-ready:bg-secondary ut-ready:text-secondary-foreground text-sm',
            }}
            content={{ button: 'Change photo' }}
            onClientUploadComplete={(res) => {
              const url = res[0]?.ufsUrl
              if (url) setImage(url)
              toast.success('Photo updated')
              router.refresh()
            }}
            onUploadError={(err) => {
              toast.error(err.message)
            }}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" {...register('fullName')} />
        {errors.fullName && <p className="text-destructive text-sm">{errors.fullName.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...register('username')} />
        {errors.username && <p className="text-destructive text-sm">{errors.username.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" rows={3} {...register('bio')} />
        {errors.bio && <p className="text-destructive text-sm">{errors.bio.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" {...register('location')} />
        {errors.location && <p className="text-destructive text-sm">{errors.location.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label>Interests</Label>
        <Controller
          control={control}
          name="interests"
          render={({ field }) => (
            <InterestsSelector value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  )
}
