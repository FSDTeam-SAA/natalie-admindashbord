'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { postJson } from '@/lib/api'
import AuthLayout from '../_components/AuthLayout'
import AuthFormCard from '../_components/AuthFormCard'
import PasswordInput from '../_components/PasswordInput'

function ChangePasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')?.trim().toLowerCase() ?? ''
  const resetToken = searchParams.get('resetToken') ?? ''
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (!email || !resetToken) router.replace('/forgot-password')
  }, [email, resetToken, router])

  const resetPasswordMutation = useMutation({
    mutationFn: () =>
      postJson<unknown, { resetToken: string; email: string; password: string }>(
        '/api/v1/auth/reset-password',
        { resetToken, email, password: newPassword },
      ),
    onSuccess: (response) => {
      toast.success(response.message || 'Password reset successfully')
      router.replace('/sign-in')
    },
    onError: (error) => {
      toast.error('Password reset failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    resetPasswordMutation.mutate()
  }

  return (
    <AuthLayout>
      <AuthFormCard title="Change Password" description="Confirm your new password">
        <form onSubmit={handleSubmit} className="space-y-6">
          <PasswordInput
            id="new-password"
            placeholder="New Password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            required
            disabled={resetPasswordMutation.isPending}
            className="h-12 border-[#3F3F46] bg-[#18181B] text-white placeholder:text-[#7C7C88]"
          />

          <PasswordInput
            id="confirm-password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            required
            disabled={resetPasswordMutation.isPending}
            className="h-12 border-[#3F3F46] bg-[#18181B] text-white placeholder:text-[#7C7C88]"
          />

          <Button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="h-12 w-full rounded-md bg-[#C2384F] text-lg font-semibold text-[#F8F6F2] hover:bg-[#C2384F]/90"
          >
            {resetPasswordMutation.isPending ? (
              <><Loader2 className="size-5 animate-spin" />Saving...</>
            ) : 'Save Password'}
          </Button>

          <div className="text-center">
            <Link
              href="/sign-in"
              className="text-sm font-semibold text-[#C2384F] hover:text-[#C2384F]/90"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </AuthFormCard>
    </AuthLayout>
  )
}

export default function ChangePasswordPage() {
  return <Suspense fallback={null}><ChangePasswordForm /></Suspense>
}
