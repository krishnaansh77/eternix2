"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Upload,
  FileHeart,
  FileImage,
  FileScan,
  FileText,
  FlaskConical,
  X,
  Plus,
  User,
  Activity,
  Scale,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Gender } from "@/lib/types"
import { CbcValueReview } from "@/components/diagnosis/cbc-value-review"
import {
  CbcApiError,
  EMPTY_CBC_LAB_VALUES,
  buildCbcAssessRequest,
  fetchCbcAssessment,
  labValuesFromExtraction,
  parseCbcReport,
  type CbcAssessmentResponse,
  type CbcLabKey,
  type CbcLabUnits,
  type CbcLabValues,
} from "@/lib/cbc-assessment"

export type ReportKind =
  | "ecg"
  | "xray"
  | "mri"
  | "cbc"
  | "ct_scan"
  | "ultrasound"
  | "blood_test"
  | "other"

export type CbcPatient = {
  id: string
  name: string
  age?: number
  gender?: Gender
}

interface DiagnosisInputPanelProps {
  patient: CbcPatient | null
  onRunDiagnosis: (data: DiagnosisInputData) => void
  isAnalyzing: boolean
  onCbcResult?: (result: CbcAssessmentResponse | null) => void
  onCbcLoadingChange?: (message: string | null) => void
}

export interface DiagnosisInputData {
  patientId?: string
  files: UploadedFile[]
  symptoms: string[]
  demographics: {
    age: string
    gender: Gender | ""
    weight: string
    height: string
    bmi: string
  }
}

interface UploadedFile {
  id: string
  name: string
  type: ReportKind
  customLabel?: string
  size: number
  file?: File
}

const reportTypeConfig: Record<
  ReportKind,
  { icon: typeof FileHeart; label: string; accept: string }
> = {
  ecg: { icon: FileHeart, label: "ECG", accept: ".dcm,.pdf,.png,.jpg,.jpeg" },
  xray: { icon: FileImage, label: "X-Ray", accept: ".dcm,.png,.jpg,.jpeg,.pdf" },
  mri: { icon: FileScan, label: "MRI", accept: ".dcm,.nii,.png,.jpg,.jpeg,.pdf" },
  cbc: { icon: FileText, label: "CBC Report", accept: ".pdf,.png,.jpg,.jpeg" },
  ct_scan: { icon: FileScan, label: "CT Scan", accept: ".dcm,.png,.jpg,.jpeg,.pdf" },
  ultrasound: { icon: FileImage, label: "Ultrasound", accept: ".dcm,.png,.jpg,.jpeg,.pdf" },
  blood_test: { icon: FlaskConical, label: "Blood Test", accept: ".pdf,.png,.jpg,.jpeg,.csv,.xlsx" },
  other: { icon: FileText, label: "Other", accept: ".pdf,.png,.jpg,.jpeg,.doc,.docx" },
}

function calculateBMI(weightKg: string, heightCm: string): string {
  const weight = parseFloat(weightKg)
  const heightM = parseFloat(heightCm) / 100

  if (!weight || !heightM || heightM <= 0) {
    return ""
  }

  return (weight / (heightM * heightM)).toFixed(1)
}

function getBMICategory(bmi: string): string {
  const value = parseFloat(bmi)
  if (!value) return ""
  if (value < 18.5) return "Underweight"
  if (value < 25) return "Normal"
  if (value < 30) return "Overweight"
  return "Obese"
}

export function DiagnosisInputPanel({
  patient,
  onRunDiagnosis,
  isAnalyzing,
  onCbcResult,
  onCbcLoadingChange,
}: DiagnosisInputPanelProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [symptomInput, setSymptomInput] = useState("")
  const [reportKind, setReportKind] = useState<ReportKind>("cbc")
  const [customReportLabel, setCustomReportLabel] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const [demographics, setDemographics] = useState({
    age: patient?.age?.toString() || "",
    gender: (patient?.gender || "") as Gender | "",
    weight: "",
    height: "",
  })
  const [cbcValues, setCbcValues] = useState<CbcLabValues>(EMPTY_CBC_LAB_VALUES)
  const [cbcUnits, setCbcUnits] = useState<CbcLabUnits>({})
  const [cbcMissingFields, setCbcMissingFields] = useState<unknown[]>([])
  const [cbcReviewFlags, setCbcReviewFlags] = useState<unknown[]>([])
  const [cbcReviewReason, setCbcReviewReason] = useState<string>()
  const [showCbcReview, setShowCbcReview] = useState(false)
  const [cbcBusy, setCbcBusy] = useState<"parse" | "assess" | null>(null)
  const [cbcError, setCbcError] = useState<string | null>(null)

  const isCbc = reportKind === "cbc"
  const busy = Boolean(cbcBusy) || isAnalyzing

  const bmi = useMemo(
    () => calculateBMI(demographics.weight, demographics.height),
    [demographics.weight, demographics.height]
  )
  const bmiCategory = useMemo(() => getBMICategory(bmi), [bmi])

  useEffect(() => {
    if (!patient) return
    setDemographics((current) => ({
      ...current,
      age: patient.age?.toString() || current.age,
      gender: patient.gender || current.gender,
    }))
  }, [patient])

  const resetCbcWorkflow = useCallback(() => {
    setShowCbcReview(false)
    setCbcValues(EMPTY_CBC_LAB_VALUES)
    setCbcUnits({})
    setCbcMissingFields([])
    setCbcReviewFlags([])
    setCbcReviewReason(undefined)
    setCbcError(null)
    onCbcResult?.(null)
    onCbcLoadingChange?.(null)
  }, [onCbcLoadingChange, onCbcResult])

  const addFiles = useCallback(
    (selectedFiles: File[]) => {
      if (selectedFiles.length === 0) return

      if (reportKind === "cbc") {
        const file = selectedFiles[selectedFiles.length - 1]
        setFiles([
          {
            id: `cbc-${Date.now()}`,
            name: file.name,
            type: "cbc",
            size: file.size,
            file,
          },
        ])
        setShowCbcReview(false)
        setCbcError(null)
        onCbcResult?.(null)
        return
      }

      const newFiles: UploadedFile[] = selectedFiles.map((file) => ({
        id: `${reportKind}-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: reportKind,
        customLabel: reportKind === "other" ? customReportLabel.trim() : undefined,
        size: file.size,
      }))

      setFiles((prev) => [...prev, ...newFiles])
    },
    [customReportLabel, onCbcResult, reportKind]
  )

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setDragOver(false)
      addFiles(Array.from(event.dataTransfer.files))
    },
    [addFiles]
  )

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId))
    if (isCbc) {
      resetCbcWorkflow()
    }
  }

  const addSymptom = () => {
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      setSymptoms((prev) => [...prev, symptomInput.trim()])
      setSymptomInput("")
    }
  }

  const removeSymptom = (symptom: string) => {
    setSymptoms((prev) => prev.filter((item) => item !== symptom))
  }

  const handleSubmit = () => {
    if (isCbc) return
    onRunDiagnosis({
      patientId: patient?.id,
      files,
      symptoms,
      demographics: {
        ...demographics,
        bmi,
      },
    })
  }

  const handleReadCbcReport = async () => {
    const uploaded = files.find((item) => item.type === "cbc" && item.file)?.file
    if (!uploaded) {
      setCbcError("Please upload a CBC PDF or image first.")
      return
    }

    setCbcError(null)
    setCbcBusy("parse")
    onCbcLoadingChange?.("Reading CBC report…")
    onCbcResult?.(null)

    try {
      const extraction = await parseCbcReport(uploaded)
      setCbcValues(labValuesFromExtraction(extraction))
      setCbcUnits(extraction.units || {})
      setCbcMissingFields(extraction.missing_fields || [])
      setCbcReviewFlags(extraction.review_flags || [])
      setCbcReviewReason(
        extraction.review_reason ||
          "Values were extracted from the report. Please verify them before analysis."
      )
      setShowCbcReview(true)
    } catch (error) {
      setShowCbcReview(true)
      setCbcValues(EMPTY_CBC_LAB_VALUES)
      setCbcUnits({})
      setCbcMissingFields([])
      setCbcReviewFlags([])
      setCbcReviewReason("Values were extracted from the report. Please verify them before analysis.")
      setCbcError(
        error instanceof CbcApiError
          ? error.message
          : "Unable to read the CBC report. Please try again or enter the CBC values manually."
      )
    } finally {
      setCbcBusy(null)
      onCbcLoadingChange?.(null)
    }
  }

  const handleAnalyzeCbc = async () => {
    const age = patient?.age?.toString() || demographics.age
    const built = buildCbcAssessRequest(
      {
        age,
        height: demographics.height,
        weight: demographics.weight,
        bmi,
      },
      cbcValues
    )

    if (built.error || !built.request) {
      setCbcError(built.error || "Please verify the CBC values before analysis.")
      return
    }

    setCbcError(null)
    setCbcBusy("assess")
    onCbcLoadingChange?.("Analyzing CBC…")
    onCbcResult?.(null)

    try {
      const assessment = await fetchCbcAssessment(built.request, patient?.id)
      onCbcResult?.(assessment)
    } catch (error) {
      setCbcError(
        error instanceof CbcApiError
          ? error.message
          : "Unable to analyze CBC. Please verify the values and try again."
      )
    } finally {
      setCbcBusy(null)
      onCbcLoadingChange?.(null)
    }
  }

  const isValid = files.length > 0 || symptoms.length > 0
  const cbcFileReady = files.some((item) => item.type === "cbc" && item.file)

  const getReportLabel = (file: UploadedFile) => {
    if (file.type === "other" && file.customLabel) {
      return file.customLabel
    }
    return reportTypeConfig[file.type].label
  }

  return (
    <div className="space-y-6">
      {patient && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{patient.name}</p>
                <p className="text-sm text-muted-foreground">
                  {patient.age}y, {patient.gender} &bull; ID: {patient.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload a Report
          </CardTitle>
          <CardDescription>
            Choose the report type, then upload the file for AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Report type</Label>
              <Select
                value={reportKind}
                onValueChange={(value) => {
                  const next = value as ReportKind
                  setReportKind(next)
                  if (next === "cbc") {
                    setFiles([])
                    resetCbcWorkflow()
                  } else {
                    resetCbcWorkflow()
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ecg">ECG</SelectItem>
                  <SelectItem value="xray">X-Ray</SelectItem>
                  <SelectItem value="mri">MRI</SelectItem>
                  <SelectItem value="cbc">CBC Report</SelectItem>
                  <SelectItem value="ct_scan">CT Scan</SelectItem>
                  <SelectItem value="ultrasound">Ultrasound</SelectItem>
                  <SelectItem value="blood_test">Blood Test</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportKind === "other" && (
              <div className="space-y-2">
                <Label htmlFor="custom-report-label">Report name</Label>
                <Input
                  id="custom-report-label"
                  placeholder="e.g. Allergy panel, biopsy, discharge summary"
                  value={customReportLabel}
                  onChange={(event) => setCustomReportLabel(event.target.value)}
                />
              </div>
            )}
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={(event) => {
              event.preventDefault()
              setDragOver(false)
            }}
            onDrop={handleDrop}
            className={cn(
              "relative rounded-lg border-2 border-dashed p-8 text-center transition-colors",
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            )}
          >
            <input
              type="file"
              accept={reportTypeConfig[reportKind].accept}
              multiple={!isCbc}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={busy}
              onChange={(event) => {
                addFiles(Array.from(event.target.files || []))
                event.target.value = ""
              }}
            />
            <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">
              Drop your {reportTypeConfig[reportKind].label.toLowerCase()} here or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isCbc ? "PDF, PNG, JPG, or JPEG" : "PDF, image, or DICOM files supported"}
            </p>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded reports</Label>
              <div className="space-y-2">
                {files.map((file) => {
                  const config = reportTypeConfig[file.type]
                  const Icon = config.icon

                  return (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded-lg bg-muted p-2"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {getReportLabel(file)}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isCbc && showCbcReview && (
        <CbcValueReview
          values={cbcValues}
          units={cbcUnits}
          missingFields={cbcMissingFields}
          reviewFlags={cbcReviewFlags}
          reviewReason={cbcReviewReason}
          disabled={busy}
          onChange={(key: CbcLabKey, value: string) =>
            setCbcValues((current) => ({ ...current, [key]: value }))
          }
        />
      )}

      {cbcError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {cbcError}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Symptoms
          </CardTitle>
          <CardDescription>Add reported symptoms for analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter symptom (e.g., chest pain, shortness of breath)"
              value={symptomInput}
              onChange={(event) => setSymptomInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addSymptom()}
            />
            <Button onClick={addSymptom} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {symptoms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom) => (
                <Badge key={symptom} variant="secondary" className="gap-1 pr-1">
                  {symptom}
                  <button
                    onClick={() => removeSymptom(symptom)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Demographics
          </CardTitle>
          <CardDescription>Enter patient measurements — BMI is calculated automatically</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {(!patient || isCbc) && (
              <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="45"
                    value={demographics.age}
                    onChange={(event) =>
                      setDemographics({ ...demographics, age: event.target.value })
                    }
                  />
                </div>
            )}
            {!patient && (
              <>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={demographics.gender}
                    onValueChange={(value) =>
                      setDemographics({ ...demographics, gender: value as Gender })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                placeholder="70"
                value={demographics.weight}
                onChange={(event) =>
                  setDemographics({ ...demographics, weight: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                min="0"
                placeholder="170"
                value={demographics.height}
                onChange={(event) =>
                  setDemographics({ ...demographics, height: event.target.value })
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bmi">BMI (auto-calculated)</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="bmi"
                  readOnly
                  placeholder="Enter weight and height"
                  value={bmi ? `${bmi} kg/m²` : ""}
                  className="bg-muted/50"
                />
                {bmiCategory && (
                  <Badge variant="secondary" className="shrink-0">
                    {bmiCategory}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isCbc ? (
        <div className="grid gap-3">
          <Button
            size="lg"
            variant={showCbcReview ? "outline" : "default"}
            className="w-full gap-2"
            onClick={handleReadCbcReport}
            disabled={!cbcFileReady || busy}
          >
            {cbcBusy === "parse" ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Reading CBC report…
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                {showCbcReview ? "Re-read CBC report" : "Read CBC Report"}
              </>
            )}
          </Button>
          {showCbcReview && (
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleAnalyzeCbc}
              disabled={busy}
            >
              {cbcBusy === "assess" ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Analyzing CBC…
                </>
              ) : (
                <>
                  <Activity className="h-5 w-5" />
                  Analyze CBC
                </>
              )}
            </Button>
          )}
          {!showCbcReview && (
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => {
                setCbcError(null)
                setCbcReviewReason("Enter the CBC values manually, then review them before analysis.")
                setShowCbcReview(true)
              }}
              disabled={busy}
            >
              Enter CBC values manually
            </Button>
          )}
        </div>
      ) : (
      <Button
        size="lg"
        className="w-full gap-2"
        onClick={handleSubmit}
        disabled={!isValid || isAnalyzing}
      >
        {isAnalyzing ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Analyzing...
          </>
        ) : (
          <>
            <Activity className="h-5 w-5" />
            Run AI Diagnosis
          </>
        )}
      </Button>
      )}
    </div>
  )
}
