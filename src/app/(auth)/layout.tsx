import Link from 'next/link'

import { ThemeToggle } from '@/components/theme-toggle'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Decorative brand glow. */}
      <div
        aria-hidden
        className="bg-brand pointer-events-none absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full opacity-20 blur-[120px]"
      />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="bg-brand shadow-soft size-9 rounded-xl" aria-hidden />
            <span className="font-heading text-2xl font-bold">VibeSphere</span>
          </Link>
        </div>
        {children}
      </div>
    </main>
  )
}
