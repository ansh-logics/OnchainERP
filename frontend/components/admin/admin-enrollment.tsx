"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from "lucide-react"

interface Enrollment {
  _id: string
  student: {
    _id: string
    name: string
    enrollmentNumber: string
    email: string
  }
  course: {
    _id: string
    name: string
    code: string
    credits: number
  }
  semester: number
  academicYear: string
  enrollmentDate: string
  status: 'active' | 'completed' | 'dropped' | 'pending'
  grade?: string
}

export function AdminEnrollment() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchEnrollments()
  }, [])

  useEffect(() => {
    let filtered = enrollments

    if (searchTerm) {
      filtered = filtered.filter(enrollment =>
        enrollment.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.student.enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.course.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(enrollment => enrollment.status === statusFilter)
    }

    setFilteredEnrollments(filtered)
  }, [enrollments, searchTerm, statusFilter])

  const fetchEnrollments = async () => {
    try {
      setIsLoading(true)
      // For now, using mock data since the backend endpoint might not exist yet
      setTimeout(() => {
        const mockEnrollments: Enrollment[] = [
          {
            _id: "1",
            student: {
              _id: "s1",
              name: "John Doe",
              enrollmentNumber: "2024001",
              email: "john.doe@college.edu"
            },
            course: {
              _id: "c1",
              name: "Introduction to Computer Science",
              code: "CS101",
              credits: 3
            },
            semester: 1,
            academicYear: "2024-2025",
            enrollmentDate: "2024-08-15",
            status: "active"
          },
          {
            _id: "2",
            student: {
              _id: "s2",
              name: "Jane Smith",
              enrollmentNumber: "2024002",
              email: "jane.smith@college.edu"
            },
            course: {
              _id: "c2",
              name: "Data Structures",
              code: "CS201",
              credits: 4
            },
            semester: 3,
            academicYear: "2024-2025",
            enrollmentDate: "2024-08-15",
            status: "active"
          }
        ]
        setEnrollments(mockEnrollments)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Enrollments fetch error:', error)
      setError("Failed to load enrollments")
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      case 'dropped':
        return <Badge className="bg-red-100 text-red-800">Dropped</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading enrollments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchEnrollments}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enrollment Management</h1>
          <p className="text-muted-foreground">Manage student course enrollments</p>
        </div>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          New Enrollment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Enrollments</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.filter(e => e.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.filter(e => e.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.filter(e => e.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Enrollments</CardTitle>
          <CardDescription>View and manage all student course enrollments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by student name, enrollment number, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredEnrollments.length > 0 ? (
            <div className="rounded-md border">
              <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b bg-muted/50">
                <div>Student</div>
                <div>Course</div>
                <div>Semester</div>
                <div>Academic Year</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              
              {filteredEnrollments.map((enrollment) => (
                <div key={enrollment._id} className="grid grid-cols-6 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/25">
                  <div>
                    <div className="font-medium">{enrollment.student.name}</div>
                    <div className="text-sm text-muted-foreground">{enrollment.student.enrollmentNumber}</div>
                  </div>
                  <div>
                    <div className="font-medium">{enrollment.course.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {enrollment.course.code} • {enrollment.course.credits} Credits
                    </div>
                  </div>
                  <div>{enrollment.semester}</div>
                  <div>{enrollment.academicYear}</div>
                  <div>{getStatusBadge(enrollment.status)}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm" className="text-red-600">Drop</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm || statusFilter !== "all" ? "No enrollments found" : "No enrollments available"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Student enrollments will appear here once courses are assigned."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
