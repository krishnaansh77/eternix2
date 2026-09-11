export type RiskLevel = "low" | "medium" | "high" | "critical"

export type Gender = "male" | "female" | "other"

export type ReportType = "ecg" | "xray" | "mri" | "lab"

export interface Patient {
  id: string
  name: string
  age: number
  gender: Gender
  avatar?: string
  lastVisit: string
  condition: string
  riskLevel: RiskLevel
  bloodPressure?: string
  heartRate?: number
  temperature?: number
  weight?: number
  height?: number
  bloodType?: string
  aadhar?: string
  notes?: string
  phone?: string
  email?: string
  address?: string
  medications?: Medication[]
  diagnoses?: Diagnosis[]
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
}

export interface Diagnosis {
  id: string
  patientId: string
  disease: string
  confidence: number
  severity: RiskLevel
  date: string
  notes?: string
  aiGenerated: boolean
  reportId?: string
  contributingFactors?: string[]
}

export interface Report {
  id: string
  patientId: string
  patientName: string
  type: ReportType
  title: string
  date: string
  fileUrl?: string
  thumbnailUrl?: string
  aiAnalyzed?: boolean
  analysisResult?: string
}

export interface Vital {
  label: string
  value: string | number
  unit: string
  status: "normal" | "warning" | "critical"
  trend?: "up" | "down" | "stable"
}

export interface TimelineEvent {
  id: string
  type: "visit" | "diagnosis" | "report" | "medication" | "note"
  title: string
  description: string
  date: string
  metadata?: Record<string, string | number>
}

export interface Alert {
  id: string
  type: "critical" | "warning" | "info"
  title: string
  message: string
  patientId?: string
  patientName?: string
  timestamp: string
  read: boolean
}

export interface DashboardStats {
  totalPatients: number
  activeCases: number
  criticalAlerts: number
  aiDiagnosesToday: number
  patientGrowth: number
  diagnosisAccuracy: number
}

export interface ChartData {
  name: string
  value: number
  [key: string]: string | number
}
