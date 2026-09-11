'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Mail, ShieldCheck } from 'lucide-react'

import { apiRequest } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const initialToken = searchParams.get('token') ?? ''
  const [token, setToken] = useState(initialToken)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(searchParams.get('sent') ? 'Check your inbox for the verification link.' : '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const attemptedToken = useRef<string | null>(null)

  const verify = async (value: string) => {
    if (!value || busy) return
    setBusy(true)
    setError('')
    try {
      const response = await apiRequest<{ message: string }>('/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token: value }),
      })
      setMessage(response.message)
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : 'Unable to verify this email address.')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (initialToken && attemptedToken.current !== initialToken) {
      attemptedToken.current = initialToken
      void verify(initialToken)
    }
  }, [initialToken]) // The ref prevents a development-mode duplicate verification request.

  const resend = async () => {
    if (!email || busy) return
    setBusy(true)
    setError('')
    try {
      const response = await apiRequest<{ message: string }>('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setMessage(response.message)
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : 'Unable to resend the verification email.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#102c42,#04111f_58%)] p-6 text-white">
      <Card className="w-full max-w-md border-white/10 bg-slate-950/75 text-white shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
            {message.startsWith('Email verified') ? <CheckCircle2 className="h-6 w-6" /> : <Mail className="h-6 w-6" />}
          </div>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription className="text-slate-400">
            We verify every Aarogyam AI account before enabling access to its protected workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {message && <p className="rounded-lg bg-emerald-400/10 p-3 text-sm text-emerald-200">{message}</p>}
          {error && <p className="rounded-lg bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}

          {!initialToken && (
            <>
              <div className="space-y-2">
                <Label htmlFor="verification-email" className="text-slate-200">Email address</Label>
                <Input id="verification-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="border-white/10 bg-white text-slate-950" placeholder="you@example.com" />
              </div>
              <Button className="w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300" onClick={resend} disabled={busy || !email}>
                {busy ? 'Sending…' : 'Resend verification email'}
              </Button>
            </>
          )}

          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <ShieldCheck className="h-4 w-4 text-cyan-300" />
            Verification links expire after 30 minutes.
          </div>
          <Button asChild variant="outline" className="w-full border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <Link href="/">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#04111f]" />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
