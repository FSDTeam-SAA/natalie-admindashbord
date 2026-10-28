'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSession, signIn } from 'next-auth/react'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import AuthLayout from '../_components/AuthLayout'
import AuthFormCard from '../_components/AuthFormCard'
import PasswordInput from '../_components/PasswordInput'

type LoginCredentials = {
  email: string
  password: string
}

const REMEMBERED_CREDENTIALS_KEY = 'admin-remembered-credentials'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    try {
      const savedCredentials = window.localStorage.getItem(
        REMEMBERED_CREDENTIALS_KEY,
      )

      if (!savedCredentials) return

      const parsedCredentials = JSON.parse(savedCredentials) as Partial<LoginCredentials>

      if (
        typeof parsedCredentials.email === 'string' &&
        typeof parsedCredentials.password === 'string'
      ) {
        setEmail(parsedCredentials.email)
        setPassword(parsedCredentials.password)
        setRememberMe(true)
      }
    } catch {
      window.localStorage.removeItem(REMEMBERED_CREDENTIALS_KEY)
    }
  }, [])

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (!result || result.error || !result.ok) {
        throw new Error(
          result?.error === 'CredentialsSignin'
            ? 'Invalid email or password'
            : result?.error || 'Login failed. Please try again.',
        )
      }

      const session = await getSession()

      if (!session?.accessToken) {
        throw new Error('Unable to create your login session')
      }

      return session
    },
    onSuccess: (session) => {
      if (rememberMe) {
        window.localStorage.setItem(
          REMEMBERED_CREDENTIALS_KEY,
          JSON.stringify({ email: email.trim().toLowerCase(), password }),
        )
      } else {
        window.localStorage.removeItem(REMEMBERED_CREDENTIALS_KEY)
      }

      toast.success(session.message || 'Login successfully', {
        description: 'Welcome back to your admin dashboard.',
        duration: 3500,
      })
      router.replace('/')
      router.refresh()
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'

      toast.error('Login failed', {
        description: message,
        duration: 5000,
      })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    loginMutation.mutate({ email, password })
  }

  return (
    <AuthLayout>
      <AuthFormCard
        title="Sign in"
        description="Please enter your email and password to continue"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            name="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={loginMutation.isPending}
            className="bg-[#18181B] border-[#3F3F46] text-white placeholder:text-[#7C7C88] h-12"
          />

          <PasswordInput
            id="password"
            placeholder="Password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            required
            disabled={loginMutation.isPending}
            className="bg-[#18181B] border-[#3F3F46] text-white placeholder:text-[#7C7C88] h-12"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                disabled={loginMutation.isPending}
                onCheckedChange={(checked) => {
                  const shouldRemember = checked === true
                  setRememberMe(shouldRemember)

                  if (!shouldRemember) {
                    window.localStorage.removeItem(REMEMBERED_CREDENTIALS_KEY)
                  }
                }}
                className="border-[#3F3F46] data-checked:border-[#C2384F] data-checked:bg-[#C2384F] data-checked:text-white [&_[data-slot=checkbox-indicator]_svg]:stroke-white"
              />
              <Label htmlFor="remember" className="text-gray-300 cursor-pointer ">
                Remember me
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-[#C2384F] hover:text-[#C2384F]/90 text-sm transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full  text-lg bg-[#C2384F] hover:bg-[#C2384F]/90 text-[#F8F6F2] h-12 font-semibold rounded-md transition-colors"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>

          <div className="text-center text-gray-400">
            Haven&apos;t account?{' '}
            <Link
              href="/sign-up"
              className="text-[#C2384F] hover:text-red-400 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </div>
        </form>
      </AuthFormCard>
    </AuthLayout>
  )
}
