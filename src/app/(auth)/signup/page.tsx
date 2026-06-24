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
import { SignupForm } from '@/features/auth/components/signup-form'
import { OAuthButtons } from '@/features/auth/components/oauth-buttons'

export default function SignupPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Join VibeSphere to connect and discover events</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <SignupForm />
        <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-muted-foreground text-xs">OR</span>
          <Separator className="flex-1" />
        </div>
        <OAuthButtons />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-muted-foreground text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-foreground font-medium underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
