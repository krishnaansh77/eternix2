import { Pool } from 'pg'

const globalForDb = globalThis as unknown as { __aarogyamPool?: Pool }

export const pool =
  globalForDb.__aarogyamPool ??
  new Pool({ connectionString: process.env.DATABASE_URL })

if (!globalForDb.__aarogyamPool) globalForDb.__aarogyamPool = pool

export type DbUser = {
  id: string
  name: string
  email: string
  password_hash: string
  role: 'DOCTOR' | 'PATIENT'
  email_verified: boolean
}
