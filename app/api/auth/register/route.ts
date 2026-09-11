import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { pool } from '@/lib/db'

export async function POST(request: Request) {
  let body: { name?: string; email?: string; password?: string; role?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 })
  }

  const name = body.name?.trim()
  const email = body.email?.trim().toLowerCase()
  const password = body.password
  const role = body.role

  if (!name || !email || !password || (role !== 'DOCTOR' && role !== 'PATIENT')) {
    return NextResponse.json({ message: 'Please provide a name, email, password, and valid role.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ message: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const existing = await pool.query('SELECT id FROM app_users WHERE email = $1', [email])
  if (existing.rowCount && existing.rowCount > 0) {
    return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  // Accounts are auto-verified in this preview build so users can sign in immediately.
  await pool.query(
    'INSERT INTO app_users (name, email, password_hash, role, email_verified) VALUES ($1, $2, $3, $4, TRUE)',
    [name, email, passwordHash, role],
  )

  return NextResponse.json({ message: 'Account created. You can now sign in.' })
}
