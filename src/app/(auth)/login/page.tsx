import Link from 'next/link'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { LoginForm } from '@/features/auth/components/login-form'
import { OAuthButtons } from '@/features/auth/components/oauth-buttons'

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your VibeSphere account</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <LoginForm />
        <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-muted-foreground text-xs">OR</span>
          <Separator className="flex-1" />
        </div>
        <OAuthButtons />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-muted-foreground text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-foreground font-medium underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
