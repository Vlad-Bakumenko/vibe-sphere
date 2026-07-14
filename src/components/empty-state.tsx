import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-14 text-center',
        className,
      )}
    >
      <div className="bg-brand-soft text-primary flex size-12 items-center justify-center rounded-2xl">
        <Icon className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="font-heading font-semibold">{title}</p>
        {description && (
          <p className="text-muted-foreground mx-auto max-w-xs text-sm">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
