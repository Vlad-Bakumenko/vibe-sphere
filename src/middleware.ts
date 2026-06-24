import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

// Edge middleware uses only the edge-safe config (no adapter/bcrypt). The
// `authorized` callback decides access; unauthenticated hits on protected
// routes are redirected to the sign-in page.
const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  // Run on everything except Next internals, the auth API, and static assets.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
