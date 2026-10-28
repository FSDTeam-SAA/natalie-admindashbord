'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { postJson } from '@/lib/api'
import AuthLayout from '../_components/AuthLayout'
import AuthFormCard from '../_components/AuthFormCard'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')

  const forgotPasswordMutation = useMutation({
    mutationFn: (emailAddress: string) =>
      postJson<unknown, { email: string }>('/api/v1/auth/forgot-password', {
        email: emailAddress,
      }),
    onSuccess: (response, emailAddress) => {
      toast.success(response.message || 'OTP sent successfully')
      router.push(`/verify-code?email=${encodeURIComponent(emailAddress)}`)
    },
    onError: (error) => {
      toast.error('Unable to send OTP', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    forgotPasswordMutation.mutate(email.trim().toLowerCase())
  }

  return (
    <AuthLayout>
      <AuthFormCard
        title="Forgot Password"
        description="Enter your email to reset your password"
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
            disabled={forgotPasswordMutation.isPending}
            className="bg-[#18181B] border-[#3F3F46] text-white placeholder:text-[#7C7C88] h-12"
          />

          <Button
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="w-full text-lg bg-[#C2384F] hover:bg-[#C2384F]/90 text-[#F8F6F2] h-12 font-semibold rounded-md transition-colors"
          >
            {forgotPasswordMutation.isPending ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </Button>

          <div className="text-center">
            <Link
              href="/sign-in"
              className="text-[#C2384F] hover:text-[#C2384F]/90 text-sm font-semibold transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </AuthFormCard>
    </AuthLayout>
  )
}
