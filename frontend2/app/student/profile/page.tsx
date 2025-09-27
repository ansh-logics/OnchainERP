"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { mockStudent, mockAnalytics } from "@/lib/mock-data";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  Edit,
  Download
} from "lucide-react";

export default function StudentProfilePage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const analytics = mockAnalytics.student;

  return (
    <DashboardLayout title="Student Profile" userRole="student">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                {mockStudent.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{mockStudent.name}</h1>
                    <p className="text-gray-600">{mockStudent.rollNumber}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{mockStudent.department}</Badge>
                      <Badge variant="outline">Semester {mockStudent.semester}</Badge>
                    </div>
                  </div>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current CGPA</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.cgpa}</div>
              <p className="text-xs text-muted-foreground">Out of 10.0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analytics.attendance}%</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Completed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.creditsCompleted}</div>
              <p className="text-xs text-muted-foreground">Out of {analytics.totalCredits}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.currentSemester}</div>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600">{mockStudent.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Phone Number</p>
                    <p className="text-sm text-gray-600">{mockStudent.phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-gray-600">{mockStudent.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Admission Date</p>
                    <p className="text-sm text-gray-600">
                      {new Date(mockStudent.admissionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guardian Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Guardian Name</p>
                    <p className="text-sm text-gray-600">{mockStudent.guardianName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Guardian Phone</p>
                    <p className="text-sm text-gray-600">{mockStudent.guardianPhone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Relationship</p>
                    <p className="text-sm text-gray-600">Father</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Emergency Contact</p>
                    <p className="text-sm text-gray-600">Yes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Academic Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Documents</CardTitle>
            <CardDescription>Download your academic certificates and transcripts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Download className="h-5 w-5" />
                Admit Card
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Download className="h-5 w-5" />
                Mark Sheet
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Download className="h-5 w-5" />
                ID Card
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Download className="h-5 w-5" />
                Transcript
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Academic Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Progress</CardTitle>
            <CardDescription>Your semester-wise performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((sem) => (
                <div key={sem} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="font-semibold text-primary">{sem}</span>
                    </div>
                    <div>
                      <p className="font-medium">Semester {sem}</p>
                      <p className="text-sm text-gray-600">
                        {sem <= analytics.currentSemester ? 'Completed' : 'Upcoming'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {sem <= analytics.currentSemester ? (
                      <>
                        <p className="font-semibold">
                          {(Math.random() * 2 + 7).toFixed(1)} GPA
                        </p>
                        <Badge variant="secondary">Passed</Badge>
                      </>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
