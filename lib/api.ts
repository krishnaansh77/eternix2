export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)

  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })
  const body = await response.json().catch(() => null)

  if (!response.ok) throw new Error(body?.message ?? 'The request could not be completed.')
  return body as T
}

export function registerUser(input: { name: string; email: string; password: string; role: 'DOCTOR' | 'PATIENT' }) {
  return apiRequest<{ message: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export type AccountUser = {
  id: string
  name: string
  email: string
  role: 'DOCTOR' | 'PATIENT'
}

export type Relationship = {
  id: string
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'INACTIVE'
  doctor: AccountUser
  patient: AccountUser
}

export type Profile = AccountUser & {
  phone: string | null
  address: string | null
  specialization: string | null
  organization: string | null
}

export type CbcPredictionRecord = {
  reportId: string
  patientId: string
  createdAt: string
  predictedClass: string
  confidence: number | null
  severity: string
  probabilities: Record<string, number>
  contributingFeatures: Array<Record<string, unknown>>
  modelVersion: string
  assessment: Record<string, unknown>
}

export function getConnectedPatients() {
  return apiRequest<AccountUser[]>('/api/users/patients')
}

export function getPatient(id: string) {
  return apiRequest<AccountUser>(`/api/users/${id}`)
}

export function getDoctors() {
  return apiRequest<AccountUser[]>('/api/users/doctors')
}

export function getProfile() {
  return apiRequest<Profile>('/api/profile/me')
}

export function updateProfile(input: Partial<Pick<Profile, 'name' | 'phone' | 'address' | 'specialization' | 'organization'>>) {
  return apiRequest<Profile>('/api/profile/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function getPatientRelationships() {
  return apiRequest<Relationship[]>('/api/relationships/doctors')
}

export function requestDoctorConnection(doctorUserId: string) {
  return apiRequest<Relationship>('/api/relationships/requests', {
    method: 'POST',
    body: JSON.stringify({ doctorUserId }),
  })
}

export function getPendingConnectionRequests() {
  return apiRequest<Relationship[]>('/api/relationships/requests')
}

export function decideConnection(relationshipId: string, accepted: boolean) {
  return apiRequest<Relationship>(`/api/relationships/${relationshipId}`, {
    method: 'PATCH',
    body: JSON.stringify({ accepted }),
  })
}

export function parseCbcReport(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return apiRequest<Record<string, unknown>>('/api/cbc/parse-report', {
    method: 'POST',
    body: formData,
  })
}

export function predictCbc(input: Record<string, unknown>) {
  return apiRequest<CbcPredictionRecord>('/api/cbc/predict', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getCbcHistory(patientId?: string) {
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : ''
  return apiRequest<CbcPredictionRecord[]>(`/api/cbc/history${query}`)
}
