"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, User, Lock, UserCheck, Building2, AlertCircle } from "lucide-react"

type UserRole = "student" | "faculty" | "admin" | "super_admin" | "cashier"

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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showCollegeRegistration, setShowCollegeRegistration] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data: LoginResponse = await response.json()

      if (data.success) {
        // Store user data and token
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("token", data.token)

        // Redirect based on role
        switch (data.user.role) {
          case "student":
            router.push("/student")
            break
          case "faculty":
            router.push("/faculty")
            break
          case "admin":
          case "super_admin":
          case "cashier":
            router.push("/admin")
            break
          default:
            router.push("/")
        }
      } else {
        setError(data.message || "Login failed")
      }
    } catch (error) {
      console.error('Login error:', error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Login Card */}
      <Card className="w-full shadow-lg border-border/50">
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
                onClick={() => setShowCollegeRegistration(!showCollegeRegistration)}
              >
                Register College
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* College Registration Card */}
      {showCollegeRegistration && <CollegeRegistrationForm />}
    </div>
  )
}

// College Registration Component
function CollegeRegistrationForm() {
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
          window.location.reload()
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
    <Card className="w-full shadow-lg border-border/50">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Register New College
        </CardTitle>
        <CardDescription>Register your institution to get started with the ERP system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="collegeName">College Name</Label>
                <Input
                  id="collegeName"
                  placeholder="Enter college name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortName">Short Name</Label>
                <Input
                  id="shortName"
                  placeholder="e.g., ABC"
                  value={formData.shortName}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="establishedYear">Established Year</Label>
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
                <Label htmlFor="university">Affiliated University</Label>
                <Input
                  id="university"
                  placeholder="Enter university name"
                  value={formData.affiliatedUniversity}
                  onChange={(e) => setFormData(prev => ({ ...prev, affiliatedUniversity: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Admin Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Admin Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminName">Admin Name</Label>
                <Input
                  id="adminName"
                  placeholder="Enter admin name"
                  value={formData.adminDetails.name}
                  onChange={(e) => updateFormData('adminDetails', 'name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
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
                <Label htmlFor="adminPassword">Admin Password</Label>
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
                <Label htmlFor="adminPhone">Admin Phone</Label>
                <Input
                  id="adminPhone"
                  placeholder="Enter admin phone"
                  value={formData.adminDetails.contactNumber}
                  onChange={(e) => updateFormData('adminDetails', 'contactNumber', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="collegePhone">College Phone</Label>
                <Input
                  id="collegePhone"
                  placeholder="Enter college phone"
                  value={formData.contactDetails.phone}
                  onChange={(e) => updateFormData('contactDetails', 'phone', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collegeEmail">College Email</Label>
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
                <Label htmlFor="registrationNumber">Registration Number</Label>
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

          <Button type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading ? "Registering College..." : "Register College"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
