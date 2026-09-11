"use client"

import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { RiskLevel, Gender } from "@/lib/types"

export interface PatientFilters {
  search: string
  riskLevel: RiskLevel | "all"
  gender: Gender | "all"
  ageRange: "all" | "0-18" | "19-40" | "41-60" | "60+"
}

interface PatientFiltersProps {
  filters: PatientFilters
  onFiltersChange: (filters: PatientFilters) => void
  totalCount: number
  filteredCount: number
}

export function PatientFiltersBar({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
}: PatientFiltersProps) {
  const hasActiveFilters =
    filters.riskLevel !== "all" || filters.gender !== "all" || filters.ageRange !== "all"

  const activeFilterCount = [
    filters.riskLevel !== "all",
    filters.gender !== "all",
    filters.ageRange !== "all",
  ].filter(Boolean).length

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      riskLevel: "all",
      gender: "all",
      ageRange: "all",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patients by name or ID..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2">
          <Select
            value={filters.riskLevel}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, riskLevel: value as RiskLevel | "all" })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          {/* Advanced Filters Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Advanced Filters</h4>

                {/* Gender Filter */}
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={filters.gender}
                    onValueChange={(value) =>
                      onFiltersChange({ ...filters, gender: value as Gender | "all" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Age Range Filter */}
                <div className="space-y-2">
                  <Label>Age Range</Label>
                  <Select
                    value={filters.ageRange}
                    onValueChange={(value) =>
                      onFiltersChange({
                        ...filters,
                        ageRange: value as PatientFilters["ageRange"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ages</SelectItem>
                      <SelectItem value="0-18">0-18 years</SelectItem>
                      <SelectItem value="19-40">19-40 years</SelectItem>
                      <SelectItem value="41-60">41-60 years</SelectItem>
                      <SelectItem value="60+">60+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full gap-2">
                    <X className="h-4 w-4" />
                    Clear all filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Filter Summary */}
      {(hasActiveFilters || filters.search) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {filteredCount} of {totalCount} patients
          </span>
          {hasActiveFilters && (
            <>
              <span>&bull;</span>
              <Button
                variant="link"
                size="sm"
                onClick={clearFilters}
                className="h-auto p-0 text-primary"
              >
                Clear filters
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
