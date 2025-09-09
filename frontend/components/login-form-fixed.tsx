"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, User, Lock, UserCheck, Building2, AlertCircle, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-api"
import { OnchainERPAPI } from "@/lib/api-client"

type UserRole = "student" | "faculty" | "admin"

interface LoginResponse {
  success: boolean
  message?: string
  user: {
    id: string
    name: string
    email: string
    role: string
    college?: {
      name: string
      shortName: string
    }
    studentProfile?: any
    facultyProfile?: any
  }
  token: string
}

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showCollegeRegistration, setShowCollegeRegistration] = useState(false)
  const router = useRouter()
  
  // Use the API hook for authentication
  const { login, loading: isLoading, error, clearError } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      const result = await login(email, password)
      
      if (result.data) {
        // Redirect based on role
        switch (result.data.role) {
          case "student":
            router.push("/student")
            break
          case "faculty":
            router.push("/faculty")
            break
          case "admin":
            router.push("/admin")
            break
          default:
            router.push("/")
        }
      }
    } catch (error: any) {
      // Error is already handled by the useAuth hook
      console.error('Login error:', error)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {!showCollegeRegistration ? (
        // Login Card
        <Card className="w-full max-w-md mx-auto shadow-lg border-border/50">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <UserCheck className="h-6 w-6 text-primary" />
              Sign In
            </CardTitle>
            <CardDescription>Enter your credentials to access the ERP system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">Demo Credentials:</p>
                <div className="text-xs text-blue-700 space-y-1">
                  <p><strong>Admin:</strong> admin@college.edu / password</p>
                  <p><strong>Faculty:</strong> faculty@college.edu / password</p>
                  <p><strong>Student:</strong> student@college.edu / password</p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Need to register a new college?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => setShowCollegeRegistration(true)}
                >
                  Register College
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        // College Registration Card
        <CollegeRegistrationForm onBackToLogin={() => setShowCollegeRegistration(false)} />
      )}
    </div>
  )
}

// College Registration Component
function CollegeRegistrationForm({ onBackToLogin }: { onBackToLogin: () => void }) {
  const [formData, setFormData] = useState({
    // Basic College Information
    name: "",
    shortName: "",
    establishedYear: "",
    affiliatedUniversity: "",
    collegeType: "government",
    
    // Address
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India"
    },
    
    // Contact Details
    contactDetails: {
      phone: "",
      email: "",
      website: "",
      fax: ""
    },
    
    // Registration Details
    registrationNumber: "",
    accreditation: {
      grade: "",
      validUntil: "",
      accreditingBody: "NAAC"
    },
    
    // Infrastructure
    campusArea: "",
    totalBuildings: "",
    totalClassrooms: "",
    totalLaboratories: "",
    libraryDetails: {
      totalBooks: "",
      digitalResources: "",
      readingCapacity: ""
    },
    
    // Admin Details
    adminDetails: {
      name: "",
      email: "",
      password: "",
      contactNumber: "",
      dateOfBirth: "",
      gender: "male"
    },
    
    // Settings
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch('/api/colleges/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("College registered successfully! You can now login with admin credentials.")
        // Optionally redirect to login
        setTimeout(() => {
          onBackToLogin()
        }, 2000)
      } else {
        setError(data.message || "Registration failed")
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (section: string, field: string, value: any) => {
    setFormData(prev => {
      if (section === 'adminDetails') {
        return {
          ...prev,
          adminDetails: {
            ...prev.adminDetails,
            [field]: value
          }
        }
      } else if (section === 'contactDetails') {
        return {
          ...prev,
          contactDetails: {
            ...prev.contactDetails,
            [field]: value
          }
        }
      } else if (section === 'address') {
        return {
          ...prev,
          address: {
            ...prev.address,
            [field]: value
          }
        }
      } else if (section === 'accreditation') {
        return {
          ...prev,
          accreditation: {
            ...prev.accreditation,
            [field]: value
          }
        }
      } else if (section === 'libraryDetails') {
        return {
          ...prev,
          libraryDetails: {
            ...prev.libraryDetails,
            [field]: value
          }
        }
      } else {
        return {
          ...prev,
          [section]: value
        }
      }
    })
  }

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-lg border-border/50">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBackToLogin}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
          <div className="flex-1 text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Register New College
            </CardTitle>
            <CardDescription>Register your institution to get started with the ERP system</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
              <UserCheck className="h-4 w-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="collegeName">College Name *</Label>
                <Input
                  id="collegeName"
                  placeholder="Enter college name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortName">Short Name *</Label>
                <Input
                  id="shortName"
                  placeholder="e.g., ABC"
                  value={formData.shortName}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="establishedYear">Established Year *</Label>
                <Input
                  id="establishedYear"
                  type="number"
                  placeholder="e.g., 1995"
                  value={formData.establishedYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, establishedYear: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="university">Affiliated University *</Label>
                <Input
                  id="university"
                  placeholder="Enter university name"
                  value={formData.affiliatedUniversity}
                  onChange={(e) => setFormData(prev => ({ ...prev, affiliatedUniversity: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collegeType">College Type</Label>
                <Select value={formData.collegeType} onValueChange={(value) => setFormData(prev => ({ ...prev, collegeType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="aided">Government Aided</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number *</Label>
                <Input
                  id="registrationNumber"
                  placeholder="Enter registration number"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  placeholder="Enter street address"
                  value={formData.address.street}
                  onChange={(e) => updateFormData('address', 'street', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={formData.address.city}
                  onChange={(e) => updateFormData('address', 'city', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="Enter state"
                  value={formData.address.state}
                  onChange={(e) => updateFormData('address', 'state', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  placeholder="Enter pincode"
                  value={formData.address.pincode}
                  onChange={(e) => updateFormData('address', 'pincode', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Enter country"
                  value={formData.address.country}
                  onChange={(e) => updateFormData('address', 'country', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="collegePhone">College Phone *</Label>
                <Input
                  id="collegePhone"
                  placeholder="Enter college phone"
                  value={formData.contactDetails.phone}
                  onChange={(e) => updateFormData('contactDetails', 'phone', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collegeEmail">College Email *</Label>
                <Input
                  id="collegeEmail"
                  type="email"
                  placeholder="Enter college email"
                  value={formData.contactDetails.email}
                  onChange={(e) => updateFormData('contactDetails', 'email', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="Enter website URL"
                  value={formData.contactDetails.website}
                  onChange={(e) => updateFormData('contactDetails', 'website', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fax">Fax</Label>
                <Input
                  id="fax"
                  placeholder="Enter fax number"
                  value={formData.contactDetails.fax}
                  onChange={(e) => updateFormData('contactDetails', 'fax', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Infrastructure Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Infrastructure Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campusArea">Campus Area (acres)</Label>
                <Input
                  id="campusArea"
                  type="number"
                  placeholder="Enter campus area"
                  value={formData.campusArea}
                  onChange={(e) => setFormData(prev => ({ ...prev, campusArea: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalBuildings">Total Buildings</Label>
                <Input
                  id="totalBuildings"
                  type="number"
                  placeholder="Number of buildings"
                  value={formData.totalBuildings}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalBuildings: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalClassrooms">Total Classrooms</Label>
                <Input
                  id="totalClassrooms"
                  type="number"
                  placeholder="Number of classrooms"
                  value={formData.totalClassrooms}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalClassrooms: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalLaboratories">Total Laboratories</Label>
                <Input
                  id="totalLaboratories"
                  type="number"
                  placeholder="Number of labs"
                  value={formData.totalLaboratories}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalLaboratories: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Library Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Library Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalBooks">Total Books</Label>
                <Input
                  id="totalBooks"
                  type="number"
                  placeholder="Number of books"
                  value={formData.libraryDetails.totalBooks}
                  onChange={(e) => updateFormData('libraryDetails', 'totalBooks', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="digitalResources">Digital Resources</Label>
                <Input
                  id="digitalResources"
                  placeholder="Digital resources available"
                  value={formData.libraryDetails.digitalResources}
                  onChange={(e) => updateFormData('libraryDetails', 'digitalResources', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="readingCapacity">Reading Capacity</Label>
                <Input
                  id="readingCapacity"
                  type="number"
                  placeholder="Seating capacity"
                  value={formData.libraryDetails.readingCapacity}
                  onChange={(e) => updateFormData('libraryDetails', 'readingCapacity', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Accreditation Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Accreditation Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accreditingBody">Accrediting Body</Label>
                <Select value={formData.accreditation.accreditingBody} onValueChange={(value) => updateFormData('accreditation', 'accreditingBody', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select accrediting body" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAAC">NAAC</SelectItem>
                    <SelectItem value="NBA">NBA</SelectItem>
                    <SelectItem value="AICTE">AICTE</SelectItem>
                    <SelectItem value="UGC">UGC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accreditationGrade">Grade</Label>
                <Input
                  id="accreditationGrade"
                  placeholder="e.g., A++"
                  value={formData.accreditation.grade}
                  onChange={(e) => updateFormData('accreditation', 'grade', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.accreditation.validUntil}
                  onChange={(e) => updateFormData('accreditation', 'validUntil', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Admin Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Admin Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminName">Admin Name *</Label>
                <Input
                  id="adminName"
                  placeholder="Enter admin name"
                  value={formData.adminDetails.name}
                  onChange={(e) => updateFormData('adminDetails', 'name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="Enter admin email"
                  value={formData.adminDetails.email}
                  onChange={(e) => updateFormData('adminDetails', 'email', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Admin Password *</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="Enter admin password"
                  value={formData.adminDetails.password}
                  onChange={(e) => updateFormData('adminDetails', 'password', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPhone">Admin Phone *</Label>
                <Input
                  id="adminPhone"
                  placeholder="Enter admin phone"
                  value={formData.adminDetails.contactNumber}
                  onChange={(e) => updateFormData('adminDetails', 'contactNumber', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.adminDetails.dateOfBirth}
                  onChange={(e) => updateFormData('adminDetails', 'dateOfBirth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.adminDetails.gender} onValueChange={(value) => updateFormData('adminDetails', 'gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Academic Year */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Academic Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  placeholder="e.g., 2024-2025"
                  value={formData.academicYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button type="button" variant="outline" onClick={onBackToLogin} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Registering College..." : "Register College"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
