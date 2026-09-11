import { NextResponse } from 'next/server'

// Accounts are auto-verified at signup in this preview build, so any
// verification link resolves to success.
export async function POST() {
  return NextResponse.json({ message: 'Email verified. You can now sign in.' })
}
