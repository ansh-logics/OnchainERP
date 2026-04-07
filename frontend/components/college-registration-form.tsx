"use client"

import type React from "react"

import { useState } from "react"
import { AlertCircle, Building2, Eye, EyeOff, UserCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type CollegeRegistrationFormState = {
  name: string
  shortName: string
  establishedYear: string
  affiliatedUniversity: string
  collegeType: string
  address: {
    street: string
    city: string
    state: string
    pincode: string
    country: string
  }
  contactDetails: {
    phone: string
    email: string
    website: string
    fax: string
  }
  registrationNumber: string
  accreditation: {
    grade: string
    validUntil: string
    accreditingBody: string
  }
  campusArea: string
  totalBuildings: string
  totalClassrooms: string
  totalLaboratories: string
  libraryDetails: {
    totalBooks: string
    digitalResources: string
    readingCapacity: string
  }
  adminDetails: {
    name: string
    email: string
    password: string
    contactNumber: string
    dateOfBirth: string
    gender: string
  }
  academicYear: string
}

interface CollegeRegistrationFormProps {
  onBackToLogin?: () => void
}

const STEP_LABELS = ["College", "Admin", "Contact"] as const
const LAST_STEP_INDEX = STEP_LABELS.length - 1

export function CollegeRegistrationForm({ onBackToLogin }: CollegeRegistrationFormProps) {
  const [formData, setFormData] = useState<CollegeRegistrationFormState>({
    name: "",
    shortName: "",
    establishedYear: "",
    affiliatedUniversity: "",
    collegeType: "government",

    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },

    contactDetails: {
      phone: "",
      email: "",
      website: "",
      fax: "",
    },

    registrationNumber: "",
    accreditation: {
      grade: "",
      validUntil: "",
      accreditingBody: "NAAC",
    },

    campusArea: "",
    totalBuildings: "",
    totalClassrooms: "",
    totalLaboratories: "",
    libraryDetails: {
      totalBooks: "",
      digitalResources: "",
      readingCapacity: "",
    },

    adminDetails: {
      name: "",
      email: "",
      password: "",
      contactNumber: "",
      dateOfBirth: "",
      gender: "male",
    },

    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [step, setStep] = useState(0)
  const [showAdminPassword, setShowAdminPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/colleges/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = (await response.json()) as { success?: boolean; message?: string }

      if (data.success) {
        setSuccess(
          "College registered successfully! You can now login with admin credentials."
        )
        setTimeout(() => {
          window.location.href = "/"
        }, 1500)
      } else {
        setError(data.message || "Registration failed")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (
    section: keyof CollegeRegistrationFormState,
    field: string,
    value: unknown
  ) => {
    setFormData((prev) => {
      if (section === "adminDetails") {
        return {
          ...prev,
          adminDetails: {
            ...prev.adminDetails,
            [field]: value as string,
          },
        }
      }
      if (section === "contactDetails") {
        return {
          ...prev,
          contactDetails: {
            ...prev.contactDetails,
            [field]: value as string,
          },
        }
      }
      if (section === "address") {
        return {
          ...prev,
          address: {
            ...prev.address,
            [field]: value as string,
          },
        }
      }
      if (section === "accreditation") {
        return {
          ...prev,
          accreditation: {
            ...prev.accreditation,
            [field]: value as string,
          },
        }
      }
      if (section === "libraryDetails") {
        return {
          ...prev,
          libraryDetails: {
            ...prev.libraryDetails,
            [field]: value as string,
          },
        }
      }

      return {
        ...prev,
        [section]: value as CollegeRegistrationFormState[typeof section],
      }
    })
  }

  const validateStep = (stepIndex: number): string | null => {
    if (stepIndex === 0) {
      if (!formData.name.trim()) return "College name is required."
      if (!formData.shortName.trim()) return "Short name is required."
      if (!formData.establishedYear.trim()) return "Established year is required."
      if (!formData.affiliatedUniversity.trim()) return "Affiliated university is required."
      return null
    }

    if (stepIndex === 1) {
      if (!formData.adminDetails.name.trim()) return "Admin name is required."
      if (!formData.adminDetails.email.trim()) return "Admin email is required."
      if (!formData.adminDetails.password.trim()) return "Admin password is required."
      if (!formData.adminDetails.contactNumber.trim()) return "Admin phone is required."
      return null
    }

    if (stepIndex === 2) {
      if (!formData.contactDetails.phone.trim()) return "College phone is required."
      if (!formData.contactDetails.email.trim()) return "College email is required."
      if (!formData.registrationNumber.trim()) return "Registration number is required."
      return null
    }

    return null
  }

  const goToNextStep = () => {
    const stepError = validateStep(step)
    if (stepError) {
      setError(stepError)
      return
    }
    setError("")
    setStep((prev) => Math.min(prev + 1, LAST_STEP_INDEX))
  }

  const goToPreviousStep = () => {
    setError("")
    setStep((prev) => Math.max(prev - 1, 0))
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (step < LAST_STEP_INDEX) {
          goToNextStep()
          return
        }
        void handleSubmit(e)
      }}
      className="flex flex-col gap-5"
    >
      <div className="flex items-center justify-center gap-2 text-center">
        <Building2 className="h-5 w-5 text-primary/90" />
        <h1 className="text-2xl font-semibold tracking-tight">Register New College</h1>
      </div>
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200/80 bg-red-50/90 p-3 text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="text-sm leading-snug">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 rounded-xl border border-green-200/80 bg-green-50/90 p-3 text-green-800">
          <UserCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="text-sm leading-snug">{success}</span>
        </div>
      )}

      <div className="space-y-4 border-b border-border/60 pb-5">
        <div className="grid grid-cols-3 gap-4">
          {STEP_LABELS.map((label, idx) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  idx === step
                    ? "bg-primary text-primary-foreground"
                    : idx < step
                      ? "bg-primary/20 text-primary"
                      : "border border-border/70 bg-transparent text-muted-foreground"
                }`}
              >
                {idx + 1}
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-tight text-foreground md:text-base">
            Basic information
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="collegeName">College name</Label>
              <Input
                id="collegeName"
                placeholder="Enter college name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shortName">Short name</Label>
              <Input
                id="shortName"
                placeholder="e.g. YCE"
                value={formData.shortName}
                onChange={(e) => setFormData((p) => ({ ...p, shortName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="establishedYear">Established year</Label>
              <Input
                id="establishedYear"
                type="number"
                placeholder="1995"
                value={formData.establishedYear}
                onChange={(e) => setFormData((p) => ({ ...p, establishedYear: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="university">Affiliated university</Label>
              <Input
                id="university"
                placeholder="University name"
                value={formData.affiliatedUniversity}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    affiliatedUniversity: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-tight text-foreground md:text-base">
            Admin details
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="adminName">Admin name</Label>
              <Input
                id="adminName"
                placeholder="Full name"
                value={formData.adminDetails.name}
                onChange={(e) => updateFormData("adminDetails", "name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="adminEmail">Admin email</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@college.edu"
                value={formData.adminDetails.email}
                onChange={(e) => updateFormData("adminDetails", "email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center">
                <Label htmlFor="adminPassword">Admin password</Label>
                <button
                  type="button"
                  aria-label={showAdminPassword ? "Hide password" : "Show password"}
                  aria-pressed={showAdminPassword}
                  className="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  onClick={() => setShowAdminPassword((s) => !s)}
                >
                  {showAdminPassword ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Show
                    </>
                  )}
                </button>
              </div>
              <Input
                id="adminPassword"
                type={showAdminPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={formData.adminDetails.password}
                onChange={(e) => updateFormData("adminDetails", "password", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adminPhone">Admin phone</Label>
              <Input
                id="adminPhone"
                placeholder="10 digit number"
                value={formData.adminDetails.contactNumber}
                onChange={(e) => updateFormData("adminDetails", "contactNumber", e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-tight text-foreground md:text-base">
            Contact information
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="collegePhone">College phone</Label>
              <Input
                id="collegePhone"
                placeholder="10 digit number"
                value={formData.contactDetails.phone}
                onChange={(e) => updateFormData("contactDetails", "phone", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="collegeEmail">College email</Label>
              <Input
                id="collegeEmail"
                type="email"
                placeholder="info@college.edu"
                value={formData.contactDetails.email}
                onChange={(e) => updateFormData("contactDetails", "email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://example.edu"
                value={formData.contactDetails.website}
                onChange={(e) => updateFormData("contactDetails", "website", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="registrationNumber">Registration number</Label>
              <Input
                id="registrationNumber"
                placeholder="Registration ID"
                value={formData.registrationNumber}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    registrationNumber: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 border-t border-border/60 pt-5">
        {step > 0 && (
          <Button type="button" variant="outline" className="flex-1" onClick={goToPreviousStep}>
            Previous
          </Button>
        )}
        {step < LAST_STEP_INDEX ? (
          <Button type="submit" className="flex-1">
            Next
          </Button>
        ) : (
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register College"}
          </Button>
        )}
      </div>

      {onBackToLogin && (
        <div className="border-t border-border/70 pt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Already registered your college?{" "}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 font-medium text-primary"
              onClick={onBackToLogin}
            >
              Sign In
            </Button>
          </p>
        </div>
      )}
    </form>
  )
}

