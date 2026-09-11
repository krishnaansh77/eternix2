'use client'

import { useState } from 'react'
import { Eye, EyeOff, Stethoscope, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
interface SignupFormProps {
  onBack: () => void
  onSubmit: (data: SignupData) => Promise<void>
  isSubmitting: boolean
  error?: string
}

export interface SignupData {
  accountType: 'doctor' | 'patient'
  firstName: string
  lastName: string
  email: string
  password: string
  specialty: string
  licenseNumber: string
  hospital: string
  acceptTerms: boolean
}

const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Emergency Medicine',
  'Family Medicine',
  'Gastroenterology',
  'General Surgery',
  'Internal Medicine',
  'Neurology',
  'Obstetrics & Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Urology',
  'Other',
]

export function SignupForm({ onBack, onSubmit, isSubmitting, error }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<SignupData>({
    accountType: 'doctor',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    specialty: '',
    licenseNumber: '',
    hospital: '',
    acceptTerms: false,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof SignupData, string>>>({})

  const validateForm = () => {
    const newErrors: Partial<Record<keyof SignupData, string>> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (formData.accountType === 'doctor' && !formData.specialty) newErrors.specialty = 'Specialty is required'
    if (formData.accountType === 'doctor' && !formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required'
    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      await onSubmit(formData)
    }
  }

  const updateField = (field: keyof SignupData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto backdrop-blur-xl bg-white/5 border-white/10">
      <CardHeader className="text-center">
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-4 top-4 text-white/60 hover:text-white hover:bg-white/10"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="mx-auto w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
          <Stethoscope className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl text-white">Create Your Account</CardTitle>
        <CardDescription className="text-white/60">
          Free access during the preview period. No subscription or payment required.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
            {(['doctor', 'patient'] as const).map((accountType) => (
              <button
                key={accountType}
                type="button"
                onClick={() => updateField('accountType', accountType)}
                className={
                  formData.accountType === accountType
                    ? 'h-10 rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm'
                    : 'h-10 rounded-lg text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white'
                }
              >
                Create as {accountType === 'doctor' ? 'Doctor' : 'Patient'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white/80">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary"
              />
              {errors.firstName && <p className="text-xs text-red-400">{errors.firstName}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-white/80">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary"
              />
              {errors.lastName && <p className="text-xs text-red-400">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder={formData.accountType === 'doctor' ? 'doctor@hospital.com' : 'patient@email.com'}
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary"
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
          </div>

          {formData.accountType === 'doctor' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="specialty" className="text-white/80">Medical Specialty</Label>
                <Select value={formData.specialty} onValueChange={(value) => updateField('specialty', value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-primary">
                    <SelectValue placeholder="Select your specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.specialty && <p className="text-xs text-red-400">{errors.specialty}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber" className="text-white/80">License Number</Label>
                  <Input id="licenseNumber" placeholder="MD123456" value={formData.licenseNumber} onChange={(e) => updateField('licenseNumber', e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary" />
                  {errors.licenseNumber && <p className="text-xs text-red-400">{errors.licenseNumber}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital" className="text-white/80">Hospital (Optional)</Label>
                  <Input id="hospital" placeholder="City Hospital" value={formData.hospital} onChange={(e) => updateField('hospital', e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary" />
                </div>
              </div>
            </>
          )}

          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="terms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) => updateField('acceptTerms', checked as boolean)}
              className="mt-1 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label htmlFor="terms" className="text-sm text-white/60 leading-relaxed cursor-pointer">
              I agree to the{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              {formData.accountType === 'doctor' && ', and certify that I am a licensed medical professional.'}
            </Label>
          </div>
          {errors.acceptTerms && <p className="text-xs text-red-400">{errors.acceptTerms}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 mt-6">
            {isSubmitting ? 'Creating account…' : 'Create Free Account'}
          </Button>

          {error && <p className="text-center text-sm text-red-300">{error}</p>}

          <p className="text-center text-sm text-white/50">
            Already have an account?{' '}
            <a href="#" className="text-primary hover:underline">Sign in</a>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
