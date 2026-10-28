'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import AuthLayout from '../_components/AuthLayout'
import AuthFormCard from '../_components/AuthFormCard'
import PasswordInput from '../_components/PasswordInput'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      console.log('Passwords do not match')
      return
    }
    console.log('Sign up:', { name, email, password })
  }

  return (
    <AuthLayout>
      <AuthFormCard
        title="Sign up"
        description="Please enter your email and password to continue"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#18181B] border-[#3F3F46] text-white placeholder:text-[#7C7C88] h-12"
          />

          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#18181B] border-[#3F3F46] text-white placeholder:text-[#7C7C88] h-12"
          />

          <PasswordInput
            id="password"
            placeholder="New Password"
            value={password}
            onChange={setPassword}
            className="bg-[#18181B] border-[#3F3F46] text-white placeholder:text-[#7C7C88] h-12"
          />

          <PasswordInput
            id="confirm-password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            className="bg-[#18181B] border-[#3F3F46] text-white placeholder:text-[#7C7C88] h-12"
          />

          <Button
            type="submit"
            className="w-full text-lg bg-[#C2384F] hover:bg-[#C2384F]/90 text-[#F8F6F2] h-12 font-semibold rounded-md transition-colors"
          >
            Signup
          </Button>

          <div className="text-center text-gray-400">
            Have an account?{' '}
            <Link
              href="/sign-in"
              className="text-[#C2384F] hover:text-[#C2384F]/90 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </div>
        </form>
      </AuthFormCard>
    </AuthLayout>
  )
}
