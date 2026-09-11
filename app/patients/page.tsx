"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Brain, CheckCircle2, Search, UserRound } from "lucide-react"
import { getConnectedPatients, type AccountUser } from "@/lib/api"

export default function PatientsPage() {
  const [patients, setPatients] = useState<AccountUser[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getConnectedPatients()
      .then(setPatients)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load connected patients."))
      .finally(() => setLoading(false))
  }, [])

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return patients
    return patients.filter((patient) =>
      [patient.name, patient.email, patient.id].some((value) => value.toLowerCase().includes(query))
    )
  }, [patients, search])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
            <p className="text-muted-foreground">Patients who have granted your practice access to their records.</p>
          </div>
          <Badge variant="outline" className="w-fit gap-2 px-3 py-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-chart-2" />
            {patients.length} active connection{patients.length === 1 ? "" : "s"}
          </Badge>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search connected patients by name, email, or ID..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Authorized patient records</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading connected patients…</p>}
            {!loading && error && <p className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}
            {!loading && !error && filteredPatients.length === 0 && (
              <div className="py-10 text-center">
                <UserRound className="mx-auto h-8 w-8 text-muted-foreground/60" />
                <p className="mt-3 font-medium">No connected patients yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Patients must request access and you must accept before their records appear here.</p>
              </div>
            )}
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary">{patient.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                  <div><p className="font-medium">{patient.name}</p><p className="text-sm text-muted-foreground">{patient.email}</p><p className="mt-1 text-xs text-muted-foreground">ID: {patient.id}</p></div>
                </div>
                <Button asChild className="gap-2"><Link href={`/patients/${patient.id}`}><Brain className="h-4 w-4" />Open record</Link></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
