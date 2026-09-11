"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Stethoscope, Brain, FileText, Pill, StickyNote } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TimelineEvent } from "@/lib/types"

interface PatientTimelineProps {
  events: TimelineEvent[]
}

const eventConfig: Record<
  TimelineEvent["type"],
  { icon: typeof Calendar; color: string; bgColor: string }
> = {
  visit: {
    icon: Stethoscope,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  diagnosis: {
    icon: Brain,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
  report: {
    icon: FileText,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  medication: {
    icon: Pill,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
  note: {
    icon: StickyNote,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
}

export function PatientTimeline({ events }: PatientTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Patient Timeline
        </CardTitle>
        <CardDescription>History of visits, diagnoses, and treatments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-border" />

          <div className="space-y-6">
            {events.map((event, index) => {
              const config = eventConfig[event.type]
              const Icon = config.icon

              return (
                <div key={event.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-background",
                      config.bgColor
                    )}
                  >
                    <Icon className={cn("h-5 w-5", config.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{event.title}</h4>
                        <Badge variant="secondary" className="capitalize text-xs">
                          {event.type}
                        </Badge>
                      </div>
                      <time className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>

                    {/* Event metadata */}
                    {event.metadata && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {value}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
