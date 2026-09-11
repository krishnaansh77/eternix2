import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const result = await pool.query(
    `SELECT id, name, email, role FROM app_users WHERE id = $1`,
    [id],
  )
  const user = result.rows[0]
  if (!user) return NextResponse.json({ message: 'User not found.' }, { status: 404 })
  if (user.id !== session.sub) {
    const relationship = await pool.query(
      `SELECT id FROM app_relationships
       WHERE ((doctor_user_id = $1 AND patient_user_id = $2) OR (doctor_user_id = $2 AND patient_user_id = $1))
       AND status = 'ACTIVE'`,
      [session.sub, id],
    )
    if (relationship.rowCount === 0) return NextResponse.json({ message: 'You do not have access to this record.' }, { status: 403 })
  }
  return NextResponse.json(user)
}
