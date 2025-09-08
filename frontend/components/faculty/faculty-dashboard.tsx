"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Users, FileText, Clock, TrendingUp, Calendar, Bell, GraduationCap } from "lucide-react"

export function FacultyDashboard() {
  const todayClasses = [
    { time: "09:00 AM", course: "Data Structures CS-201", room: "CS-201", students: 45, type: "Lecture" },
    { time: "11:00 AM", course: "Algorithms CS-301", room: "CS-301", students: 32, type: "Lab" },
    { time: "02:00 PM", course: "Software Engineering CS-401", room: "CS-401", students: 28, type: "Seminar" },
  ]

  const pendingGrading = [
    { course: "Data Structures", assignment: "Midterm Exam", submissions: 45, pending: 12, dueDate: "2024-01-16" },
    { course: "Algorithms", assignment: "Project 2", submissions: 32, pending: 8, dueDate: "2024-01-18" },
    {
      course: "Software Engineering",
      assignment: "Design Document",
      submissions: 28,
      pending: 15,
      dueDate: "2024-01-20",
    },
  ]

  const courseStats = [
    { name: "Data Structures", enrolled: 45, attendance: 92, avgGrade: "B+", progress: 75 },
    { name: "Algorithms", enrolled: 32, attendance: 88, avgGrade: "A-", progress: 68 },
    { name: "Software Engineering", enrolled: 28, attendance: 95, avgGrade: "A", progress: 82 },
  ]

  const recentActivities = [
    { type: "grade", message: "Graded 15 assignments for Data Structures", time: "2 hours ago" },
    { type: "announcement", message: "Posted announcement for Algorithms class", time: "4 hours ago" },
    { type: "meeting", message: "Faculty meeting scheduled for tomorrow", time: "1 day ago" },
    { type: "submission", message: "New project submissions received", time: "2 days ago" },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Professor!</h1>
          <p className="text-muted-foreground mt-1">Here's your teaching overview for today.</p>
        </div>
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4 mr-2" />
          View Notifications
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">105</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">35</div>
            <p className="text-xs text-muted-foreground">Assignments to grade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">+3% from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Classes */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Classes
            </CardTitle>
            <CardDescription>Your scheduled classes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayClasses.map((classItem, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{classItem.course}</p>
                  <p className="text-xs text-muted-foreground">
                    {classItem.room} • {classItem.students} students • {classItem.type}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {classItem.time}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending Grading */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pending Grading
            </CardTitle>
            <CardDescription>Assignments awaiting review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingGrading.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.assignment}</p>
                  <p className="text-xs text-muted-foreground">{item.course}</p>
                </div>
                <div className="text-right">
                  <Badge variant="destructive" className="text-xs">
                    {item.pending} pending
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Due: {item.dueDate}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Your latest actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Course Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Course Performance Overview
          </CardTitle>
          <CardDescription>Performance metrics for your courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            {courseStats.map((course, index) => (
              <div key={index} className="space-y-4 p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{course.name}</h3>
                  <Badge variant="secondary">{course.avgGrade}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Enrolled</p>
                    <p className="font-medium">{course.enrolled} students</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Attendance</p>
                    <p className="font-medium">{course.attendance}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Course Progress</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>

                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
