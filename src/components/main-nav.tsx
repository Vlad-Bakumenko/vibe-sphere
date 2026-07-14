'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Home, Settings as SettingsIcon, User, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/theme-toggle'

type NavUser = {
  username: string | null
  name: string | null
  image: string | null
}

type NavLink = { href: string; label: string; icon: LucideIcon }

export function MainNav({ user, signOut }: { user: NavUser; signOut: React.ReactNode }) {
  const pathname = usePathname()

  const links: NavLink[] = [
    { href: '/feed', label: 'Feed', icon: Home },
    { href: '/events', label: 'Events', icon: CalendarDays },
    ...(user.username ? [{ href: `/profile/${user.username}`, label: 'Profile', icon: User }] : []),
    { href: '/settings', label: 'Settings', icon: SettingsIcon },
  ]

  const isActive = (href: string) =>
    pathname === href || (href !== '/feed' && pathname.startsWith(href))

  return (
    <>
      <header className="bg-background/80 sticky top-0 z-30 border-b backdrop-blur-lg">
        <nav className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-3">
            <Link href="/feed" className="font-heading flex items-center gap-2 text-lg font-bold">
              <span className="bg-brand shadow-soft size-6 rounded-lg" aria-hidden />
              <span>VibeSphere</span>
            </Link>
            {/* Inline links on tablet/desktop; mobile uses the bottom bar. */}
            <div className="hidden items-center gap-0.5 sm:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            {user.username && (
              <Link href={`/profile/${user.username}`} aria-label="Your profile">
                <Avatar className="ring-border size-8 ring-2">
                  {user.image && <AvatarImage src={user.image} alt={user.name ?? ''} />}
                  <AvatarFallback className="bg-brand text-xs text-white">
                    {(user.name ?? user.username ?? '?')[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
            {signOut}
          </div>
        </nav>
      </header>

      {/* Mobile bottom tab bar. */}
      <nav className="bg-background/90 fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur-lg sm:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-around px-2 py-1.5">
          {links.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <link.icon className="size-5" />
                {link.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
