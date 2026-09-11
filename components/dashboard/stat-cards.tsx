"use client"

import { Users, Activity, AlertTriangle, Brain, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DashboardStats } from "@/lib/types"

interface StatCardsProps {
  stats: DashboardStats
}

const statConfig = [
  {
    key: "totalPatients",
    label: "Total Patients",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    key: "activeCases",
    label: "Active Cases",
    icon: Activity,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  {
    key: "criticalAlerts",
    label: "Critical Alerts",
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    key: "aiDiagnosesToday",
    label: "AI Diagnoses Today",
    icon: Brain,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
] as const

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statConfig.map((config) => {
        const value = stats[config.key]
        const Icon = config.icon
        
        return (
          <Card key={config.key} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {config.label}
                  </p>
                  <p className="text-3xl font-bold tracking-tight">
                    {value.toLocaleString()}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    config.bgColor
                  )}
                >
                  <Icon className={cn("h-6 w-6", config.color)} />
                </div>
              </div>
              
              {config.key === "totalPatients" && (
                <div className="mt-4 flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-chart-2" />
                  <span className="font-medium text-chart-2">
                    +{stats.patientGrowth}%
                  </span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              )}
              
              {config.key === "aiDiagnosesToday" && (
                <div className="mt-4 flex items-center gap-1 text-sm">
                  <span className="text-muted-foreground">Accuracy:</span>
                  <span className="font-medium text-chart-2">
                    {stats.diagnosisAccuracy}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
