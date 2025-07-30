'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (session) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (session) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            BizFlow
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Sistem ERP + POS untuk mengelola bisnis Anda
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Masuk ke Sistem
          </Link>
          
          <Link
            href="/register"
            className="block w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            Daftar Akun Baru
          </Link>
        </div>

        <div className="text-sm text-gray-500">
          <p>Akses cepat untuk kasir, admin, dan staff lainnya</p>
        </div>
      </div>
    </div>
  )
}
