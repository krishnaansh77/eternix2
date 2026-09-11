"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, Heart, FileText, AlertCircle, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Gender } from "@/lib/types"

interface AddPatientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: PatientFormData) => void
}

export interface PatientFormData {
  name: string
  age: number | ""
  gender: Gender | ""
  bloodPressureSystolic: number | ""
  bloodPressureDiastolic: number | ""
  heartRate: number | ""
  temperature: number | ""
  weight: number | ""
  height: number | ""
  bloodType: string
  aadhar: string
  notes: string
}

const initialFormData: PatientFormData = {
  name: "",
  age: "",
  gender: "",
  bloodPressureSystolic: "",
  bloodPressureDiastolic: "",
  heartRate: "",
  temperature: "",
  weight: "",
  height: "",
  bloodType: "",
  aadhar: "",
  notes: "",
}

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export function AddPatientModal({ open, onOpenChange, onSubmit }: AddPatientModalProps) {
  const [formData, setFormData] = useState<PatientFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof PatientFormData, string>>>({})
  const [currentSection, setCurrentSection] = useState<"basic" | "vitals" | "optional">("basic")

  // Calculate BMI
  const bmi = useMemo(() => {
    if (formData.weight && formData.height) {
      const heightInMeters = Number(formData.height) / 100
      const calculatedBmi = Number(formData.weight) / (heightInMeters * heightInMeters)
      return calculatedBmi.toFixed(1)
    }
    return null
  }, [formData.weight, formData.height])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData(initialFormData)
      setErrors({})
      setCurrentSection("basic")
    }
  }, [open])

  const validateField = (field: keyof PatientFormData, value: string | number) => {
    switch (field) {
      case "name":
        if (!value || String(value).trim().length < 2) {
          return "Name must be at least 2 characters"
        }
        break
      case "age":
        if (!value || Number(value) < 0 || Number(value) > 150) {
          return "Age must be between 0 and 150"
        }
        break
      case "gender":
        if (!value) {
          return "Gender is required"
        }
        break
      case "aadhar":
        if (value && String(value).replace(/\s/g, "").length !== 12) {
          return "Aadhar must be 12 digits"
        }
        break
    }
    return ""
  }

  const handleInputChange = (field: keyof PatientFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    const error = validateField(field, value)
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  const formatAadhar = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    const match = cleaned.match(/^(\d{0,4})(\d{0,4})(\d{0,4})$/)
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join(" ")
    }
    return value
  }

  const isBasicValid = formData.name && formData.age && formData.gender && !errors.name && !errors.age

  const handleSubmit = () => {
    // Validate all required fields
    const nameError = validateField("name", formData.name)
    const ageError = validateField("age", formData.age)
    const genderError = validateField("gender", formData.gender)

    if (nameError || ageError || genderError) {
      setErrors({
        name: nameError,
        age: ageError,
        gender: genderError,
      })
      setCurrentSection("basic")
      return
    }

    onSubmit?.(formData)
    onOpenChange(false)
  }

  const sections = [
    { id: "basic" as const, label: "Basic Info", icon: User, required: true },
    { id: "vitals" as const, label: "Vitals", icon: Heart, required: false },
    { id: "optional" as const, label: "Additional", icon: FileText, required: false },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Fill in the patient details. Required fields are marked with an asterisk.
          </DialogDescription>
        </DialogHeader>

        {/* Section Tabs */}
        <div className="flex px-6 gap-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(section.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                currentSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <section.icon className="h-4 w-4" />
              {section.label}
              {section.required && <span className="text-destructive">*</span>}
              {section.id === "basic" && isBasicValid && (
                <Check className="h-3 w-3 text-chart-2" />
              )}
            </button>
          ))}
        </div>

        <Separator />

        <ScrollArea className="px-6 py-4 max-h-[50vh]">
          {/* Basic Info Section */}
          {currentSection === "basic" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter patient's full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={cn(errors.name && "border-destructive")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">
                    Age <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Years"
                    min={0}
                    max={150}
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value ? Number(e.target.value) : "")}
                    className={cn(errors.age && "border-destructive")}
                  />
                  {errors.age && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.age}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">
                    Gender <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange("gender", value as Gender)}
                  >
                    <SelectTrigger className={cn(errors.gender && "border-destructive")}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.gender}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Vitals Section */}
          {currentSection === "vitals" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Blood Pressure</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Systolic"
                    value={formData.bloodPressureSystolic}
                    onChange={(e) =>
                      handleInputChange("bloodPressureSystolic", e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-24"
                  />
                  <span className="text-muted-foreground">/</span>
                  <Input
                    type="number"
                    placeholder="Diastolic"
                    value={formData.bloodPressureDiastolic}
                    onChange={(e) =>
                      handleInputChange("bloodPressureDiastolic", e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">mmHg</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heartRate">Heart Rate</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="heartRate"
                      type="number"
                      placeholder="72"
                      value={formData.heartRate}
                      onChange={(e) =>
                        handleInputChange("heartRate", e.target.value ? Number(e.target.value) : "")
                      }
                    />
                    <span className="text-sm text-muted-foreground">bpm</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      placeholder="98.6"
                      value={formData.temperature}
                      onChange={(e) =>
                        handleInputChange("temperature", e.target.value ? Number(e.target.value) : "")
                      }
                    />
                    <span className="text-sm text-muted-foreground">&deg;F</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="70"
                      value={formData.weight}
                      onChange={(e) =>
                        handleInputChange("weight", e.target.value ? Number(e.target.value) : "")
                      }
                    />
                    <span className="text-sm text-muted-foreground">kg</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      value={formData.height}
                      onChange={(e) =>
                        handleInputChange("height", e.target.value ? Number(e.target.value) : "")
                      }
                    />
                    <span className="text-sm text-muted-foreground">cm</span>
                  </div>
                </div>
              </div>

              {bmi && (
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Calculated BMI</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        Number(bmi) < 18.5
                          ? "text-chart-4"
                          : Number(bmi) < 25
                          ? "text-chart-2"
                          : Number(bmi) < 30
                          ? "text-chart-4"
                          : "text-destructive"
                      )}
                    >
                      {bmi} kg/m&sup2;
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Optional Section */}
          {currentSection === "optional" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select
                  value={formData.bloodType}
                  onValueChange={(value) => handleInputChange("bloodType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadhar">Aadhar Number</Label>
                <Input
                  id="aadhar"
                  placeholder="XXXX XXXX XXXX"
                  value={formData.aadhar}
                  onChange={(e) => handleInputChange("aadhar", formatAadhar(e.target.value))}
                  maxLength={14}
                  className={cn(errors.aadhar && "border-destructive")}
                />
                {errors.aadhar && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.aadhar}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  This field will be masked for privacy
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about the patient..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
        </ScrollArea>

        <Separator />

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-muted/50">
          <div className="text-sm text-muted-foreground">
            {!isBasicValid && (
              <span className="flex items-center gap-1 text-chart-4">
                <AlertCircle className="h-4 w-4" />
                Complete required fields in Basic Info
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!isBasicValid}>
              Add Patient
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function useMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const [value, setValue] = useState<T>(factory)
  useEffect(() => {
    setValue(factory())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return value
}
