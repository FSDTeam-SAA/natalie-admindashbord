import { ReactNode } from 'react'

interface AuthFormCardProps {
  title: string
  description: string
  children: ReactNode
}

export default function AuthFormCard({
  title,
  description,
  children,
}: AuthFormCardProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-manrope font-bold text-white">{title}</h1>
        <p className="text-base font-manrope text-gray-400">{description}</p>
      </div>
      <div className="space-y-6 font-manrope">{children}</div>
    </div>
  )
}
