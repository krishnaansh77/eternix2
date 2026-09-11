"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Activity, Thermometer, Scale, Brain, Pill } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Patient, Diagnosis, RiskLevel } from "@/lib/types"

interface PatientOverviewProps {
  patient: Patient
  diagnoses: Diagnosis[]
}

const riskColors: Record<RiskLevel, string> = {
  low: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  medium: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  high: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
}

export function PatientOverview({ patient, diagnoses }: PatientOverviewProps) {
  const vitals = [
    {
      label: "Blood Pressure",
      value: patient.bloodPressure || "N/A",
      unit: "mmHg",
      icon: Activity,
      status: patient.bloodPressure ? getBloodPressureStatus(patient.bloodPressure) : "normal",
    },
    {
      label: "Heart Rate",
      value: patient.heartRate || "N/A",
      unit: "bpm",
      icon: Heart,
      status: patient.heartRate ? getHeartRateStatus(patient.heartRate) : "normal",
    },
    {
      label: "Temperature",
      value: patient.temperature || "N/A",
      unit: "\u00B0F",
      icon: Thermometer,
      status: patient.temperature ? getTemperatureStatus(patient.temperature) : "normal",
    },
    {
      label: "Weight",
      value: patient.weight || "N/A",
      unit: "kg",
      icon: Scale,
      status: "normal" as const,
    },
  ]

  const latestDiagnosis = diagnoses[0]

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Vitals Summary */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Vitals Summary</CardTitle>
          <CardDescription>Current vital signs and measurements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {vitals.map((vital) => (
              <div
                key={vital.label}
                className={cn(
                  "flex items-center gap-4 rounded-lg border p-4",
                  vital.status === "critical" && "border-destructive/50 bg-destructive/5",
                  vital.status === "warning" && "border-chart-4/50 bg-chart-4/5"
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    vital.status === "critical"
                      ? "bg-destructive/10 text-destructive"
                      : vital.status === "warning"
                      ? "bg-chart-4/10 text-chart-4"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  <vital.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{vital.label}</p>
                  <p className="text-xl font-bold">
                    {vital.value}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {vital.unit}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Latest Diagnosis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Latest AI Diagnosis
          </CardTitle>
          <CardDescription>Most recent diagnostic result</CardDescription>
        </CardHeader>
        <CardContent>
          {latestDiagnosis ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{latestDiagnosis.disease}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(latestDiagnosis.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Badge variant="outline" className={cn(riskColors[latestDiagnosis.severity])}>
                  {latestDiagnosis.severity}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">AI Confidence</span>
                  <span className="font-medium">{latestDiagnosis.confidence}%</span>
                </div>
                <Progress
                  value={latestDiagnosis.confidence}
                  className={cn(
                    "h-2",
                    latestDiagnosis.confidence >= 90
                      ? "[&>div]:bg-chart-2"
                      : latestDiagnosis.confidence >= 70
                      ? "[&>div]:bg-chart-4"
                      : "[&>div]:bg-destructive"
                  )}
                />
              </div>

              {latestDiagnosis.contributingFactors && (
                <div className="pt-2">
                  <p className="text-sm font-medium mb-2">Contributing Factors:</p>
                  <ul className="space-y-1">
                    {latestDiagnosis.contributingFactors.map((factor, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No diagnosis recorded yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Active Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Active Medications
          </CardTitle>
          <CardDescription>Current prescriptions</CardDescription>
        </CardHeader>
        <CardContent>
          {patient.medications && patient.medications.length > 0 ? (
            <div className="space-y-4">
              {patient.medications.map((med) => (
                <div
                  key={med.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {med.dosage} - {med.frequency}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Since{" "}
                    {new Date(med.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No active medications
            </p>
          )}
        </CardContent>
      </Card>

      {/* Risk Indicators */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Risk Indicators</CardTitle>
          <CardDescription>Health risk assessment based on current data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Cardiovascular Risk", value: 65, status: "high" as const },
              { label: "Metabolic Risk", value: 40, status: "medium" as const },
              { label: "Respiratory Risk", value: 20, status: "low" as const },
            ].map((risk) => (
              <div key={risk.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{risk.label}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      risk.status === "high"
                        ? "text-destructive"
                        : risk.status === "medium"
                        ? "text-chart-4"
                        : "text-chart-2"
                    )}
                  >
                    {risk.value}%
                  </Badge>
                </div>
                <Progress
                  value={risk.value}
                  className={cn(
                    "h-2",
                    risk.status === "high"
                      ? "[&>div]:bg-destructive"
                      : risk.status === "medium"
                      ? "[&>div]:bg-chart-4"
                      : "[&>div]:bg-chart-2"
                  )}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getBloodPressureStatus(bp: string): "normal" | "warning" | "critical" {
  const [systolic] = bp.split("/").map(Number)
  if (systolic >= 140) return "critical"
  if (systolic >= 130) return "warning"
  return "normal"
}

function getHeartRateStatus(hr: number): "normal" | "warning" | "critical" {
  if (hr > 100 || hr < 60) return "warning"
  if (hr > 120 || hr < 50) return "critical"
  return "normal"
}

function getTemperatureStatus(temp: number): "normal" | "warning" | "critical" {
  if (temp >= 100.4) return "critical"
  if (temp >= 99.5) return "warning"
  return "normal"
}
