"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Brain, FileText, ShieldCheck } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPatient, apiRequest, type AccountUser } from "@/lib/api"

type PatientReport = { id: string; reportType: string; uploadDate: string; originalFileName: string; status: string }

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [patient, setPatient] = useState<AccountUser | null>(null)
  const [reports, setReports] = useState<PatientReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([getPatient(id), apiRequest<PatientReport[]>(`/api/reports/patient/${id}`)])
      .then(([nextPatient, nextReports]) => { setPatient(nextPatient); setReports(nextReports) })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load this patient record."))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button variant="ghost" asChild className="-ml-4 gap-2"><Link href="/patients"><ArrowLeft className="h-4 w-4" />Back to Patients</Link></Button>
        {loading && <p className="py-12 text-center text-muted-foreground">Loading authorized patient record…</p>}
        {!loading && error && <Card><CardContent className="p-6 text-destructive">{error}</CardContent></Card>}
        {!loading && patient && !error && <>
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 lg:flex-row lg:items-center lg:justify-between">
            <div><div className="flex items-center gap-3"><h1 className="text-2xl font-bold">{patient.name}</h1><Badge variant="outline" className="gap-1"><ShieldCheck className="h-3.5 w-3.5 text-chart-2" />Authorized</Badge></div><p className="mt-2 text-muted-foreground">{patient.email}</p><p className="mt-1 text-xs text-muted-foreground">Patient ID: {patient.id}</p></div>
            <Button asChild className="gap-2"><Link href={`/diagnosis?patient=${patient.id}`}><Brain className="h-4 w-4" />CBC tools</Link></Button>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Report history</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {reports.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No reports have been shared with your practice yet.</p> : reports.map((report) => <div key={report.id} className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{report.originalFileName}</p><p className="text-sm text-muted-foreground">{report.reportType} · {new Date(report.uploadDate).toLocaleDateString()}</p></div><Badge variant="outline">{report.status.toLowerCase()}</Badge></div>)}
            </CardContent>
          </Card>
        </>}
      </div>
    </DashboardLayout>
  )
}
