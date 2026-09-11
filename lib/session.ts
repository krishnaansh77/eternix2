import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const COOKIE_NAME = 'aarogyam_session'

// Falls back to DATABASE_URL so the app works in the v0 preview without an
// extra env var. Set AUTH_SECRET in production for a stable signing key.
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET ?? process.env.DATABASE_URL ?? 'aarogyam-dev-secret',
)

export type SessionPayload = {
  sub: string
  email: string
  role: 'DOCTOR' | 'PATIENT'
}

export async function createSession(payload: SessionPayload, remember: boolean) {
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24
  const token = await new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(secret)

  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    // The v0 preview renders the app in a cross-site iframe, so the session
    // cookie must be SameSite=None + Secure or the browser drops it.
    sameSite: 'none',
    secure: true,
    path: '/',
    maxAge,
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: payload.role as 'DOCTOR' | 'PATIENT',
    }
  } catch {
    return null
  }
}

export async function clearSession() {
  const store = await cookies()
  store.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
    maxAge: 0,
  })
}
