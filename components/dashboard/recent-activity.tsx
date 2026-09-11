"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, ArrowRight, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Patient, Diagnosis, RiskLevel } from "@/lib/types"

interface RecentActivityProps {
  recentPatients: Patient[]
  recentDiagnoses: Diagnosis[]
  criticalPatients: Patient[]
}

const riskColors: Record<RiskLevel, string> = {
  low: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  medium: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  high: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
}

export function RecentActivity({
  recentPatients,
  recentDiagnoses,
  criticalPatients,
}: RecentActivityProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Recently Added Patients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg">Recent Patients</CardTitle>
            <CardDescription>Newly added patients</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/patients" className="gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[320px] pr-4">
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {patient.age}y, {patient.gender} &bull; {patient.condition}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn("text-xs", riskColors[patient.riskLevel])}>
                    {patient.riskLevel}
                  </Badge>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recent Diagnoses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg">Recent Diagnoses</CardTitle>
            <CardDescription>Latest AI predictions</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/diagnosis" className="gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[320px] pr-4">
            <div className="space-y-4">
              {recentDiagnoses.map((diagnosis) => (
                <div
                  key={diagnosis.id}
                  className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{diagnosis.disease}</p>
                    <p className="text-xs text-muted-foreground">
                      Patient ID: {diagnosis.patientId}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-16 rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              diagnosis.confidence >= 90
                                ? "bg-chart-2"
                                : diagnosis.confidence >= 70
                                ? "bg-chart-4"
                                : "bg-chart-3"
                            )}
                            style={{ width: `${diagnosis.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{diagnosis.confidence}%</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", riskColors[diagnosis.severity])}
                      >
                        {diagnosis.severity}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Critical Patients */}
      <Card className="border-destructive/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <CardTitle className="text-lg">Critical Patients</CardTitle>
              <CardDescription>Require immediate attention</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[320px] pr-4">
            <div className="space-y-4">
              {criticalPatients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No critical patients at this time
                </p>
              ) : (
                criticalPatients.map((patient) => (
                  <Link
                    key={patient.id}
                    href={`/patients/${patient.id}`}
                    className="flex items-center gap-3 rounded-lg p-2 border border-destructive/20 bg-destructive/5 transition-colors hover:bg-destructive/10"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-destructive/10 text-destructive text-sm font-medium">
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">{patient.condition}</p>
                      <div className="flex gap-2 text-xs text-destructive">
                        <span>BP: {patient.bloodPressure}</span>
                        <span>&bull;</span>
                        <span>HR: {patient.heartRate}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="destructive" className="shrink-0">
                      View
                    </Button>
                  </Link>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
