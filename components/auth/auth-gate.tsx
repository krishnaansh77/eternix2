'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { LoginScreen } from '@/components/auth/login-screen'
import { useAuth } from '@/components/auth/auth-provider'

const PUBLIC_PATHS = new Set(['/signup', '/verify-email'])

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#eff9ff,#f8fdfa)]">
      <div className="rounded-full border border-cyan-100 bg-white/80 px-6 py-3 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm">
        Preparing secure workspace...
      </div>
    </div>
  )
}

export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isReady, signIn, user } = useAuth()

  useEffect(() => {
    if (!isReady || !isAuthenticated || !pathname || PUBLIC_PATHS.has(pathname)) {
      return
    }

    if (user?.accountType === 'patient' && pathname !== '/patient-dashboard') {
      router.replace('/patient-dashboard')
    }

    if (user?.accountType === 'doctor' && pathname.startsWith('/patient-dashboard')) {
      router.replace('/')
    }
  }, [isAuthenticated, isReady, pathname, router, user?.accountType])

  if (!isReady) {
    return <LoadingScreen />
  }

  if (pathname && PUBLIC_PATHS.has(pathname)) {
    return <>{children}</>
  }

  if (!isAuthenticated) {
    return <LoginScreen onSignIn={signIn} />
  }

  return <>{children}</>
}
