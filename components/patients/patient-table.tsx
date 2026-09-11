"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Eye, Pencil, Brain, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Patient, RiskLevel } from "@/lib/types"

interface PatientTableProps {
  patients: Patient[]
  onEdit?: (patient: Patient) => void
  onStartDiagnosis?: (patient: Patient) => void
}

const riskColors: Record<RiskLevel, string> = {
  low: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  medium: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  high: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
}

type SortField = "name" | "age" | "lastVisit" | "riskLevel"
type SortOrder = "asc" | "desc"

const riskOrder: Record<RiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
}

export function PatientTable({ patients, onEdit, onStartDiagnosis }: PatientTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>("lastVisit")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(patients.map((p) => p.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelect = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) {
      newSet.add(id)
    } else {
      newSet.delete(id)
    }
    setSelectedIds(newSet)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const sortedPatients = [...patients].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name)
        break
      case "age":
        comparison = a.age - b.age
        break
      case "lastVisit":
        comparison = new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime()
        break
      case "riskLevel":
        comparison = riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
        break
    }
    return sortOrder === "asc" ? comparison : -comparison
  })

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=active]:bg-accent"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.size === patients.length && patients.length > 0}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>
              <SortButton field="name">Patient</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="age">Age / Gender</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="lastVisit">Last Visit</SortButton>
            </TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>
              <SortButton field="riskLevel">Risk Level</SortButton>
            </TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPatients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No patients found.
              </TableCell>
            </TableRow>
          ) : (
            sortedPatients.map((patient) => (
              <TableRow key={patient.id} className="group">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(patient.id)}
                    onCheckedChange={(checked) => handleSelect(patient.id, !!checked)}
                    aria-label={`Select ${patient.name}`}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/patients/${patient.id}`}
                    className="flex items-center gap-3 group-hover:text-primary transition-colors"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {patient.id}</p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {patient.age}y, <span className="capitalize">{patient.gender}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {new Date(patient.lastVisit).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {patient.condition}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("capitalize", riskColors[patient.riskLevel])}>
                    {patient.riskLevel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/patients/${patient.id}`} className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          View Patient
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit?.(patient)} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Patient
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onStartDiagnosis?.(patient)}
                        className="cursor-pointer text-primary"
                      >
                        <Brain className="mr-2 h-4 w-4" />
                        Start AI Diagnosis
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
