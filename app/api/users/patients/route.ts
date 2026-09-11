import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'DOCTOR') return NextResponse.json({ message: 'Only doctors can view connected patients.' }, { status: 403 })

  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.role
     FROM app_relationships r
     JOIN app_users u ON u.id = r.patient_user_id
     WHERE r.doctor_user_id = $1 AND r.status = 'ACTIVE'
     ORDER BY u.name ASC`,
    [session.sub],
  )
  return NextResponse.json(result.rows)
}
