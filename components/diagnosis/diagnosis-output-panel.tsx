"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Download,
  Save,
  Plus,
  Info,
  Zap,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { RiskLevel } from "@/lib/types"

interface DiagnosisResult {
  disease: string
  confidence: number
  severity: RiskLevel
  contributingFactors: string[]
  reasoning: string
  recommendations: string[]
  heatmapUrl?: string
}

interface DiagnosisOutputPanelProps {
  result: DiagnosisResult | null
  isAnalyzing: boolean
  analyzingLabel?: string
  onSaveToPatient?: () => void
  onDownloadReport?: () => void
  onAddAsDiagnosis?: () => void
}

const riskColors: Record<RiskLevel, string> = {
  low: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  medium: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  high: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
}

const severityConfig: Record<RiskLevel, { label: string; color: string; icon: typeof CheckCircle }> = {
  low: { label: "Low Risk", color: "text-chart-2", icon: CheckCircle },
  medium: { label: "Moderate Risk", color: "text-chart-4", icon: Info },
  high: { label: "High Risk", color: "text-chart-3", icon: AlertTriangle },
  critical: { label: "Critical", color: "text-destructive", icon: AlertTriangle },
}

export function DiagnosisOutputPanel({
  result,
  isAnalyzing,
  analyzingLabel,
  onSaveToPatient,
  onDownloadReport,
  onAddAsDiagnosis,
}: DiagnosisOutputPanelProps) {
  if (isAnalyzing) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <div className="absolute inset-0 h-16 w-16 mx-auto rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{analyzingLabel || "Analyzing Medical Data"}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {analyzingLabel ? "Please wait while the CBC server responds." : "AI is processing your input..."}
            </p>
          </div>
          <div className="space-y-2 w-full max-w-xs mx-auto">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Processing images</span>
              <span>...</span>
            </div>
            <Progress value={33} className="h-1" />
          </div>
        </div>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-sm">
          <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Brain className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AI Diagnosis Results</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upload a report and enter patient data, then click &quot;Run AI
              Diagnosis&quot; to see results here.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const severityInfo = severityConfig[result.severity]
  const SeverityIcon = severityInfo.icon

  return (
    <div className="space-y-6">
      {/* Low Confidence Warning */}
      {result.confidence < 70 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Low Confidence Warning</AlertTitle>
          <AlertDescription>
            The AI model&apos;s confidence is below 70%. Please review carefully
            and consider additional diagnostic tests.
          </AlertDescription>
        </Alert>
      )}

      {/* Critical Alert */}
      {result.severity === "critical" && (
        <Alert className="border-destructive/50 bg-destructive/5">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertTitle className="text-destructive">Critical Condition Detected</AlertTitle>
          <AlertDescription>
            Immediate medical attention may be required. Review findings and
            consult with specialists if necessary.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Prediction Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle>AI Diagnosis Result</CardTitle>
              <CardDescription>Based on uploaded reports and patient data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Disease Prediction */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Predicted Condition</p>
                <h3 className="text-2xl font-bold mt-1">{result.disease}</h3>
              </div>
              <Badge
                variant="outline"
                className={cn("text-sm", riskColors[result.severity])}
              >
                <SeverityIcon className={cn("h-4 w-4 mr-1", severityInfo.color)} />
                {severityInfo.label}
              </Badge>
            </div>
          </div>

          {/* Confidence Meter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">AI Confidence</span>
              </div>
              <span
                className={cn(
                  "text-2xl font-bold",
                  result.confidence >= 90
                    ? "text-chart-2"
                    : result.confidence >= 70
                    ? "text-chart-4"
                    : "text-destructive"
                )}
              >
                {result.confidence}%
              </span>
            </div>
            <Progress
              value={result.confidence}
              className={cn(
                "h-3",
                result.confidence >= 90
                  ? "[&>div]:bg-chart-2"
                  : result.confidence >= 70
                  ? "[&>div]:bg-chart-4"
                  : "[&>div]:bg-destructive"
              )}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>Low (&lt;70%)</span>
              <span>Moderate (70-89%)</span>
              <span>High (90%+)</span>
            </div>
          </div>

          <Separator />

          {/* Visual Output (Heatmap) */}
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-primary" />
              Visual Analysis (Grad-CAM)
            </h4>
            <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/5 via-chart-3/10 to-chart-4/5 border flex items-center justify-center relative overflow-hidden">
              {/* Simulated heatmap visualization */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-destructive/50 blur-xl" />
                <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-chart-4/50 blur-lg" />
              </div>
              <div className="relative text-center p-4">
                <p className="text-sm font-medium">Region of Interest Highlighted</p>
                <p className="text-xs text-muted-foreground mt-1">
                  AI has identified areas of concern in the medical image
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contributing Factors */}
          <div>
            <h4 className="font-medium mb-3">Contributing Factors</h4>
            <div className="space-y-2">
              {result.contributingFactors.map((factor, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                >
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* AI Reasoning */}
          <div>
            <h4 className="font-medium mb-3">AI Reasoning</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {result.reasoning}
            </p>
          </div>

          <Separator />

          {/* Recommendations */}
          <div>
            <h4 className="font-medium mb-3">Recommendations</h4>
            <ul className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-chart-2 mt-0.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
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
