"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FormWizard, FormStep, FormStepProps } from "@/components/ui/form-wizard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { 
  FileText, 
  User, 
  GraduationCap, 
  Upload, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Download
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/student", icon: "BarChart3" as const },
  { name: "Admissions", href: "/student/admissions", icon: "FileText" as const, current: true },
  { name: "Fees", href: "/student/fees", icon: "DollarSign" as const },
  { name: "Hostel", href: "/student/hostel", icon: "User" as const },
  { name: "Library", href: "/student/library", icon: "BookOpen" as const },
  { name: "Academics", href: "/student/academics", icon: "GraduationCap" as const },
  { name: "Profile", href: "/student/profile", icon: "User" as const },
]

// Form Step Components
function PersonalInfoStep({ data, updateData, errors }: FormStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            placeholder="Enter first name"
            value={data.firstName || ''}
            onChange={(e) => updateData({ firstName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            placeholder="Enter last name"
            value={data.lastName || ''}
            onChange={(e) => updateData({ lastName: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email"
            value={data.email || ''}
            onChange={(e) => updateData({ email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            placeholder="Enter phone number"
            value={data.phone || ''}
            onChange={(e) => updateData({ phone: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={data.dateOfBirth || ''}
            onChange={(e) => updateData({ dateOfBirth: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select value={data.gender || ''} onValueChange={(value) => updateData({ gender: value })}>
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
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={data.category || ''} onValueChange={(value) => updateData({ category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="obc">OBC</SelectItem>
              <SelectItem value="sc">SC</SelectItem>
              <SelectItem value="st">ST</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          placeholder="Enter complete address"
          value={data.address || ''}
          onChange={(e) => updateData({ address: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  )
}

function AcademicInfoStep({ data, updateData, errors }: FormStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">10th Standard Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tenth_board">Board *</Label>
            <Input
              id="tenth_board"
              placeholder="e.g., CBSE, ICSE, State Board"
              value={data.tenth_board || ''}
              onChange={(e) => updateData({ tenth_board: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenth_year">Year of Passing *</Label>
            <Input
              id="tenth_year"
              type="number"
              placeholder="e.g., 2020"
              min="2015"
              max={new Date().getFullYear()}
              value={data.tenth_year || ''}
              onChange={(e) => updateData({ tenth_year: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenth_percentage">Percentage *</Label>
            <Input
              id="tenth_percentage"
              type="number"
              placeholder="e.g., 85.5"
              min="0"
              max="100"
              step="0.1"
              value={data.tenth_percentage || ''}
              onChange={(e) => updateData({ tenth_percentage: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">12th Standard Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="twelfth_board">Board *</Label>
            <Input
              id="twelfth_board"
              placeholder="e.g., CBSE, ICSE, State Board"
              value={data.twelfth_board || ''}
              onChange={(e) => updateData({ twelfth_board: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twelfth_year">Year of Passing *</Label>
            <Input
              id="twelfth_year"
              type="number"
              placeholder="e.g., 2022"
              min="2017"
              max={new Date().getFullYear()}
              value={data.twelfth_year || ''}
              onChange={(e) => updateData({ twelfth_year: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twelfth_percentage">Percentage *</Label>
            <Input
              id="twelfth_percentage"
              type="number"
              placeholder="e.g., 90.2"
              min="0"
              max="100"
              step="0.1"
              value={data.twelfth_percentage || ''}
              onChange={(e) => updateData({ twelfth_percentage: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Entrance Exam Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="entrance_exam">Exam Name</Label>
            <Select value={data.entrance_exam || ''} onValueChange={(value) => updateData({ entrance_exam: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select entrance exam" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jee_main">JEE Main</SelectItem>
                <SelectItem value="jee_advanced">JEE Advanced</SelectItem>
                <SelectItem value="state_cet">State CET</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="entrance_rank">Rank</Label>
            <Input
              id="entrance_rank"
              type="number"
              placeholder="Enter rank"
              value={data.entrance_rank || ''}
              onChange={(e) => updateData({ entrance_rank: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entrance_score">Score</Label>
            <Input
              id="entrance_score"
              type="number"
              placeholder="Enter score"
              value={data.entrance_score || ''}
              onChange={(e) => updateData({ entrance_score: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ProgramSelectionStep({ data, updateData, errors }: FormStepProps) {
  const programs = [
    'B.Tech Computer Science & Engineering',
    'B.Tech Electronics & Communication',
    'B.Tech Mechanical Engineering',
    'B.Tech Civil Engineering',
    'B.Tech Electrical Engineering'
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="preferredProgram">Preferred Program *</Label>
        <Select value={data.preferredProgram || ''} onValueChange={(value) => updateData({ preferredProgram: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select your preferred program" />
          </SelectTrigger>
          <SelectContent>
            {programs.map((program) => (
              <SelectItem key={program} value={program}>
                {program}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="alternateProgram">Alternate Program</Label>
        <Select value={data.alternateProgram || ''} onValueChange={(value) => updateData({ alternateProgram: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select alternate program (optional)" />
          </SelectTrigger>
          <SelectContent>
            {programs.map((program) => (
              <SelectItem key={program} value={program}>
                {program}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reasonForChoice">Why did you choose this program? *</Label>
        <Textarea
          id="reasonForChoice"
          placeholder="Explain your interest in this program"
          value={data.reasonForChoice || ''}
          onChange={(e) => updateData({ reasonForChoice: e.target.value })}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="careerGoals">Career Goals</Label>
        <Textarea
          id="careerGoals"
          placeholder="Describe your career aspirations"
          value={data.careerGoals || ''}
          onChange={(e) => updateData({ careerGoals: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  )
}

function DocumentUploadStep({ data, updateData, errors }: FormStepProps) {
  const requiredDocuments = [
    { id: 'tenth_marksheet', label: '10th Marksheet', required: true },
    { id: 'twelfth_marksheet', label: '12th Marksheet', required: true },
    { id: 'transfer_certificate', label: 'Transfer Certificate', required: true },
    { id: 'passport_photo', label: 'Passport Size Photo', required: true },
    { id: 'entrance_scorecard', label: 'Entrance Exam Scorecard', required: false },
    { id: 'caste_certificate', label: 'Caste Certificate', required: false },
    { id: 'income_certificate', label: 'Income Certificate', required: false },
  ]

  const handleFileUpload = (docId: string, file: File | null) => {
    const documents = { ...data.documents } || {}
    documents[docId] = {
      file,
      status: file ? 'uploaded' : 'pending',
      uploadDate: file ? new Date().toISOString() : undefined
    }
    updateData({ documents })
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Document Upload Guidelines</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Upload clear, scanned copies of documents</li>
          <li>• Accepted formats: PDF, JPG, PNG (Max size: 5MB)</li>
          <li>• Ensure all text is clearly readable</li>
          <li>• Documents marked with * are mandatory</li>
        </ul>
      </div>

      <div className="space-y-4">
        {requiredDocuments.map((doc) => (
          <div key={doc.id} className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Label htmlFor={doc.id} className="font-medium">
                  {doc.label}
                </Label>
                {doc.required && <span className="text-red-500">*</span>}
              </div>
              <Badge variant={data.documents?.[doc.id]?.status === 'uploaded' ? 'default' : 'outline'}>
                {data.documents?.[doc.id]?.status || 'Pending'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <Input
                id={doc.id}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(doc.id, e.target.files?.[0] || null)}
                className="flex-1"
              />
              {data.documents?.[doc.id]?.status === 'uploaded' && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  View
                </Button>
              )}
            </div>
            
            {data.documents?.[doc.id]?.uploadDate && (
              <p className="text-xs text-muted-foreground mt-2">
                Uploaded on: {new Date(data.documents[doc.id].uploadDate).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewStep({ data, updateData, errors }: FormStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Review Your Application</h3>
        <p className="text-sm text-yellow-700">
          Please review all the information before submitting. You can go back to any step to make changes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Name:</strong> {data.firstName} {data.lastName}</p>
            <p><strong>Email:</strong> {data.email}</p>
            <p><strong>Phone:</strong> {data.phone}</p>
            <p><strong>Date of Birth:</strong> {data.dateOfBirth}</p>
            <p><strong>Gender:</strong> {data.gender}</p>
            <p><strong>Category:</strong> {data.category}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>10th:</strong> {data.tenth_percentage}% ({data.tenth_board}, {data.tenth_year})</p>
            <p><strong>12th:</strong> {data.twelfth_percentage}% ({data.twelfth_board}, {data.twelfth_year})</p>
            {data.entrance_exam && (
              <p><strong>Entrance:</strong> {data.entrance_exam} (Rank: {data.entrance_rank})</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Program Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Preferred Program:</strong> {data.preferredProgram}</p>
            {data.alternateProgram && (
              <p><strong>Alternate Program:</strong> {data.alternateProgram}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(data.documents || {}).map(([key, doc]: [string, any]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{key.replace('_', ' ').toUpperCase()}</span>
                  <Badge variant={doc.status === 'uploaded' ? 'default' : 'outline'}>
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function StudentAdmissionsPage() {
  const [applicationStatus] = useState<'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'>('draft')

  const formSteps: FormStep[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Basic personal details',
      component: PersonalInfoStep,
      validation: (data) => {
        const errors = []
        if (!data.firstName) errors.push('First name is required')
        if (!data.lastName) errors.push('Last name is required')
        if (!data.email) errors.push('Email is required')
        if (!data.phone) errors.push('Phone number is required')
        if (!data.dateOfBirth) errors.push('Date of birth is required')
        if (!data.gender) errors.push('Gender is required')
        if (!data.category) errors.push('Category is required')
        if (!data.address) errors.push('Address is required')
        return errors
      }
    },
    {
      id: 'academic',
      title: 'Academic Information',
      description: 'Educational background',
      component: AcademicInfoStep,
      validation: (data) => {
        const errors = []
        if (!data.tenth_board) errors.push('10th board is required')
        if (!data.tenth_year) errors.push('10th passing year is required')
        if (!data.tenth_percentage) errors.push('10th percentage is required')
        if (!data.twelfth_board) errors.push('12th board is required')
        if (!data.twelfth_year) errors.push('12th passing year is required')
        if (!data.twelfth_percentage) errors.push('12th percentage is required')
        return errors
      }
    },
    {
      id: 'program',
      title: 'Program Selection',
      description: 'Choose your program',
      component: ProgramSelectionStep,
      validation: (data) => {
        const errors = []
        if (!data.preferredProgram) errors.push('Preferred program is required')
        if (!data.reasonForChoice) errors.push('Reason for program choice is required')
        return errors
      }
    },
    {
      id: 'documents',
      title: 'Document Upload',
      description: 'Upload required documents',
      component: DocumentUploadStep,
      validation: (data) => {
        const errors = []
        const requiredDocs = ['tenth_marksheet', 'twelfth_marksheet', 'transfer_certificate', 'passport_photo']
        const documents = data.documents || {}
        
        requiredDocs.forEach(docId => {
          if (!documents[docId] || documents[docId].status !== 'uploaded') {
            errors.push(`${docId.replace('_', ' ')} is required`)
          }
        })
        return errors
      }
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Review your application',
      component: ReviewStep,
    }
  ]

  const handleComplete = async (data: any) => {
    console.log('Submitting application:', data)
    // Handle form submission
    alert('Application submitted successfully!')
  }

  const handleSave = async (data: any) => {
    console.log('Saving draft:', data)
    // Handle draft save
  }

  if (applicationStatus !== 'draft') {
    return (
      <AuthGuard allowedRoles={["student"]}>
        <DashboardLayout userRole="student" navigation={navigation}>
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {applicationStatus === 'submitted' && <Clock className="h-16 w-16 text-blue-500" />}
                  {applicationStatus === 'under_review' && <AlertTriangle className="h-16 w-16 text-yellow-500" />}
                  {applicationStatus === 'approved' && <CheckCircle className="h-16 w-16 text-green-500" />}
                  {applicationStatus === 'rejected' && <AlertTriangle className="h-16 w-16 text-red-500" />}
                </div>
                <CardTitle className="text-2xl">
                  {applicationStatus === 'submitted' && 'Application Submitted'}
                  {applicationStatus === 'under_review' && 'Under Review'}
                  {applicationStatus === 'approved' && 'Application Approved'}
                  {applicationStatus === 'rejected' && 'Application Rejected'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  {applicationStatus === 'submitted' && 'Your application has been submitted successfully. You will receive updates via email.'}
                  {applicationStatus === 'under_review' && 'Your application is currently being reviewed by our admissions team.'}
                  {applicationStatus === 'approved' && 'Congratulations! Your application has been approved. Please proceed with fee payment.'}
                  {applicationStatus === 'rejected' && 'Unfortunately, your application has been rejected. Please contact admissions for more details.'}
                </p>
                
                <div className="flex justify-center gap-4">
                  <Button variant="outline">
                    Download Application
                  </Button>
                  {applicationStatus === 'approved' && (
                    <Button>
                      Pay Fees
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout userRole="student" navigation={navigation}>
        <FormWizard
          steps={formSteps}
          title="Student Admission Application"
          description="Complete all steps to submit your admission application"
          onComplete={handleComplete}
          onSave={handleSave}
          autoSave={true}
          allowSkip={false}
        />
      </DashboardLayout>
    </AuthGuard>
  )
}
