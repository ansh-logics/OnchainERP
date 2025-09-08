"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Users, Clock, Calendar, ExternalLink } from "lucide-react"

export function StudentCourses() {
  const enrolledCourses = [
    {
      id: 1,
      code: "CS 201",
      name: "Data Structures and Algorithms",
      instructor: "Dr. Sarah Johnson",
      credits: 4,
      progress: 75,
      grade: "A-",
      schedule: "MWF 9:00-10:00 AM",
      room: "CS-201",
      students: 45,
    },
    {
      id: 2,
      code: "PHY 101",
      name: "General Physics I",
      instructor: "Prof. Michael Chen",
      credits: 3,
      progress: 68,
      grade: "B+",
      schedule: "TTh 11:00-12:30 PM",
      room: "PHY-105",
      students: 60,
    },
    {
      id: 3,
      code: "ENG 102",
      name: "English Literature",
      instructor: "Dr. Emily Rodriguez",
      credits: 3,
      progress: 82,
      grade: "A",
      schedule: "MWF 2:00-3:00 PM",
      room: "ENG-201",
      students: 30,
    },
    {
      id: 4,
      code: "MATH 201",
      name: "Calculus II",
      instructor: "Dr. Robert Kim",
      credits: 4,
      progress: 90,
      grade: "A",
      schedule: "TTh 9:30-11:00 AM",
      room: "MATH-150",
      students: 35,
    },
    {
      id: 5,
      code: "CHEM 101",
      name: "General Chemistry",
      instructor: "Dr. Lisa Wang",
      credits: 4,
      progress: 65,
      grade: "B",
      schedule: "MWF 1:00-2:00 PM",
      room: "CHEM-Lab-1",
      students: 40,
    },
    {
      id: 6,
      code: "HIST 150",
      name: "World History",
      instructor: "Prof. David Brown",
      credits: 3,
      progress: 78,
      grade: "B+",
      schedule: "TTh 3:30-5:00 PM",
      room: "HIST-101",
      students: 25,
    },
  ]

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
          <p className="text-muted-foreground mt-1">Manage your enrolled courses and track progress</p>
        </div>
        <Button>
          <BookOpen className="h-4 w-4 mr-2" />
          Browse Courses
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">21</div>
            <p className="text-xs text-muted-foreground">Credit hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76%</div>
            <p className="text-xs text-muted-foreground">Course completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.85</div>
            <p className="text-xs text-muted-foreground">Semester GPA</p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {enrolledCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{course.code}</CardTitle>
                  <CardDescription className="mt-1">{course.name}</CardDescription>
                </div>
                <Badge className={getGradeColor(course.grade)}>{course.grade}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{course.schedule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {course.credits} credits • {course.students} students
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Course
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
