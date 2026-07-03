'use client'

import { EventType } from '@prisma/client'

import { cn } from '@/lib/utils'
import { ALL_EVENT_TYPES } from '../schema'

type Props = {
  value: EventType[]
  onChange: (value: EventType[]) => void
}

export function EventTypeSelector({ value, onChange }: Props) {
  function toggle(type: EventType) {
    onChange(value.includes(type) ? value.filter((t) => t !== type) : [...value, type])
  }

  return (
    <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-md border p-3">
      {ALL_EVENT_TYPES.map((type) => {
        const selected = value.includes(type)
        return (
          <button
            type="button"
            key={type}
            onClick={() => toggle(type)}
            aria-pressed={selected}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors',
              selected
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-accent',
            )}
          >
            {type}
          </button>
        )
      })}
    </div>
  )
}
