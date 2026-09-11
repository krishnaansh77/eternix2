'use client'

import { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Stethoscope, ArrowLeft, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SignupForm, type SignupData } from '@/components/signup/signup-form'
import { registerUser } from '@/lib/api'

const DNAHelixScene = dynamic(
  () => import('@/components/signup/dna-helix-scene'),
  { ssr: false },
)

export default function SignupPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSignupSubmit = async (data: SignupData) => {
    setError('')
    setIsSubmitting(true)

    try {
      await registerUser({
        name: `${data.firstName.trim()} ${data.lastName.trim()}`.trim(),
        email: data.email,
        password: data.password,
        role: data.accountType === 'patient' ? 'PATIENT' : 'DOCTOR',
      })
      router.replace('/verify-email?sent=1')
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : 'Unable to create your account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950">
      <Suspense fallback={<div className="absolute inset-0 bg-gray-950" />}>
        <DNAHelixScene />
      </Suspense>

      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-transparent to-gray-950/80 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />

      <div className="relative z-10 min-h-screen">
        <header className="px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary/20 group-hover:bg-primary/30 transition-colors">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-semibold text-white">Aarogyam AI</span>
            </Link>

            <Link href="/">
              <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to sign in
              </Button>
            </Link>
          </div>
        </header>

        <main className="px-6 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm text-white/80">Free early access</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white text-balance">
                Create your Aarogyam AI account
              </h1>
              <p className="text-lg text-white/60 max-w-2xl mx-auto text-pretty">
                Subscriptions are paused while the platform is in preview. Creating an account and signing in are free.
              </p>
            </div>

            <SignupForm
              onBack={() => router.push('/')}
              onSubmit={handleSignupSubmit}
              isSubmitting={isSubmitting}
              error={error}
            />
          </div>
        </main>

        <footer className="px-6 py-8 mt-12 border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
            <p>2026 Aarogyam AI. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
