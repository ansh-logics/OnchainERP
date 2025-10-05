"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { mockStudent, mockAnalytics, mockCourses } from "@/lib/mock-data";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  Edit,
  Download,
  Loader2,
  AlertCircle,
  TrendingUp,
  Award
} from "lucide-react";
import { toast } from "sonner";

export default function StudentProfilePage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [router]);

  if (loading || !user) {
    return (
      <DashboardLayout title="Student Profile" userRole="student">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Student Profile" userRole="student">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{mockStudent.name}</CardTitle>
                  <CardDescription className="text-lg">
                    {mockStudent.rollNumber} • {mockStudent.department}
                  </CardDescription>
                  <Badge variant="secondary" className="mt-1">
                    Semester {mockStudent.currentSemester}
                  </Badge>
                </div>
              </div>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{mockStudent.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{mockStudent.phoneNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{mockStudent.address}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Admission Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(mockStudent.admissionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Enrollment Number</p>
                  <p className="text-sm text-muted-foreground">{mockStudent.enrollmentNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Department</p>
                  <p className="text-sm text-muted-foreground">{mockStudent.department}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Current CGPA</p>
                  <p className="text-sm text-muted-foreground font-semibold text-green-600">
                    {mockStudent.cgpa}/10.0
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Award className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Section</p>
                  <p className="text-sm text-muted-foreground">{mockStudent.section}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guardian Information */}
        <Card>
          <CardHeader>
            <CardTitle>Guardian Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Guardian Name</p>
                <p className="text-sm text-muted-foreground">{mockStudent.guardianName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Guardian Phone</p>
                <p className="text-sm text-muted-foreground">{mockStudent.guardianPhone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Performance</CardTitle>
            <CardDescription>Your academic statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{mockAnalytics.student.cgpa}</div>
                <p className="text-sm text-muted-foreground">CGPA</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{mockAnalytics.student.attendance}%</div>
                <p className="text-sm text-muted-foreground">Attendance</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{mockAnalytics.student.creditsCompleted}</div>
                <p className="text-sm text-muted-foreground">Credits Earned</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{mockCourses.length}</div>
                <p className="text-sm text-muted-foreground">Enrolled Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Current Semester Courses</CardTitle>
            <CardDescription>Courses enrolled for Semester {mockStudent.currentSemester}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{course.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {course.code} • {course.instructor} • {course.credits} Credits
                    </p>
                    <p className="text-sm text-muted-foreground">{course.schedule}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{course.grade}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">{course.progress}% Complete</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => toast.success('Profile updated! (Demo)')}>
                <Edit className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
              <Button variant="outline" onClick={() => toast.success('Transcript downloaded! (Demo)')}>
                <Download className="h-4 w-4 mr-2" />
                Download Transcript
              </Button>
              <Button variant="outline" onClick={() => toast.success('ID Card downloaded! (Demo)')}>
                <Download className="h-4 w-4 mr-2" />
                Download ID Card
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
