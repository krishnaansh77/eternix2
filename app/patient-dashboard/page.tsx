"use client"

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import {
  Activity,
  AlertTriangle,
  Bell,
  Brain,
  CheckCircle2,
  ClipboardList,
  FileImage,
  FileText,
  HeartPulse,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  UploadCloud,
  UserCircle2,
} from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { apiRequest, getDoctors, getPatientRelationships, requestDoctorConnection, type AccountUser, type Relationship } from "@/lib/api"

type ReportKind = "cbc" | "dengue" | "typhoid" | "imaging" | "other"
type ImagingKind = "xray" | "ct" | "mri"

type PatientReport = {
  id: string
  title: string
  type: string
  fileName: string
  date: string
  status: "tracking" | "reviewed" | "flagged"
}

const reportTypeLabels: Record<ReportKind, string> = {
  cbc: "CBC report",
  dengue: "Dengue report",
  typhoid: "Typhoid report",
  imaging: "Imaging report",
  other: "Other report",
}

const imagingLabels: Record<ImagingKind, string> = {
  xray: "X-ray",
  ct: "CT scan",
  mri: "MRI",
}

type ApiReport = {
  id: string
  reportType: string
  originalFileName: string
  uploadDate: string
  status: "PENDING" | "PREDICTED" | "CONFIRMED" | "CORRECTED"
}

function toPatientReport(report: ApiReport): PatientReport {
  return {
    id: report.id,
    title: report.reportType === "CBC" ? "CBC report" : `${report.reportType} report`,
    type: report.reportType,
    fileName: report.originalFileName,
    date: new Date(report.uploadDate).toLocaleDateString(),
    status: report.status === "PREDICTED" ? "flagged" : report.status === "PENDING" ? "tracking" : "reviewed",
  }
}

export default function PatientDashboardPage() {
  const { user, signOut } = useAuth()
  const [reports, setReports] = useState<PatientReport[]>([])
  const [reportKind, setReportKind] = useState<ReportKind>("cbc")
  const [imagingKind, setImagingKind] = useState<ImagingKind>("xray")
  const [reportTitle, setReportTitle] = useState("")
  const [fileName, setFileName] = useState("")
  const [activeTab, setActiveTab] = useState("upload")
  const [doctors, setDoctors] = useState<AccountUser[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [connectionMessage, setConnectionMessage] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    apiRequest<ApiReport[]>("/api/reports/mine")
      .then((items) => setReports(items.map(toPatientReport)))
      .catch(() => setReports([]))
    getDoctors().then(setDoctors).catch(() => setDoctors([]))
    getPatientRelationships().then(setRelationships).catch(() => setRelationships([]))
  }, [])

  const warnings = useMemo(() => {
    const latest = reports[0]

    if (!latest || latest.status !== "flagged") return []
    return [{
      title: `${latest.title} is awaiting clinical review`,
      detail: "A clinician can review this stored report after accepting your connection request.",
      tone: "default" as const,
    }]
  }, [reports])

  const trackedCount = reports.filter((report) => report.status === "tracking").length

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.files?.[0]?.name ?? "")
  }

  const handleUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setConnectionMessage("CBC submission and analysis will be connected in the next phase. No report was saved from this form yet.")
  }

  const connectDoctor = async (doctorId: string) => {
    setIsConnecting(true)
    setConnectionMessage("")
    try {
      const relationship = await requestDoctorConnection(doctorId)
      setRelationships((current) => [relationship, ...current.filter((item) => item.doctor.id !== doctorId)])
      setConnectionMessage("Connection request sent. Your doctor must accept before they can access your records.")
    } catch (connectionError) {
      setConnectionMessage(connectionError instanceof Error ? connectionError.message : "Unable to send the connection request.")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#f1f8f5_52%,#fbfcff_100%)] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/88 px-4 backdrop-blur-xl lg:px-8">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Aarogyam AI
              </p>
              <p className="text-sm text-slate-500">Patient dashboard</p>
            </div>
          </div>

          <div className="hidden h-10 w-full max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500 md:flex">
            <Search className="h-4 w-4" />
            <span>Search reports, warnings, health track</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-600 p-0 text-[10px]">
                {warnings.length}
              </Badge>
            </Button>
            <Button variant="ghost" className="hidden gap-2 sm:flex">
              <UserCircle2 className="h-5 w-5" />
              {user?.name ?? "Patient"}
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  HealthTrack AI active
                </Badge>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                  Hello, {user?.name ?? "Patient"}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Your reports, tracking signals, and warnings are organized in one calm workspace.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-2xl font-semibold">{reports.length}</p>
                  <p className="text-xs text-slate-500">Reports</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-2xl font-semibold">{trackedCount}</p>
                  <p className="text-xs text-slate-500">Tracking</p>
                </div>
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-2xl font-semibold text-red-700">{warnings.length}</p>
                  <p className="text-xs text-red-700">Warnings</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Health score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <span className="text-4xl font-semibold">—</span>
                <Badge variant="outline">CBC module pending</Badge>
              </div>
              <Progress value={0} className="h-3 bg-emerald-100" />
              <p className="text-sm text-slate-600">
                A health score will only appear after a real CBC analysis is available.
              </p>
            </CardContent>
          </Card>
        </section>

        <Card className="mt-6 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-600" />Your care connections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {connectionMessage && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{connectionMessage}</p>}
            {relationships.length > 0 && <div className="space-y-2">{relationships.map((relationship) => <div key={relationship.id} className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm font-medium">{relationship.doctor.name}</span><Badge variant="outline">{relationship.status.toLowerCase()}</Badge></div>)}</div>}
            {doctors.length === 0 ? <p className="text-sm text-muted-foreground">No doctors are available yet.</p> : <div className="flex flex-wrap gap-2">{doctors.filter((doctor) => !relationships.some((relationship) => relationship.doctor.id === doctor.id && relationship.status !== "REJECTED")).map((doctor) => <Button key={doctor.id} variant="outline" size="sm" disabled={isConnecting} onClick={() => void connectDoctor(doctor.id)}>Request {doctor.name}</Button>)}</div>}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6 gap-4">
          <TabsList className="grid h-auto w-full grid-cols-3 rounded-lg bg-white p-1 shadow-sm md:w-[620px]">
            <TabsTrigger value="upload" className="gap-2 py-2">
              <UploadCloud className="h-4 w-4" />
              Store reports
            </TabsTrigger>
            <TabsTrigger value="track" className="gap-2 py-2">
              <Activity className="h-4 w-4" />
              HealthTrack
            </TabsTrigger>
            <TabsTrigger value="warnings" className="gap-2 py-2">
              <AlertTriangle className="h-4 w-4" />
              Warnings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-emerald-600" />
                    Upload report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleUpload}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Report type</Label>
                        <Select value={reportKind} onValueChange={(value) => setReportKind(value as ReportKind)}>
                          <SelectTrigger className="h-11 w-full bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cbc">CBC report</SelectItem>
                            <SelectItem value="dengue">Dengue report</SelectItem>
                            <SelectItem value="typhoid">Typhoid report</SelectItem>
                            <SelectItem value="imaging">Imaging report</SelectItem>
                            <SelectItem value="other">Other report</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {reportKind === "imaging" && (
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Imaging type</Label>
                          <Select value={imagingKind} onValueChange={(value) => setImagingKind(value as ImagingKind)}>
                            <SelectTrigger className="h-11 w-full bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="xray">X-ray</SelectItem>
                              <SelectItem value="ct">CT scan</SelectItem>
                              <SelectItem value="mri">MRI</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="report-title">Report name</Label>
                        <Input
                          id="report-title"
                          value={reportTitle}
                          onChange={(event) => setReportTitle(event.target.value)}
                          placeholder={reportKind === "other" ? "Allergy panel, biopsy, discharge summary" : reportTypeLabels[reportKind]}
                          className="h-11 bg-white"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="report-file">Report file</Label>
                        <Input
                          id="report-file"
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                          onChange={handleFileChange}
                          className="h-11 cursor-pointer bg-white pt-2"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="h-11 w-full bg-emerald-600 hover:bg-emerald-700">
                      <UploadCloud className="h-4 w-4" />
                      Save when CBC is available
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    Stored medical reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reports.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No medical reports are stored in your account yet.</p>}
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                          {report.type.includes("scan") || report.type.includes("X-ray") ? (
                            <FileImage className="h-5 w-5" />
                          ) : (
                            <ClipboardList className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{report.title}</p>
                          <p className="text-sm text-slate-500">{report.fileName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={report.status === "flagged" ? "destructive" : "secondary"}
                          className={cn(report.status === "tracking" && "bg-emerald-100 text-emerald-800")}
                        >
                          {report.status}
                        </Badge>
                        <span className="text-sm text-slate-500">{report.date}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="track">
            <Card className="border-slate-200 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-emerald-600" />CBC tracking</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">Longitudinal CBC trends will appear here after the real CBC module is connected. No health score or trend is shown until then.</p></CardContent></Card>
          </TabsContent>

          <TabsContent value="warnings">
            <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
              <div className="space-y-3">
                {warnings.length === 0 && <Alert className="border-slate-200 bg-white"><CheckCircle2 className="h-4 w-4" /><AlertTitle>No current report warnings</AlertTitle><AlertDescription>Warnings are created only from real stored report results.</AlertDescription></Alert>}
                {warnings.map((warning) => (
                  <Alert
                    key={warning.title}
                    variant={warning.tone === "destructive" ? "destructive" : "default"}
                    className="border-slate-200 bg-white"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{warning.title}</AlertTitle>
                    <AlertDescription>{warning.detail}</AlertDescription>
                  </Alert>
                ))}
              </div>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    Tracking status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reports.slice(0, 4).map((report) => (
                    <div key={report.id} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{report.title}</p>
                        <p className="text-xs text-slate-500">{report.type}</p>
                      </div>
                      <Badge variant={report.status === "flagged" ? "destructive" : "outline"}>
                        {report.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
