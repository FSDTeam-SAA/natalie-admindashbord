'use client'

import { ClipboardEvent, KeyboardEvent, Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import AuthLayout from '../_components/AuthLayout'
import AuthFormCard from '../_components/AuthFormCard'
import { Button } from '@/components/ui/button'
import { postJson } from '@/lib/api'

type VerifyOtpData = { resetToken: string }

function VerifyCodeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')?.trim().toLowerCase() ?? ''
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [timeLeft, setTimeLeft] = useState(43)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (!email) router.replace('/forgot-password')
  }, [email, router])

  useEffect(() => {
    if (timeLeft <= 0) return
    const interval = window.setInterval(() => {
      setTimeLeft((previous) => previous - 1)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [timeLeft])

  const verifyMutation = useMutation({
    mutationFn: () =>
      postJson<VerifyOtpData, { email: string; otp: string }>(
        '/api/v1/auth/verify-otp',
        { email, otp: otp.join('') },
      ),
    onSuccess: (response) => {
      const resetToken = response.data?.resetToken
      if (!resetToken) {
        toast.error('Reset token was not returned by the server')
        return
      }

      toast.success(response.message || 'OTP verified successfully')
      router.push(
        `/change-password?email=${encodeURIComponent(email)}&resetToken=${encodeURIComponent(resetToken)}`,
      )
    },
    onError: (error) => {
      toast.error('OTP verification failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    },
  })

  const resendMutation = useMutation({
    mutationFn: () =>
      postJson<unknown, { email: string }>('/api/v1/auth/forgot-password', { email }),
    onSuccess: (response) => {
      setTimeLeft(43)
      setOtp(Array(6).fill(''))
      inputRefs.current[0]?.focus()
      toast.success(response.message || 'A new OTP has been sent')
    },
    onError: (error) => {
      toast.error('Unable to resend OTP', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    },
  })

  const setOtpDigits = (digits: string) => {
    const values = digits.replace(/\D/g, '').slice(0, 6).split('')
    setOtp(Array.from({ length: 6 }, (_, index) => values[index] ?? ''))
    if (values.length > 0) inputRefs.current[Math.min(values.length, 6) - 1]?.focus()
  }

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    setOtp((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? digit : item)),
    )
    if (digit && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (event.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault()
    setOtpDigits(event.clipboardData.getData('text'))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (otp.join('').length !== 6) {
      toast.error('Please enter the complete 6-digit OTP')
      return
    }
    verifyMutation.mutate()
  }

  return (
    <AuthLayout>
      <AuthFormCard
        title="Enter Code"
        description="Please check your email for a message with your code. Your code is 6 numbers long."
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3 pt-4" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => { inputRefs.current[index] = element }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                aria-label={`OTP digit ${index + 1}`}
                maxLength={1}
                value={digit}
                disabled={verifyMutation.isPending}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className="h-14 w-12 rounded-md border border-[#3F3F46] bg-[#18181B] text-center text-lg font-semibold text-white outline-none transition focus:border-[#C2384F]"
              />
            ))}
          </div>

          <div className="text-center text-sm text-gray-400">
            {timeLeft > 0 ? `Resend code in ${timeLeft}s` : 'You can resend the code now'}
          </div>

          <Button
            type="submit"
            disabled={verifyMutation.isPending}
            className="h-12 w-full rounded-md bg-[#C2384F] text-lg font-semibold text-[#F8F6F2] hover:bg-[#C2384F]/90"
          >
            {verifyMutation.isPending ? (
              <><Loader2 className="size-5 animate-spin" />Verifying...</>
            ) : 'Verify code'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => resendMutation.mutate()}
              disabled={timeLeft > 0 || resendMutation.isPending || !email}
              className={`text-sm ${timeLeft > 0 || resendMutation.isPending ? 'cursor-not-allowed text-gray-500' : 'text-[#C2384F] hover:text-[#C2384F]/90'}`}
            >
              {resendMutation.isPending ? 'Sending...' : 'Resend code'}
            </button>
          </div>
        </form>
      </AuthFormCard>
    </AuthLayout>
  )
}

export default function VerifyCodePage() {
  return <Suspense fallback={null}><VerifyCodeForm /></Suspense>
}
