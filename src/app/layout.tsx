import type { Metadata } from 'next'
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin'
import { extractRouterConfig } from 'uploadthing/server'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/components/providers'
import { ourFileRouter } from '@/app/api/uploadthing/core'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'VibeSphere',
  description: 'Connect with people, share moments, and discover events around you.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${jakarta.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
