"use client"

import { useState, useEffect } from "react"
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
import { BookOpen } from "lucide-react"

interface AddCourseModalProps {
  onCourseAdded?: () => void
}

export function AddCourseModal({ onCourseAdded }: AddCourseModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [departments, setDepartments] = useState<Array<{_id: string, name: string}>>([])
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    credits: "",
    department: "",
    semester: "",
    type: "",
    prerequisites: "",
    maxStudents: ""
  })

  // Fetch departments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDepartments()
    }
  }, [isOpen])

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch('/api/admin/departments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setDepartments(data.data)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

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
      
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          college: userData.user?.college?._id || userData.user?.college, // Add college ID
          credits: parseInt(formData.credits),
          semester: parseInt(formData.semester),
          maxStudents: formData.maxStudents ? parseInt(formData.maxStudents) : undefined
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setIsOpen(false)
        setFormData({
          code: "",
          name: "",
          description: "",
          credits: "",
          department: "",
          semester: "",
          type: "",
          prerequisites: "",
          maxStudents: ""
        })
        onCourseAdded?.()
      } else {
        alert(data.message || 'Failed to create course')
      }
    } catch (error) {
      console.error('Error creating course:', error)
      alert('Failed to create course')
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
        <Button className="h-10 rounded-lg px-4 font-medium shadow-none">
          <BookOpen className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Add a new course to the curriculum
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Course Code</Label>
              <Input
                id="code"
                placeholder="e.g., CS101"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                placeholder="e.g., Introduction to Programming"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Course description..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                min="1"
                max="10"
                value={formData.credits}
                onChange={(e) => handleInputChange("credits", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select value={formData.semester} onValueChange={(value) => handleInputChange("semester", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>{sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Course Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Core">Core</SelectItem>
                  <SelectItem value="Elective">Elective</SelectItem>
                  <SelectItem value="Lab">Lab</SelectItem>
                  <SelectItem value="Project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prerequisites">Prerequisites</Label>
              <Input
                id="prerequisites"
                placeholder="e.g., CS100, MATH101"
                value={formData.prerequisites}
                onChange={(e) => handleInputChange("prerequisites", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxStudents">Max Students</Label>
              <Input
                id="maxStudents"
                type="number"
                min="1"
                placeholder="e.g., 60"
                value={formData.maxStudents}
                onChange={(e) => handleInputChange("maxStudents", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
