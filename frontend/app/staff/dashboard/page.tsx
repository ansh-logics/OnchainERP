"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { mockAnalytics } from "@/lib/mock-data";
import { 
  Users, 
  CreditCard, 
  Building, 
  FileText,
  AlertTriangle,
  Clock,
  UserPlus,
  DollarSign
} from "lucide-react";

export default function StaffDashboard() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser.role !== 'staff') {
      router.push(`/${currentUser.role}/dashboard`);
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const analytics = mockAnalytics.staff;

  const recentActivities = [
    { id: 1, action: "New admission application", student: "Rahul Kumar", time: "2 hours ago", type: "admission" },
    { id: 2, action: "Fee payment received", student: "Priya Sharma", amount: "₹45,000", time: "4 hours ago", type: "fee" },
    { id: 3, action: "Hostel room allocated", student: "Amit Patel", room: "Block A-205", time: "1 day ago", type: "hostel" },
    { id: 4, action: "Exam marks updated", subject: "Data Structures", students: "25 students", time: "2 days ago", type: "exam" },
  ];

  const pendingTasks = [
    { id: 1, task: "Review admission applications", count: 12, priority: "high" },
    { id: 2, task: "Process fee payments", count: 8, priority: "medium" },
    { id: 3, task: "Update exam schedules", count: 3, priority: "low" },
    { id: 4, task: "Hostel maintenance requests", count: 5, priority: "medium" },
  ];

  return (
    <DashboardLayout title="Staff Dashboard" userRole="staff">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome, {user.name}!</h2>
          <p className="text-green-100">
            Staff Dashboard • Department Operations
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Active enrollments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Admissions</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{analytics.pendingAdmissions}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.feeCollectionRate}%</div>
              <p className="text-xs text-muted-foreground">Current semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hostel Occupancy</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analytics.hostelOccupancy}%</div>
              <p className="text-xs text-muted-foreground">Room utilization</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activities
              </CardTitle>
              <CardDescription>Latest updates from your department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full mt-0.5 ${
                      activity.type === 'admission' ? 'bg-blue-100' :
                      activity.type === 'fee' ? 'bg-green-100' :
                      activity.type === 'hostel' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      {activity.type === 'admission' && <UserPlus className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'fee' && <CreditCard className="h-4 w-4 text-green-600" />}
                      {activity.type === 'hostel' && <Building className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'exam' && <FileText className="h-4 w-4 text-orange-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-sm text-gray-600">
                        {activity.student && `Student: ${activity.student}`}
                        {activity.amount && ` • Amount: ${activity.amount}`}
                        {activity.room && ` • Room: ${activity.room}`}
                        {activity.subject && `Subject: ${activity.subject}`}
                        {activity.students && ` • ${activity.students}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Pending Tasks
              </CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">{task.task}</p>
                        <p className="text-xs text-gray-600">{task.count} items</p>
                      </div>
                    </div>
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Tasks
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common staff operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex-col gap-2">
                <UserPlus className="h-5 w-5" />
                Add Student
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <CreditCard className="h-5 w-5" />
                Collect Fees
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Building className="h-5 w-5" />
                Manage Hostel
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <FileText className="h-5 w-5" />
                Update Marks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
