'use client'

import Image from 'next/image'

interface AuthLayoutProps {
  children: React.ReactNode
  imageSrc?: string
  imageAlt?: string
}

export default function AuthLayout({
  children,
  imageSrc = '/auth.png',
  imageAlt = 'Warm-lit portrait',
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#0a0a0c] md:grid-cols-2">
      {/* Left: Portrait Image */}
      <div className="relative h-full  overflow-hidden  md:h-screen">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={1000}
          height={1000}
          className="w-full h-full object-cover "
        />
      </div>

      {/* Right: Form Content */}
      <div className="flex items-center justify-center bg-black px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
