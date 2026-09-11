import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { pool, type DbUser } from '@/lib/db'
import { createSession } from '@/lib/session'

export async function POST(request: Request) {
  let body: { email?: string; password?: string; remember?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const password = body.password

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 })
  }

  const result = await pool.query<DbUser>('SELECT * FROM app_users WHERE email = $1', [email])
  const user = result.rows[0]

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 })
  }

  await createSession({ sub: user.id, email: user.email, role: user.role }, Boolean(body.remember))

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
}
