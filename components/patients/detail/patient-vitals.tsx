"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Heart, Activity, Thermometer, Droplets, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Patient } from "@/lib/types"

interface PatientVitalsProps {
  patient: Patient
}

// Mock historical data for charts
const bpHistory = [
  { date: "Jan 1", systolic: 138, diastolic: 88 },
  { date: "Jan 8", systolic: 142, diastolic: 90 },
  { date: "Jan 15", systolic: 140, diastolic: 89 },
  { date: "Jan 22", systolic: 145, diastolic: 92 },
  { date: "Jan 29", systolic: 143, diastolic: 91 },
  { date: "Feb 5", systolic: 141, diastolic: 88 },
  { date: "Feb 12", systolic: 138, diastolic: 86 },
]

const hrHistory = [
  { date: "Jan 1", value: 85 },
  { date: "Jan 8", value: 88 },
  { date: "Jan 15", value: 82 },
  { date: "Jan 22", value: 90 },
  { date: "Jan 29", value: 86 },
  { date: "Feb 5", value: 84 },
  { date: "Feb 12", value: 82 },
]

const tempHistory = [
  { date: "Jan 1", value: 98.4 },
  { date: "Jan 8", value: 98.6 },
  { date: "Jan 15", value: 98.2 },
  { date: "Jan 22", value: 99.1 },
  { date: "Jan 29", value: 98.8 },
  { date: "Feb 5", value: 98.6 },
  { date: "Feb 12", value: 98.4 },
]

const oxygenHistory = [
  { date: "Jan 1", value: 97 },
  { date: "Jan 8", value: 96 },
  { date: "Jan 15", value: 98 },
  { date: "Jan 22", value: 95 },
  { date: "Jan 29", value: 96 },
  { date: "Feb 5", value: 97 },
  { date: "Feb 12", value: 98 },
]

export function PatientVitals({ patient }: PatientVitalsProps) {
  const vitals = [
    {
      label: "Blood Pressure",
      value: patient.bloodPressure || "N/A",
      unit: "mmHg",
      icon: Activity,
      trend: "down" as const,
      trendValue: "-3%",
      status: "warning" as const,
      color: "var(--color-destructive)",
      data: bpHistory,
    },
    {
      label: "Heart Rate",
      value: patient.heartRate || "N/A",
      unit: "bpm",
      icon: Heart,
      trend: "stable" as const,
      trendValue: "0%",
      status: "normal" as const,
      color: "var(--color-chart-3)",
      data: hrHistory,
    },
    {
      label: "Temperature",
      value: patient.temperature || "N/A",
      unit: "\u00B0F",
      icon: Thermometer,
      trend: "down" as const,
      trendValue: "-0.5%",
      status: "normal" as const,
      color: "var(--color-chart-4)",
      data: tempHistory,
    },
    {
      label: "Oxygen Saturation",
      value: 98,
      unit: "%",
      icon: Droplets,
      trend: "up" as const,
      trendValue: "+2%",
      status: "normal" as const,
      color: "var(--color-chart-2)",
      data: oxygenHistory,
    },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {vitals.map((vital) => {
        const TrendIcon =
          vital.trend === "up"
            ? TrendingUp
            : vital.trend === "down"
            ? TrendingDown
            : Minus

        return (
          <Card key={vital.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      vital.status === "warning"
                        ? "bg-chart-4/10 text-chart-4"
                        : vital.status === "critical"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    <vital.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{vital.label}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold">{vital.value}</span>
                      <span className="text-sm text-muted-foreground">{vital.unit}</span>
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm",
                    vital.trend === "up"
                      ? "text-chart-2"
                      : vital.trend === "down"
                      ? "text-chart-3"
                      : "text-muted-foreground"
                  )}
                >
                  <TrendIcon className="h-4 w-4" />
                  <span>{vital.trendValue}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: { label: vital.label, color: vital.color },
                  systolic: { label: "Systolic", color: "var(--color-destructive)" },
                  diastolic: { label: "Diastolic", color: "var(--color-chart-4)" },
                }}
                className="h-[120px] w-full"
              >
                {vital.label === "Blood Pressure" ? (
                  <LineChart data={vital.data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      stroke="var(--color-destructive)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      stroke="var(--color-chart-4)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                ) : (
                  <LineChart data={vital.data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={vital.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                )}
              </ChartContainer>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
