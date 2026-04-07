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

interface AddFacultyModalProps {
  onFacultyAdded?: () => void
}

export function AddFacultyModal({ onFacultyAdded }: AddFacultyModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [departments, setDepartments] = useState<Array<{_id: string, name: string}>>([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    facultyId: "",
    designation: "",
    department: "",
    contactNumber: "",
    address: "",
    qualification: "",
    experience: "",
    specialization: ""
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
      
      const response = await fetch('/api/admin/faculty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          college: userData.user?.college?._id || userData.user?.college, // Add college ID
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setIsOpen(false)
        setFormData({
          name: "",
          email: "",
          password: "",
          facultyId: "",
          designation: "",
          department: "",
          contactNumber: "",
          address: "",
          qualification: "",
          experience: "",
          specialization: ""
        })
        onFacultyAdded?.()
      } else {
        alert(data.message || 'Failed to create faculty')
      }
    } catch (error) {
      console.error('Error creating faculty:', error)
      alert('Failed to create faculty')
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
          Add Faculty
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Faculty</DialogTitle>
          <DialogDescription>
            Create a new faculty account with professional details
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
              <Label htmlFor="facultyId">Faculty ID</Label>
              <Input
                id="facultyId"
                value={formData.facultyId}
                onChange={(e) => handleInputChange("facultyId", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Select value={formData.designation} onValueChange={(value) => handleInputChange("designation", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professor">Professor</SelectItem>
                  <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                  <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                  <SelectItem value="Lecturer">Lecturer</SelectItem>
                  <SelectItem value="Senior Lecturer">Senior Lecturer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                placeholder="e.g., PhD in Computer Science"
                value={formData.qualification}
                onChange={(e) => handleInputChange("qualification", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience (years)</Label>
              <Input
                id="experience"
                type="number"
                value={formData.experience}
                onChange={(e) => handleInputChange("experience", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              placeholder="e.g., Machine Learning, Data Structures"
              value={formData.specialization}
              onChange={(e) => handleInputChange("specialization", e.target.value)}
            />
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
              {isLoading ? "Creating..." : "Create Faculty"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
