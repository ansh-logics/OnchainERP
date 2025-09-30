"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { mockStudent, mockFeeRecords, mockExamRecords, mockAnalytics } from "@/lib/mock-data";
import { 
  BookOpen, 
  CreditCard, 
  Calendar, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  GraduationCap
} from "lucide-react";

export default function StudentDashboard() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser.role !== 'student') {
      router.push(`/${currentUser.role}/dashboard`);
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const analytics = mockAnalytics.student;
  const recentFees = mockFeeRecords.slice(0, 3);
  const upcomingExams = mockExamRecords.filter(exam => exam.status === 'scheduled').slice(0, 3);

  return (
    <DashboardLayout title="Student Dashboard" userRole="student">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {mockStudent.name}!</h2>
          <p className="text-blue-100">
            {mockStudent.rollNumber} • {mockStudent.department} • Semester {analytics.currentSemester}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CGPA</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.cgpa}</div>
              <p className="text-xs text-muted-foreground">Out of 10.0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analytics.attendance}%</div>
              <Progress value={analytics.attendance} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.creditsCompleted}/{analytics.totalCredits}</div>
              <Progress value={(analytics.creditsCompleted / analytics.totalCredits) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.currentSemester}</div>
              <p className="text-xs text-muted-foreground">Active semester</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Fee Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Recent Fee Payments
              </CardTitle>
              <CardDescription>Your latest fee transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFees.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        fee.status === 'paid' ? 'bg-green-100' :
                        fee.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        {fee.status === 'paid' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{fee.type.charAt(0).toUpperCase() + fee.type.slice(1)} Fee</p>
                        <p className="text-sm text-gray-600">{fee.semester}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{fee.amount.toLocaleString()}</p>
                      <Badge variant={fee.status === 'paid' ? 'default' : 'secondary'}>
                        {fee.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Payments
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Exams */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Exams
              </CardTitle>
              <CardDescription>Your scheduled examinations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingExams.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{exam.subject}</p>
                      <p className="text-sm text-gray-600">{exam.examType.replace('-', ' ').toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{new Date(exam.examDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">Max: {exam.maxMarks}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View Exam Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex-col gap-2">
                <CreditCard className="h-5 w-5" />
                Pay Fees
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Calendar className="h-5 w-5" />
                Exam Results
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <BookOpen className="h-5 w-5" />
                Course Materials
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <AlertCircle className="h-5 w-5" />
                Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
