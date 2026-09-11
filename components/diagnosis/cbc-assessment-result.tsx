"use client"

import { useMemo } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  CBC_RESULT_DISPLAY_CONFIG,
  displayDiseaseSignalName,
  formatCbcValue,
  formatProbability,
  rankPredictions,
  toProbabilityPercent,
  type CbcAssessmentResponse,
  type CbcParameterStatus,
} from "@/lib/cbc-assessment"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Download,
  Droplets,
  FlaskConical,
  Info,
  Minus,
  Plus,
  Save,
  ShieldCheck,
} from "lucide-react"

interface CbcAssessmentResultProps {
  assessment: CbcAssessmentResponse
  displayConfig?: {
    topPredictionsLimit: number
    minProbability: number
  }
  onSaveToPatient?: () => void
  onDownloadReport?: () => void
  onAddAsDiagnosis?: () => void
}

const statusCopy: Record<CbcParameterStatus, string> = {
  low: "Low",
  high: "High",
  elevated: "Elevated",
  normal: "Normal",
  critical: "Critical",
}

const statusTone: Record<CbcParameterStatus, string> = {
  low: "text-sky-700 bg-sky-50 border-sky-200",
  high: "text-amber-700 bg-amber-50 border-amber-200",
  elevated: "text-amber-700 bg-amber-50 border-amber-200",
  normal: "text-emerald-700 bg-emerald-50 border-emerald-200",
  critical: "text-red-700 bg-red-50 border-red-200",
}

const statusDot: Record<CbcParameterStatus, string> = {
  low: "bg-sky-500",
  high: "bg-amber-500",
  elevated: "bg-amber-500",
  normal: "bg-emerald-500",
  critical: "bg-red-500",
}

function statusClass(status?: string) {
  if (status && status in statusTone) {
    return statusTone[status as CbcParameterStatus]
  }
  return "text-slate-700 bg-slate-50 border-slate-200"
}

function statusText(status?: string) {
  if (!status) return ""
  if (status in statusCopy) return statusCopy[status as CbcParameterStatus]
  return status
}

function statusDotClass(status?: string) {
  if (status && status in statusDot) {
    return statusDot[status as CbcParameterStatus]
  }
  return "bg-slate-400"
}

function StatusIcon({ status }: { status?: string }) {
  if (status === "low") return <ArrowDown className="h-3.5 w-3.5" />
  if (status === "high" || status === "elevated") return <ArrowUp className="h-3.5 w-3.5" />
  if (status === "critical") return <AlertTriangle className="h-3.5 w-3.5" />
  return <Minus className="h-3.5 w-3.5" />
}

function ProbabilityRing({
  percent,
  label,
}: {
  percent: number
  label: string
}) {
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference
  const color =
    percent >= 70 ? "stroke-emerald-500" : percent >= 40 ? "stroke-amber-500" : "stroke-sky-500"

  return (
    <div className="relative h-[132px] w-[132px]">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          className={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tracking-tight">{percent}%</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  )
}

function groupCbcResults(assessment: CbcAssessmentResponse) {
  const groups: { key: string; label: string; rows: CbcAssessmentResponse["cbc_results"] }[] = []

  for (const row of assessment.cbc_results || []) {
    const existing = groups.find((group) => group.key === (row.group || "other"))
    if (existing) {
      existing.rows.push(row)
    } else {
      groups.push({
        key: row.group || "other",
        label: row.group_label || "CBC Parameters",
        rows: [row],
      })
    }
  }

  return groups
}

export function CbcAssessmentResult({
  assessment,
  displayConfig = CBC_RESULT_DISPLAY_CONFIG,
  onSaveToPatient,
  onDownloadReport,
  onAddAsDiagnosis,
}: CbcAssessmentResultProps) {
  const probabilityPercent = toProbabilityPercent(assessment.primary_prediction.probability)
  const confidenceLabel =
    assessment.primary_prediction.confidence_level === "high"
      ? "High probability"
      : assessment.primary_prediction.confidence_level === "low"
        ? "Low probability"
        : "Moderate probability"

  const rankedPredictions = useMemo(
    () => rankPredictions(assessment, displayConfig),
    [assessment, displayConfig]
  )

  const groupedResults = useMemo(() => groupCbcResults(assessment), [assessment])
  const disclaimer =
    assessment.disclaimer ||
    "AI-generated CBC assessment. This result is intended to support clinical review and is not a definitive diagnosis. Additional clinical evaluation and confirmatory testing may be required."

  return (
    <div className="space-y-5">
      {assessment.severity === "urgent" && (
        <Alert className="border-amber-300 bg-amber-50 text-amber-950">
          <AlertTriangle className="h-4 w-4 text-amber-700" />
          <AlertTitle>Requires Clinical Review</AlertTitle>
          <AlertDescription>
            {assessment.clinical_flag_message ||
              "Model identified findings that may require prompt clinical evaluation."}
          </AlertDescription>
        </Alert>
      )}

      {assessment.severity === "attention" && (
        <Alert className="border-sky-200 bg-sky-50 text-sky-950">
          <Info className="h-4 w-4 text-sky-700" />
          <AlertTitle>Clinical attention suggested</AlertTitle>
          <AlertDescription>
            {assessment.clinical_flag_message ||
              "Model identified findings that may require prompt clinical evaluation."}
          </AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="border-b bg-slate-50/80 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                CBC AI Assessment
              </p>
              <CardTitle className="mt-1 text-lg">Model Prediction</CardTitle>
              <CardDescription>CBC-based assessment from returned model output</CardDescription>
            </div>
            <Badge variant="outline" className="bg-white">
              {confidenceLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <ProbabilityRing percent={probabilityPercent} label="Estimate" />
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Most Likely Condition / Pattern
              </p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight">
                {assessment.primary_prediction.name}
              </h3>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Estimated Probability
              </p>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${probabilityPercent}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {assessment.model_info?.name} · v{assessment.model_info?.version}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Top Predicted Conditions / Patterns</CardTitle>
          <CardDescription>
            Showing up to {displayConfig.topPredictionsLimit} results at or above{" "}
            {Math.round(displayConfig.minProbability * 100)}% estimated probability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rankedPredictions.map((prediction, index) => {
            const percent = Math.round(prediction.probability * 100)
            return (
              <div key={`${prediction.name}-${index}`} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">
                    {index + 1}. {prediction.name}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      index === 0 ? "bg-emerald-500" : "bg-sky-500/80"
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {(assessment.disease_associated_signals || []).length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Disease-associated CBC signals</CardTitle>
            <CardDescription>
              CBC pattern signals returned by the model — not confirmed diagnoses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assessment.disease_associated_signals!.map((signal) => (
              <div key={signal.name} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{displayDiseaseSignalName(signal.name)}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatProbability(signal.probability)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-500/80"
                    style={{ width: `${toProbabilityPercent(signal.probability)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Why this prediction?</CardTitle>
          <CardDescription>
            Feature importance returned by the model explainability layer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {assessment.contributing_factors.map((factor) => {
            const importancePct = Math.round(factor.importance * 100)
            return (
              <div key={factor.parameter} className="rounded-xl border bg-card p-3">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{factor.parameter}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCbcValue(factor.value)}
                      {factor.unit ? ` ${factor.unit}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {factor.status ? (
                      <Badge
                        variant="outline"
                        className={cn("gap-1", statusClass(factor.status))}
                      >
                        <StatusIcon status={factor.status} />
                        {statusText(factor.status)}
                      </Badge>
                    ) : null}
                    <Badge variant="secondary">
                      {factor.contribution_label || "Contribution"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-slate-800"
                      style={{ width: `${importancePct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                    {importancePct}%
                  </span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Observed CBC Pattern</CardTitle>
          <CardDescription>Explanation provided by the model, not inferred in the UI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-foreground/90">
            {assessment.pattern_summary}
          </p>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Key Pattern
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {assessment.key_pattern.map((step, index) => (
                <div key={`${step.label}-${index}`} className="flex items-center gap-2">
                  <div className="rounded-xl border bg-slate-50 px-3 py-2 text-sm font-medium">
                    {step.label}
                    {step.direction && step.direction !== "normal" ? (
                      <span className="ml-1 text-muted-foreground">
                        {step.direction === "low" ? "↓" : "↑"}
                      </span>
                    ) : null}
                  </div>
                  {index < assessment.key_pattern.length - 1 && (
                    <span className="text-xs font-semibold text-muted-foreground">+</span>
                  )}
                </div>
              ))}
            </div>
            {assessment.pattern_caption && (
              <p className="mt-3 text-xs text-muted-foreground">
                {assessment.pattern_caption}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Visual CBC Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {assessment.lineage_overview.map((item) => (
            <div
              key={item.lineage}
              className="flex items-center justify-between rounded-xl border px-3 py-3"
            >
              <span className="text-sm text-muted-foreground">{item.lineage}</span>
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className={cn("h-2.5 w-2.5 rounded-full", statusDot[item.status])} />
                {statusCopy[item.status]}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">CBC Results</CardTitle>
          </div>
          <CardDescription>Values, units, status, and ranges as returned by the backend</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {groupedResults.map((group) => (
            <div key={group.key}>
              <h4 className="mb-2 text-sm font-semibold">{group.label}</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.rows.map((row) => (
                    <TableRow key={row.parameter}>
                      <TableCell className="font-medium">{row.parameter}</TableCell>
                      <TableCell className="tabular-nums">{formatCbcValue(row.value)}</TableCell>
                      <TableCell>{row.unit}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("gap-1", statusTone[row.status])}
                        >
                          <StatusIcon status={row.status} />
                          {statusCopy[row.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {row.reference_range || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Supporting Evidence</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {assessment.supporting_evidence.map((group) => (
            <div key={group.strength} className="rounded-xl border bg-slate-50/70 p-4">
              <p className="mb-2 text-sm font-semibold capitalize">{group.strength} evidence</p>
              <ul className="space-y-1.5">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-700" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Alternative Possibilities</CardTitle>
          <CardDescription>Expand any class returned by the model to review supporting factors</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {assessment.alternative_predictions.map((prediction) => (
              <AccordionItem key={prediction.name} value={prediction.name}>
                <AccordionTrigger className="text-sm">
                  <span className="flex w-full items-center justify-between gap-3 pr-3">
                    <span>{prediction.name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatProbability(prediction.probability)}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Estimated probability:{" "}
                    <span className="font-medium text-foreground">
                      {formatProbability(prediction.probability)}
                    </span>
                  </p>
                  {prediction.explanation && <p>{prediction.explanation}</p>}
                  {prediction.supporting_factors && prediction.supporting_factors.length > 0 && (
                    <ul className="space-y-1">
                      {prediction.supporting_factors.map((factor) => (
                        <li key={factor}>• {factor}</li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {assessment.follow_up.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Follow-up returned by the model</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assessment.follow_up.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="rounded-xl border border-dashed bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        {disclaimer}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Button onClick={onSaveToPatient} className="gap-2">
          <Save className="h-4 w-4" />
          Save to Patient
        </Button>
        <Button variant="outline" onClick={onAddAsDiagnosis} className="gap-2">
          <Plus className="h-4 w-4" />
          Add as Diagnosis
        </Button>
        <Button variant="outline" onClick={onDownloadReport} className="gap-2">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>
    </div>
  )
}
