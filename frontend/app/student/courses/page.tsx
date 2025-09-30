"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth";
import { 
  BookOpen, 
  Clock, 
  Users, 
  FileText, 
  Download,
  Play,
  CheckCircle,
  Calendar,
  Star,
  BarChart3
} from "lucide-react";

export default function StudentCoursesPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Mock course data
  const currentCourses = [
    {
      id: 1,
      name: "Data Structures & Algorithms",
      code: "CS301",
      credits: 4,
      instructor: "Dr. Sarah Johnson",
      progress: 75,
      grade: "A",
      attendance: 92,
      assignments: { completed: 8, total: 10 },
      nextClass: "2024-10-15T10:00:00Z",
      materials: 15
    },
    {
      id: 2,
      name: "Database Management Systems",
      code: "CS302",
      credits: 3,
      instructor: "Prof. Michael Brown",
      progress: 68,
      grade: "B+",
      attendance: 88,
      assignments: { completed: 6, total: 8 },
      nextClass: "2024-10-15T14:00:00Z",
      materials: 12
    },
    {
      id: 3,
      name: "Computer Networks",
      code: "CS303",
      credits: 3,
      instructor: "Dr. Emily Davis",
      progress: 82,
      grade: "A-",
      attendance: 95,
      assignments: { completed: 7, total: 8 },
      nextClass: "2024-10-16T09:00:00Z",
      materials: 18
    },
    {
      id: 4,
      name: "Software Engineering",
      code: "CS304",
      credits: 4,
      instructor: "Prof. Robert Wilson",
      progress: 71,
      grade: "B+",
      attendance: 85,
      assignments: { completed: 5, total: 7 },
      nextClass: "2024-10-16T11:00:00Z",
      materials: 20
    }
  ];

  const assignments = [
    {
      id: 1,
      title: "Binary Search Tree Implementation",
      course: "CS301",
      dueDate: "2024-10-18",
      status: "pending",
      type: "Programming Assignment"
    },
    {
      id: 2,
      title: "Database Normalization Exercise",
      course: "CS302",
      dueDate: "2024-10-20",
      status: "submitted",
      type: "Theory Assignment"
    },
    {
      id: 3,
      title: "Network Protocol Analysis",
      course: "CS303",
      dueDate: "2024-10-22",
      status: "pending",
      type: "Lab Report"
    }
  ];

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalCredits = currentCourses.reduce((sum, course) => sum + course.credits, 0);
  const averageGrade = 'A-'; // Calculated from grades
  const averageAttendance = Math.round(currentCourses.reduce((sum, course) => sum + course.attendance, 0) / currentCourses.length);

  return (
    <DashboardLayout title="My Courses" userRole="student">
      <div className="space-y-6">
        {/* Course Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentCourses.length}</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCredits}</div>
              <p className="text-xs text-muted-foreground">Credit hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{averageGrade}</div>
              <p className="text-xs text-muted-foreground">Current GPA: 3.7</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{averageAttendance}%</div>
              <p className="text-xs text-muted-foreground">Average attendance</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses">Current Courses</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          {/* Current Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            <div className="grid gap-6">
              {currentCourses.map((course) => (
                <Card key={course.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{course.name}</CardTitle>
                        <CardDescription>
                          {course.code} • {course.credits} Credits • {course.instructor}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getGradeColor(course.grade)}>
                          Grade: {course.grade}
                        </Badge>
                        <Badge variant="outline">
                          {course.attendance}% Attendance
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Course Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Course Progress</span>
                          <span className="text-sm text-gray-600">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>

                      {/* Course Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">Assignments</p>
                            <p className="text-xs text-gray-600">{course.assignments.completed}/{course.assignments.total} completed</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">Next Class</p>
                            <p className="text-xs text-gray-600">{new Date(course.nextClass).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">Materials</p>
                            <p className="text-xs text-gray-600">{course.materials} files</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">Attendance</p>
                            <p className="text-xs text-gray-600">{course.attendance}%</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Course Materials
                        </Button>
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4 mr-2" />
                          Join Class
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Assignments
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{assignment.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{assignment.course} • {assignment.type}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status === 'submitted' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Submitted
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                        {assignment.status === 'pending' && (
                          <Button size="sm">Submit</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>Your class schedule for this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{course.name}</h4>
                        <p className="text-sm text-gray-600">{course.code} • {course.instructor}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{new Date(course.nextClass).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">{new Date(course.nextClass).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
