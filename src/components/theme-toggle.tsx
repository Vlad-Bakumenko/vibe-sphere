'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Theme is unknown until mounted; render a stable placeholder to avoid a
  // hydration mismatch and icon flash. (Canonical next-themes guard — a
  // one-time mount flag is the intended use of this effect.)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      className="cursor-pointer"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {mounted && isDark ? <Moon className="size-5" /> : <Sun className="size-5" />}
    </Button>
  )
}
