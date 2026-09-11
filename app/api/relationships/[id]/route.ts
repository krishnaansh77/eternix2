import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'DOCTOR') return NextResponse.json({ message: 'Only doctors can decide requests.' }, { status: 403 })
  const { id } = await params
  const body = await request.json().catch(() => null)
  const accepted = body?.accepted === true
  const result = await pool.query(`UPDATE app_relationships SET status = $1, updated_at = now() WHERE id = $2 AND doctor_user_id = $3 RETURNING id, status`, [accepted ? 'ACTIVE' : 'REJECTED', id, session.sub])
  if (result.rowCount === 0) return NextResponse.json({ message: 'Connection request not found.' }, { status: 404 })
  return NextResponse.json(result.rows[0])
}
