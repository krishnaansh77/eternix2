import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/session'

const relationshipSelect = `SELECT r.id, r.status,
  json_build_object('id', d.id, 'name', d.name, 'email', d.email, 'role', d.role) AS doctor,
  json_build_object('id', p.id, 'name', p.name, 'email', p.email, 'role', p.role) AS patient
  FROM app_relationships r
  JOIN app_users d ON d.id = r.doctor_user_id
  JOIN app_users p ON p.id = r.patient_user_id`

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const result = await pool.query(`${relationshipSelect} WHERE r.doctor_user_id = $1 AND r.status = 'PENDING' ORDER BY r.created_at DESC`, [session.sub])
  return NextResponse.json(result.rows)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'PATIENT') return NextResponse.json({ message: 'Only patients can request a doctor connection.' }, { status: 403 })
  const body = await request.json().catch(() => null)
  const doctorUserId = typeof body?.doctorUserId === 'string' ? body.doctorUserId : ''
  if (!doctorUserId) return NextResponse.json({ message: 'A doctor is required.' }, { status: 400 })
  const doctor = await pool.query(`SELECT id FROM app_users WHERE id = $1 AND role = 'DOCTOR'`, [doctorUserId])
  if (doctor.rowCount === 0) return NextResponse.json({ message: 'Doctor not found.' }, { status: 404 })
  const result = await pool.query(`${relationshipSelect} WHERE r.id = $1`, [
    (await pool.query(`INSERT INTO app_relationships (doctor_user_id, patient_user_id) VALUES ($1, $2) ON CONFLICT (doctor_user_id, patient_user_id) DO UPDATE SET status = CASE WHEN app_relationships.status = 'REJECTED' THEN 'PENDING' ELSE app_relationships.status END, updated_at = now() RETURNING id`, [doctorUserId, session.sub])).rows[0].id,
  ])
  return NextResponse.json(result.rows[0], { status: 201 })
}
