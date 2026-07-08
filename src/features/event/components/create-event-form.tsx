'use client'

import { useTransition } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createEvent, editEvent, type EventDetailData } from '../actions'
import { createEventSchema, type CreateEventInput } from '../schema'
import { EventTypeSelector } from './event-type-selector'

function toLocalInput(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function CreateEventForm({ event }: { event?: EventDetailData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description,
          eventType: event.eventType,
          startDate: toLocalInput(event.startDate),
          endDate: toLocalInput(event.endDate),
          location: event.location,
          isPaid: event.isPaid,
          priceUsd: event.ticket ? String(event.ticket.price / 100) : '',
          quantity: event.ticket ? String(event.ticket.quantity) : '',
        }
      : {
          title: '',
          description: '',
          eventType: [],
          startDate: '',
          endDate: '',
          location: '',
          isPaid: false,
          priceUsd: '',
          quantity: '',
        },
  })

  const isPaid = useWatch({ control, name: 'isPaid' })

  function onSubmit(values: CreateEventInput) {
    startTransition(async () => {
      const result = event
        ? await editEvent({ ...values, id: event.id })
        : await createEvent(values)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success(event ? 'Event updated' : 'Event created')
      router.push(`/events/${result.id}`)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title')} />
        {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} {...register('description')} />
        {errors.description && (
          <p className="text-destructive text-sm">{errors.description.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label>Event types</Label>
        <Controller
          control={control}
          name="eventType"
          render={({ field }) => (
            <EventTypeSelector value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.eventType && <p className="text-destructive text-sm">{errors.eventType.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="startDate">Starts</Label>
          <Input id="startDate" type="datetime-local" {...register('startDate')} />
          {errors.startDate && (
            <p className="text-destructive text-sm">{errors.startDate.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="endDate">Ends</Label>
          <Input id="endDate" type="datetime-local" {...register('endDate')} />
          {errors.endDate && <p className="text-destructive text-sm">{errors.endDate.message}</p>}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" {...register('location')} />
        {errors.location && <p className="text-destructive text-sm">{errors.location.message}</p>}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4" {...register('isPaid')} />
        This is a paid event
      </label>

      {isPaid && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="priceUsd">Ticket price (USD)</Label>
            <Input id="priceUsd" type="number" min="0" step="0.01" {...register('priceUsd')} />
            {errors.priceUsd && (
              <p className="text-destructive text-sm">{errors.priceUsd.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity">Tickets available</Label>
            <Input id="quantity" type="number" min="0" step="1" {...register('quantity')} />
            {errors.quantity && (
              <p className="text-destructive text-sm">{errors.quantity.message}</p>
            )}
          </div>
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? 'Saving…' : event ? 'Save changes' : 'Create event'}
      </Button>
    </form>
  )
}
