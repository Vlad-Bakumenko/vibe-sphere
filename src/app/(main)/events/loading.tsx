import { Skeleton } from '@/components/ui/skeleton'

export default function EventsLoading() {
  return (
    <div className="grid gap-6">
      <div className="flex items-end justify-between">
        <div className="grid gap-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card shadow-soft grid gap-3 rounded-2xl border p-4">
          <div className="flex items-start justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}
