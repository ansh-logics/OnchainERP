"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardCard, DashboardGrid } from "@/components/ui/dashboard-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, 
  DollarSign, 
  User, 
  Settings, 
  GraduationCap,
  TrendingUp,
  Clock,
  Bell,
  FileText,
  CreditCard,
  Home as HomeIcon,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Book,
  Award,
  BarChart3
} from "lucide-react"
import { mockDashboardStats, mockFees, mockNotices, getNoticesForRole } from "@/lib/mock-data"
import Link from "next/link"

const navigation = [
  { name: "Dashboard", href: "/student", icon: "BarChart3" as const, current: true },
  { name: "Admissions", href: "/student/admissions", icon: "FileText" as const },
  { name: "Fees", href: "/student/fees", icon: "DollarSign" as const },
  { name: "Hostel", href: "/student/hostel", icon: "User" as const },
  { name: "Library", href: "/student/library", icon: "BookOpen" as const },
  { name: "Academics", href: "/student/academics", icon: "GraduationCap" as const },
  { name: "Profile", href: "/student/profile", icon: "User" as const },
]

export default function StudentPage() {
  const stats = mockDashboardStats.student
  const pendingFees = mockFees.filter(fee => fee.status === 'pending' || fee.status === 'overdue')
  const recentNotices = getNoticesForRole('student').slice(0, 3)

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout userRole="student" navigation={navigation}>
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Jane!</h1>
            <p className="text-muted-foreground">Here's what's happening with your academic journey</p>
          </div>

          {/* Quick Stats */}
          <DashboardGrid columns={4}>
            <DashboardCard
              title="Current Semester"
              value={stats.currentSemester}
              description="B.Tech Computer Science"
              icon={GraduationCap}
              color="blue"
            />
            <DashboardCard
              title="CGPA"
              value={stats.cgpa}
              description="Out of 10.0"
              trend={{ value: 5.2, direction: 'up', label: 'from last sem' }}
              icon={Award}
              color="green"
            />
            <DashboardCard
              title="Attendance"
              value={`${stats.attendance}%`}
              description="This semester"
              trend={{ value: 2.1, direction: 'up' }}
              icon={Clock}
              color="yellow"
            />
            <DashboardCard
              title="Pending Fees"
              value={`₹${stats.pendingFees.toLocaleString()}`}
              description="Due this month"
              icon={CreditCard}
              color="red"
              onClick={() => window.location.href = '/student/fees'}
            />
          </DashboardGrid>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Academic Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Academic Progress
                  </CardTitle>
                  <CardDescription>Your current semester performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Semester Progress</span>
                      <span className="text-sm text-muted-foreground">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{stats.totalCredits}</div>
                      <div className="text-sm text-muted-foreground">Credits Earned</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{stats.upcomingExams}</div>
                      <div className="text-sm text-muted-foreground">Upcoming Exams</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Frequently used features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/student/fees">
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                        <CreditCard className="h-6 w-6" />
                        <span className="text-sm">Pay Fees</span>
                      </Button>
                    </Link>
                    <Link href="/student/library">
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                        <Book className="h-6 w-6" />
                        <span className="text-sm">Library</span>
                      </Button>
                    </Link>
                    <Link href="/student/hostel">
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                        <HomeIcon className="h-6 w-6" />
                        <span className="text-sm">Hostel</span>
                      </Button>
                    </Link>
                    <Link href="/student/academics">
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                        <Calendar className="h-6 w-6" />
                        <span className="text-sm">Timetable</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium">Assignment Submitted</p>
                        <p className="text-sm text-muted-foreground">Database Systems - Project Report</p>
                      </div>
                      <span className="text-sm text-muted-foreground">2 hours ago</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Book className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium">Book Issued</p>
                        <p className="text-sm text-muted-foreground">Clean Code by Robert Martin</p>
                      </div>
                      <span className="text-sm text-muted-foreground">1 day ago</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div className="flex-1">
                        <p className="font-medium">Attendance Marked</p>
                        <p className="text-sm text-muted-foreground">Machine Learning - Lecture 15</p>
                      </div>
                      <span className="text-sm text-muted-foreground">2 days ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pending Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Action Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingFees.map((fee) => (
                    <div key={fee.id} className="p-3 border border-red-200 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-red-800">{fee.type} Fee</span>
                        <Badge variant="destructive">Due</Badge>
                      </div>
                      <p className="text-sm text-red-700">₹{fee.amount.toLocaleString()}</p>
                      <p className="text-xs text-red-600">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                    </div>
                  ))}
                  
                  <Link href="/student/fees">
                    <Button variant="outline" size="sm" className="w-full">
                      Pay Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Notices */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Recent Notices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentNotices.map((notice) => (
                    <div key={notice.id} className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-xs">
                          {notice.type}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm leading-tight">{notice.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notice.publishedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notice.content}
                      </p>
                    </div>
                  ))}
                  
                  <Link href="/notices">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Notices
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Library Books */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    My Library Books
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium text-sm">Clean Code</p>
                      <p className="text-xs text-muted-foreground">Due: Jan 24, 2024</p>
                      <Badge variant="outline" className="text-xs mt-1">Issued</Badge>
                    </div>
                    
                    <Link href="/student/library">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Books
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}