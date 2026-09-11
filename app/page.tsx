"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Check, Clock3, Users, X } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { decideConnection, getConnectedPatients, getPendingConnectionRequests, type AccountUser, type Relationship } from "@/lib/api"

export default function DashboardPage() {
  const { isReady, user } = useAuth()
  const router = useRouter()
  const [patients, setPatients] = useState<AccountUser[]>([])
  const [pendingRequests, setPendingRequests] = useState<Relationship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    if (!isReady || user?.role !== "DOCTOR") return
    setLoading(true)
    setError("")
    try {
      const [connectedPatients, requests] = await Promise.all([
        getConnectedPatients(),
        getPendingConnectionRequests(),
      ])
      setPatients(connectedPatients)
      setPendingRequests(requests)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load your practice data.")
    } finally {
      setLoading(false)
    }
  }, [isReady, user?.role])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    if (isReady && user?.role === "PATIENT") router.replace("/patient-dashboard")
  }, [isReady, router, user?.role])

  if (!isReady || user?.role === "PATIENT") {
    return <div className="min-h-screen bg-background" />
  }

  async function handleDecision(relationshipId: string, accepted: boolean) {
    setUpdatingId(relationshipId)
    setError("")
    try {
      await decideConnection(relationshipId, accepted)
      await loadDashboard()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update the connection request.")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name ?? "Doctor"}. Here&apos;s your practice overview.
          </p>
        </div>

        {error && (
          <Card className="border-destructive/50">
            <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "—" : patients.length}</div>
              <p className="text-xs text-muted-foreground">Patients who have approved your access</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connection requests</CardTitle>
              <Clock3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "—" : pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting your decision</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connection requests</CardTitle>
            <CardDescription>Patients choose whether to share their records with you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading connection requests…</p>
            ) : pendingRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">There are no pending patient connection requests.</p>
            ) : pendingRequests.map((relationship) => (
              <div key={relationship.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{relationship.patient.name}</p>
                  <p className="text-sm text-muted-foreground">{relationship.patient.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => void handleDecision(relationship.id, true)} disabled={updatingId === relationship.id}>
                    <Check className="h-4 w-4" /> Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void handleDecision(relationship.id, false)} disabled={updatingId === relationship.id}>
                    <X className="h-4 w-4" /> Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your patients</CardTitle>
            <CardDescription>Only patients with an active connection are visible here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading patients…</p>
            ) : patients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No patients have connected with you yet.</p>
            ) : patients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">{patient.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Connected</Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/patients/${patient.id}`}>Open record</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
