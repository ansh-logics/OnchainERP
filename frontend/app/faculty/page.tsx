"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { 
  BookOpen, 
  Users, 
  FileText, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Bell, 
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  MapPin,
  User
} from "lucide-react";

interface FacultyDashboardData {
  facultyInfo: {
    id: string;
    name: string;
    email: string;
    employeeId: string;
    designation: string;
    department: {
      name: string;
      code: string;
    };
    profilePicture?: string;
  };
  dashboardMetrics: {
    totalCourses: number;
    totalStudents: number;
    totalSections: number;
    averageAttendance: number;
    pendingGrading: number;
    completedAssignments: number;
    upcomingExams: number;
  };
  todaySchedule: Array<{
    id: string;
    courseCode: string;
    courseName: string;
    section: string;
    timeSlot: string;
    room: string;
    type: string;
    studentsCount: number;
    status: string;
  }>;
  courses: Array<{
    id: string;
    code: string;
    name: string;
    totalStudents: number;
    averageAttendance: number;
    completedClasses: number;
    totalClasses: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    courseCode: string;
  }>;
  pendingTasks: Array<{
    id: string;
    type: string;
    title: string;
    courseCode: string;
    dueDate: string;
    priority: string;
    count: number;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    type: string;
  }>;
}

export default function FacultyDashboard() {
  const [user, setUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<FacultyDashboardData | null>(null);
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
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/faculty/dashboard-mock', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || !user) {
    return (
      <DashboardLayout title="Faculty Dashboard" userRole="faculty">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Faculty Dashboard" userRole="faculty">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={fetchDashboardData}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout title="Faculty Dashboard" userRole="faculty">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No dashboard data available</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const { facultyInfo, dashboardMetrics, todaySchedule, courses, recentActivities, pendingTasks, upcomingEvents } = dashboardData;

  return (
    <DashboardLayout title="Faculty Dashboard" userRole="faculty">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {facultyInfo.name}!</h2>
              <p className="text-blue-100">
                {facultyInfo.employeeId} • {facultyInfo.designation} • {facultyInfo.department.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Today's Classes</p>
              <p className="text-2xl font-bold">{todaySchedule.length}</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardMetrics.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardMetrics.totalSections} sections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardMetrics.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardMetrics.averageAttendance.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Overall average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardMetrics.pendingGrading}</div>
              <p className="text-xs text-muted-foreground">Items to grade</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Today's Schedule */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Classes
              </CardTitle>
              <CardDescription>Your scheduled classes for today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todaySchedule.length > 0 ? (
                todaySchedule.map((classItem) => (
                  <div key={classItem.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{classItem.courseName}</p>
                      <p className="text-xs text-muted-foreground">
                        {classItem.room} • Section {classItem.section} • {classItem.studentsCount} students
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {classItem.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-xs">
                        {classItem.timeSlot.split(' - ')[0]}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No classes scheduled for today</p>
              )}
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pending Tasks
              </CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border ${getPriorityColor(task.priority)}`}>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs opacity-75">{task.courseCode}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {task.count} items
                    </Badge>
                    <p className="text-xs opacity-75 mt-1">Due: {formatDate(task.dueDate)}</p>
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
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {activity.courseCode}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Course Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Course Performance Overview
            </CardTitle>
            <CardDescription>Progress and statistics for your courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div key={course.id} className="space-y-4 p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{course.code}</h3>
                      <p className="text-sm text-muted-foreground">{course.name}</p>
                    </div>
                    <Badge variant="secondary">{course.totalStudents} students</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Attendance</span>
                      <span className="font-medium">{course.averageAttendance.toFixed(1)}%</span>
                    </div>
                    <Progress value={course.averageAttendance} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Course Progress</span>
                      <span className="font-medium">
                        {course.completedClasses}/{course.totalClasses} classes
                      </span>
                    </div>
                    <Progress value={(course.completedClasses / course.totalClasses) * 100} className="h-2" />
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Important events and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-4 rounded-lg border border-border">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(event.date)} • {event.time}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{event.location}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
