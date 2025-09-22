"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardCard, DashboardGrid } from "@/components/ui/dashboard-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  FileText, 
  CreditCard, 
  Home as HomeIcon,
  BookOpen,
  GraduationCap,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Bell,
  Calendar,
  BarChart3
} from "lucide-react"
import { mockDashboardStats, mockApplications, mockFees, mockHostelRooms, getNoticesForRole } from "@/lib/mock-data"
import Link from "next/link"

const navigation = [
  { name: "Dashboard", href: "/staff", icon: "BarChart3" as const, current: true },
  { name: "Admissions Desk", href: "/staff/admissions", icon: "FileText" as const },
  { name: "Fees Desk", href: "/staff/fees", icon: "DollarSign" as const },
  { name: "Hostel Desk", href: "/staff/hostel", icon: "User" as const },
  { name: "Library Desk", href: "/staff/library", icon: "BookOpen" as const },
  { name: "Academics Desk", href: "/staff/academics", icon: "GraduationCap" as const },
  { name: "Reports", href: "/staff/reports", icon: "FileText" as const },
]

export default function StaffPage() {
  const stats = mockDashboardStats.staff
  const pendingApplications = mockApplications.filter(app => app.status === 'submitted' || app.status === 'under_review')
  const pendingPayments = mockFees.filter(fee => fee.status === 'pending')
  const availableRooms = mockHostelRooms.filter(room => room.status === 'available')
  const recentNotices = getNoticesForRole('staff').slice(0, 3)

  return (
    <AuthGuard allowedRoles={["staff", "faculty", "admin"]}>
      <DashboardLayout userRole="staff" navigation={navigation}>
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Staff Dashboard</h1>
            <p className="text-muted-foreground">Manage student services and administrative tasks</p>
          </div>

          {/* Quick Stats */}
          <DashboardGrid columns={4}>
            <DashboardCard
              title="Pending Applications"
              value={stats.pendingApplications}
              description="Admission applications"
              icon={FileText}
              color="blue"
              onClick={() => window.location.href = '/staff/admissions'}
            />
            <DashboardCard
              title="Payment Validations"
              value={stats.pendingPayments}
              description="Require verification"
              icon={CreditCard}
              color="yellow"
              onClick={() => window.location.href = '/staff/fees'}
            />
            <DashboardCard
              title="Room Requests"
              value={stats.roomRequests}
              description="Hostel allocations"
              icon={HomeIcon}
              color="green"
              onClick={() => window.location.href = '/staff/hostel'}
            />
            <DashboardCard
              title="Library Issues"
              value={stats.libraryIssues}
              description="Books to process"
              icon={BookOpen}
              color="purple"
              onClick={() => window.location.href = '/staff/library'}
            />
          </DashboardGrid>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Task Queue */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Today's Priority Tasks
                  </CardTitle>
                  <CardDescription>Tasks requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div className="flex-1">
                      <p className="font-medium">Urgent: Document Verification</p>
                      <p className="text-sm text-muted-foreground">3 applications with missing documents</p>
                    </div>
                    <Link href="/staff/admissions">
                      <Button size="sm">Review</Button>
                    </Link>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="font-medium">Payment Reconciliation</p>
                      <p className="text-sm text-muted-foreground">8 payments pending validation</p>
                    </div>
                    <Link href="/staff/fees">
                      <Button size="sm" variant="outline">Process</Button>
                    </Link>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <HomeIcon className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">Room Allocation</p>
                      <p className="text-sm text-muted-foreground">12 students waiting for hostel rooms</p>
                    </div>
                    <Link href="/staff/hostel">
                      <Button size="sm" variant="outline">Allocate</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Frequently used desk operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/staff/admissions">
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                        <FileText className="h-6 w-6" />
                        <span className="text-sm">Verify Applications</span>
                      </Button>
                    </Link>
                    <Link href="/staff/fees">
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                        <CreditCard className="h-6 w-6" />
                        <span className="text-sm">Validate Payments</span>
                      </Button>
                    </Link>
                    <Link href="/staff/hostel">
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                        <HomeIcon className="h-6 w-6" />
                        <span className="text-sm">Manage Rooms</span>
                      </Button>
                    </Link>
                    <Link href="/staff/library">
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                        <BookOpen className="h-6 w-6" />
                        <span className="text-sm">Issue Books</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest desk operations and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium">Application Approved</p>
                        <p className="text-sm text-muted-foreground">Alice Johnson - B.Tech CSE</p>
                      </div>
                      <span className="text-sm text-muted-foreground">10 min ago</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium">Payment Verified</p>
                        <p className="text-sm text-muted-foreground">₹50,000 tuition fee - Jane Doe</p>
                      </div>
                      <span className="text-sm text-muted-foreground">25 min ago</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <HomeIcon className="h-5 w-5 text-purple-600" />
                      <div className="flex-1">
                        <p className="font-medium">Room Allocated</p>
                        <p className="text-sm text-muted-foreground">Room A-101 assigned to John Smith</p>
                      </div>
                      <span className="text-sm text-muted-foreground">1 hour ago</span>
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
                    Pending Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-blue-800">Applications</span>
                      <Badge variant="outline">{pendingApplications.length}</Badge>
                    </div>
                    <p className="text-sm text-blue-700">Require document verification</p>
                  </div>

                  <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-yellow-800">Payments</span>
                      <Badge variant="outline">{pendingPayments.length}</Badge>
                    </div>
                    <p className="text-sm text-yellow-700">Need validation and approval</p>
                  </div>

                  <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-green-800">Available Rooms</span>
                      <Badge variant="outline">{availableRooms.length}</Badge>
                    </div>
                    <p className="text-sm text-green-700">Ready for allocation</p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Notices */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Staff Notices
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

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Today's Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Applications Processed</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Payments Verified</span>
                      <span className="font-semibold">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rooms Allocated</span>
                      <span className="font-semibold">5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Books Issued</span>
                      <span className="font-semibold">23</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-2 bg-muted rounded">
                      <p className="font-medium text-sm">9:00 AM - Staff Meeting</p>
                      <p className="text-xs text-muted-foreground">Conference Room A</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="font-medium text-sm">2:00 PM - Document Review</p>
                      <p className="text-xs text-muted-foreground">Admissions Office</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="font-medium text-sm">4:00 PM - Parent Meeting</p>
                      <p className="text-xs text-muted-foreground">Counseling Room</p>
                    </div>
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
