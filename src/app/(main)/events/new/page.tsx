import { CreateEventForm } from '@/features/event/components/create-event-form'

export default function NewEventPage() {
  return (
    <div className="grid max-w-2xl gap-6">
      <h1 className="text-2xl font-semibold">Create event</h1>
      <CreateEventForm />
    </div>
  )
}
