"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Brain, Plus, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Diagnosis, RiskLevel } from "@/lib/types"

interface PatientDiagnosisProps {
  diagnoses: Diagnosis[]
  patientId: string
}

const riskColors: Record<RiskLevel, string> = {
  low: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  medium: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  high: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
}

export function PatientDiagnosis({ diagnoses, patientId }: PatientDiagnosisProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDiagnosis, setNewDiagnosis] = useState({
    disease: "",
    severity: "" as RiskLevel | "",
    notes: "",
    prescription: "",
  })

  const handleSubmit = () => {
    console.log("New diagnosis:", newDiagnosis)
    setShowAddForm(false)
    setNewDiagnosis({ disease: "", severity: "", notes: "", prescription: "" })
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Diagnosis History</h3>
          <p className="text-sm text-muted-foreground">
            View and add patient diagnoses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Manual Diagnosis
          </Button>
          <Button asChild className="gap-2">
            <Link href={`/diagnosis?patient=${patientId}`}>
              <Brain className="h-4 w-4" />
              Run AI Diagnosis
            </Link>
          </Button>
        </div>
      </div>

      {/* Add Diagnosis Form */}
      {showAddForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Add New Diagnosis</CardTitle>
            <CardDescription>Manually add a diagnosis for this patient</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="disease">Diagnosis / Condition</Label>
                <Textarea
                  id="disease"
                  placeholder="Enter diagnosis..."
                  value={newDiagnosis.disease}
                  onChange={(e) =>
                    setNewDiagnosis({ ...newDiagnosis, disease: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={newDiagnosis.severity}
                  onValueChange={(value) =>
                    setNewDiagnosis({ ...newDiagnosis, severity: value as RiskLevel })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Clinical Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add clinical notes..."
                value={newDiagnosis.notes}
                onChange={(e) => setNewDiagnosis({ ...newDiagnosis, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescription">Prescription</Label>
              <Textarea
                id="prescription"
                placeholder="Enter prescription details..."
                value={newDiagnosis.prescription}
                onChange={(e) =>
                  setNewDiagnosis({ ...newDiagnosis, prescription: e.target.value })
                }
                rows={2}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Save Diagnosis</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diagnosis List */}
      <div className="space-y-4">
        {diagnoses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-center">
                No diagnoses recorded yet.
                <br />
                Run an AI diagnosis or add one manually.
              </p>
            </CardContent>
          </Card>
        ) : (
          diagnoses.map((diagnosis) => (
            <Card key={diagnosis.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                          diagnosis.aiGenerated ? "bg-primary/10" : "bg-muted"
                        )}
                      >
                        {diagnosis.aiGenerated ? (
                          <Brain className="h-5 w-5 text-primary" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{diagnosis.disease}</h4>
                          <Badge
                            variant="outline"
                            className={cn("capitalize", riskColors[diagnosis.severity])}
                          >
                            {diagnosis.severity}
                          </Badge>
                          {diagnosis.aiGenerated && (
                            <Badge variant="secondary" className="gap-1">
                              <Brain className="h-3 w-3" />
                              AI Generated
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {new Date(diagnosis.date).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {diagnosis.contributingFactors && (
                      <div className="pl-13">
                        <p className="text-sm font-medium mb-2">Contributing Factors:</p>
                        <ul className="grid gap-1 sm:grid-cols-2">
                          {diagnosis.contributingFactors.map((factor, i) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground flex items-center gap-2"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Confidence Meter */}
                  <div className="lg:w-48 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence</span>
                      <span
                        className={cn(
                          "font-semibold",
                          diagnosis.confidence >= 90
                            ? "text-chart-2"
                            : diagnosis.confidence >= 70
                            ? "text-chart-4"
                            : "text-destructive"
                        )}
                      >
                        {diagnosis.confidence}%
                      </span>
                    </div>
                    <Progress
                      value={diagnosis.confidence}
                      className={cn(
                        "h-2",
                        diagnosis.confidence >= 90
                          ? "[&>div]:bg-chart-2"
                          : diagnosis.confidence >= 70
                          ? "[&>div]:bg-chart-4"
                          : "[&>div]:bg-destructive"
                      )}
                    />
                    {diagnosis.confidence < 70 && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Low confidence - Review required
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
