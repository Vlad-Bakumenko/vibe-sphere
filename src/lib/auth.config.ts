import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'

// Edge-safe base config, shared by the Edge middleware and the full server
// config in auth.ts. Must NOT import the Prisma adapter, bcrypt, or any
// Node-only API — middleware runs on the Edge runtime.
//
// OAuth providers are registered only when their credentials are present, so
// local dev and CI builds don't fail before you've set up OAuth apps. Email/
// password (Credentials) is added in auth.ts since its authorize() needs the
// database + bcrypt.

const oauthProviders: NextAuthConfig['providers'] = []
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  oauthProviders.push(Google)
}
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  oauthProviders.push(GitHub)
}

// Routes anyone may visit unauthenticated.
const PUBLIC_ROUTES = ['/', '/login', '/signup']

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: oauthProviders,
  callbacks: {
    // Runs in middleware for every matched request.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl
      const isPublic = PUBLIC_ROUTES.includes(pathname)

      // Keep authenticated users out of the auth screens.
      if (isLoggedIn && (pathname === '/login' || pathname === '/signup')) {
        return Response.redirect(new URL('/feed', nextUrl))
      }

      if (isPublic) return true
      return isLoggedIn // protected route → must be signed in
    },
  },
} satisfies NextAuthConfig
