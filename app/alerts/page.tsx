"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertTriangle,
  Heart,
  Activity,
  Brain,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Bell,
  BellOff,
  Filter,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type AlertType = "critical" | "high-risk" | "abnormal-vitals" | "low-confidence" | "follow-up"
type AlertStatus = "active" | "acknowledged" | "resolved"

interface Alert {
  id: string
  type: AlertType
  status: AlertStatus
  patientId: string
  patientName: string
  patientAvatar?: string
  title: string
  description: string
  timestamp: string
  data?: Record<string, string | number>
}

const mockAlerts: Alert[] = [
  {
    id: "a1",
    type: "critical",
    status: "active",
    patientId: "1",
    patientName: "John Smith",
    title: "Critical Heart Rate Detected",
    description: "Patient's heart rate has exceeded 150 BPM for over 10 minutes",
    timestamp: "2024-01-15T10:30:00",
    data: { heartRate: 158, duration: "12 min" },
  },
  {
    id: "a2",
    type: "high-risk",
    status: "active",
    patientId: "3",
    patientName: "Michael Chen",
    title: "High-Risk Patient Alert",
    description: "Patient has multiple risk factors requiring immediate attention",
    timestamp: "2024-01-15T09:45:00",
    data: { riskScore: 8.5, factors: "3" },
  },
  {
    id: "a3",
    type: "abnormal-vitals",
    status: "active",
    patientId: "2",
    patientName: "Sarah Johnson",
    title: "Abnormal Blood Pressure",
    description: "Systolic blood pressure reading above normal range",
    timestamp: "2024-01-15T09:15:00",
    data: { systolic: 165, diastolic: 95 },
  },
  {
    id: "a4",
    type: "low-confidence",
    status: "acknowledged",
    patientId: "4",
    patientName: "Emily Davis",
    title: "Low Confidence AI Diagnosis",
    description: "AI diagnosis confidence below threshold - manual review required",
    timestamp: "2024-01-15T08:30:00",
    data: { confidence: "62%", diagnosis: "Arrhythmia" },
  },
  {
    id: "a5",
    type: "follow-up",
    status: "active",
    patientId: "5",
    patientName: "Robert Wilson",
    title: "Follow-up Reminder",
    description: "Scheduled follow-up appointment is overdue",
    timestamp: "2024-01-14T16:00:00",
    data: { daysPast: 3 },
  },
  {
    id: "a6",
    type: "critical",
    status: "resolved",
    patientId: "6",
    patientName: "Lisa Anderson",
    title: "Oxygen Saturation Critical",
    description: "SpO2 levels dropped below 90%",
    timestamp: "2024-01-14T14:20:00",
    data: { spo2: "88%", resolved: "Oxygen administered" },
  },
  {
    id: "a7",
    type: "abnormal-vitals",
    status: "acknowledged",
    patientId: "1",
    patientName: "John Smith",
    title: "Temperature Spike",
    description: "Patient temperature elevated above 38.5°C",
    timestamp: "2024-01-14T11:45:00",
    data: { temperature: "39.1°C" },
  },
]

const alertTypeConfig: Record<AlertType, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  critical: {
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    label: "Critical",
  },
  "high-risk": {
    icon: Heart,
    color: "text-warning",
    bgColor: "bg-warning/10",
    label: "High Risk",
  },
  "abnormal-vitals": {
    icon: Activity,
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    label: "Abnormal Vitals",
  },
  "low-confidence": {
    icon: Brain,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    label: "Low Confidence",
  },
  "follow-up": {
    icon: Clock,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "Follow-up",
  },
}

const statusConfig: Record<AlertStatus, { icon: React.ElementType; color: string; label: string }> = {
  active: { icon: Bell, color: "text-destructive", label: "Active" },
  acknowledged: { icon: Clock, color: "text-warning", label: "Acknowledged" },
  resolved: { icon: CheckCircle, color: "text-success", label: "Resolved" },
}

function AlertCard({ alert, onAcknowledge, onResolve, onViewPatient }: {
  alert: Alert
  onAcknowledge: (id: string) => void
  onResolve: (id: string) => void
  onViewPatient: (patientId: string) => void
}) {
  const typeConfig = alertTypeConfig[alert.type]
  const TypeIcon = typeConfig.icon
  const StatusIcon = statusConfig[alert.status].icon

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase()
  }

  return (
    <Card className={`${alert.status === "active" && alert.type === "critical" ? "border-destructive/50 bg-destructive/5" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Alert Type Icon */}
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${typeConfig.bgColor}`}>
            <TypeIcon className={`h-5 w-5 ${typeConfig.color}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{alert.title}</h3>
                  <Badge
                    variant={alert.status === "active" ? "destructive" : alert.status === "acknowledged" ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {statusConfig[alert.status].label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(alert.timestamp).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Patient Info */}
            <div className="flex items-center gap-2 mt-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={alert.patientAvatar} />
                <AvatarFallback className="text-xs">{getInitials(alert.patientName)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{alert.patientName}</span>
            </div>

            {/* Data Pills */}
            {alert.data && (
              <div className="flex flex-wrap gap-2 mt-3">
                {Object.entries(alert.data).map(([key, value]) => (
                  <div key={key} className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs">
                    <span className="text-muted-foreground capitalize">{key}:</span>
                    <span className="ml-1 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4">
              {alert.status === "active" && (
                <>
                  <Button size="sm" variant="outline" onClick={() => onAcknowledge(alert.id)}>
                    Acknowledge
                  </Button>
                  <Button size="sm" onClick={() => onResolve(alert.id)}>
                    Resolve
                  </Button>
                </>
              )}
              {alert.status === "acknowledged" && (
                <Button size="sm" onClick={() => onResolve(alert.id)}>
                  Mark Resolved
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => onViewPatient(alert.patientId)}>
                View Patient
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AlertsPage() {
  const router = useRouter()
  const [alerts, setAlerts] = useState(mockAlerts)
  const [activeTab, setActiveTab] = useState("all")

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, status: "acknowledged" as AlertStatus } : alert
      )
    )
  }

  const handleResolve = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, status: "resolved" as AlertStatus } : alert
      )
    )
  }

  const handleViewPatient = (patientId: string) => {
    router.push(`/patients/${patientId}`)
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === "all") return true
    if (activeTab === "active") return alert.status === "active"
    if (activeTab === "acknowledged") return alert.status === "acknowledged"
    if (activeTab === "resolved") return alert.status === "resolved"
    return alert.type === activeTab
  })

  const stats = {
    total: alerts.length,
    active: alerts.filter((a) => a.status === "active").length,
    critical: alerts.filter((a) => a.type === "critical" && a.status === "active").length,
    highRisk: alerts.filter((a) => a.type === "high-risk" && a.status === "active").length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
            <p className="text-muted-foreground">
              Monitor and respond to patient alerts and notifications
            </p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setActiveTab("critical")}>
                  <AlertTriangle className="mr-2 h-4 w-4 text-destructive" />
                  Critical Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("high-risk")}>
                  <Heart className="mr-2 h-4 w-4 text-warning" />
                  High Risk Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("abnormal-vitals")}>
                  <Activity className="mr-2 h-4 w-4 text-chart-1" />
                  Abnormal Vitals
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("all")}>
                  <Bell className="mr-2 h-4 w-4" />
                  Show All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="gap-2">
              <BellOff className="h-4 w-4" />
              Mute All
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Alerts</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Bell className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card className={stats.active > 0 ? "border-warning/50" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-warning/20 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-warning animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={stats.critical > 0 ? "border-destructive/50" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Risk</p>
                  <p className="text-2xl font-bold text-warning">{stats.highRisk}</p>
                </div>
                <Heart className="h-8 w-8 text-warning/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle>Alert List</CardTitle>
            <CardDescription>
              {filteredAlerts.length} alerts {activeTab !== "all" && `(${activeTab})`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">
                  Active
                  {stats.active > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      {stats.active}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {filteredAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-success mb-4" />
                    <h3 className="text-lg font-medium">No alerts</h3>
                    <p className="text-sm text-muted-foreground">
                      There are no alerts matching your current filter.
                    </p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onAcknowledge={handleAcknowledge}
                      onResolve={handleResolve}
                      onViewPatient={handleViewPatient}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
