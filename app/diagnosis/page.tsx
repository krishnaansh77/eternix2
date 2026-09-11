"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Brain } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DiagnosisInputPanel, type CbcPatient, type DiagnosisInputData } from "@/components/diagnosis/diagnosis-input-panel"
import { DiagnosisOutputPanel } from "@/components/diagnosis/diagnosis-output-panel"
import { CbcAssessmentResult } from "@/components/diagnosis/cbc-assessment-result"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getConnectedPatients } from "@/lib/api"
import type { CbcAssessmentResponse } from "@/lib/cbc-assessment"

function DiagnosisPageContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const requestedPatientId = searchParams.get("patient")
  const [patients, setPatients] = useState<CbcPatient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<CbcPatient | null>(null)
  const [cbcResult, setCbcResult] = useState<CbcAssessmentResponse | null>(null)
  const [cbcLoadingMessage, setCbcLoadingMessage] = useState<string | null>(null)
  const [loadError, setLoadError] = useState("")
  const [comingSoon, setComingSoon] = useState("")

  useEffect(() => {
    if (!user) return
    if (user.role === "PATIENT") {
      const self = { id: user.id, name: user.name }
      setPatients([self])
      setSelectedPatient(self)
      return
    }
    getConnectedPatients()
      .then((items) => {
        const nextPatients = items.map(({ id, name }) => ({ id, name }))
        setPatients(nextPatients)
        setSelectedPatient(nextPatients.find((patient) => patient.id === requestedPatientId) ?? null)
      })
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : "Unable to load authorized patients.")
      })
  }, [requestedPatientId, user])

  function handlePatientSelect(patientId: string) {
    setSelectedPatient(patients.find((patient) => patient.id === patientId) ?? null)
    setCbcResult(null)
    setCbcLoadingMessage(null)
    setComingSoon("")
  }

  function handleUnavailableModule(_data: DiagnosisInputData) {
    setCbcResult(null)
    setComingSoon("This AI module is currently under development and will be available in a future version.")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">AI Diagnosis</h1>
              <p className="text-muted-foreground">CBC AI assessment is available for authorized patient records.</p>
            </div>
          </div>

          {user?.role === "DOCTOR" && (
            <div className="flex items-center gap-3">
              <Label htmlFor="patient-select" className="shrink-0">Patient:</Label>
              <Select value={selectedPatient?.id ?? ""} onValueChange={handlePatientSelect}>
                <SelectTrigger id="patient-select" className="w-[250px]"><SelectValue placeholder="Select an authorized patient" /></SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => <SelectItem key={patient.id} value={patient.id}>{patient.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {loadError && <Alert variant="destructive"><AlertTitle>Unable to load patients</AlertTitle><AlertDescription>{loadError}</AlertDescription></Alert>}
        {comingSoon && <Alert><AlertTitle>Coming Soon</AlertTitle><AlertDescription>{comingSoon}</AlertDescription></Alert>}

        <div className="grid gap-6 lg:grid-cols-2">
          <DiagnosisInputPanel
            patient={selectedPatient}
            onRunDiagnosis={handleUnavailableModule}
            isAnalyzing={false}
            onCbcResult={(assessment) => {
              setCbcResult(assessment)
              if (assessment) setComingSoon("")
            }}
            onCbcLoadingChange={setCbcLoadingMessage}
          />

          <div className={cbcResult && !cbcLoadingMessage ? "lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto lg:pr-1" : undefined}>
            {cbcResult && !cbcLoadingMessage ? (
              <CbcAssessmentResult assessment={cbcResult} />
            ) : (
              <DiagnosisOutputPanel result={null} isAnalyzing={Boolean(cbcLoadingMessage)} analyzingLabel={cbcLoadingMessage ?? undefined} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function DiagnosisPage() {
  return <Suspense fallback={<div>Loading...</div>}><DiagnosisPageContent /></Suspense>
}
