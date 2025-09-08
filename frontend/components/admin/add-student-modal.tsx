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
import { Plus } from "lucide-react"

interface AddStudentModalProps {
  onStudentAdded?: () => void
}

export function AddStudentModal({ onStudentAdded }: AddStudentModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false)
  const [departments, setDepartments] = useState<Array<{_id: string, name: string}>>([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    enrollmentNumber: "",
    batch: "",
    program: "",
    currentSemester: "",
    department: "",
    contactNumber: "",
    address: ""
  })

  // Fetch departments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDepartments()
    }
  }, [isOpen])

  const fetchDepartments = async () => {
    setIsDepartmentsLoading(true)
    try {
      const token = localStorage.getItem("token")
      console.log('Fetching departments with token:', token ? 'Token exists' : 'No token')
      
      const response = await fetch('/api/admin/departments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Departments response:', data)
      
      if (data.success) {
        setDepartments(data.data)
        console.log('Departments set:', data.data)
      } else {
        console.error('Failed to fetch departments:', data.message)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setIsDepartmentsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate that a department is selected
    if (!formData.department) {
      alert('Please select a department. You may need to create departments first.')
      return
    }
    
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
      
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          college: collegeIdString, // Add college ID as string
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setIsOpen(false)
        setFormData({
          name: "",
          email: "",
          password: "",
          enrollmentNumber: "",
          batch: "",
          program: "",
          currentSemester: "",
          department: "",
          contactNumber: "",
          address: ""
        })
        onStudentAdded?.()
        alert('Student created successfully!')
      } else {
        alert(data.message || 'Failed to create student')
      }
    } catch (error) {
      console.error('Error creating student:', error)
      alert('Failed to create student')
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
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Create a new student account with enrollment details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrollmentNumber">Enrollment Number</Label>
              <Input
                id="enrollmentNumber"
                value={formData.enrollmentNumber}
                onChange={(e) => handleInputChange("enrollmentNumber", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <Input
                id="batch"
                placeholder="e.g., 2023-2027"
                value={formData.batch}
                onChange={(e) => handleInputChange("batch", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Select value={formData.program} onValueChange={(value) => handleInputChange("program", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B.Tech">B.Tech</SelectItem>
                  <SelectItem value="M.Tech">M.Tech</SelectItem>
                  <SelectItem value="BCA">BCA</SelectItem>
                  <SelectItem value="MCA">MCA</SelectItem>
                  <SelectItem value="BSc">BSc</SelectItem>
                  <SelectItem value="MSc">MSc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentSemester">Current Semester</Label>
              <Select value={formData.currentSemester} onValueChange={(value) => handleInputChange("currentSemester", value)}>
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
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={isDepartmentsLoading ? "Loading departments..." : departments.length === 0 ? "No departments available. Please create departments first." : "Select department"} />
                </SelectTrigger>
                <SelectContent>
                  {!isDepartmentsLoading && departments.length > 0 && (
                    departments.map((dept) => (
                      <SelectItem key={dept._id} value={dept._id}>{dept.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input
              id="contactNumber"
              value={formData.contactNumber}
              onChange={(e) => handleInputChange("contactNumber", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
