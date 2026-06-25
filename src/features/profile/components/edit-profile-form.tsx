'use client'

import { useTransition } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { updateProfile } from '../actions'
import { updateProfileSchema, type UpdateProfileInput } from '../schema'
import { InterestsSelector } from './interests-selector'

export function EditProfileForm({ defaultValues }: { defaultValues: UpdateProfileInput }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
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
