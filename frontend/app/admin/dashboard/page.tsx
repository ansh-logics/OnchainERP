"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { 
  fetchDashboardAnalytics, 
  fetchCollegeSetupStatus,
  DashboardAnalytics,
  CollegeSetupStatus,
  handleApiError 
} from "@/lib/api";
import { 
  Users, 
  Building, 
  FileText,
  DollarSign,
  GraduationCap,
  Calendar,
  AlertCircle,
  UserCheck,
  BookOpen,
  TrendingUp
} from "lucide-react";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [collegeSetupStatus, setCollegeSetupStatus] = useState<CollegeSetupStatus | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    initializeDashboard();
  }, [router]);

  const initializeDashboard = async () => {
    try {
      // Check authentication first
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }
      
      if (currentUser.role !== 'admin') {
        router.push('/auth/login');
        return;
      }

      setUser(currentUser);
      
      // Fetch data in parallel
      const [setupResponse, analyticsResponse] = await Promise.all([
        fetchCollegeSetupStatus(),
        fetchDashboardAnalytics()
      ]);

      // Handle setup status
      if (setupResponse.success && setupResponse.data) {
        setCollegeSetupStatus(setupResponse.data);
      } else {
        console.error('Failed to fetch setup status:', setupResponse.error);
        // Set default setup status if API fails
        setCollegeSetupStatus({
          profileCompleted: false,
          setupStep: 1,
          missingFields: ['branding'],
          college: {
            name: currentUser.college?.name || 'Your College',
            shortName: currentUser.college?.shortName || 'YC'
          }
        });
      }

      // Handle analytics
      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalytics(analyticsResponse.data);
      } else {
        console.error('Failed to fetch analytics:', analyticsResponse.error);
        setError(handleApiError(analyticsResponse.error));
        // Set fallback mock data if API fails
        setAnalytics({
          totalStudents: 1250,
          totalFaculty: 85,
          revenue: 56200000,
          hostelOccupancy: 87,
          totalDepartments: 8,
          activeAlerts: 4,
          pendingFees: 125,
          upcomingExams: 12
        });
      }
      
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  // Show setup completion prompt if college profile is not complete
  if (collegeSetupStatus && !collegeSetupStatus.profileCompleted) {
    return (
      <DashboardLayout title="Complete Setup" userRole="admin">
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-2xl">Complete Your College Profile</CardTitle>
              <CardDescription className="text-base">
                Welcome to YuktiERP! To access the full dashboard and start managing your college, 
                please complete your college profile setup.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Setup Progress</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Basic Information</span>
                    <Badge variant="default" className="bg-green-600">Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">College Profile & Branding</span>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Infrastructure Details</span>
                    <Badge variant="secondary">Optional</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Academic Calendar</span>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => router.push('/admin/college-profile')} 
                  className="flex-1"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Complete College Profile
                </Button>
                <Button 
                  onClick={() => router.push('/admin/academic-calendar')} 
                  variant="outline"
                  className="flex-1"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Setup Academic Calendar
                </Button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Need help? Contact our support team or visit our documentation.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Return early if analytics is not loaded yet
  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard data...</div>
      </div>
    );
  }

  const recentSystemActivity = [
    { id: 1, event: "New faculty member added", details: "Dr. Sarah Johnson - Computer Science", time: "1 hour ago", type: "user" },
    { id: 2, event: "Bulk fee payment processed", details: "125 students - ₹5,625,000", time: "3 hours ago", type: "finance" },
    { id: 3, event: "Exam schedule published", details: "Mid-term examinations - May 2024", time: "1 day ago", type: "academic" },
    { id: 4, event: "System backup completed", details: "Full database backup - 2.3GB", time: "2 days ago", type: "system" },
  ];

  const systemAlerts = [
    { id: 1, message: "Server maintenance scheduled", severity: "info", time: "Tomorrow 2:00 AM" },
    { id: 2, message: "Fee payment deadline approaching", severity: "warning", time: "3 days remaining" },
    { id: 3, message: "Low hostel capacity in Block C", severity: "warning", time: "Current: 95%" },
  ];

  const departmentStats = [
    { name: "Computer Science", students: 320, faculty: 18, revenue: 14400000 },
    { name: "Electronics", students: 280, faculty: 15, revenue: 12600000 },
    { name: "Mechanical", students: 350, faculty: 20, revenue: 15750000 },
    { name: "Civil", students: 300, faculty: 16, revenue: 13500000 },
  ];

  return (
    <DashboardLayout title="Admin Dashboard" userRole="admin">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome, {user.name}!</h2>
          <p className="text-purple-100">
            System Administrator • Institution Overview
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
              <div className="text-2xl font-bold">{analytics.totalStudents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalFaculty}</div>
              <p className="text-xs text-muted-foreground">Across all departments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{(analytics.revenue / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-muted-foreground">This academic year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hostel Occupancy</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analytics.hostelOccupancy}%</div>
              <p className="text-xs text-muted-foreground">All blocks combined</p>
            </CardContent>
          </Card>
        </div>

        {/* Department Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Department Overview
            </CardTitle>
            <CardDescription>Student enrollment and revenue by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentStats.map((dept) => (
                <div key={dept.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{dept.name}</h3>
                      <p className="text-sm text-gray-600">{dept.students} students • {dept.faculty} faculty</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">₹{(dept.revenue / 1000000).toFixed(1)}M</p>
                    <p className="text-sm text-gray-600">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent System Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent System Activity
              </CardTitle>
              <CardDescription>Latest administrative actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSystemActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full mt-0.5 ${
                      activity.type === 'user' ? 'bg-blue-100' :
                      activity.type === 'finance' ? 'bg-green-100' :
                      activity.type === 'academic' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      {activity.type === 'user' && <Users className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'finance' && <DollarSign className="h-4 w-4 text-green-600" />}
                      {activity.type === 'academic' && <Calendar className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'system' && <FileText className="h-4 w-4 text-orange-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.event}</p>
                      <p className="text-sm text-gray-600">{activity.details}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                System Alerts
              </CardTitle>
              <CardDescription>Important notifications and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`p-1 rounded-full mt-1 ${
                      alert.severity === 'warning' ? 'bg-yellow-100' :
                      alert.severity === 'error' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <AlertCircle className={`h-4 w-4 ${
                        alert.severity === 'warning' ? 'text-yellow-600' :
                        alert.severity === 'error' ? 'text-red-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                    <Badge variant={alert.severity === 'warning' ? 'destructive' : 'secondary'}>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => router.push('/admin/alerts')}>
                  View All Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Administrative Actions</CardTitle>
            <CardDescription>System management and configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => router.push('/admin/users')}>
                <Users className="h-5 w-5" />
                Manage Users
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => router.push('/admin/reports')}>
                <FileText className="h-5 w-5" />
                Generate Reports
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => router.push('/admin/reports')}>
                <TrendingUp className="h-5 w-5" />
                View Analytics
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => router.push('/admin/logs')}>
                <AlertCircle className="h-5 w-5" />
                System Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
