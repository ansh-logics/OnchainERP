"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Calendar, FileText, Clock, TrendingUp, Award, Bell } from "lucide-react"

export function StudentDashboard() {
  const upcomingAssignments = [
    { id: 1, title: "Data Structures Project", course: "CS 201", dueDate: "2024-01-15", status: "pending" },
    { id: 2, title: "Physics Lab Report", course: "PHY 101", dueDate: "2024-01-18", status: "in-progress" },
    { id: 3, title: "Literature Essay", course: "ENG 102", dueDate: "2024-01-20", status: "pending" },
  ]

  const recentGrades = [
    { course: "Mathematics", assignment: "Midterm Exam", grade: "A-", points: "92/100" },
    { course: "Computer Science", assignment: "Algorithm Quiz", grade: "A", points: "95/100" },
    { course: "Physics", assignment: "Lab Report 3", grade: "B+", points: "87/100" },
  ]

  const todaySchedule = [
    { time: "09:00 AM", course: "Data Structures", room: "CS-201", type: "Lecture" },
    { time: "11:00 AM", course: "Physics Lab", room: "PHY-Lab-1", type: "Lab" },
    { time: "02:00 PM", course: "Literature", room: "ENG-105", type: "Discussion" },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Student!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your studies today.</p>
        </div>
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4 mr-2" />
          View All Notifications
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Active this semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Due this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.85</div>
            <p className="text-xs text-muted-foreground">+0.12 from last semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84</div>
            <p className="text-xs text-muted-foreground">36 remaining</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Schedule */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
            <CardDescription>Your classes for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todaySchedule.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{item.course}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.room} • {item.type}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {item.time}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Assignments */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upcoming Assignments
            </CardTitle>
            <CardDescription>Due soon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAssignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <p className="font-medium text-sm">{assignment.title}</p>
                  <p className="text-xs text-muted-foreground">{assignment.course}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium">{assignment.dueDate}</p>
                  <Badge variant={assignment.status === "pending" ? "destructive" : "secondary"} className="text-xs">
                    {assignment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Grades
            </CardTitle>
            <CardDescription>Latest assessment results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentGrades.map((grade, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{grade.assignment}</p>
                  <p className="text-xs text-muted-foreground">{grade.course}</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-sm font-bold">
                    {grade.grade}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{grade.points}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Course Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
          <CardDescription>Your progress in current courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Data Structures", progress: 75, grade: "A-" },
              { name: "Physics", progress: 68, grade: "B+" },
              { name: "Literature", progress: 82, grade: "A" },
              { name: "Mathematics", progress: 90, grade: "A" },
              { name: "Chemistry", progress: 65, grade: "B" },
              { name: "History", progress: 78, grade: "B+" },
            ].map((course, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{course.name}</p>
                  <Badge variant="outline">{course.grade}</Badge>
                </div>
                <Progress value={course.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{course.progress}% complete</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
