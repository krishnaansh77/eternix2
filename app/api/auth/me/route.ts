import { NextResponse } from 'next/server'
import { pool, type DbUser } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 })
  }

  const result = await pool.query<DbUser>(
    'SELECT id, name, email, role FROM app_users WHERE id = $1',
    [session.sub],
  )
  const user = result.rows[0]
  if (!user) {
    return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 })
  }

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role })
}
