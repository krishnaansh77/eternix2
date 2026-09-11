"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Heart, Thermometer, Activity, User, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Patient, RiskLevel } from "@/lib/types"

interface QuickPatientPanelProps {
  patient: Patient | null
  onClose?: () => void
}

const riskColors: Record<RiskLevel, string> = {
  low: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  medium: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  high: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
}

export function QuickPatientPanel({ patient, onClose }: QuickPatientPanelProps) {
  if (!patient) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-center">
        <User className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-medium text-muted-foreground">No Patient Selected</h3>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Click on a patient to view their quick summary
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {patient.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{patient.name}</h3>
              <p className="text-sm text-muted-foreground">
                {patient.age}y, {patient.gender} &bull; ID: {patient.id}
              </p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Risk Badge & Condition */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-sm", riskColors[patient.riskLevel])}>
            {patient.riskLevel.toUpperCase()} RISK
          </Badge>
          <Badge variant="secondary">{patient.condition}</Badge>
        </div>

        <Separator />

        {/* Vitals Summary */}
        <div>
          <h4 className="text-sm font-medium mb-3">Latest Vitals</h4>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                  <Activity className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Blood Pressure</p>
                  <p className="text-sm font-semibold">{patient.bloodPressure || "N/A"}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-3/10">
                  <Heart className="h-4 w-4 text-chart-3" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Heart Rate</p>
                  <p className="text-sm font-semibold">{patient.heartRate || "N/A"} bpm</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-4/10">
                  <Thermometer className="h-4 w-4 text-chart-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Temperature</p>
                  <p className="text-sm font-semibold">{patient.temperature || "N/A"}&deg;F</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="text-sm font-semibold">{patient.weight || "N/A"} kg</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Medications */}
        {patient.medications && patient.medications.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Active Medications</h4>
            <div className="space-y-2">
              {patient.medications.slice(0, 3).map((med) => (
                <div key={med.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{med.name}</span>
                  <span className="text-muted-foreground">{med.dosage}</span>
                </div>
              ))}
              {patient.medications.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{patient.medications.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          <Button asChild className="w-full gap-2">
            <Link href={`/diagnosis?patient=${patient.id}`}>
              <Brain className="h-4 w-4" />
              Start AI Diagnosis
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href={`/patients/${patient.id}`}>View Full Profile</Link>
          </Button>
        </div>
      </div>
    </ScrollArea>
  )
}
