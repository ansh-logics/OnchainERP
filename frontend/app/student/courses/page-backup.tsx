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
  Clock, 
  Users, 
  FileText,
  BarChart3
} from "lucide-react";

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  courseType: string;
  description: string;
  enrollmentId: string;
  enrollmentDate: string;
  grade: string | null;
  attendance: {
    total: number;
    present: number;
    percentage: number;
  };
  assignments: {
    total: number;
    completed: number;
  };
}

export default function StudentCoursesPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
    fetchCourses();
  }, [router]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/student-services/courses');
      
      if (response.data.success) {
        setCourses(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <DashboardLayout title="My Courses" userRole="student">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const averageAttendance = courses.length > 0
    ? Math.round(courses.reduce((sum, course) => sum + course.attendance.percentage, 0) / courses.length)
    : 0;

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'bg-gray-100 text-gray-800';
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

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
              <div className="text-2xl font-bold">{courses.length}</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCredits}</div>
              <p className="text-xs text-muted-foreground">Credit hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{averageAttendance}%</div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.reduce((sum, c) => sum + c.assignments.completed, 0)}/{courses.reduce((sum, c) => sum + c.assignments.total, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Course List */}
        <div className="space-y-4">
          {courses.length > 0 ? (
            courses.map((course) => (
              <Card key={course.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{course.name}</CardTitle>
                      <CardDescription>
                        {course.code} • {course.credits} Credits • {course.courseType}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {course.grade && (
                        <Badge className={getGradeColor(course.grade)}>
                          Grade: {course.grade}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {course.attendance.percentage.toFixed(1)}% Attendance
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Attendance Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Attendance</span>
                        <span className="text-sm text-gray-600">
                          {course.attendance.present}/{course.attendance.total} classes ({course.attendance.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={course.attendance.percentage} className="h-2" />
                    </div>

                    {/* Course Description */}
                    {course.description && (
                      <p className="text-sm text-gray-600">{course.description}</p>
                    )}

                    {/* Assignments */}
                    {course.assignments.total > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span>
                          Assignments: {course.assignments.completed}/{course.assignments.total} completed
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Clock className="h-4 w-4 mr-2" />
                        Attendance
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No courses enrolled yet</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
