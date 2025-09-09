"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AddStudentModal } from "./add-student-modal"
import { AddFacultyModal } from "./add-faculty-modal"
import { AddCourseModal } from "./add-course-modal"
import { AddDepartmentModal } from "./add-department-modal"
import { useDashboard } from "@/lib/hooks/use-api"
import {
  Users,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Building,
  Download,
  Plus,
  Settings,
  User,
  RefreshCw,
} from "lucide-react"

interface DashboardStats {
  userStats: {
    totalUsers: number
    totalStudents: number
    totalFaculty: number
    totalAdmin: number
  }
  courseStats: {
    totalCourses: number
  }
  departmentStats: {
    totalDepartments: number
    departments: string[]
  }
  recentUsers: Array<{
    _id: string
    name: string
    email: string
    role: string
    department?: string
    createdAt: string
  }>
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  
  // Use the dashboard hook for data management
  const { dashboardData, loading: isLoading, error, refetch: fetchDashboardData } = useDashboard()

  // Cast the data to match the expected interface
  const data = dashboardData as DashboardStats | null

  const generateAttendanceReport = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch('/api/admin/reports/attendance', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        // Create and download CSV
        const csv = convertToCSV(data.data)
        downloadCSV(csv, 'attendance-report.csv')
      }
    } catch (error) {
      console.error('Attendance report error:', error)
    }
  }

  const generateGradeReport = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch('/api/admin/reports/grades', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        // Create and download CSV
        const csv = convertToCSV(data.data)
        downloadCSV(csv, 'grade-report.csv')
      }
    } catch (error) {
      console.error('Grade report error:', error)
    }
  }

  const convertToCSV = (data: any[]) => {
    if (!data.length) return ""
    
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => Object.values(row).join(','))
    return [headers, ...rows].join('\n')
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', filename)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-900">{error}</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage your institution's operations</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDashboardData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={generateAttendanceReport}>
            <Download className="h-4 w-4 mr-2" />
            Attendance Report
          </Button>
          <Button variant="outline" size="sm" onClick={generateGradeReport}>
            <Download className="h-4 w-4 mr-2" />
            Grade Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.userStats.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">Active enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.userStats.totalFaculty || 0}</div>
            <p className="text-xs text-muted-foreground">Teaching staff members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.courseStats.totalCourses || 0}</div>
            <p className="text-xs text-muted-foreground">Available courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.departmentStats.totalDepartments || 0}</div>
            <p className="text-xs text-muted-foreground">Academic departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Buttons */}
      <div className="flex space-x-2 border-b border-border">
        <Button
          variant={activeTab === "overview" ? "default" : "ghost"}
          onClick={() => setActiveTab("overview")}
          className="rounded-b-none"
        >
          Overview
        </Button>
        <Button
          variant={activeTab === "users" ? "default" : "ghost"}
          onClick={() => setActiveTab("users")}
          className="rounded-b-none"
        >
          Recent Users
        </Button>
        <Button
          variant={activeTab === "departments" ? "default" : "ghost"}
          onClick={() => setActiveTab("departments")}
          className="rounded-b-none"
        >
          Departments
        </Button>
        <Button
          variant={activeTab === "reports" ? "default" : "ghost"}
          onClick={() => setActiveTab("reports")}
          className="rounded-b-none"
        >
          Reports
        </Button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* User Distribution Chart */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Overview of users by role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Students</span>
                      <span className="text-sm text-muted-foreground">
                        {data?.userStats.totalStudents || 0}
                      </span>
                    </div>
                    <Progress 
                      value={(data?.userStats.totalStudents || 0) / (data?.userStats.totalUsers || 1) * 100} 
                      className="h-2"
                    />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Faculty</span>
                      <span className="text-sm text-muted-foreground">
                        {data?.userStats.totalFaculty || 0}
                      </span>
                    </div>
                    <Progress 
                      value={(data?.userStats.totalFaculty || 0) / (data?.userStats.totalUsers || 1) * 100} 
                      className="h-2"
                    />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Admin</span>
                      <span className="text-sm text-muted-foreground">
                        {data?.userStats.totalAdmin || 0}
                      </span>
                    </div>
                    <Progress 
                      value={(data?.userStats.totalAdmin || 0) / (data?.userStats.totalUsers || 1) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <AddStudentModal onStudentAdded={fetchDashboardData} />
                  <AddFacultyModal onFacultyAdded={fetchDashboardData} />
                  <AddCourseModal onCourseAdded={fetchDashboardData} />
                  <AddDepartmentModal onDepartmentAdded={fetchDashboardData} />
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.recentUsers.map((user: any) => (
                  <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.role === 'admin' ? 'default' : user.role === 'faculty' ? 'secondary' : 'outline'}>
                        {user.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "departments" && (
          <Card>
            <CardHeader>
              <CardTitle>Departments</CardTitle>
              <CardDescription>Available academic departments</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.departmentStats.departments && data.departmentStats.departments.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {data.departmentStats.departments.map((dept: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <Building className="h-5 w-5 text-primary" />
                          <span className="font-medium">{dept}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No departments found</h3>
                  <p className="text-muted-foreground mb-4">Create your first department to get started.</p>
                  <AddDepartmentModal onDepartmentAdded={fetchDashboardData} />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "reports" && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Reports</CardTitle>
                <CardDescription>Generate detailed attendance reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={generateAttendanceReport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Attendance Report
                </Button>
                <p className="text-sm text-muted-foreground">
                  Includes student attendance data across all courses and dates.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grade Reports</CardTitle>
                <CardDescription>Generate comprehensive grade reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={generateGradeReport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Grade Report
                </Button>
                <p className="text-sm text-muted-foreground">
                  Includes student grades, assignments, and performance metrics.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
