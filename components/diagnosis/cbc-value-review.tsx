"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CBC_LAB_FIELDS,
  formatReviewItem,
  type CbcLabKey,
  type CbcLabUnits,
  type CbcLabValues,
} from "@/lib/cbc-assessment"
import { Info } from "lucide-react"

interface CbcValueReviewProps {
  values: CbcLabValues
  units: CbcLabUnits
  missingFields?: unknown[]
  reviewFlags?: unknown[]
  reviewReason?: string
  disabled?: boolean
  onChange: (key: CbcLabKey, value: string) => void
}

export function CbcValueReview({
  values,
  units,
  missingFields = [],
  reviewFlags = [],
  reviewReason,
  disabled,
  onChange,
}: CbcValueReviewProps) {
  const groups = [
    {
      key: "rbc",
      label: "Red Blood Cell Parameters",
      fields: CBC_LAB_FIELDS.filter((field) => field.group === "rbc"),
    },
    {
      key: "wbc",
      label: "White Blood Cell Parameters",
      fields: CBC_LAB_FIELDS.filter((field) => field.group === "wbc"),
    },
    {
      key: "platelet",
      label: "Platelet Parameters",
      fields: CBC_LAB_FIELDS.filter((field) => field.group === "platelet"),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Extracted CBC Values</CardTitle>
        <CardDescription>
          These normalized values will be sent to the CBC model after you confirm them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Verification required</AlertTitle>
          <AlertDescription>
            {reviewReason ||
              "Values were extracted from the report. Please verify them before analysis."}
          </AlertDescription>
        </Alert>

        {missingFields.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            <p className="font-medium">Missing fields</p>
            <ul className="mt-1 list-disc pl-4">
              {missingFields.map((field, index) => (
                <li key={`${formatReviewItem(field)}-${index}`}>{formatReviewItem(field)}</li>
              ))}
            </ul>
          </div>
        )}

        {reviewFlags.length > 0 && (
          <div className="rounded-lg border px-3 py-2 text-sm">
            <p className="font-medium">Review flags from extraction</p>
            <ul className="mt-1 list-disc pl-4 text-muted-foreground">
              {reviewFlags.map((flag, index) => (
                <li key={`${formatReviewItem(flag)}-${index}`}>{formatReviewItem(flag)}</li>
              ))}
            </ul>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.key} className="space-y-3">
            <h4 className="text-sm font-semibold">{group.label}</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={`cbc-${field.key}`}>
                    {field.label}
                    {units[field.key] ? (
                      <span className="ml-1 font-normal text-muted-foreground">
                        ({units[field.key]})
                      </span>
                    ) : null}
                  </Label>
                  <Input
                    id={`cbc-${field.key}`}
                    type="number"
                    step="any"
                    value={values[field.key]}
                    disabled={disabled}
                    onChange={(event) => onChange(field.key, event.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
