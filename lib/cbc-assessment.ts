export const CBC_RESULT_DISPLAY_CONFIG = {
  topPredictionsLimit: 5,
  minProbability: 0.05,
} as const

export type CbcConfidenceLevel = "high" | "moderate" | "low"
export type CbcSeverity = "routine" | "attention" | "urgent"
export type CbcParameterStatus =
  | "low"
  | "high"
  | "elevated"
  | "normal"
  | "critical"
export type CbcEvidenceStrength = "strong" | "moderate" | "low"
export type CbcParameterGroup = "rbc" | "wbc" | "platelet" | string

export interface CbcPrediction {
  name: string
  probability: number
  confidence_level?: CbcConfidenceLevel
  explanation?: string
  supporting_factors?: string[]
}

export interface CbcContributingFactor {
  parameter: string
  value: number | string
  unit?: string
  status?: CbcParameterStatus | string
  importance: number
  shap_value?: number
  direction?: string
  contribution_label?: string
}

export interface CbcParameterResult {
  parameter: string
  key?: string
  value: number | string
  value_display?: string
  unit: string
  status: CbcParameterStatus | string
  reference_range?: string
  abnormality_severity?: string
  group?: CbcParameterGroup
  group_label?: string
  message?: string
}

export interface CbcLineageStatus {
  lineage: string
  status: CbcParameterStatus | string
}

export interface CbcDiseaseSignal {
  name: string
  probability: number
  contributing_factors?: CbcContributingFactor[]
  ensemble_weights?: Record<string, number>
}

export interface CbcPatternStep {
  label: string
  direction?: CbcParameterStatus | string
}

export interface CbcEvidenceGroup {
  strength: CbcEvidenceStrength
  items: string[]
}

export interface CbcModelInfo {
  name: string
  version: string
}

export interface CbcAssessmentResponse {
  primary_prediction: CbcPrediction
  alternative_predictions: CbcPrediction[]
  disease_associated_signals?: CbcDiseaseSignal[]
  contributing_factors: CbcContributingFactor[]
  pattern_summary: string
  key_pattern: CbcPatternStep[]
  pattern_caption?: string
  cbc_results: CbcParameterResult[]
  grouped_results?: {
    rbc?: CbcParameterResult[]
    wbc?: CbcParameterResult[]
    platelet?: CbcParameterResult[]
  }
  lineage_overview: CbcLineageStatus[]
  supporting_evidence: CbcEvidenceGroup[]
  severity: CbcSeverity
  follow_up: string[]
  clinical_flag_message?: string
  disclaimer?: string
  model_info: CbcModelInfo
}

export type CbcLabKey =
  | "Hb"
  | "RBC"
  | "WBC"
  | "Platelets"
  | "Neutrophils"
  | "Lymphocytes"
  | "Monocytes"
  | "Eosinophils"
  | "Basophils"
  | "MCV"
  | "MCH"
  | "MCHC"
  | "RDW"

export interface CbcAssessRequest {
  Age: number
  Height: number
  Weight: number
  BMI: number
  Hb: number | null
  RBC: number | null
  WBC: number | null
  Platelets: number | null
  Neutrophils: number | null
  Lymphocytes: number | null
  Monocytes: number | null
  Eosinophils: number | null
  Basophils: number | null
  MCV: number | null
  MCH: number | null
  MCHC: number | null
  RDW: number | null
}

export type CbcLabValues = Record<CbcLabKey, string>
export type CbcLabUnits = Partial<Record<CbcLabKey, string>>

export interface CbcReportExtractionResponse {
  success: boolean
  source_file?: string
  values?: Partial<Record<CbcLabKey, number | string | null>>
  units?: CbcLabUnits
  raw_values?: Record<string, unknown>
  missing_fields?: unknown[]
  conversions?: unknown[]
  review_flags?: unknown[]
  requires_manual_review?: boolean
  review_reason?: string
  message?: string
}

export const CBC_LAB_FIELDS: {
  key: CbcLabKey
  label: string
  group: "rbc" | "wbc" | "platelet"
  groupLabel: string
}[] = [
  { key: "Hb", label: "Hb", group: "rbc", groupLabel: "Red Blood Cell Parameters" },
  { key: "RBC", label: "RBC", group: "rbc", groupLabel: "Red Blood Cell Parameters" },
  { key: "MCV", label: "MCV", group: "rbc", groupLabel: "Red Blood Cell Parameters" },
  { key: "MCH", label: "MCH", group: "rbc", groupLabel: "Red Blood Cell Parameters" },
  { key: "MCHC", label: "MCHC", group: "rbc", groupLabel: "Red Blood Cell Parameters" },
  { key: "RDW", label: "RDW", group: "rbc", groupLabel: "Red Blood Cell Parameters" },
  { key: "WBC", label: "WBC", group: "wbc", groupLabel: "White Blood Cell Parameters" },
  { key: "Neutrophils", label: "Neutrophils", group: "wbc", groupLabel: "White Blood Cell Parameters" },
  { key: "Lymphocytes", label: "Lymphocytes", group: "wbc", groupLabel: "White Blood Cell Parameters" },
  { key: "Monocytes", label: "Monocytes", group: "wbc", groupLabel: "White Blood Cell Parameters" },
  { key: "Eosinophils", label: "Eosinophils", group: "wbc", groupLabel: "White Blood Cell Parameters" },
  { key: "Basophils", label: "Basophils", group: "wbc", groupLabel: "White Blood Cell Parameters" },
  { key: "Platelets", label: "Platelets", group: "platelet", groupLabel: "Platelet Parameters" },
]

export const EMPTY_CBC_LAB_VALUES: CbcLabValues = {
  Hb: "",
  RBC: "",
  WBC: "",
  Platelets: "",
  Neutrophils: "",
  Lymphocytes: "",
  Monocytes: "",
  Eosinophils: "",
  Basophils: "",
  MCV: "",
  MCH: "",
  MCHC: "",
  RDW: "",
}

const DISEASE_SIGNAL_LABELS: Record<string, string> = {
  Dengue_signal: "Dengue-associated CBC signal",
  Malaria_signal: "Malaria-associated CBC signal",
  Iron_deficiency_signal: "Iron-deficiency-like anemia signal",
  Megaloblastic_signal: "Megaloblastic-like anemia signal",
  Hemolytic_signal: "Hemolytic-like anemia signal",
}

export class CbcApiError extends Error {
  kind: "unavailable" | "parse" | "assess"

  constructor(message: string, kind: "unavailable" | "parse" | "assess") {
    super(message)
    this.name = "CbcApiError"
    this.kind = kind
  }
}

export function getCbcApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_CBC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "")
}

async function readJson(response: Response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function isNetworkError(error: unknown) {
  return error instanceof TypeError || (error instanceof Error && /failed to fetch|network/i.test(error.message))
}

export async function parseCbcReport(file: File): Promise<CbcReportExtractionResponse> {
  try {
    const { parseCbcReport: requestCbcParse } = await import("@/lib/api")
    return await requestCbcParse(file) as unknown as CbcReportExtractionResponse
  } catch (error) {
    throw new CbcApiError(
      error instanceof Error ? error.message : "Unable to read the CBC report. Please try again or enter the CBC values manually.",
      "parse"
    )
  }
}

export async function fetchCbcAssessment(input: CbcAssessRequest, patientId?: string): Promise<CbcAssessmentResponse> {
  try {
    const { predictCbc } = await import("@/lib/api")
    const result = await predictCbc({ ...input, patientId })
    if (!result.assessment?.primary_prediction) {
      throw new Error("The CBC model returned an incomplete response.")
    }
    return normalizeCbcAssessment(result.assessment as unknown as CbcAssessmentResponse)
  } catch (error) {
    throw new CbcApiError(
      error instanceof Error ? error.message : "Unable to analyze CBC. Please verify the values and try again.",
      "assess"
    )
  }
}

export function labValuesFromExtraction(extraction: CbcReportExtractionResponse): CbcLabValues {
  const next = { ...EMPTY_CBC_LAB_VALUES }
  for (const field of CBC_LAB_FIELDS) {
    const value = extraction.values?.[field.key]
    if (value === null || value === undefined || value === "") continue
    next[field.key] = String(value)
  }
  return next
}

export function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

export function buildCbcAssessRequest(
  demographics: { age: string; height: string; weight: string; bmi: string },
  labValues: CbcLabValues
): { request?: CbcAssessRequest; error?: string } {
  const Age = Number(demographics.age)
  const Height = Number(demographics.height)
  const Weight = Number(demographics.weight)
  const BMI = Number(demographics.bmi)

  if (![Age, Height, Weight, BMI].every((value) => Number.isFinite(value) && value > 0)) {
    return { error: "Please enter age, height, and weight before analysis." }
  }

  for (const field of CBC_LAB_FIELDS) {
    const raw = labValues[field.key].trim()
    if (raw && !Number.isFinite(Number(raw))) {
      return { error: `Please enter a valid number for ${field.label}.` }
    }
  }

  return {
    request: {
      Age,
      Height,
      Weight,
      BMI,
      Hb: parseOptionalNumber(labValues.Hb),
      RBC: parseOptionalNumber(labValues.RBC),
      WBC: parseOptionalNumber(labValues.WBC),
      Platelets: parseOptionalNumber(labValues.Platelets),
      Neutrophils: parseOptionalNumber(labValues.Neutrophils),
      Lymphocytes: parseOptionalNumber(labValues.Lymphocytes),
      Monocytes: parseOptionalNumber(labValues.Monocytes),
      Eosinophils: parseOptionalNumber(labValues.Eosinophils),
      Basophils: parseOptionalNumber(labValues.Basophils),
      MCV: parseOptionalNumber(labValues.MCV),
      MCH: parseOptionalNumber(labValues.MCH),
      MCHC: parseOptionalNumber(labValues.MCHC),
      RDW: parseOptionalNumber(labValues.RDW),
    },
  }
}

export function displayDiseaseSignalName(name: string) {
  return DISEASE_SIGNAL_LABELS[name] || name.replace(/_signal$/i, "-associated CBC signal").replace(/_/g, " ")
}

export function contributionLabelFromImportance(importance: number) {
  if (importance >= 0.15) return "High contribution"
  if (importance >= 0.05) return "Moderate contribution"
  return "Low contribution"
}

export function formatReviewItem(item: unknown): string {
  if (typeof item === "string") return item
  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>
    if (typeof record.message === "string") return record.message
    if (typeof record.reason === "string") return record.reason
    if (typeof record.field === "string") return record.field
  }
  try {
    return JSON.stringify(item)
  } catch {
    return String(item)
  }
}

function assignResultGroups(results: CbcParameterResult[]): CbcParameterResult[] {
  return results.map((row) => {
    if (row.group && row.group_label) return row
    const match = CBC_LAB_FIELDS.find(
      (field) =>
        field.key === row.key ||
        field.label.toLowerCase() === row.parameter.toLowerCase() ||
        (field.key === "Hb" && row.parameter.toLowerCase().includes("hemoglobin"))
    )
    return {
      ...row,
      group: row.group || match?.group || "other",
      group_label: row.group_label || match?.groupLabel || "Other parameters",
    }
  })
}

export function normalizeCbcAssessment(raw: CbcAssessmentResponse): CbcAssessmentResponse {
  const grouped = raw.grouped_results
  let cbcResults = raw.cbc_results || []

  if (grouped && (!cbcResults.length || cbcResults.every((row) => !row.group))) {
    cbcResults = [
      ...(grouped.rbc || []).map((row) => ({
        ...row,
        group: "rbc",
        group_label: "Red Blood Cell Parameters",
      })),
      ...(grouped.wbc || []).map((row) => ({
        ...row,
        group: "wbc",
        group_label: "White Blood Cell Parameters",
      })),
      ...(grouped.platelet || []).map((row) => ({
        ...row,
        group: "platelet",
        group_label: "Platelet Parameters",
      })),
    ]
  }

  return {
    ...raw,
    alternative_predictions: raw.alternative_predictions || [],
    contributing_factors: (raw.contributing_factors || []).map((factor) => ({
      ...factor,
      contribution_label:
        factor.contribution_label || contributionLabelFromImportance(factor.importance),
    })),
    key_pattern: raw.key_pattern || [],
    cbc_results: assignResultGroups(cbcResults),
    lineage_overview: raw.lineage_overview || [],
    supporting_evidence: raw.supporting_evidence || [],
    follow_up: raw.follow_up || [],
    model_info: raw.model_info || { name: "CBC model", version: "1.0" },
  }
}

export const mockCbcAssessment: CbcAssessmentResponse = {
  primary_prediction: {
    name: "Dengue-like CBC pattern",
    probability: 0.78,
    confidence_level: "high",
  },
  alternative_predictions: [
    {
      name: "Malaria-like CBC pattern",
      probability: 0.11,
      explanation:
        "The model assigned secondary probability to a malaria-like pattern based on overlapping cytopenia features, with comparatively lower contribution from the platelet decline.",
      supporting_factors: [
        "Reduced WBC count",
        "Platelet reduction of moderate strength",
      ],
    },
    {
      name: "Viral infection pattern",
      probability: 0.07,
      explanation:
        "A viral infection pattern remained a lower-ranked alternative due to the lymphocyte-predominant differential, without dominating the overall prediction.",
      supporting_factors: [
        "Relative lymphocyte increase",
        "Reduced neutrophil proportion",
      ],
    },
    {
      name: "Normal CBC pattern",
      probability: 0.04,
      explanation:
        "A normal CBC pattern was retained as a low-probability class and did not meet the default display threshold.",
      supporting_factors: ["Several red-cell indices within reported range"],
    },
    {
      name: "Bacterial infection pattern",
      probability: 0.03,
      explanation:
        "Bacterial-pattern probability remained low because neutrophil predominance was not the dominant returned feature.",
      supporting_factors: ["Limited neutrophil contribution"],
    },
  ],
  contributing_factors: [
    {
      parameter: "Platelets",
      value: 92000,
      unit: "/µL",
      status: "low",
      importance: 0.92,
      contribution_label: "High",
    },
    {
      parameter: "WBC",
      value: 3800,
      unit: "/µL",
      status: "low",
      importance: 0.78,
      contribution_label: "High",
    },
    {
      parameter: "Lymphocytes",
      value: 52,
      unit: "%",
      status: "high",
      importance: 0.61,
      contribution_label: "Moderate",
    },
    {
      parameter: "Neutrophils",
      value: 38,
      unit: "%",
      status: "low",
      importance: 0.54,
      contribution_label: "Moderate",
    },
    {
      parameter: "Hematocrit",
      value: 47,
      unit: "%",
      status: "elevated",
      importance: 0.41,
      contribution_label: "Moderate",
    },
  ],
  pattern_summary:
    "Low platelet count combined with reduced WBC count and the observed differential pattern contributed strongly to the model's prediction.",
  key_pattern: [
    { label: "Platelets", direction: "low" },
    { label: "WBC", direction: "low" },
    { label: "Lymphocyte shift", direction: "high" },
  ],
  pattern_caption: "Pattern contributing to prediction",
  cbc_results: [
    {
      parameter: "Hemoglobin",
      value: 12.8,
      unit: "g/dL",
      status: "normal",
      reference_range: "12.0–15.5",
      group: "rbc",
      group_label: "Red Blood Cell Parameters",
    },
    {
      parameter: "RBC",
      value: 4.6,
      unit: "×10⁶/µL",
      status: "normal",
      reference_range: "4.0–5.2",
      group: "rbc",
      group_label: "Red Blood Cell Parameters",
    },
    {
      parameter: "Hematocrit",
      value: 47,
      unit: "%",
      status: "elevated",
      reference_range: "36–46",
      abnormality_severity: "mild",
      group: "rbc",
      group_label: "Red Blood Cell Parameters",
    },
    {
      parameter: "MCV",
      value: 88,
      unit: "fL",
      status: "normal",
      reference_range: "80–96",
      group: "rbc",
      group_label: "Red Blood Cell Parameters",
    },
    {
      parameter: "MCH",
      value: 29.4,
      unit: "pg",
      status: "normal",
      reference_range: "27–33",
      group: "rbc",
      group_label: "Red Blood Cell Parameters",
    },
    {
      parameter: "MCHC",
      value: 33.2,
      unit: "g/dL",
      status: "normal",
      reference_range: "32–36",
      group: "rbc",
      group_label: "Red Blood Cell Parameters",
    },
    {
      parameter: "RDW",
      value: 13.1,
      unit: "%",
      status: "normal",
      reference_range: "11.5–14.5",
      group: "rbc",
      group_label: "Red Blood Cell Parameters",
    },
    {
      parameter: "WBC",
      value: 3800,
      unit: "/µL",
      status: "low",
      reference_range: "4,000–11,000",
      abnormality_severity: "moderate",
      group: "wbc",
      group_label: "White Blood Cell Parameters",
    },
    {
      parameter: "Neutrophils",
      value: 38,
      unit: "%",
      status: "low",
      reference_range: "40–70",
      abnormality_severity: "mild",
      group: "wbc",
      group_label: "White Blood Cell Parameters",
    },
    {
      parameter: "Lymphocytes",
      value: 52,
      unit: "%",
      status: "high",
      reference_range: "20–45",
      abnormality_severity: "mild",
      group: "wbc",
      group_label: "White Blood Cell Parameters",
    },
    {
      parameter: "Monocytes",
      value: 7,
      unit: "%",
      status: "normal",
      reference_range: "2–8",
      group: "wbc",
      group_label: "White Blood Cell Parameters",
    },
    {
      parameter: "Eosinophils",
      value: 2,
      unit: "%",
      status: "normal",
      reference_range: "1–4",
      group: "wbc",
      group_label: "White Blood Cell Parameters",
    },
    {
      parameter: "Basophils",
      value: 0.4,
      unit: "%",
      status: "normal",
      reference_range: "0–1",
      group: "wbc",
      group_label: "White Blood Cell Parameters",
    },
    {
      parameter: "Platelets",
      value: 92000,
      unit: "/µL",
      status: "low",
      reference_range: "150,000–450,000",
      abnormality_severity: "moderate",
      group: "platelet",
      group_label: "Platelet Parameters",
    },
  ],
  lineage_overview: [
    { lineage: "RBC Status", status: "normal" },
    { lineage: "WBC Status", status: "low" },
    { lineage: "Platelet Status", status: "low" },
  ],
  supporting_evidence: [
    {
      strength: "strong",
      items: [
        "Low platelet count",
        "Low WBC count",
        "Differential-count pattern",
      ],
    },
    {
      strength: "moderate",
      items: ["Elevated hematocrit", "Relative lymphocyte increase"],
    },
  ],
  severity: "attention",
  follow_up: [
    "Correlate with clinical presentation and fever history.",
    "Consider serial CBC monitoring as clinically indicated.",
    "Review additional confirmatory tests per institutional protocol.",
  ],
  clinical_flag_message:
    "Model identified findings that may require prompt clinical evaluation.",
  disclaimer:
    "AI-generated CBC assessment. This result is intended to support clinical review and is not a definitive diagnosis. Additional clinical evaluation and confirmatory testing may be required.",
  model_info: {
    name: "CBC Ensemble",
    version: "1.0",
  },
}

export function rankPredictions(
  assessment: CbcAssessmentResponse,
  config: { topPredictionsLimit: number; minProbability: number } = CBC_RESULT_DISPLAY_CONFIG
) {
  return [assessment.primary_prediction, ...(assessment.alternative_predictions || [])]
    .filter((prediction) => prediction && typeof prediction.probability === "number")
    .filter((prediction) => {
      const value = prediction.probability <= 1 ? prediction.probability : prediction.probability / 100
      return value >= config.minProbability
    })
    .sort((a, b) => b.probability - a.probability)
    .slice(0, config.topPredictionsLimit)
}

export function formatCbcValue(value: number | string) {
  if (typeof value === "string") return value
  if (Number.isInteger(value) && Math.abs(value) >= 1000) {
    return value.toLocaleString("en-US")
  }
  return String(value)
}

export function toProbabilityPercent(probability: number) {
  return probability <= 1 ? Math.round(probability * 100) : Math.round(probability)
}

export function formatProbability(probability: number) {
  return `${toProbabilityPercent(probability)}%`
}
