'use client'

import { Interest } from '@prisma/client'

import { cn } from '@/lib/utils'
import { ALL_INTERESTS } from '../schema'

type Props = {
  value: Interest[]
  onChange: (value: Interest[]) => void
}

export function InterestsSelector({ value, onChange }: Props) {
  function toggle(interest: Interest) {
    onChange(value.includes(interest) ? value.filter((i) => i !== interest) : [...value, interest])
  }

  return (
    <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-md border p-3">
      {ALL_INTERESTS.map((interest) => {
        const selected = value.includes(interest)
        return (
          <button
            type="button"
            key={interest}
            onClick={() => toggle(interest)}
            aria-pressed={selected}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors',
              selected
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-accent',
            )}
          >
            {interest}
          </button>
        )
      })}
    </div>
  )
}
