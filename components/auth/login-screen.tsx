'use client'

import { useRef, useState, type CSSProperties, type FormEvent, type MouseEvent as ReactMouseEvent } from 'react'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, HeartPulse, ScanHeart, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react'

import { Login3DScene } from '@/components/auth/login-3d-scene'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type LoginScreenProps = {
  onSignIn: (payload: {
    email: string
    password: string
    remember: boolean
  }) => Promise<void>
}

const featureCards = [
  {
    icon: ShieldCheck,
    title: 'Secure care access',
    detail: 'A single front door for doctors and patients across the care journey.',
    tone: 'text-cyan-300',
  },
  {
    icon: ScanHeart,
    title: 'Live health oversight',
    detail: 'Move quickly into alerts, reports, diagnostics, or personal tracking.',
    tone: 'text-teal-300',
  },
  {
    icon: BadgeCheck,
    title: 'Built for clarity',
    detail: 'Create a free account or sign in to access your care workspace.',
    tone: 'text-sky-300',
  },
]

export function LoginScreen({ onSignIn }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [accountType, setAccountType] = useState<'doctor' | 'patient'>('doctor')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await onSignIn({ email, password, remember })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePointerMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100

    containerRef.current?.style.setProperty('--login-pointer-x', `${x}%`)
    containerRef.current?.style.setProperty('--login-pointer-y', `${y}%`)
  }

  const handlePointerLeave = () => {
    containerRef.current?.style.setProperty('--login-pointer-x', '50%')
    containerRef.current?.style.setProperty('--login-pointer-y', '32%')
  }

  return (
    <div
      ref={containerRef}
      className="relative isolate min-h-screen overflow-hidden bg-[#04111f]"
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      style={
        {
          '--login-pointer-x': '50%',
          '--login-pointer-y': '32%',
        } as CSSProperties
      }
    >
      <Login3DScene />
      <div className="absolute inset-0 z-10 opacity-80 [background:radial-gradient(circle_at_var(--login-pointer-x)_var(--login-pointer-y),rgba(34,211,238,0.08),transparent_14%),linear-gradient(90deg,rgba(4,17,31,0.46)_0%,rgba(4,17,31,0.2)_34%,rgba(4,17,31,0.1)_58%,rgba(4,17,31,0.34)_100%)]" />
      <div className="absolute inset-0 z-10 bg-[linear-gradient(to_bottom,rgba(4,17,31,0.16),rgba(4,17,31,0.03)_28%,rgba(4,17,31,0.22)_100%)]" />

      <div className="relative z-20 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 shadow-[0_20px_45px_-24px_rgba(34,211,238,0.55)] ring-1 ring-cyan-300/15 backdrop-blur-sm">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-100/80">
                Aarogyam AI
              </p>
              <p className="text-sm text-slate-400">
                Clinical intelligence portal
              </p>
            </div>
          </div>

          <Link href="/signup">
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 text-slate-200 backdrop-blur-md hover:bg-white/10"
            >
              <Sparkles className="h-4 w-4" />
              Sign up
            </Button>
          </Link>
        </header>

        <main className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1.12fr_0.88fr] xl:gap-14">
          <section className="max-w-[38rem] space-y-7 lg:pr-6 xl:pr-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/5 px-4 py-2 text-sm text-cyan-50/75 shadow-sm backdrop-blur-md">
              <HeartPulse className="h-4 w-4 text-cyan-300" />
              Protected doctor and patient workspace
            </div>

            <div className="space-y-5">
              <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Welcome back. Your care workspace is ready.
              </h1>
              <p className="max-w-[34rem] text-lg leading-8 text-slate-300">
                Sign in to review alerts, reports, and AI insights from one
                secure workspace designed to feel calm, fast, and trustworthy from
                the very first screen.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {featureCards.map((card, index) => (
                <div
                  key={card.title}
                  className="login-panel rounded-[1.25rem] border border-white/6 bg-[#0c1724]/84 p-5 shadow-[0_24px_70px_-36px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                  style={{ animationDelay: `${index * 140}ms` }}
                >
                  <card.icon className={`h-5 w-5 ${card.tone}`} />
                  <p className="mt-4 text-sm font-medium text-white">
                    {card.title}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {card.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-6 text-sm text-slate-500">
              Free accounts are securely stored in the Aarogyam database.
            </div>
          </section>

          <section className="lg:justify-self-end lg:w-full lg:max-w-[29rem] xl:max-w-[30rem]">
            <Card className="login-panel border-white/8 bg-[#121926]/78 py-0 shadow-[0_30px_100px_-45px_rgba(0,0,0,0.75)] backdrop-blur-xl">
              <CardHeader className="space-y-2 px-7 pt-7">
                <div className="flex items-center gap-8 text-sm">
                  <span className="rounded-full bg-cyan-400 px-4 py-1 font-medium text-slate-950">
                    Sign in
                  </span>
                  <span className="text-slate-400">Sign up</span>
                </div>
                <CardTitle className="pt-4 text-2xl text-white">
                  Welcome back
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Sign in with your registered Aarogyam account.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-7 pb-7">
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/8 bg-white/5 p-1">
                    {(['doctor', 'patient'] as const).map((type) => {
                      const isSelected = accountType === type

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAccountType(type)}
                          className={cn(
                            'h-11 rounded-lg text-sm font-medium transition-colors',
                            isSelected
                              ? 'bg-cyan-400 text-slate-950 shadow-sm'
                              : 'text-slate-300 hover:bg-white/8 hover:text-white',
                          )}
                        >
                          {type === 'doctor' ? 'Login as doctor' : 'Login as patient'}
                        </button>
                      )
                    })}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-12 border-white/8 bg-white text-slate-900"
                      placeholder={accountType === 'doctor' ? 'doctor@hospital.org' : 'patient@email.com'}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-12 border-white/8 bg-white text-slate-900"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <label className="flex items-center gap-3 text-sm text-slate-400">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="h-4 w-4 rounded border-cyan-300/20 text-cyan-400 focus:ring-cyan-500"
                    />
                    Keep me signed in on this device
                  </label>

                  <Button
                    type="submit"
                    size="lg"
                    className="relative h-12 w-full overflow-hidden rounded-xl bg-[linear-gradient(135deg,#22d3ee,#2dd4bf)] text-slate-950 shadow-[0_20px_50px_-24px_rgba(34,211,238,0.55)] hover:opacity-95"
                  >
                    <span className="login-button-sheen absolute inset-y-0 left-[-35%] w-1/3 -skew-x-12 bg-white/25" />
                    {isSubmitting ? 'Signing in…' : `Enter ${accountType === 'doctor' ? 'doctor' : 'patient'} dashboard`}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>

                {error && <p className="mt-4 rounded-lg bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</p>}

                <div className="mt-6 flex items-center justify-between gap-4 text-xs text-slate-500">
                  <span>Free protected API session</span>
                  <Link href="/signup" className="font-medium text-cyan-300 hover:text-cyan-200">
                    Create account
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  )
}
