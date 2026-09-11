"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  ClipboardList,
  Target,
  Calendar,
  Plus,
  Check,
  Clock,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Patient } from "@/lib/types"

interface PatientCarePlanProps {
  patient: Patient
}

interface Task {
  id: string
  label: string
  completed: boolean
  dueDate?: string
  priority: "low" | "medium" | "high"
}

interface Goal {
  id: string
  title: string
  target: string
  current: string
  progress: number
  status: "on-track" | "at-risk" | "achieved"
}

interface FollowUp {
  id: string
  type: string
  date: string
  notes?: string
}

const initialTasks: Task[] = [
  { id: "1", label: "Monitor blood pressure daily", completed: true, priority: "high" },
  { id: "2", label: "Take medications as prescribed", completed: true, priority: "high" },
  { id: "3", label: "Schedule follow-up ECG", completed: false, dueDate: "2024-02-15", priority: "medium" },
  { id: "4", label: "Dietary consultation", completed: false, dueDate: "2024-02-20", priority: "low" },
  { id: "5", label: "Exercise for 30 mins daily", completed: false, priority: "medium" },
]

const initialGoals: Goal[] = [
  { id: "1", title: "Blood Pressure Control", target: "Below 130/85", current: "145/95", progress: 65, status: "at-risk" },
  { id: "2", title: "Weight Management", target: "75 kg", current: "82 kg", progress: 45, status: "on-track" },
  { id: "3", title: "Heart Rate Stability", target: "60-80 bpm", current: "88 bpm", progress: 80, status: "on-track" },
]

const followUps: FollowUp[] = [
  { id: "1", type: "Cardiology Review", date: "2024-02-15", notes: "Review ECG results" },
  { id: "2", type: "Lab Work", date: "2024-02-20", notes: "Lipid panel, HbA1c" },
  { id: "3", type: "General Checkup", date: "2024-03-01" },
]

export function PatientCarePlan({ patient }: PatientCarePlanProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [newTask, setNewTask] = useState("")

  const completedTasks = tasks.filter((t) => t.completed).length
  const taskProgress = (completedTasks / tasks.length) * 100

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const addTask = () => {
    if (!newTask.trim()) return
    setTasks((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        label: newTask,
        completed: false,
        priority: "medium",
      },
    ])
    setNewTask("")
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Tasks Checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <CardTitle>Care Tasks</CardTitle>
            </div>
            <Badge variant="secondary">
              {completedTasks}/{tasks.length} completed
            </Badge>
          </div>
          <Progress value={taskProgress} className="h-2 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                  task.completed ? "bg-muted/50 border-muted" : "bg-card"
                )}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      task.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {task.label}
                  </p>
                  {task.dueDate && !task.completed && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Due: {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    task.priority === "high"
                      ? "text-destructive"
                      : task.priority === "medium"
                      ? "text-chart-4"
                      : "text-muted-foreground"
                  )}
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>

          {/* Add Task */}
          <div className="flex gap-2">
            <Input
              placeholder="Add new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <Button size="icon" onClick={addTask}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Health Goals</CardTitle>
          </div>
          <CardDescription>Treatment targets and progress</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {initialGoals.map((goal) => (
            <div key={goal.id} className="space-y-2 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{goal.title}</h4>
                <Badge
                  variant="outline"
                  className={cn(
                    goal.status === "achieved"
                      ? "text-chart-2 border-chart-2/20"
                      : goal.status === "at-risk"
                      ? "text-destructive border-destructive/20"
                      : "text-chart-4 border-chart-4/20"
                  )}
                >
                  {goal.status === "achieved" && <Check className="h-3 w-3 mr-1" />}
                  {goal.status === "at-risk" && <AlertCircle className="h-3 w-3 mr-1" />}
                  {goal.status.replace("-", " ")}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current: {goal.current}</span>
                <span className="font-medium">Target: {goal.target}</span>
              </div>
              <Progress
                value={goal.progress}
                className={cn(
                  "h-2",
                  goal.status === "achieved"
                    ? "[&>div]:bg-chart-2"
                    : goal.status === "at-risk"
                    ? "[&>div]:bg-destructive"
                    : "[&>div]:bg-chart-4"
                )}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Follow-up Reminders */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Follow-up Schedule</CardTitle>
          </div>
          <CardDescription>Upcoming appointments and reminders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {followUps.map((followUp) => {
              const date = new Date(followUp.date)
              const isUpcoming = date > new Date()
              const isPast = date < new Date()

              return (
                <div
                  key={followUp.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    isPast
                      ? "bg-muted/50 border-muted"
                      : "bg-card border-primary/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={isPast ? "secondary" : "default"}>
                      {followUp.type}
                    </Badge>
                    {isPast && <Check className="h-4 w-4 text-chart-2" />}
                  </div>
                  <p className="font-semibold">
                    {date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  {followUp.notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {followUp.notes}
                    </p>
                  )}
                </div>
              )
            })}
            <button className="p-4 rounded-lg border border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
              <Plus className="h-6 w-6" />
              <span className="text-sm font-medium">Schedule Follow-up</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
