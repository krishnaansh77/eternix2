import { NextResponse } from 'next/server'

// Verification is automatic in this preview build; nothing needs to be resent.
export async function POST() {
  return NextResponse.json({ message: 'Your account is already verified. You can sign in.' })
}
