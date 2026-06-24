import { Button } from '@/components/ui/button'
import { loginWithProvider } from '@/features/auth/actions'

// Server component: each button is a form whose action is the bound server
// action, so OAuth sign-in runs server-side. Buttons are always shown; a
// provider only works once its AUTH_*_ID / AUTH_*_SECRET env vars are set.
export function OAuthButtons() {
  return (
    <div className="grid gap-2">
      <form action={loginWithProvider.bind(null, 'google')}>
        <Button type="submit" variant="outline" className="w-full">
          Continue with Google
        </Button>
      </form>
      <form action={loginWithProvider.bind(null, 'github')}>
        <Button type="submit" variant="outline" className="w-full">
          Continue with GitHub
        </Button>
      </form>
    </div>
  )
}
