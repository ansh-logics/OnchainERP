"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Building } from "lucide-react"

interface AddDepartmentModalProps {
  onDepartmentAdded?: () => void
}

export function AddDepartmentModal({ onDepartmentAdded }: AddDepartmentModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    code: "",
    description: "",
    hod: "",
    programs: "",
    sectionsConfig: {
      studentsPerSection: "",
      totalSections: "",
      sectionNamingPattern: "A,B,C..."
    },
    rollNumberConfig: {
      startingNumber: "",
      pattern: "{YEAR}{DEPT}{###}"
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      
      // Get user info to get college ID
      const userResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const userData = await userResponse.json()
      
      // Ensure college ID is properly extracted and converted to string
      const collegeId = userData.data?.college?._id || userData.data?.college
      const collegeIdString = typeof collegeId === 'string' ? collegeId : collegeId?.toString()
      
      const departmentData = {
        name: formData.name,
        shortName: formData.shortName,
        code: formData.code,
        description: formData.description,
        college: collegeIdString,
        hod: formData.hod || undefined, // Convert empty string to undefined
        programs: formData.programs ? formData.programs.split(',').map(program => {
          const trimmed = program.trim();
          // Parse program format: "B.Tech (4 years, 8 semesters)" or just "B.Tech"
          if (trimmed.includes('(')) {
            const [degree, details] = trimmed.split('(');
            const detailsMatch = details.match(/(\d+)\s*years?,\s*(\d+)\s*semesters?/);
            return {
              name: `${degree.trim()} Program`,
              degree: degree.trim(),
              duration: detailsMatch ? parseInt(detailsMatch[1]) : 4,
              totalSemesters: detailsMatch ? parseInt(detailsMatch[2]) : 8
            };
          }
          // Default values for simple degree format
          return {
            name: `${trimmed} Program`,
            degree: trimmed,
            duration: trimmed.includes('M.') ? 2 : 4,
            totalSemesters: trimmed.includes('M.') ? 4 : 8
          };
        }) : [],
        sectionsConfig: {
          studentsPerSection: parseInt(formData.sectionsConfig.studentsPerSection) || 60,
          totalSections: parseInt(formData.sectionsConfig.totalSections) || 2,
          sectionNamingPattern: formData.sectionsConfig.sectionNamingPattern
        },
        rollNumberConfig: {
          startingNumber: parseInt(formData.rollNumberConfig.startingNumber) || 1,
          pattern: formData.rollNumberConfig.pattern || "{YEAR}{DEPT}{###}"
        }
      }
      
      console.log('Department data being sent:', departmentData)
      
      const response = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(departmentData),
      })

      const data = await response.json()
      
      if (data.success) {
        setIsOpen(false)
        setFormData({
          name: "",
          shortName: "",
          code: "",
          description: "",
          hod: "",
          programs: "",
          sectionsConfig: {
            studentsPerSection: "",
            totalSections: "",
            sectionNamingPattern: "A,B,C..."
          },
          rollNumberConfig: {
            startingNumber: "",
            pattern: "{YEAR}{DEPT}{###}"
          }
        })
        onDepartmentAdded?.()
      } else {
        alert(data.message || 'Failed to create department')
      }
    } catch (error) {
      console.error('Error creating department:', error)
      alert('Failed to create department')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Building className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
          <DialogDescription>
            Create a new academic department
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name</Label>
              <Input
                id="name"
                placeholder="e.g., Computer Science Engineering"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortName">Short Name</Label>
              <Input
                id="shortName"
                placeholder="e.g., CSE"
                value={formData.shortName}
                onChange={(e) => handleInputChange("shortName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Department Code</Label>
              <Input
                id="code"
                placeholder="e.g., CS01"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Department description..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentsPerSection">Students Per Section</Label>
              <Input
                id="studentsPerSection"
                type="number"
                min="10"
                max="100"
                placeholder="e.g., 60"
                value={formData.sectionsConfig.studentsPerSection}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  sectionsConfig: {
                    ...prev.sectionsConfig,
                    studentsPerSection: e.target.value
                  }
                }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalSections">Total Sections</Label>
              <Input
                id="totalSections"
                type="number"
                min="1"
                max="10"
                placeholder="e.g., 2"
                value={formData.sectionsConfig.totalSections}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  sectionsConfig: {
                    ...prev.sectionsConfig,
                    totalSections: e.target.value
                  }
                }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startingNumber">Starting Roll Number</Label>
              <Input
                id="startingNumber"
                type="number"
                min="1"
                placeholder="e.g., 1"
                value={formData.rollNumberConfig.startingNumber}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  rollNumberConfig: {
                    ...prev.rollNumberConfig,
                    startingNumber: e.target.value
                  }
                }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rollPattern">Roll Number Pattern</Label>
              <Select 
                value={formData.rollNumberConfig.pattern} 
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  rollNumberConfig: {
                    ...prev.rollNumberConfig,
                    pattern: value
                  }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="{YEAR}{DEPT}{###}">{new Date().getFullYear()}CS001</SelectItem>
                  <SelectItem value="{DEPT}{YEAR}{###}">CS2024001</SelectItem>
                  <SelectItem value="{YEAR}{###}{DEPT}">2024001CS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="programs">Programs Offered</Label>
            <Input
              id="programs"
              placeholder="e.g., B.Tech (4 years, 8 semesters), M.Tech (2 years, 4 semesters)"
              value={formData.programs}
              onChange={(e) => handleInputChange("programs", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter programs separated by commas. Format: "Degree (years, semesters)" or just "Degree"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hod">Head of Department (Optional)</Label>
            <Input
              id="hod"
              placeholder="Faculty ID or name"
              value={formData.hod}
              onChange={(e) => handleInputChange("hod", e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Department"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
