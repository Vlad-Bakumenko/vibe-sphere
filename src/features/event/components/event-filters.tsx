'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { ALL_EVENT_TYPES } from '../schema'

const selectClass =
  'border-input bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-1'

export function EventFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        aria-label="Filter by type"
        value={params.get('type') ?? ''}
        onChange={(e) => setParam('type', e.target.value)}
        className={selectClass}
      >
        <option value="">All types</option>
        {ALL_EVENT_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by price"
        value={params.get('paid') ?? ''}
        onChange={(e) => setParam('paid', e.target.value)}
        className={selectClass}
      >
        <option value="">Free & paid</option>
        <option value="free">Free</option>
        <option value="paid">Paid</option>
      </select>

      <select
        aria-label="Filter by date"
        value={params.get('when') ?? ''}
        onChange={(e) => setParam('when', e.target.value)}
        className={selectClass}
      >
        <option value="">Any time</option>
        <option value="upcoming">Upcoming</option>
        <option value="past">Past</option>
      </select>
    </div>
  )
}
