import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'PATIENT') return NextResponse.json({ message: 'Only patients can view doctors.' }, { status: 403 })

  const result = await pool.query(
    `SELECT id, name, email, role FROM app_users WHERE role = 'DOCTOR' ORDER BY name ASC`,
  )
  return NextResponse.json(result.rows)
}
