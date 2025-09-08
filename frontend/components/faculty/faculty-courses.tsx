"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Users, Calendar, Settings, Plus, BarChart3, FileText } from "lucide-react"

export function FacultyCourses() {
  const courses = [
    {
      id: 1,
      code: "CS-201",
      name: "Data Structures and Algorithms",
      semester: "Spring 2024",
      enrolled: 45,
      capacity: 50,
      schedule: "MWF 9:00-10:00 AM",
      room: "CS-201",
      progress: 75,
      avgGrade: "B+",
      attendance: 92,
      assignments: 8,
      pendingGrades: 12,
    },
    {
      id: 2,
      code: "CS-301",
      name: "Advanced Algorithms",
      semester: "Spring 2024",
      enrolled: 32,
      capacity: 35,
      schedule: "TTh 11:00-12:30 PM",
      room: "CS-301",
      progress: 68,
      avgGrade: "A-",
      attendance: 88,
      assignments: 6,
      pendingGrades: 8,
    },
    {
      id: 3,
      code: "CS-401",
      name: "Software Engineering",
      semester: "Spring 2024",
      enrolled: 28,
      capacity: 30,
      schedule: "MWF 2:00-3:00 PM",
      room: "CS-401",
      progress: 82,
      avgGrade: "A",
      attendance: 95,
      assignments: 10,
      pendingGrades: 15,
    },
  ]

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return "text-green-600"
    if (attendance >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-green-100 text-green-800"
    if (grade.startsWith("B")) return "bg-blue-100 text-blue-800"
    if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground mt-1">Manage your teaching assignments and course materials</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">105</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Overall average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">35</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-6 lg:grid-cols-1">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {course.code} - {course.name}
                  </CardTitle>
                  <CardDescription className="mt-1">{course.semester}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getGradeColor(course.avgGrade)}>{course.avgGrade}</Badge>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Enrollment Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Enrollment
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Students</span>
                      <span className="font-medium">
                        {course.enrolled}/{course.capacity}
                      </span>
                    </div>
                    <Progress value={(course.enrolled / course.capacity) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {Math.round((course.enrolled / course.capacity) * 100)}% capacity
                    </p>
                  </div>
                </div>

                {/* Schedule Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{course.schedule}</p>
                    <p className="text-muted-foreground">Room: {course.room}</p>
                    <p className={`font-medium ${getAttendanceColor(course.attendance)}`}>
                      {course.attendance}% attendance
                    </p>
                  </div>
                </div>

                {/* Progress Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Progress
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Course</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">Semester progress</p>
                  </div>
                </div>

                {/* Grading Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Grading
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">{course.assignments}</span> assignments
                    </p>
                    <p className="text-destructive font-medium">{course.pendingGrades} pending grades</p>
                    <p className="text-muted-foreground">Avg: {course.avgGrade}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-border">
                <Button variant="default" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  View Students
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Grade Assignments
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Schedule
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
