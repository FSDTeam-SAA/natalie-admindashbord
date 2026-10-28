'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface PasswordInputProps {
  id?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
  autoComplete?: string
  required?: boolean
  disabled?: boolean
}

export default function PasswordInput({
  id = 'password',
  placeholder = 'Password',
  value,
  onChange,
  className,
  autoComplete,
  required,
  disabled,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        id={id}
        type={isVisible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className={`pr-10 ${className}`}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsVisible(!isVisible)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        tabIndex={-1}
      >
        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
