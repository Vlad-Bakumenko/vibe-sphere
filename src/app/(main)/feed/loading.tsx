import { Skeleton } from '@/components/ui/skeleton'

export default function FeedLoading() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-32 rounded-2xl" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-card shadow-soft grid gap-3 rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="grid gap-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}
