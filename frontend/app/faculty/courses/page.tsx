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
  Users, 
  Calendar, 
  Settings, 
  Plus, 
  BarChart3, 
  FileText,
  Clock,
  MapPin,
  GraduationCap,
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface Course {
  id: string;
  code: string;
  name: string;
  semester: number;
  academicYear: string;
  credits: number;
  courseType: string;
  description: string;
  sections: Array<{
    id: string;
    name: string;
    studentsCount: number;
    schedule: Array<{
      day: string;
      time: string;
      room: string;
      type: string;
    }>;
    averageAttendance: number;
    lastClassDate: string;
    upcomingClass: {
      date: string;
      time: string;
      room: string;
      type: string;
    };
  }>;
  totalStudents: number;
  averageAttendance: number;
  completedClasses: number;
  totalClasses: number;
  progressPercentage: number;
  upcomingAssignments: Array<{
    id: string;
    title: string;
    dueDate: string;
    type: string;
    maxMarks: number;
  }>;
  recentTopics: string[];
}

interface CoursesData {
  courses: Course[];
  summary: {
    totalCourses: number;
    totalSections: number;
    totalStudents: number;
    averageAttendance: number;
    totalCredits: number;
    upcomingClasses: number;
    pendingAssignments: number;
    completedAssignments: number;
  };
}

export default function FacultyCoursesPage() {
  const [user, setUser] = useState<any>(null);
  const [coursesData, setCoursesData] = useState<CoursesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    if (currentUser.role !== 'faculty') {
      router.push('/');
      return;
    }

    setUser(currentUser);
    fetchCoursesData();
  }, [router]);

  const fetchCoursesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/faculty/courses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setCoursesData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch courses data');
      }
    } catch (err: any) {
      console.error('Courses fetch error:', err);
      setError(err.message || 'Failed to load courses data');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return "text-green-600";
    if (attendance >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading || !user) {
    return (
      <DashboardLayout title="My Courses" userRole="faculty">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="My Courses" userRole="faculty">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={fetchCoursesData}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!coursesData) {
    return (
      <DashboardLayout title="My Courses" userRole="faculty">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No courses data available</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const { courses, summary } = coursesData;

  return (
    <DashboardLayout title="My Courses" userRole="faculty">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalCourses}</div>
              <p className="text-xs text-muted-foreground">{summary.totalCredits} credits total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalStudents}</div>
              <p className="text-xs text-muted-foreground">{summary.totalSections} sections</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.averageAttendance.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Overall average</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.pendingAssignments}</div>
              <p className="text-xs text-muted-foreground">Assignments to grade</p>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      {course.code} - {course.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {course.description}
                    </CardDescription>
                    <div className="flex items-center gap-4 mt-3">
                      <Badge variant="secondary">
                        Semester {course.semester}
                      </Badge>
                      <Badge variant="outline">
                        {course.credits} Credits
                      </Badge>
                      <Badge variant="outline">
                        {course.courseType}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{course.totalStudents}</p>
                    <p className="text-sm text-muted-foreground">Students</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="sections">Sections</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                    <TabsTrigger value="topics">Topics</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      {/* Progress Info */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Course Progress
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Classes Completed</span>
                            <span className="font-medium">{course.completedClasses}/{course.totalClasses}</span>
                          </div>
                          <Progress value={course.progressPercentage} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {course.progressPercentage}% complete
                          </p>
                        </div>
                      </div>

                      {/* Attendance Info */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Attendance
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Average</span>
                            <span className={`font-medium ${getAttendanceColor(course.averageAttendance)}`}>
                              {course.averageAttendance.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={course.averageAttendance} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            Across all sections
                          </p>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Quick Actions
                        </h4>
                        <div className="space-y-2">
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Users className="h-4 w-4 mr-2" />
                            View Students
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <FileText className="h-4 w-4 mr-2" />
                            Mark Attendance
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sections" className="space-y-4">
                    <div className="grid gap-4">
                      {course.sections.map((section) => (
                        <Card key={section.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="font-semibold">{section.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {section.studentsCount} students
                                </p>
                              </div>
                              <Badge variant="outline" className={getAttendanceColor(section.averageAttendance)}>
                                {section.averageAttendance.toFixed(1)}% attendance
                              </Badge>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <h5 className="text-sm font-medium mb-2">Schedule</h5>
                                <div className="grid gap-2">
                                  {section.schedule.map((schedule, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                      <span>{schedule.day}</span>
                                      <span>{schedule.time}</span>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-muted-foreground">{schedule.room}</span>
                                        <Badge variant="secondary" className="text-xs">
                                          {schedule.type}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-medium mb-2">Next Class</h5>
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>{formatDate(section.upcomingClass.date)}</span>
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>{section.upcomingClass.time}</span>
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>{section.upcomingClass.room}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 mt-4">
                              <Button variant="outline" size="sm">
                                Mark Attendance
                              </Button>
                              <Button variant="outline" size="sm">
                                View Students
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="assignments" className="space-y-4">
                    {course.upcomingAssignments.length > 0 ? (
                      <div className="grid gap-4">
                        {course.upcomingAssignments.map((assignment) => (
                          <Card key={assignment.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold">{assignment.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {assignment.type} • Max Marks: {assignment.maxMarks}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <Badge variant="outline">
                                    Due: {formatDate(assignment.dueDate)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-4">
                                <Button variant="outline" size="sm">
                                  View Submissions
                                </Button>
                                <Button variant="outline" size="sm">
                                  Grade Assignments
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No upcoming assignments</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="topics" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Recent Topics Covered</h4>
                      <div className="grid gap-2">
                        {course.recentTopics.map((topic, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                            <span className="text-sm">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2 mt-6 pt-4 border-t border-border">
                  <Button variant="default" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    View All Students
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
    </DashboardLayout>
  );
}
